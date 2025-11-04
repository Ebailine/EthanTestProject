# 🚀 Test Pathfinder Right Now!

## Quick Test Commands

### 1. **Basic Setup Test**
```bash
cd /workspace/cmhkjmd9900aftmikhfc0qtcr/EthanTestProject

# Install dependencies (if not done)
npm install
cd app && npm install && cd ../ingestion && npm install && cd ..

# Start services
docker-compose up -d

# Wait 10 seconds, then check status
docker-compose ps
```

### 2. **Database Setup**
```bash
cd app

# Setup database
npm run db:generate
npm run db:migrate

# Go back to root
cd ..
```

### 3. **Start Application**
```bash
# In one terminal:
npm run dev

# In another terminal, you should see:
# - Frontend running on http://localhost:3000
# - Ingestion API running on http://localhost:3001
```

### 4. **Test the Application**

#### **Test 1: Basic Frontend (No Auth Required)**
```bash
# Visit in browser:
http://localhost:3000/jobs

# You should see:
# - Job search interface
# - Sample job listings
# - Filter buttons (Engineering, Design, etc.)
# - Search functionality
```

#### **Test 2: API Endpoints**
```bash
# Test job search API:
curl -X POST http://localhost:3000/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"filters": {"function": ["engineering"]}}'

# Should return JSON with job data
```

#### **Test 3: Background Services**
```bash
# Check n8n dashboard:
http://localhost:5678
# Login: admin / admin

# Check Typesense dashboard:
http://localhost:8108
```

### 5. **Run Automated Tests**
```bash
# Run the test script:
./scripts/test.sh

# This will check:
# - Docker services status
# - Application endpoints
# - Database connectivity
# - Type checking
# - API functionality
```

## 🔍 What to Look For

### ✅ **Working Correctly:**
- Docker services start without errors
- Frontend loads at http://localhost:3000
- Job search page shows sample data
- API endpoints return JSON responses
- Test script shows mostly green checkmarks

### ❌ **Common Issues:**
- Port conflicts (something already using ports 3000, 5432, etc.)
- Missing dependencies (Node.js, Docker)
- Database connection errors
- Environment variables not set

## 🛠️ Quick Fixes

### Port Conflicts:
```bash
# See what's using ports:
lsof -i :3000
lsof -i :5432

# Kill processes if needed:
kill -9 <PID>

# Or use different ports
```

### Database Issues:
```bash
# Reset database:
docker-compose down
docker volume rm pathfinder_postgres_data
docker-compose up -d
npm run db:migrate
```

### Dependencies:
```bash
# Fresh install:
rm -rf node_modules package-lock.json
rm -rf app/node_modules app/package-lock.json
rm -rf ingestion/node_modules ingestion/package-lock.json
npm install
cd app && npm install && cd ../ingestion && npm install && cd ..
```

## 📊 Test Checklist

### ✅ **Must Pass:**
- [ ] Docker services start successfully
- [ ] Frontend loads without errors
- [ ] Job search page displays
- [ ] API endpoints respond
- [ ] Database migrations run

### ✅ **Should Pass:**
- [ ] n8n dashboard accessible
- [ ] Typesense dashboard accessible
- [ ] Typescript compilation succeeds
- [ ] Test script runs successfully

### ✅ **Bonus:**
- [ ] Authentication flow (if Clerk configured)
- [ ] User dashboard functionality
- [ ] Performance monitoring works

## 🚀 Next Steps After Testing

1. **If Everything Works:**
   - Configure Clerk authentication for full features
   - Import n8n workflows for automation
   - Test complete user flow
   - Prepare for beta launch

2. **If Issues Occur:**
   - Check error logs in terminal
   - Run `./scripts/test.sh` for detailed diagnostics
   - Review error messages carefully
   - Check QUICK_START.md for troubleshooting

## 📞 Need Help?

- **Documentation**: Check `/docs` folder
- **Quick Start**: See `QUICK_START.md`
- **Issues**: Report in GitHub Issues
- **Real-time**: Join Discord for support

**Happy Testing! 🧪**