# Pathfinder Deployment Guide

This guide covers deploying Pathfinder to production for beta launch.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Next.js App    │    │   Database       │
│   (Vercel)      │◄──►│   (Serverless)   │◄──►│   (PostgreSQL)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CDN           │    │   Typesense      │    │   Redis Cache    │
│   (Vercel Edge)  │    │   (Search)       │    │   (Sessions)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Environment Setup

### Production Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/pathfinder_prod
REDIS_URL=redis://host:6379

# Search
TYPESENSE_API_KEY=your_production_api_key
TYPESENSE_HOST=your-typesense-cluster.com
TYPESENSE_PORT=443

# Authentication
CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key

# Email Services
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret

# LLM Services
ANTHROPIC_API_KEY=your_claude_production_key
OPENAI_API_KEY=your_openai_production_key

# External APIs
NEVERBOUNCE_API_KEY=your_neverbounce_prod_key
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
POSTHOG_API_KEY=your_posthog_api_key

# Application
NODE_ENV=production
NEXTAUTH_URL=https://app.pathfinder.com
NEXTAUTH_SECRET=your_strong_secret
```

## Hosting Infrastructure

### Frontend (Vercel)

1. **Connect Repository**
   ```bash
   vercel link
   vercel --prod
   ```

2. **Environment Variables**
   - Set all environment variables in Vercel dashboard
   - Use production API keys and secrets

3. **Domain Configuration**
   - Add custom domain: `app.pathfinder.com`
   - Configure SSL (automatically handled by Vercel)

### Database (Railway)

1. **Create PostgreSQL Instance**
   ```bash
   # Using Railway CLI
   railway login
   railway create
   railway variables set DATABASE_URL=your_production_url
   ```

2. **Run Migrations**
   ```bash
   railway run npm run db:migrate
   railway run npm run db:generate
   ```

3. **Connection Pooling**
   - Enable connection pooling in Railway
   - Configure pool size based on expected load

### Search (Typesense Cloud)

1. **Create Cluster**
   - Sign up for Typesense Cloud
   - Create cluster in appropriate region

2. **Initialize Collection**
   ```bash
   # Run collection initialization
   curl -X POST "https://your-cluster.typesense.net/collections" \
     -H "X-TYPESENSE-API-KEY: your_api_key" \
     -H "Content-Type: application/json" \
     -d @typesense-schema.json
   ```

### Cache (Redis Cloud)

1. **Create Redis Instance**
   - Use Redis Cloud or Upstash
   - Configure for session storage

## Deployment Steps

### 1. Prepare for Deployment

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

### 2. Database Migration

```bash
# Backup current database (if exists)
pg_dump $DATABASE_URL > backup.sql

# Run migrations
npm run db:migrate

# Seed initial data (if needed)
npm run db:seed
```

### 3. Deploy Frontend

```bash
# Deploy to Vercel
vercel --prod

# Verify deployment
curl -I https://app.pathfinder.com
```

### 4. Configure Background Services

```bash
# Deploy n8n workflows
# Option 1: n8n Cloud
# Option 2: Self-hosted on VPS

# Example: Self-hosted deployment
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Initialize Search Index

```bash
# Index existing jobs
curl -X POST "https://api.pathfinder.com/api/jobs/reindex" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Monitoring Setup

### Application Monitoring

1. **Sentry Error Tracking**
   ```javascript
   // next.config.js
   const { withSentryConfig } = require('@sentry/nextjs')

   module.exports = withSentryConfig({
     // Your existing config
   })
   ```

2. **PostHog Analytics**
   ```javascript
   // lib/analytics.ts
   import { PostHog } from 'posthog-js'

   export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
     api_host: 'https://app.posthog.com'
   })
   ```

### Infrastructure Monitoring

1. **Database Monitoring**
   - Set up query performance alerts
   - Monitor connection pool usage
   - Track storage growth

2. **Search Performance**
   - Monitor Typesense cluster health
   - Track query response times
   - Set up index rebuild alerts

3. **API Performance**
   - Monitor response times
   - Track error rates
   - Set up alerting for high latency

## Security Configuration

### 1. SSL/TLS

- Frontend: Handled by Vercel
- Database: Use SSL connection strings
- APIs: Enforce HTTPS only

### 2. Rate Limiting

```javascript
// lib/rate-limiter.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
```

### 3. Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

## Beta Launch Checklist

### Pre-Launch

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup procedures implemented
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Error handling verified

### User Onboarding

- [ ] Create onboarding email templates
- [ ] Set up user support channels
- [ ] Prepare help documentation
- [ ] Test sign-up flow end-to-end
- [ ] Verify email integrations work

### Post-Launch

- [ ] Monitor error rates
- [ ] Track user engagement metrics
- [ ] Set up automated backups
- [ ] Monitor database performance
- [ ] Track API response times
- [ ] Monitor search performance

## Rollback Plan

### 1. Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Rollback migrations
npm run db:migrate:rollback
```

### 2. Application Rollback

```bash
# Vercel rollback
vercel rollback

# Or deploy previous commit
git checkout previous-commit
vercel --prod
```

### 3. Search Rollback

```bash
# Restore search index from backup
curl -X POST "https://api.pathfinder.com/api/search/restore" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"backup_id": "backup_id"}'
```

## Scaling Considerations

### Horizontal Scaling

- **Frontend**: Vercel automatically scales
- **Database**: Use read replicas for read-heavy workloads
- **Search**: Typesense supports horizontal scaling
- **Cache**: Redis clustering for session storage

### Performance Optimization

- **CDN**: Vercel Edge Network for static assets
- **Database**: Connection pooling and query optimization
- **Search**: Proper indexing and query optimization
- **Caching**: Strategic caching of frequently accessed data

## Support Procedures

### Incident Response

1. **Detection**: Monitoring alerts trigger
2. **Assessment**: Determine impact and scope
3. **Communication**: Notify stakeholders
4. **Resolution**: Implement fix or rollback
5. **Recovery**: Verify service restoration
6. **Post-mortem**: Document lessons learned

### User Support

- **Email**: support@pathfinder.com
- **Documentation**: https://docs.pathfinder.com
- **Status Page**: https://status.pathfinder.com
- **Community**: Discord for beta users

---

## Emergency Contacts

- **Technical Lead**: [Contact info]
- **DevOps**: [Contact info]
- **Product Manager**: [Contact info]
- **Customer Support**: [Contact info]

This deployment guide should be updated regularly as the infrastructure evolves.