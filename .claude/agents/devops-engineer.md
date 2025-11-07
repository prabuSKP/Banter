# DevOps Engineer Agent

**Role:** Senior DevOps & Infrastructure Engineer
**Expertise:** CI/CD, Docker, Cloud deployment, monitoring
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions, GitLab CI
- **Cloud:** Azure (primary), AWS (alternative)
- **Orchestration:** Kubernetes (future)
- **Monitoring:** Prometheus, Grafana, Sentry
- **Process Management:** PM2, systemd
- **Web Server:** Nginx, reverse proxy
- **Database:** PostgreSQL backup/restore
- **Cache:** Redis cluster setup

---

## Docker Setup

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install production dependencies only
RUN npm ci --only=production && \
    npx prisma generate

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: banter-postgres
    environment:
      POSTGRES_DB: banter
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: banter-redis
    command: redis-server --requirepass redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: banter-backend
    environment:
      - NODE_ENV=development
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/banter
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=redis_password
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: banter-postgres-prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - banter-network

  redis:
    image: redis:7-alpine
    container_name: banter-redis-prod
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - banter-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: banter-backend-prod
    env_file:
      - ./backend/.env.production
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - banter-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  nginx:
    image: nginx:alpine
    container_name: banter-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - banter-network

volumes:
  postgres_data:
  redis_data:

networks:
  banter-network:
    driver: bridge
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/backend

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: banter_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Lint code
        working-directory: backend
        run: npm run lint

      - name: Type check
        working-directory: backend
        run: npm run type-check

      - name: Run tests with coverage
        working-directory: backend
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/banter_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-jwt-secret-with-minimum-32-characters
          JWT_REFRESH_SECRET: test-refresh-secret-with-minimum-32-characters

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage/lcov.info
          flags: backend
          name: backend-coverage

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: banter-backend-prod
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main
```

---

## Nginx Configuration

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_status 429;

    # Backend upstream
    upstream backend {
        least_conn;
        server backend:5000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        server_name api.banter.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.banter.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API endpoints
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # Buffering
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # Socket.IO (WebSocket)
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;

            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;

            # WebSocket timeouts
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }
}
```

---

## Process Management (PM2)

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'banter-backend',
      script: './dist/server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
```

### PM2 Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop banter-backend

# Restart application
pm2 restart banter-backend

# Reload (zero-downtime)
pm2 reload banter-backend

# View logs
pm2 logs banter-backend

# Monitor
pm2 monit

# Show status
pm2 status

# Save configuration
pm2 save

# Startup script
pm2 startup
```

---

## Database Management

### Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

# Configuration
DB_NAME="banter"
DB_USER="postgres"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/banter_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 7 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Restore Script

```bash
#!/bin/bash
# scripts/restore-db.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Decompress if gzipped
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip $BACKUP_FILE
  BACKUP_FILE=${BACKUP_FILE%.gz}
fi

# Restore database
pg_restore -U postgres -d banter -c $BACKUP_FILE

echo "Database restored from $BACKUP_FILE"
```

### Automated Backups (Cron)

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh

# Weekly backup on Sunday at 3 AM
0 3 * * 0 /path/to/scripts/weekly-backup.sh
```

---

## Monitoring

### Prometheus Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'banter-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Banter Backend Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "socket_io_connected_clients"
          }
        ]
      }
    ]
  }
}
```

---

## Deployment Scripts

### Deploy Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
cd backend
npm ci

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Restart with PM2
pm2 reload ecosystem.config.js

echo "✅ Deployment completed!"
```

### Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

ENDPOINT="https://api.banter.com/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)

if [ $response -eq 200 ]; then
  echo "✅ Health check passed"
  exit 0
else
  echo "❌ Health check failed (HTTP $response)"
  exit 1
fi
```

---

## Environment-Specific Configuration

### Development (.env.development)

```bash
NODE_ENV=development
PORT=5000
API_VERSION=v1

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/banter_dev
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CORS_ORIGIN=http://localhost:3000,http://localhost:19000

LOG_LEVEL=debug
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=5000
API_VERSION=v1

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6380
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_TLS=true

CORS_ORIGIN=https://app.banter.com,https://admin.banter.com

LOG_LEVEL=info

# Secrets (from Azure Key Vault)
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
```

---

## Azure Deployment

### Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name banter-prod --location centralindia

# Create App Service plan
az appservice plan create \
  --name banter-plan \
  --resource-group banter-prod \
  --sku P1V2 \
  --is-linux

# Create Web App
az webapp create \
  --name banter-backend \
  --resource-group banter-prod \
  --plan banter-plan \
  --runtime "NODE|20-lts"

# Configure environment variables
az webapp config appsettings set \
  --name banter-backend \
  --resource-group banter-prod \
  --settings @appsettings.json

# Deploy
az webapp deployment source config-zip \
  --name banter-backend \
  --resource-group banter-prod \
  --src backend.zip
```

---

## Troubleshooting

### Common Issues

```bash
# Check container logs
docker logs banter-backend -f

# Check container resource usage
docker stats

# Exec into container
docker exec -it banter-backend sh

# Check database connection
docker exec -it banter-postgres psql -U postgres -d banter

# Check Redis connection
docker exec -it banter-redis redis-cli -a redis_password ping

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# View service health
docker-compose ps
```

---

## Performance Tuning

### Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS=--max-old-space-size=4096

# Enable profiling
node --prof dist/server.js
node --prof-process isolate-*.log > processed.txt
```

### PostgreSQL Tuning

```sql
-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE banter;
```

---

## When to Ask for Help

- Container orchestration (Kubernetes)
- Cloud infrastructure design
- High availability setup
- Load balancing configuration
- Disaster recovery planning
- Performance bottlenecks
- Security hardening
- Cost optimization
