#!/bin/bash

# Comprehensive health check for all services

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏥 Running Pathfinder Health Checks...${NC}"
echo ""

FAILED_CHECKS=0

# Check Docker services
echo -e "${BLUE}Checking Docker services...${NC}"
SERVICES=("postgres" "redis" "typesense" "n8n")
for SERVICE in "${SERVICES[@]}"; do
  if docker-compose ps | grep -q "$SERVICE.*Up\|healthy"; then
    echo -e "${GREEN}✅ $SERVICE is healthy${NC}"
  else
    echo -e "${RED}❌ $SERVICE is not healthy${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  fi
done

# Check database connection
echo ""
echo -e "${BLUE}Checking database connection...${NC}"
if docker-compose exec -T postgres pg_isready -U pathfinder -d pathfinder >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Database connection successful${NC}"
else
  echo -e "${RED}❌ Database connection failed${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check database permissions
echo -e "${BLUE}Checking database permissions...${NC}"
if docker-compose exec -T postgres psql -U pathfinder -d pathfinder -c "SELECT 1;" >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Database permissions correct${NC}"
else
  echo -e "${RED}❌ Database permissions issue${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check for sample data
echo -e "${BLUE}Checking for sample data...${NC}"
JOB_COUNT=$(docker-compose exec -T postgres psql -U pathfinder -d pathfinder -c "SELECT COUNT(*) FROM \"Job\";" -t 2>/dev/null | tr -d ' ' || echo "0")
if [ "$JOB_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Sample data found: $JOB_COUNT jobs${NC}"
else
  echo -e "${YELLOW}⚠️  No sample data found (run: cd app && npm run db:seed)${NC}"
fi

# Check if dependencies are installed
echo ""
echo -e "${BLUE}Checking dependencies...${NC}"

if [ -d "app/node_modules" ]; then
  echo -e "${GREEN}✅ App dependencies installed${NC}"
else
  echo -e "${RED}❌ App dependencies not installed${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

if [ -d "ingestion/node_modules" ]; then
  echo -e "${GREEN}✅ Ingestion dependencies installed${NC}"
else
  echo -e "${YELLOW}⚠️  Ingestion dependencies not installed${NC}"
fi

# Check if environment files exist
echo ""
echo -e "${BLUE}Checking environment files...${NC}"

if [ -f ".env" ]; then
  echo -e "${GREEN}✅ Root .env file exists${NC}"
else
  echo -e "${RED}❌ Root .env file missing${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

if [ -f "app/.env" ]; then
  echo -e "${GREEN}✅ App .env file exists${NC}"
else
  echo -e "${RED}❌ App .env file missing${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check if frontend can build
echo ""
echo -e "${BLUE}Checking frontend build...${NC}"
cd app
if npm run build >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend builds successfully${NC}"
else
  echo -e "${RED}❌ Frontend build failed${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
cd ..

# Check TypeScript compilation
echo -e "${BLUE}Checking TypeScript compilation...${NC}"
cd app
if npm run typecheck 2>&1 | grep -q "Found 0 errors"; then
  echo -e "${GREEN}✅ TypeScript checks pass${NC}"
else
  echo -e "${YELLOW}⚠️  TypeScript warnings present${NC}"
fi
cd ..

# Check Prisma client
echo ""
echo -e "${BLUE}Checking Prisma client...${NC}"
if [ -d "app/node_modules/.prisma/client" ]; then
  echo -e "${GREEN}✅ Prisma client generated${NC}"
else
  echo -e "${RED}❌ Prisma client not generated (run: cd app && npm run db:generate)${NC}"
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
if [ $FAILED_CHECKS -eq 0 ]; then
  echo -e "${GREEN}🎉 All health checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ $FAILED_CHECKS health check(s) failed${NC}"
  echo -e "${YELLOW}Run './setup.sh' to fix issues${NC}"
  exit 1
fi