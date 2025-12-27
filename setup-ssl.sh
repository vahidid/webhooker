#!/bin/bash

# SSL Certificate Setup Script for Webhooker
# This script helps you set up Let's Encrypt SSL certificates with Certbot

set -e

DOMAIN=${1:-webhooker.app}
EMAIL=${2:-admin@webhooker.app}

echo "=========================================="
echo "SSL Certificate Setup for Webhooker"
echo "=========================================="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Create certbot directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Check if certificate already exists
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "✓ Certificate already exists for $DOMAIN"
    echo ""
    echo "To renew, run:"
    echo "  docker-compose -f docker-compose.nginx.yml exec certbot certbot renew"
    echo ""
    echo "To force renew, run:"
    echo "  docker-compose -f docker-compose.nginx.yml exec certbot certbot renew --force-renewal"
    exit 0
fi

# First, start nginx with HTTP only (for ACME challenge)
echo "Step 1: Starting nginx with HTTP configuration..."
docker-compose -f docker-compose.nginx.yml up -d nginx

echo ""
echo "Step 2: Obtaining SSL certificate from Let's Encrypt..."
echo ""

# Get certificate
docker-compose -f docker-compose.nginx.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ SSL Certificate obtained successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update nginx.conf with your domain: $DOMAIN"
    echo "2. Restart nginx: docker-compose -f docker-compose.nginx.yml restart nginx"
    echo ""
    echo "Certificate location: certbot/conf/live/$DOMAIN/"
    echo "Certificate will auto-renew every 12 hours via the certbot container"
else
    echo ""
    echo "=========================================="
    echo "✗ Failed to obtain SSL certificate"
    echo "=========================================="
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure DNS for $DOMAIN points to this server"
    echo "2. Make sure port 80 is open and accessible"
    echo "3. Check nginx logs: docker-compose -f docker-compose.nginx.yml logs nginx"
    exit 1
fi
