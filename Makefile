.PHONY: help build up down logs ps restart clean scale-workers scale-web migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs (all services)
	docker-compose logs -f

logs-web: ## View web service logs
	docker-compose logs -f web

logs-worker: ## View worker service logs
	docker-compose logs -f worker

ps: ## Show running containers
	docker-compose ps

restart: ## Restart all services
	docker-compose restart

restart-web: ## Restart web service
	docker-compose restart web

restart-worker: ## Restart worker service
	docker-compose restart worker

clean: ## Stop and remove containers, networks, and volumes
	docker-compose down -v

scale-workers: ## Scale workers (usage: make scale-workers N=5)
	docker-compose up -d --scale worker=$(N)

scale-web: ## Scale web servers (usage: make scale-web N=3)
	docker-compose up -d --scale web=$(N)

migrate: ## Run database migrations
	docker-compose exec web npx prisma migrate deploy

seed: ## Seed the database
	docker-compose exec web pnpm db:seed

shell-web: ## Open shell in web container
	docker-compose exec web sh

shell-worker: ## Open shell in worker container
	docker-compose exec worker sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U webhooker -d webhooker

stats: ## Show container resource usage
	docker stats

backup-db: ## Backup database to backup.sql
	docker-compose exec postgres pg_dump -U webhooker webhooker > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up to backup_$$(date +%Y%m%d_%H%M%S).sql"

restore-db: ## Restore database from backup.sql (usage: make restore-db FILE=backup.sql)
	docker-compose exec -T postgres psql -U webhooker -d webhooker < $(FILE)

prod-up: ## Start with production configuration
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build: ## Build with production configuration
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-down: ## Stop production services
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

dev: ## Start in development mode (local PostgreSQL and Redis)
	docker-compose up -d postgres redis
	@echo "PostgreSQL and Redis started. Run 'pnpm dev' for Next.js"

prune: ## Remove all unused Docker resources
	docker system prune -af --volumes
