# Production Deployment Guide - CareerPropel

**Version**: 1.0.0
**Date**: May 16, 2026
**Status**: Ready for Production

---

## Table of Contents
1. Pre-Deployment Checklist
2. Environment Configuration
3. Database Setup
4. Security Hardening
5. Deployment Options
6. Monitoring & Maintenance
7. Troubleshooting

---

## 📋 Pre-Deployment Checklist

### Code & Testing
- [ ] All tests passing (`npm run test`)
- [ ] No console warnings or errors
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Security audit passed (`npm audit`)
- [ ] Performance benchmarks met

### Documentation
- [ ] All API endpoints documented
- [ ] Environment variables documented
- [ ] Error codes documented
- [ ] Security policies documented
- [ ] Deployment procedures documented

### Security
- [ ] All sensitive data removed from code
- [ ] No hardcoded credentials
- [ ] `.env.local` excluded from git
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured

### Infrastructure
- [ ] Production database provisioned
- [ ] Redis instance deployed (for rate limiting)
- [ ] Backup strategy planned
- [ ] Monitoring tools configured
- [ ] Error tracking configured
- [ ] CDN configured (optional)

---

## 🔐 Environment Configuration

### Required Environment Variables

**Database**
```env
# Production PostgreSQL
DATABASE_URL="postgresql://user:password@prod-host:5432/careerpropel_prod"
```

**Authentication**
```env
# Must be a strong random string (use: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secure-random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth Providers (optional)
GITHUB_ID="your_github_app_id"
GITHUB_SECRET="your_github_app_secret"
GOOGLE_ID="your_google_client_id"
GOOGLE_SECRET="your_google_client_secret"
```

**API Configuration**
```env
NODE_ENV="production"
NEXT_PUBLIC_API_BASE_URL="https://yourdomain.com/api"
LOG_LEVEL="info"  # Change from "debug" in production
```

**Security**
```env
# Rate Limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"

# CORS - Add all trusted origins
CORS_ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

**Caching & Storage**
```env
# Redis for rate limiting and caching
REDIS_URL="redis://user:password@redis-host:6379"

# Optional: S3 for file uploads
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET="careerpropel-prod"
```

**Monitoring & Logging**
```env
# Error tracking (Sentry)
SENTRY_DSN="https://your_sentry_dsn@sentry.io/project"

# Analytics (optional)
MIXPANEL_TOKEN="your_mixpanel_token"
```

### .env.production File Structure
```bash
# Create .env.production (separate from .env.local)
cat > .env.production << 'EOF'
# Copy all production values here
# NEVER commit this file to git
EOF

# Add to .gitignore
echo ".env.production" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## 🗄️ Database Setup

### PostgreSQL Production Setup

**1. Create Production Database**
```bash
# SSH into your database server
ssh postgres@your-db-host

# Create database and user
psql -U postgres << 'EOF'
CREATE DATABASE careerpropel_prod;
CREATE USER careerpropel_user WITH PASSWORD 'strong-password-here';
GRANT ALL PRIVILEGES ON DATABASE careerpropel_prod TO careerpropel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO careerpropel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO careerpropel_user;
EOF
```

**2. Run Prisma Migrations**
```bash
# In your deployment environment
DATABASE_URL="postgresql://careerpropel_user:password@host:5432/careerpropel_prod" \
npm run db:push

# Verify migrations
DATABASE_URL="postgresql://careerpropel_user:password@host:5432/careerpropel_prod" \
npx prisma studio
```

**3. Backup Strategy**
```bash
# Automated daily backups
# Create a cron job that runs:
pg_dump careerpropel_prod | gzip > backup-$(date +%Y%m%d).sql.gz

# Store in S3 or cold storage
aws s3 cp backup-*.sql.gz s3://careerpropel-backups/
```

**4. Connection Pool Configuration**
```env
# Prisma + PgBouncer for connection pooling
DATABASE_URL="postgresql://careerpropel_user:password@pgbouncer:6432/careerpropel_prod"
```

---

## 🔒 Security Hardening

### HTTPS Configuration

**1. SSL/TLS Certificate**
```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com -d app.yourdomain.com

# Certificate renewal (automatic with certbot)
sudo certbot renew --quiet
```

**2. Nginx Configuration (Example)**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Redis Configuration

**1. Redis Setup**
```bash
# Install and configure Redis
sudo apt-get install redis-server

# Edit /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
requirepass strong-redis-password

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**2. Rate Limiter Migration to Redis**
```typescript
// Update src/lib/middleware/rateLimiter.ts
import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL,
})

// Replace in-memory Map with Redis operations
```

### Secrets Management

**1. Use a Secrets Manager**
```bash
# Option 1: AWS Secrets Manager
aws secretsmanager create-secret \
  --name careerpropel/prod \
  --secret-string file://secrets.json

# Option 2: HashiCorp Vault
vault kv put secret/careerpropel \
  NEXTAUTH_SECRET="..." \
  DATABASE_URL="..."
```

**2. Never Commit Secrets**
```bash
# .gitignore
.env.local
.env.production
.env.*.local
secrets.json
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Deploy**
```bash
vercel --prod
```

**3. Configure Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... add all other variables
```

**Advantages**:
- ✅ Zero-config Next.js deployment
- ✅ Automatic HTTPS
- ✅ CDN included
- ✅ Serverless functions
- ✅ Environment management

### Option 2: Docker Containerization

**1. Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

# Runtime
EXPOSE 3000
CMD ["npm", "start"]
```

**2. Create Docker Compose**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/careerpropel
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: careerpropel
      POSTGRES_USER: careerpropel_user
      POSTGRES_PASSWORD: strong_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**3. Deploy to Docker Host**
```bash
docker-compose build
docker-compose up -d
```

### Option 3: Traditional VPS/Cloud (AWS EC2, DigitalOcean, etc.)

**1. Prepare Server**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx
```

**2. Clone & Setup Project**
```bash
cd /home/ubuntu
git clone https://github.com/your-org/careerpropel.git
cd careerpropel

# Install dependencies
npm install

# Build project
npm run build

# Start with PM2
pm2 start npm --name "careerpropel" -- start
pm2 save
```

**3. Setup Nginx Reverse Proxy**
```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/careerpropel > /dev/null << 'EOF'
upstream careerpropel {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://careerpropel;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable and restart
sudo ln -sf /etc/nginx/sites-available/careerpropel /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 📊 Monitoring & Maintenance

### Error Tracking (Sentry)

**1. Setup Sentry**
```bash
npm install @sentry/nextjs
```

**2. Configure Sentry**
```typescript
// sentry.server.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Performance Monitoring

**1. Vercel Analytics** (if using Vercel)
```typescript
// Built-in for Vercel deployments
```

**2. Custom Metrics**
```typescript
// Track important operations
console.time('api-response');
// ... operation
console.timeEnd('api-response');
```

### Health Checks

**1. Create Health Check Endpoint**
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }))
}
```

**2. Monitor with External Service**
```bash
# Pingdom, UptimeRobot, or similar
# Monitor: https://yourdomain.com/api/health every 5 minutes
```

### Log Aggregation

**1. Setup Logging Infrastructure**
```typescript
// Use Pino or Winston for structured logging
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
})
```

**2. Send to Log Service**
```typescript
// ELK Stack, Datadog, or CloudWatch
// Configure in your logging framework
```

---

## 🧪 Post-Deployment Testing

### Smoke Tests
```bash
# Test critical endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/login
curl -X POST https://yourdomain.com/api/auth/signin
```

### Security Tests
```bash
# Test HTTPS
curl -I https://yourdomain.com

# Check security headers
curl -I https://yourdomain.com | grep -E "Strict-Transport|X-Frame"

# Test rate limiting
for i in {1..150}; do curl https://yourdomain.com/api/jobs; done
# Should get 429 after 100 requests
```

### Performance Tests
```bash
# Load testing with Artillery or k6
npm install -g artillery

artillery quick --count 100 --num 10 https://yourdomain.com
```

---

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql "postgresql://user:pass@host:5432/careerpropel_prod"

# Check Prisma schema
npx prisma validate

# View migrations
npx prisma migrate status
```

### Memory Leaks
```bash
# Monitor with PM2
pm2 monit

# Use Node inspector
node --inspect=0.0.0.0:9229 app.js
```

### Rate Limiting Not Working
```typescript
// Check Redis connection
redis-cli ping
redis-cli info

// Verify middleware integration
console.log('Rate limiting:', process.env.RATE_LIMIT_ENABLED)
```

### CORS Errors
```bash
# Check allowed origins
curl -H "Origin: https://yourdomain.com" -v https://yourdomain.com/api/jobs

# Verify headers in response
# Should include: Access-Control-Allow-Origin
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
```yaml
# Use load balancer (AWS ALB, Nginx)
# Run multiple instances of Node.js app
# Share Redis and PostgreSQL across instances
```

### Caching Strategy
```typescript
// Implement Redis caching
// Cache frequently accessed data
// Invalidate on mutations
```

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_jobs_candidate_id ON jobs(candidate_id);
CREATE INDEX idx_jobs_stage ON jobs(stage);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
```

---

## 📞 Support & Rollback

### Rollback Procedure
```bash
# If deployment fails, revert to previous version
git revert HEAD
npm run build
# Redeploy
```

### Monitoring Alerts
```bash
# Set up alerts for:
- High error rate (> 1%)
- High response time (> 1000ms)
- Database connection pool exhaustion
- Redis disconnection
- Disk space issues
```

---

## ✅ Deployment Checklist (Final)

Before going live:
- [ ] Environment variables set correctly
- [ ] Database migrations run successfully
- [ ] HTTPS/SSL configured
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Rate limiting configured
- [ ] CORS configured for production domain
- [ ] OAuth apps registered and configured
- [ ] Smoke tests passing
- [ ] Security tests passing
- [ ] Performance tests acceptable
- [ ] Team aware of deployment
- [ ] Rollback procedure tested

---

**Document**: DEPLOYMENT_GUIDE.md
**Last Updated**: May 16, 2026
**Status**: Ready for Production
