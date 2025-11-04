# Pathfinder Testing Guide

## Quick Test (5 minutes)

After running `./setup.sh`, verify everything works:

### 1. Check Services
```bash
docker-compose ps
```
All services should show "Up" and "healthy".

### 2. Test Frontend
```bash
npm run dev
```
Visit http://localhost:3000/jobs - you should see 50+ internship listings.

### 3. Run Health Checks
```bash
./scripts/health-check.sh
```
All checks should pass.

---

## Comprehensive Test Suite

### Frontend Tests

#### TypeScript Compilation
```bash
cd app
npm run typecheck
```
**Expected**: Should pass with 0 errors

#### Linting
```bash
cd app
npm run lint
```
**Expected**: Should pass with 0 errors

#### Build Test
```bash
cd app
npm run build
```
**Expected**: Should build successfully with no errors

#### Unit Tests (if available)
```bash
cd app
npm test
```
**Expected**: All tests pass

---

### API Endpoint Tests

#### Test Job Search
```bash
curl -X POST http://localhost:3000/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"filters": {}}'
```
**Expected**: Returns JSON with jobs array containing 50+ jobs

#### Test Job Detail
```bash
# First get a job ID from the search response, then:
curl http://localhost:3000/api/jobs/<JOB_ID>
```
**Expected**: Returns detailed job information

#### Test Performance Endpoint (if admin key is set)
```bash
curl http://localhost:3000/api/performance \
  -H "x-admin-api-key: your_admin_key"
```
**Expected**: Returns performance metrics

---

### Database Tests

#### Check Sample Data
```bash
docker-compose exec postgres psql -U pathfinder -d pathfinder \
  -c "SELECT COUNT(*) FROM \"Job\";"
```
**Expected**: Returns count > 0 (should be 50+)

#### Check All Tables Exist
```bash
docker-compose exec postgres psql -U pathfinder -d pathfinder \
  -c "\dt"
```
**Expected**: Shows tables: companies, jobs, sources, moments, contacts, users, outreach_*, etc.

#### Check Database Permissions
```bash
docker-compose exec postgres psql -U pathfinder -d pathfinder \
  -c "SELECT 1;"
```
**Expected**: Returns "1" without permission errors

#### Check Table Structure
```bash
docker-compose exec postgres psql -U pathfinder -d pathfinder \
  -c "\d \"Job\""
```
**Expected**: Shows Job table schema with all columns

---

### Service Health Tests

#### PostgreSQL Health
```bash
docker-compose exec postgres pg_isready -U pathfinder -d pathfinder
```
**Expected**: "accepting connections"

#### Redis Health
```bash
docker-compose exec redis redis-cli ping
```
**Expected**: "PONG"

#### Typesense Health
```bash
curl http://localhost:8108/health
```
**Expected**: Returns health status JSON

#### n8n Health
```bash
curl http://localhost:5678/healthz
```
**Expected**: Returns "ok"

---

### Performance Tests

#### API Response Time
```bash
time curl -s http://localhost:3000/api/jobs/search \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"filters": {}}'
```
**Expected**: Completes in < 2 seconds

#### Frontend Load Time
```bash
time curl -s http://localhost:3000/jobs > /dev/null
```
**Expected**: Completes in < 1 second

---

## Automated Testing

### Run Comprehensive Test Script
```bash
./scripts/test.sh
```

This checks:
- ✅ Docker services health
- ✅ Database connectivity
- ✅ API endpoints
- ✅ Frontend build
- ✅ TypeScript compilation
- ✅ Sample data presence
- ✅ Environment configuration

### Run Health Check Script
```bash
./scripts/health-check.sh
```

This checks:
- ✅ All services running and healthy
- ✅ Database connection and permissions
- ✅ Sample data loaded
- ✅ Dependencies installed
- ✅ Environment files exist
- ✅ Frontend builds successfully
- ✅ TypeScript compilation
- ✅ Prisma client generated

---

## Manual Testing Checklist

### Basic Functionality
- [ ] Frontend loads at http://localhost:3000
- [ ] Job search page shows internships at http://localhost:3000/jobs
- [ ] Search functionality works
- [ ] Filters apply correctly (location, pay, company)
- [ ] Job details modal opens when clicking a job
- [ ] No console errors in browser
- [ ] Navigation between pages works
- [ ] Responsive design works on mobile view

### Data Integrity
- [ ] Jobs display correct information (title, company, location, pay)
- [ ] Job descriptions render properly
- [ ] Company logos/images load (if available)
- [ ] Application links work and open in new tabs

### Search & Filters
- [ ] Search by keyword works
- [ ] Filter by location works
- [ ] Filter by salary range works
- [ ] Filter by remote/hybrid/onsite works
- [ ] Filter by company works
- [ ] Filters can be combined
- [ ] Clear filters button works

### Performance
- [ ] Initial page load is fast (< 3 seconds)
- [ ] Search results appear quickly (< 2 seconds)
- [ ] No lag when scrolling through jobs
- [ ] Filtering is responsive

---

## Integration Testing

### Ingestion Service (if running)
```bash
cd ingestion
npm run dev
```
**Expected**: Ingestion service starts without errors

### n8n Workflows
1. Visit http://localhost:5678
2. Login with credentials from `.env` (admin / pathfinder_dev)
3. Import workflows from `flows/` directory
4. Test workflow execution

---

## Troubleshooting Tests

### If Frontend Build Fails
```bash
cd app
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### If Database Tests Fail
```bash
./cleanup.sh
./setup.sh
```

### If Health Checks Fail
```bash
docker-compose logs [service_name]
docker-compose restart [service_name]
```

---

## Continuous Testing

### Watch Mode for Development
```bash
# Terminal 1: Run frontend
cd app && npm run dev

# Terminal 2: Watch TypeScript
cd app && npm run typecheck -- --watch

# Terminal 3: Monitor logs
docker-compose logs -f
```

### Pre-Commit Checks
Before committing code, run:
```bash
cd app
npm run typecheck  # Must pass
npm run lint       # Must pass
npm run build      # Must succeed
```

---

## Success Criteria

All tests pass when:
1. ✅ `./scripts/health-check.sh` exits with code 0
2. ✅ `./scripts/test.sh` shows all checks passing
3. ✅ Frontend builds without errors
4. ✅ API endpoints return expected data
5. ✅ Database contains sample data (50+ jobs)
6. ✅ No TypeScript compilation errors
7. ✅ All Docker services are healthy

---

## Performance Benchmarks

### Expected Performance
- **Page Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Database Queries**: < 500ms
- **Frontend Build**: < 60 seconds

### Monitoring Performance
```bash
# Check Docker resource usage
docker stats --no-stream

# Check database performance
docker-compose exec postgres psql -U pathfinder -d pathfinder \
  -c "SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables;"
```

---

## Automated CI/CD Testing

If GitHub Actions is set up (`.github/workflows/test.yml`):

1. Every push runs automated tests
2. Pull requests require tests to pass
3. Build artifacts are cached for faster CI

View test results at: `https://github.com/[org]/[repo]/actions`

---

## Reporting Issues

If tests fail, please include:
1. **Test command**: What test failed
2. **Error output**: Full error message
3. **Environment**: OS, Node version, Docker version
4. **Steps to reproduce**: What you did before the failure
5. **Logs**: Relevant logs from `docker-compose logs`

Create an issue at: https://github.com/ebailine/EthanTestProject/issues