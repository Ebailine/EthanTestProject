# Pathfinder Quick Start Guide

## Prerequisites

- **Node.js** 18+ (download from https://nodejs.org)
- **Docker & Docker Compose** (download from https://docker.com)
- **Git** (download from https://git-scm.com)
- **Code editor** (VS Code recommended)

## Step 1: Project Setup

### Clone and Install Dependencies

```bash
# Navigate to project directory
cd /workspace/cmhkjmd9900aftmikhfc0qtcr/EthanTestProject

# Install root dependencies
npm install

# Install app dependencies
cd app
npm install

# Install ingestion dependencies
cd ../ingestion
npm install

# Return to root
cd ..
```

### Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file (required minimal setup)
# For local testing, you can use these minimal values:
```

**Minimal `.env` file for local testing:**
```env
# Database - Use local Docker containers
DATABASE_URL=postgresql://pathfinder:pathfinder_dev@localhost:5432/pathfinder
REDIS_URL=redis://localhost:6379

# Search - Use local Typesense
TYPESENSE_API_KEY=xyz
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108

# Authentication - Get free keys from these services:
# Clerk: https://dashboard.clerk.com/
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Development
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_secret_change_in_production
```

## Step 2: Start Services

### Start Docker Services
```bash
# Start PostgreSQL, Redis, Typesense, and n8n
docker compose up -d

# Verify services are running
docker compose ps
```

**Expected output:**
```
NAME                    COMMAND                  SERVICE             STATUS              PORTS
pathfinder-postgres     "docker-entrypoint.s…"   postgres             running             0.0.0.0:5432->5432/tcp
pathfinder-redis         "docker-entrypoint.s…"   redis                running             0.0.0.0:6379->6379/tcp
pathfinder-typesense     "typesense"              typesense            running             0.0.0.0:8108->8108/tcp
pathfinder-n8n          "n8n"                    n8n                  running             0.0.0.0:5678->5678/tcp
```

### Setup Database
```bash
# Navigate to app directory
cd app

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed

# Return to root
cd ..
```

## Step 3: Run the Application

### Start Development Servers

```bash
# Start both frontend and ingestion services in parallel
npm run dev
```

**This will start:**
- Frontend: http://localhost:3000 (Next.js app)
- Ingestion API: http://localhost:3001 (Job collection service)
- n8n Dashboard: http://localhost:5678 (Workflow automation)
- Typesense Dashboard: http://localhost:8108 (Search interface)

### Access Points

1. **Main Application**: http://localhost:3000
2. **n8n Workflows**: http://localhost:5678 (admin/admin)
3. **Typesense Dashboard**: http://localhost:8108
4. **Job Search**: http://localhost:3000/jobs
5. **User Dashboard**: http://localhost:3000/dashboard

## Step 4: Test the Application

### 1. Test Job Search (No Auth Required)

Visit http://localhost:3000/jobs

**What you should see:**
- Job search interface with filters
- Sample job listings (mock data)
- Search functionality
- Filter buttons (Engineering, Design, Remote, Paid)

### 2. Test Authentication (Requires Clerk Setup)

1. **Get Clerk Keys** (5 minutes):
   - Go to https://dashboard.clerk.com
   - Sign up for free account
   - Create new application
   - Copy Publishable Key and Secret Key to your `.env`
   - Set "Development domains" to `localhost:3000`

2. **Test Authentication Flow**:
   - Visit http://localhost:3000
   - Click "Sign In" or "Get Started"
   - Test email/password signup
   - Test Google/GitHub login (if configured)

### 3. Test User Dashboard

After signing in:
1. Visit http://localhost:3000/dashboard
2. Should see analytics and performance metrics
3. Should display recent activity

### 4. Test Complete User Flow

1. **Sign up** for an account
2. **Complete onboarding** (profile setup)
3. **Browse jobs** at /jobs
4. **Search and filter** opportunities
5. **Launch outreach** (if n8n workflows are configured)

## Step 5: Test Background Services

### Test Job Ingestion

```bash
# Run ingestion service directly
cd ingestion
npm run dev

# In another terminal, test the API:
curl http://localhost:3001/connectors/greenhouse
```

### Test n8n Workflows

1. Visit http://localhost:5678
2. Login with admin/admin
3. Import workflows from `/flows` directory:
   - `flows/job-ingestion.json`
   - `flows/company-research.json`
   - `flows/contact-finder.json`

### Test Search API

```bash
# Test job search API
curl -X POST http://localhost:3000/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"filters": {"function": ["engineering"]}}'
```

## Common Issues & Solutions

### Port Already in Use
If you see "Port already in use" or "EADDRINUSE" errors:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

**Check all ports:**
```bash
lsof -i :3000  # Frontend
lsof -i :3001  # Ingestion API
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8108  # Typesense
lsof -i :5678  # n8n
```

### Docker Won't Start
If Docker services fail to start or health checks fail:

```bash
# Reset Docker completely
docker system prune -a
docker-compose down -v
docker-compose up -d

# Check service logs
docker-compose logs postgres
docker-compose logs typesense
docker-compose logs n8n

# Verify Docker is running
docker ps
```

### Database Connection Failed
If you see "Database connection failed" or "Can't reach database server":

```bash
# Check if postgres is running
docker-compose ps postgres

# Check logs for errors
docker-compose logs postgres

# Restart postgres service
docker-compose restart postgres

# If still failing, reset database:
docker-compose down
docker volume rm pathfinder_postgres_data
docker-compose up -d postgres
cd app && npm run db:migrate && cd ..
```

### Permission Denied (Database)
If you see "permission denied for database" errors:

```bash
# Complete database reset
docker-compose down
docker volume rm pathfinder_postgres_data
docker-compose up -d postgres

# Wait for postgres to be healthy
docker-compose ps

# Re-run migrations
cd app && npm run db:migrate && cd ..
```

### npm install fails with peer dependency errors
If npm install fails with dependency conflicts:

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
rm -rf app/node_modules app/package-lock.json
rm -rf ingestion/node_modules ingestion/package-lock.json
npm cache clean --force
npm install

# If still failing, use --legacy-peer-deps
npm install --legacy-peer-deps
```

### Build Error: Module not found
If you see "Module not found: Can't resolve 'lucide-react'" or similar:

```bash
# Install missing dependencies
cd app && npm install lucide-react @tailwindcss/forms @tailwindcss/typography && cd ..
```

### Environment Variables Not Loading
If environment variables aren't working:

```bash
# Verify .env file exists
ls -la .env

# Check format (no quotes, no spaces around =)
cat .env

# Restart all services
docker-compose restart
npm run dev
```

### Prisma Client Errors
If you see "Prisma Client is not generated" or schema errors:

```bash
cd app
npm run db:generate
npm run db:migrate
cd ..
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Application loads at http://localhost:3000
- [ ] Job search page works with sample data
- [ ] Filters and search are functional
- [ ] Responsive design works on mobile
- [ ] Navigation between pages works

### ✅ Authentication (if Clerk configured)
- [ ] User can sign up
- [ ] User can sign in/out
- [ ] User profile creation works
- [ ] Protected routes are secured

### ✅ Background Services
- [ ] Docker services are running
- [ ] Database migrations applied
- [ ] n8n dashboard accessible
- [ ] Typesense dashboard accessible

### ✅ API Endpoints
- [ ] Job search API returns data
- [ ] Performance monitoring works
- [ ] Error handling functions correctly

## Next Steps After Local Testing

1. **Configure Real Services**: Set up actual Clerk keys for full functionality
2. **Import Workflows**: Load n8n workflows for automation
3. **Add Real Data**: Connect to real job sources
4. **Test Email Integration**: Configure Gmail/Outlook for outreach
5. **Deploy to Production**: Follow deployment guide for beta launch

## Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs in GitHub Issues
- **Community**: Join Discord for support
- **Email**: Contact support@pathfinder.com

Happy testing! 🚀