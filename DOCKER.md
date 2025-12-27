# Docker Deployment Guide

This guide explains how to deploy the Webhooker application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available

## Quick Start (Development)

```bash
# Start all services (web + worker + postgres + redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Scale workers
docker-compose up -d --scale worker=5

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

Access the application at http://localhost:3000

## Production Deployment

### 1. Environment Configuration

Create a `.env.production` file:

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/webhooker?schema=public

# Redis
REDIS_URL=redis://redis:6379

# Auth
AUTH_SECRET=your-secure-random-string-here

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
APP_URL=https://your-domain.com
```

### 2. Deploy with Production Compose

```bash
# Build images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start services with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services as needed
docker-compose -f docker-compose.prod.yml up -d --scale web=3 --scale worker=5
```

### 3. Using External Database/Redis

If using managed PostgreSQL and Redis services:

```bash
# Only run web and worker (no postgres/redis)
docker-compose -f docker-compose.prod.yml up -d

# Make sure your .env.production has correct URLs
```

## Architecture

### Services

1. **postgres** - PostgreSQL 16 database
   - Port: 5432
   - Volume: `postgres_data`

2. **redis** - Redis 7 for BullMQ job queue
   - Port: 6379
   - Volume: `redis_data`

3. **migration** - Runs database migrations once on startup
   - Auto-stops after completion

4. **web** - Next.js application
   - Port: 3000
   - Scalable (use `--scale web=N`)

5. **worker** - Background job processor
   - Processes webhook deliveries
   - Scalable (use `--scale worker=N`)

### Multi-Stage Dockerfile

The Dockerfile uses 3 stages for optimal image size:

1. **deps** - Installs node_modules
2. **builder** - Builds Next.js standalone output
3. **runner** - Minimal production image (~200MB)

### Standalone Output

Next.js standalone mode creates a self-contained build that includes:
- Only production dependencies
- Optimized server code
- Static assets

This reduces the final image size significantly compared to bundling all node_modules.

## Scaling

### Horizontal Scaling

```bash
# Scale web servers
docker-compose up -d --scale web=3

# Scale workers
docker-compose up -d --scale worker=10

# Both
docker-compose up -d --scale web=3 --scale worker=10
```

### With Load Balancer

For production with multiple web instances, use a reverse proxy:

```yaml
# Add to docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
```

Example `nginx.conf`:

```nginx
upstream webhooker_web {
    least_conn;
    server web:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://webhooker_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f worker
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 worker
```

### Container Stats

```bash
# Real-time stats
docker stats

# Check health
docker-compose ps
```

## Maintenance

### Database Migrations

Migrations run automatically via the `migration` service on startup.

Manual migration:

```bash
docker-compose exec web npx prisma migrate deploy
```

### Database Seeding

```bash
docker-compose exec web pnpm db:seed
```

### Access Database

```bash
# Via psql
docker-compose exec postgres psql -U webhooker -d webhooker

# Via Prisma Studio
docker-compose exec web npx prisma studio
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U webhooker webhooker > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U webhooker -d webhooker < backup.sql
```

## Troubleshooting

### Worker Not Starting

Check logs:
```bash
docker-compose logs worker
```

Common issues:
- Missing REDIS_URL environment variable
- Database connection failed
- Port conflicts

### Web Service Not Accessible

```bash
# Check if container is running
docker-compose ps web

# Check health
docker-compose exec web wget -O- http://localhost:3000/api/health

# Check logs
docker-compose logs web
```

### Out of Memory

Increase Docker memory limit or scale down workers:

```bash
docker-compose up -d --scale worker=2
```

### Database Connection Errors

```bash
# Verify postgres is healthy
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready -U webhooker
```

## Performance Tuning

### Worker Concurrency

Edit worker service environment:

```yaml
worker:
  environment:
    WORKER_CONCURRENCY: "10"  # Jobs per worker
    WORKER_LIMITER_MAX: "100" # Max jobs per interval
```

### Database Connection Pooling

In `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 20
  connection_limit = 10
}
```

### Redis Memory

Limit Redis memory:

```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## Security Best Practices

1. **Change default passwords** in production
2. **Use secrets management** for sensitive env vars
3. **Enable TLS** for external connections
4. **Restrict network access** using Docker networks
5. **Regular updates** - rebuild images periodically
6. **Scan images** for vulnerabilities:

```bash
docker scan webhooker-web
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build image
        run: docker build -t webhooker:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push webhooker:${{ github.sha }}
      
      - name: Deploy
        run: |
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
```

## Resources

- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [BullMQ Workers](https://docs.bullmq.io/guide/workers)
