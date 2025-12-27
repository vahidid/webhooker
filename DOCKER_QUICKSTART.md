# 🐳 Docker Quick Start

Get Webhooker running with Docker in under 2 minutes!

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- At least 2GB RAM available

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd webhooker

# 2. Start all services (web, worker, database, redis)
docker-compose up -d

# 3. Watch the logs
docker-compose logs -f

# 4. Open your browser
open http://localhost:3000
```

That's it! The application is now running with:
- ✅ Next.js web server on port 3000
- ✅ 2 background workers processing deliveries
- ✅ PostgreSQL database
- ✅ Redis for job queues

### Option 2: Using Makefile (Even Easier)

```bash
# Start everything
make up

# View logs
make logs

# Scale workers to 5
make scale-workers N=5

# Stop everything
make down

# See all available commands
make help
```

## 📊 Scaling

### Scale Workers

```bash
# Run 10 workers
docker-compose up -d --scale worker=10

# Or with make
make scale-workers N=10
```

### Scale Web Servers

```bash
# Run 3 web instances (need load balancer)
docker-compose up -d --scale web=3

# Or with make
make scale-web N=3
```

## 🛠️ Common Commands

```bash
# View all containers
docker-compose ps

# View web logs only
docker-compose logs -f web

# View worker logs only
docker-compose logs -f worker

# Restart workers
docker-compose restart worker

# Stop everything and remove volumes
docker-compose down -v

# Rebuild images
docker-compose build
```

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Required
DATABASE_URL=postgresql://webhooker:webhooker_password@postgres:5432/webhooker
REDIS_URL=redis://redis:6379
AUTH_SECRET=your-super-secret-key-here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

## 🏥 Health Checks

```bash
# Check if web is healthy
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"2025-12-27T...","service":"webhooker-api"}
```

## 📦 What's Included?

The Docker setup includes:

1. **Multi-stage Dockerfile** - Optimized build (~200MB final image)
2. **docker-compose.yml** - Complete stack for development
3. **docker-compose.prod.yml** - Production scaling configuration
4. **Makefile** - Convenient commands for common tasks
5. **Health checks** - Automatic container health monitoring
6. **Auto-migrations** - Database migrations run on startup
7. **Graceful shutdown** - Workers finish current jobs before stopping

## 🚀 Production Deployment

See [DOCKER.md](./DOCKER.md) for detailed production deployment guide including:
- External database setup
- Load balancing
- Monitoring
- Backup strategies
- Security best practices

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Worker Not Processing Jobs

```bash
# Check Redis connection
docker-compose exec redis redis-cli ping

# Check worker logs
docker-compose logs worker

# Restart worker
docker-compose restart worker
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Clean Start

```bash
# Remove everything and start fresh
docker-compose down -v
docker-compose up -d
```

## 📚 Learn More

- [Complete Docker Guide](./DOCKER.md)
- [Webhook Documentation](./WEBHOOK_ROUTE.md)
- [Agent Instructions](./AGENTS.md)

## 💡 Tips

1. **During Development**: Run only database and Redis in Docker, run Next.js locally
   ```bash
   make dev
   pnpm dev
   ```

2. **Monitor Resources**: Keep an eye on Docker stats
   ```bash
   make stats
   ```

3. **Database Backups**: Regular backups are important
   ```bash
   make backup-db
   ```

4. **Clean Up**: Remove unused images periodically
   ```bash
   make prune
   ```

---

Need help? Check the logs:
```bash
make logs
```
