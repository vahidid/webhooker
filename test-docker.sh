#!/bin/bash

# Docker Setup Test Script
# This script tests the Docker deployment to ensure everything is working correctly

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Docker Setup Test Suite"
echo "=========================================="
echo ""

# Function to print test results
pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo "ℹ $1"
}

# Test 1: Docker installed
echo "Test 1: Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    pass "Docker installed: $DOCKER_VERSION"
else
    fail "Docker is not installed"
fi

# Test 2: Docker Compose installed
echo "Test 2: Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    pass "Docker Compose installed: $COMPOSE_VERSION"
else
    fail "Docker Compose is not installed"
fi

# Test 3: Docker daemon running
echo "Test 3: Checking Docker daemon..."
if docker info &> /dev/null; then
    pass "Docker daemon is running"
else
    fail "Docker daemon is not running"
fi

# Test 4: Check required files
echo "Test 4: Checking required files..."
REQUIRED_FILES=(
    "Dockerfile"
    ".dockerignore"
    "docker-compose.yml"
    "next.config.ts"
    "package.json"
    "prisma/schema.prisma"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        pass "Found $file"
    else
        fail "Missing $file"
    fi
done

# Test 5: Check if containers are running
echo "Test 5: Checking running containers..."
if docker-compose ps | grep -q "Up"; then
    pass "Containers are running"
    info "Running containers:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | grep -v "^Name"
else
    warn "No containers running. Start with: docker-compose up -d"
fi

# Test 6: Check web service health (if running)
echo "Test 6: Checking web service health..."
if docker-compose ps web 2>/dev/null | grep -q "Up"; then
    WEB_PORT=$(docker-compose port web 3000 2>/dev/null | cut -d: -f2)
    if [ -n "$WEB_PORT" ]; then
        HEALTH_CHECK=$(curl -s "http://localhost:$WEB_PORT/api/health" || echo "failed")
        if echo "$HEALTH_CHECK" | grep -q "ok"; then
            pass "Web service is healthy"
            info "Health check response: $HEALTH_CHECK"
        else
            fail "Web service health check failed"
        fi
    else
        warn "Web service port not exposed"
    fi
else
    warn "Web service not running"
fi

# Test 7: Check database connectivity (if running)
echo "Test 7: Checking database connectivity..."
if docker-compose ps postgres 2>/dev/null | grep -q "Up"; then
    DB_CHECK=$(docker-compose exec -T postgres pg_isready -U webhooker 2>/dev/null || echo "failed")
    if echo "$DB_CHECK" | grep -q "accepting connections"; then
        pass "Database is accepting connections"
    else
        fail "Database connection failed"
    fi
else
    warn "Database not running"
fi

# Test 8: Check Redis connectivity (if running)
echo "Test 8: Checking Redis connectivity..."
if docker-compose ps redis 2>/dev/null | grep -q "Up"; then
    REDIS_CHECK=$(docker-compose exec -T redis redis-cli ping 2>/dev/null || echo "failed")
    if echo "$REDIS_CHECK" | grep -q "PONG"; then
        pass "Redis is responding"
    else
        fail "Redis connection failed"
    fi
else
    warn "Redis not running"
fi

# Test 9: Check worker service (if running)
echo "Test 9: Checking worker service..."
if docker-compose ps worker 2>/dev/null | grep -q "Up"; then
    WORKER_LOGS=$(docker-compose logs --tail=5 worker 2>/dev/null)
    if echo "$WORKER_LOGS" | grep -q "worker"; then
        pass "Worker service is running"
        info "Recent worker activity detected"
    else
        warn "Worker logs don't show recent activity"
    fi
else
    warn "Worker service not running"
fi

# Test 10: Check disk space
echo "Test 10: Checking disk space..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    pass "Sufficient disk space available (${DISK_USAGE}% used)"
elif [ "$DISK_USAGE" -lt 90 ]; then
    warn "Disk usage is high (${DISK_USAGE}% used)"
else
    fail "Disk space critical (${DISK_USAGE}% used)"
fi

# Test 11: Check Docker image size
echo "Test 11: Checking Docker image size..."
if docker images | grep -q "webhooker"; then
    IMAGE_SIZE=$(docker images webhooker --format "{{.Size}}" | head -n 1)
    pass "Image size: $IMAGE_SIZE"
    if [[ "$IMAGE_SIZE" == *"GB"* ]]; then
        SIZE_NUM=$(echo "$IMAGE_SIZE" | sed 's/[^0-9.]//g')
        if (( $(echo "$SIZE_NUM > 1" | bc -l) )); then
            warn "Image size is large (> 1GB). Consider optimization."
        fi
    fi
else
    warn "No webhooker image found. Build with: docker-compose build"
fi

# Test 12: Check environment variables
echo "Test 12: Checking environment configuration..."
if [ -f ".env" ]; then
    pass ".env file exists"
    
    # Check critical variables
    if grep -q "DATABASE_URL" .env && [ -n "$(grep "DATABASE_URL" .env | cut -d= -f2)" ]; then
        pass "DATABASE_URL is set"
    else
        warn "DATABASE_URL not configured in .env"
    fi
    
    if grep -q "AUTH_SECRET" .env && [ -n "$(grep "AUTH_SECRET" .env | cut -d= -f2)" ]; then
        AUTH_SECRET_LEN=$(grep "AUTH_SECRET" .env | cut -d= -f2 | tr -d '"' | wc -c)
        if [ "$AUTH_SECRET_LEN" -ge 32 ]; then
            pass "AUTH_SECRET is set and sufficient length"
        else
            warn "AUTH_SECRET is too short (< 32 characters)"
        fi
    else
        warn "AUTH_SECRET not configured in .env"
    fi
else
    warn ".env file not found. Copy from .env.example"
fi

# Test 13: Network connectivity
echo "Test 13: Checking Docker networks..."
if docker network ls | grep -q "webhooker-network"; then
    pass "webhooker-network exists"
else
    warn "webhooker-network not created yet"
fi

# Test 14: Volume persistence
echo "Test 14: Checking Docker volumes..."
VOLUMES=("postgres_data" "redis_data")
for vol in "${VOLUMES[@]}"; do
    if docker volume ls | grep -q "$vol"; then
        pass "$vol volume exists"
    else
        warn "$vol volume not created yet"
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="

if docker-compose ps &>/dev/null; then
    RUNNING_CONTAINERS=$(docker-compose ps --services --filter "status=running" | wc -l)
    TOTAL_CONTAINERS=$(docker-compose ps --services | wc -l)
    
    echo "Running: $RUNNING_CONTAINERS/$TOTAL_CONTAINERS containers"
    echo ""
    
    if [ "$RUNNING_CONTAINERS" -eq 0 ]; then
        info "To start services: docker-compose up -d"
        info "Or use: make up"
    elif [ "$RUNNING_CONTAINERS" -eq "$TOTAL_CONTAINERS" ]; then
        pass "All services are running!"
        echo ""
        info "Access the application at: http://localhost:3000"
        info "View logs with: docker-compose logs -f"
        info "Or use: make logs"
    else
        warn "Some services are not running"
        info "Check status: docker-compose ps"
        info "View logs: docker-compose logs"
    fi
else
    info "No docker-compose services detected"
    info "Start services with: docker-compose up -d"
fi

echo ""
echo "For more commands, see: make help"
echo "For deployment guide, see: DOCKER.md"
echo "For quick start, see: DOCKER_QUICKSTART.md"
echo "=========================================="
