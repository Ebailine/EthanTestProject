# Pre-Commit Verification Checklist

Before committing changes to fix the repository, verify all items below:

## ✅ Dependencies

- [ ] All packages in app/package.json are used in code
- [ ] All imports in code have corresponding packages in package.json
- [ ] No conflicting versions between packages
- [ ] All devDependencies are properly categorized
- [ ] lucide-react is in dependencies
- [ ] @tailwindcss/forms is in devDependencies
- [ ] @tailwindcss/typography is in devDependencies
- [ ] @anthropic-ai/sdk is in dependencies
- [ ] openai is in dependencies
- [ ] googleapis is in dependencies

## ✅ TypeScript

- [ ] `npm run typecheck` passes in app/
- [ ] `npm run typecheck` passes in ingestion/
- [ ] No `any` types without good reason
- [ ] All interfaces are exported properly
- [ ] All component props have proper types

## ✅ Build

- [ ] `npm run build` succeeds in app/
- [ ] `npm run build` succeeds in ingestion/
- [ ] No build warnings that could cause issues
- [ ] All environment variables are documented
- [ ] Next.js configuration is correct
- [ ] No missing imports or modules

## ✅ Database

- [ ] Prisma schema is valid (`npx prisma validate`)
- [ ] All migrations are in sync with schema
- [ ] Seed script runs without errors (`npm run db:seed`)
- [ ] Database permissions are correct in init-db.sql
- [ ] All model relationships are properly defined

## ✅ Docker

- [ ] All services start successfully (`docker-compose up -d`)
- [ ] All services pass health checks (`docker-compose ps`)
- [ ] docker-compose.yml has correct versions
- [ ] No port conflicts in default configuration
- [ ] All health check commands are correct
- [ ] Restart policies are set appropriately

## ✅ Scripts

- [ ] setup.sh runs successfully on fresh clone
- [ ] cleanup.sh properly resets everything
- [ ] All scripts have proper error handling
- [ ] Scripts are executable (`chmod +x`)
- [ ] health-check.sh passes all checks
- [ ] test.sh runs all tests successfully

## ✅ Documentation

- [ ] README.md has accurate setup instructions
- [ ] TROUBLESHOOTING.md covers common issues
- [ ] TESTING_GUIDE.md is comprehensive
- [ ] .env.example has all required variables
- [ ] All API endpoints are documented
- [ ] Comments explain complex code sections

## ✅ Testing

- [ ] Health check script passes (`./scripts/health-check.sh`)
- [ ] Sample data loads correctly (50+ jobs)
- [ ] Frontend renders without errors
- [ ] API endpoints respond correctly
- [ ] All Docker services are healthy
- [ ] Database connectivity works
- [ ] TypeScript compilation succeeds

## ✅ Code Quality

- [ ] No console.log statements in production code
- [ ] No TODO comments without GitHub issues
- [ ] All functions have clear purposes
- [ ] Code follows project conventions
- [ ] No unused imports or variables
- [ ] Proper error handling in all async functions

## ✅ Environment

- [ ] .env.example is complete and documented
- [ ] All required environment variables are documented
- [ ] Optional environment variables are marked as such
- [ ] Default values work for local development
- [ ] Secret values have placeholder examples

## ✅ Git

- [ ] No sensitive data in commits (API keys, passwords)
- [ ] .gitignore properly excludes generated files
- [ ] Commit message is descriptive
- [ ] Branch name follows convention
- [ ] No merge conflicts

## ✅ Integration

- [ ] Fresh clone works: `git clone && cd && ./setup.sh`
- [ ] Development server starts: `npm run dev`
- [ ] Jobs page loads: http://localhost:3000/jobs
- [ ] No errors in browser console
- [ ] All links and navigation work
- [ ] Search and filter functionality works

---

## Quick Verification Commands

Run these commands to verify most items:

```bash
# Check dependencies are installed
npm install && cd app && npm install && cd ../ingestion && npm install && cd ..

# Check TypeScript
cd app && npm run typecheck && cd ../ingestion && npm run typecheck && cd ..

# Check builds
cd app && npm run build && cd ..

# Check Docker services
docker-compose up -d
docker-compose ps

# Wait for services to be healthy
sleep 30

# Run health checks
./scripts/health-check.sh

# Run full test suite
./scripts/test.sh

# Check database
cd app && npm run db:generate && npm run db:migrate && npm run db:seed && cd ..

# Verify frontend starts
timeout 10s npm run dev || true
```

---

## Final Verification

The ultimate test - simulate a fresh clone:

```bash
# In a completely fresh directory
cd /tmp
git clone https://github.com/ebailine/EthanTestProject.git
cd EthanTestProject
./setup.sh
npm run dev
# Visit http://localhost:3000/jobs in browser
# Should see 50+ jobs with no errors
```

---

## Success Criteria

All of these must be true:

1. ✅ Fresh clone + `./setup.sh` completes without errors
2. ✅ `npm run dev` starts without errors
3. ✅ http://localhost:3000/jobs loads and shows jobs
4. ✅ No build errors in browser console
5. ✅ All Docker services are healthy
6. ✅ Database has sample data (50+ jobs)
7. ✅ `./scripts/health-check.sh` exits with code 0
8. ✅ TypeScript compilation passes with 0 errors
9. ✅ All documentation is accurate and complete

---

## Checklist Completion

Date: _______________

Verified by: _______________

All items checked: [ ] YES / [ ] NO

If NO, list remaining items:
_________________________________________________
_________________________________________________
_________________________________________________

---

## Notes

- This checklist should be updated as the project evolves
- All items must pass before merging to main branch
- If any item fails, fix it before proceeding
- Document any exceptions in the PR description