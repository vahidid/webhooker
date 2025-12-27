# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment of Webhooker using Docker.

## Pre-Deployment

### 1. Infrastructure Preparation

- [ ] Server provisioned (VPS, cloud instance, etc.)
- [ ] Minimum 2GB RAM available
- [ ] Minimum 20GB disk space available
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] Domain name configured (DNS pointing to server)
- [ ] Firewall configured (ports 80, 443 open)

### 2. Repository Setup

- [ ] Code cloned to server
- [ ] Git repository up to date
- [ ] All dependencies in package.json reviewed
- [ ] Prisma schema reviewed

### 3. Environment Configuration

- [ ] `.env` file created (copy from `.env.example`)
- [ ] `DATABASE_URL` configured
- [ ] `REDIS_URL` configured (or using Docker Redis)
- [ ] `AUTH_SECRET` generated (minimum 32 characters)
  ```bash
  openssl rand -base64 32
  ```
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] `APP_URL` set to production URL
- [ ] Other provider API keys configured (if needed)

### 4. SSL/TLS Setup (Production)

- [ ] Domain verified and accessible
- [ ] SSL certificate obtained (or ready to obtain)
- [ ] nginx.conf updated with correct domain name
- [ ] Certbot email configured

## Deployment

### 5. Build & Test

- [ ] Docker images build successfully
  ```bash
  docker-compose build
  ```
- [ ] No build errors in logs
- [ ] Image size reasonable (~200-300MB)

### 6. Database Setup

- [ ] PostgreSQL accessible (or using Docker)
- [ ] Database created
- [ ] Migrations run successfully
  ```bash
  make migrate
  ```
- [ ] Database seeded (optional)
  ```bash
  make seed
  ```

### 7. Services Deployment

**Development/Staging:**
- [ ] Start all services
  ```bash
  docker-compose up -d
  ```
- [ ] All containers running
  ```bash
  docker-compose ps
  ```
- [ ] No errors in logs
  ```bash
  docker-compose logs
  ```

**Production:**
- [ ] Start with production config
  ```bash
  docker-compose -f docker-compose.nginx.yml up -d
  ```
- [ ] All containers healthy
- [ ] SSL certificates obtained (if using nginx setup)
  ```bash
  ./setup-ssl.sh your-domain.com admin@your-domain.com
  ```

### 8. Health Checks

- [ ] Web service accessible
  ```bash
  curl http://localhost:3000/api/health
  ```
- [ ] Response: `{"status":"ok",...}`
- [ ] Via load balancer (production)
  ```bash
  curl https://your-domain.com/api/health
  ```
- [ ] PostgreSQL healthy
  ```bash
  docker-compose exec postgres pg_isready
  ```
- [ ] Redis healthy
  ```bash
  docker-compose exec redis redis-cli ping
  ```

### 9. Worker Verification

- [ ] Workers started
  ```bash
  docker-compose logs worker
  ```
- [ ] No connection errors
- [ ] Workers connected to Redis
- [ ] Workers connected to database

## Post-Deployment

### 10. Functional Testing

- [ ] Can access login page
- [ ] Can create account
- [ ] Can create organization
- [ ] Can create endpoint
- [ ] Can create channel
- [ ] Can create route
- [ ] Webhook endpoint accessible
  ```bash
  curl -X POST https://your-domain.com/api/webhook/org-slug/endpoint-slug \
    -H "Content-Type: application/json" \
    -d '{"test": true}'
  ```
- [ ] Event created in database
- [ ] Delivery processed by worker
- [ ] Message delivered to channel

### 11. Performance Verification

- [ ] Response time acceptable (< 500ms)
- [ ] No memory leaks
  ```bash
  docker stats
  ```
- [ ] CPU usage reasonable (< 50% idle)
- [ ] Disk usage monitored
  ```bash
  df -h
  ```

### 12. Scaling (Production)

- [ ] Scale workers as needed
  ```bash
  docker-compose up -d --scale worker=5
  ```
- [ ] Scale web servers (with load balancer)
  ```bash
  docker-compose -f docker-compose.nginx.yml up -d --scale web=3
  ```
- [ ] Load balancer distributing traffic
- [ ] All instances healthy

### 13. Monitoring Setup

- [ ] Log aggregation configured
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] Backup schedule configured
  ```bash
  # Add to crontab
  0 2 * * * cd /path/to/webhooker && make backup-db
  ```
- [ ] Disk space monitoring
- [ ] SSL certificate expiry monitoring

### 14. Security Hardening

- [ ] Default passwords changed
- [ ] AUTH_SECRET is unique and secure
- [ ] Database password is strong
- [ ] Firewall rules configured
  ```bash
  # Example: ufw
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 22/tcp  # SSH
  ufw enable
  ```
- [ ] SSH key-only authentication (no passwords)
- [ ] fail2ban configured (optional)
- [ ] Regular security updates scheduled
- [ ] Rate limiting verified
  ```bash
  # Test rate limiting
  ab -n 1000 -c 10 https://your-domain.com/api/webhook/test/test
  ```

### 15. Documentation

- [ ] Deployment notes documented
- [ ] Access credentials stored securely
- [ ] Runbook created for common operations
- [ ] Contact information for on-call
- [ ] Rollback procedure documented

### 16. Backup & Recovery

- [ ] Initial backup created
  ```bash
  make backup-db
  ```
- [ ] Backup stored offsite
- [ ] Recovery procedure tested
  ```bash
  make restore-db FILE=backup.sql
  ```
- [ ] Automated backup verified
- [ ] Retention policy defined

## Maintenance

### Daily

- [ ] Check service health
  ```bash
  docker-compose ps
  ```
- [ ] Review error logs
  ```bash
  docker-compose logs --tail=100 | grep ERROR
  ```
- [ ] Monitor disk space
  ```bash
  df -h
  ```

### Weekly

- [ ] Review performance metrics
- [ ] Check for failed deliveries
- [ ] Review worker queue length
  ```bash
  docker-compose exec redis redis-cli LLEN bullmq:delivery:active
  ```
- [ ] Verify backups

### Monthly

- [ ] Update Docker images
  ```bash
  docker-compose pull
  docker-compose up -d
  ```
- [ ] Review and archive old logs
- [ ] Review and optimize database
  ```bash
  docker-compose exec postgres vacuumdb -U webhooker -d webhooker -z
  ```
- [ ] Test disaster recovery

### Quarterly

- [ ] Security audit
- [ ] Performance tuning
- [ ] Capacity planning review
- [ ] Dependencies update
  ```bash
  pnpm update
  docker-compose build
  ```

## Rollback Procedure

If something goes wrong:

1. [ ] Stop current deployment
   ```bash
   docker-compose down
   ```

2. [ ] Restore previous version
   ```bash
   git checkout <previous-commit>
   docker-compose build
   ```

3. [ ] Restore database (if needed)
   ```bash
   make restore-db FILE=backup_before_deployment.sql
   ```

4. [ ] Start services
   ```bash
   docker-compose up -d
   ```

5. [ ] Verify health
   ```bash
   curl http://localhost:3000/api/health
   ```

6. [ ] Document incident

## Troubleshooting

### Common Issues

**Service Won't Start:**
- [ ] Check logs: `docker-compose logs <service>`
- [ ] Verify environment variables
- [ ] Check port conflicts: `netstat -tulpn | grep <port>`
- [ ] Verify disk space: `df -h`

**Worker Not Processing:**
- [ ] Check Redis connection: `docker-compose exec redis redis-cli ping`
- [ ] Check worker logs: `docker-compose logs worker`
- [ ] Verify queue: `docker-compose exec redis redis-cli LLEN bullmq:delivery:waiting`
- [ ] Restart worker: `docker-compose restart worker`

**Database Connection Failed:**
- [ ] Check PostgreSQL: `docker-compose exec postgres pg_isready`
- [ ] Verify DATABASE_URL
- [ ] Check network: `docker network ls`
- [ ] Check connection limit: `docker-compose exec postgres psql -U webhooker -c "SELECT count(*) FROM pg_stat_activity;"`

**Out of Memory:**
- [ ] Check stats: `docker stats`
- [ ] Reduce worker count: `docker-compose up -d --scale worker=2`
- [ ] Increase server memory
- [ ] Add swap space

**High CPU Usage:**
- [ ] Check stats: `docker stats`
- [ ] Review worker concurrency settings
- [ ] Check for infinite loops in logs
- [ ] Reduce number of workers

## Support Contacts

- **DevOps Lead:** [contact]
- **Database Admin:** [contact]
- **Security Team:** [contact]
- **On-Call:** [contact]

## References

- [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - Quick start guide
- [DOCKER.md](./DOCKER.md) - Comprehensive Docker guide
- [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md) - Complete overview

---

**Last Updated:** [Date]
**Deployed By:** [Name]
**Deployment Version:** [Version/Commit]
