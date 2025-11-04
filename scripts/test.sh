#!/bin/bash

# Pathfinder Testing Script
# This script runs tests and checks the health of the application

echo "🧪 Running Pathfinder tests and health checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker services are running
echo "🐳 Checking Docker services..."
docker-compose ps > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status 0 "Docker is running"

    # Check individual services with health status
    POSTGRES_STATUS=$(docker-compose ps postgres | grep "Up\|healthy" || echo "")
    REDIS_STATUS=$(docker-compose ps redis | grep "Up\|healthy" || echo "")
    TYPESENSE_STATUS=$(docker-compose ps typesense | grep "Up\|healthy" || echo "")
    N8N_STATUS=$(docker-compose ps n8n | grep "Up\|healthy" || echo "")

    [ ! -z "$POSTGRES_STATUS" ] && print_status 0 "PostgreSQL is running and healthy" || print_status 1 "PostgreSQL is not running or unhealthy"
    [ ! -z "$REDIS_STATUS" ] && print_status 0 "Redis is running and healthy" || print_status 1 "Redis is not running or unhealthy"
    [ ! -z "$TYPESENSE_STATUS" ] && print_status 0 "Typesense is running and healthy" || print_status 1 "Typesense is not running or unhealthy"
    [ ! -z "$N8N_STATUS" ] && print_status 0 "n8n is running and healthy" || print_status 1 "n8n is not running or unhealthy"
else
    print_status 1 "Docker services are not running"
    echo "Run './setup.sh' to set up and start services"
fi

# Check if Node.js services are accessible
echo ""
echo "🔍 Checking application endpoints..."

# Check if main application is running
if curl -s http://localhost:3000 > /dev/null; then
    print_status 0 "Frontend is accessible at http://localhost:3000"
else
    print_status 1 "Frontend is not accessible at http://localhost:3000"
fi

# Check if ingestion API is running
if curl -s http://localhost:3001 > /dev/null; then
    print_status 0 "Ingestion API is accessible at http://localhost:3001"
else
    print_warning "Ingestion API is not running at http://localhost:3001 (this is OK for basic testing)"
fi

# Check n8n dashboard
if curl -s http://localhost:5678 > /dev/null; then
    print_status 0 "n8n dashboard is accessible at http://localhost:5678"
else
    print_status 1 "n8n dashboard is not accessible at http://localhost:5678"
fi

# Check Typesense
if curl -s http://localhost:8108 > /dev/null; then
    print_status 0 "Typesense dashboard is accessible at http://localhost:8108"
else
    print_status 1 "Typesense dashboard is not accessible at http://localhost:8108"
fi

# Run unit tests
echo ""
echo "🧪 Running unit tests..."

cd app
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "Frontend tests passed"
    else
        print_status 1 "Frontend tests failed"
    fi
else
    print_warning "No frontend tests found"
fi

cd ../ingestion
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "Ingestion tests passed"
    else
        print_status 1 "Ingestion tests failed"
    fi
else
    print_warning "No ingestion tests found"
fi

cd ..

# Run type checking
echo ""
echo "🔍 Running type checking..."

cd app
if npm run typecheck 2>/dev/null; then
    print_status 0 "Frontend type checking passed"
else
    print_status 1 "Frontend type checking failed"
fi

cd ../ingestion
if npm run typecheck 2>/dev/null; then
    print_status 0 "Ingestion type checking passed"
else
    print_status 1 "Ingestion type checking failed"
fi

cd ..

# Check API endpoints
echo ""
echo "🌐 Testing API endpoints..."

# Test job search endpoint
echo "Testing job search API..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"filters": {}}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "success"; then
    print_status 0 "Job search API is working"
else
    print_status 1 "Job search API is not working"
fi

# Test performance endpoint
echo "Testing performance API..."
RESPONSE=$(curl -s http://localhost:3000/api/performance 2>/dev/null)

if echo "$RESPONSE" | grep -q "metrics"; then
    print_status 0 "Performance API is working"
else
    print_warning "Performance API is not accessible (may require auth)"
fi

# Database connectivity test
echo ""
echo "🗄️ Testing database connectivity..."

# Test basic database connection
if docker-compose exec -T postgres pg_isready -U pathfinder -d pathfinder >/dev/null 2>&1; then
    print_status 0 "Database connection is working"
else
    print_status 1 "Database connection failed - run './setup.sh' to fix"
fi

# Test database permissions
if docker-compose exec -T postgres psql -U pathfinder -d pathfinder -c "SELECT 1;" >/dev/null 2>&1; then
    print_status 0 "Database permissions are correct"
else
    print_status 1 "Database permissions issue - run './setup.sh' to fix"
fi

# Test for sample data
JOB_COUNT=$(docker-compose exec -T postgres psql -U pathfinder -d pathfinder -c "SELECT COUNT(*) FROM \"Job\";" -t 2>/dev/null | tr -d ' ' || echo "0")
if [ "$JOB_COUNT" -gt 0 ]; then
    print_status 0 "Sample data found: $JOB_COUNT jobs in database"
else
    print_status 1 "No sample data found - run 'npm run db:seed' in app directory"
fi

cd app
if npm run db:generate >/dev/null 2>&1; then
    print_status 0 "Prisma client generation successful"
else
    print_status 1 "Prisma client generation failed"
fi

cd ..

# Check environment variables
echo ""
echo "🔧 Checking environment configuration..."

if [ -f ".env" ]; then
    print_status 0 ".env file exists in root directory"
else
    print_status 1 ".env file does not exist in root directory - run './setup.sh'"
fi

if [ -f "app/.env" ]; then
    print_status 0 ".env file exists in app directory"
else
    print_status 1 ".env file does not exist in app directory - run './setup.sh'"
fi

# Check for required variables in both .env files
if [ -f ".env" ]; then
    REQUIRED_VARS=("DATABASE_URL" "TYPESENSE_API_KEY")
    MISSING_VARS=()

    for VAR in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${VAR}=" .env; then
            MISSING_VARS+=("$VAR")
        fi
    done

    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        print_status 0 "Required environment variables are set"
    else
        print_warning "Missing environment variables: ${MISSING_VARS[*]}"
    fi
fi

# Check file structure
echo ""
echo "📁 Checking project structure..."

REQUIRED_DIRS=("app" "ingestion" "flows" "llm-prompts" "docs" "scripts")
MISSING_DIRS=()

for DIR in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        print_status 0 "$DIR directory exists"
    else
        MISSING_DIRS+=("$DIR")
    fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    print_status 0 "All required directories exist"
else
    print_status 1 "Missing directories: ${MISSING_DIRS[*]}"
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="

# Provide recommendations
echo ""
echo "💡 Recommendations:"
echo "1. Ensure all Docker services are running: 'docker-compose up -d'"
echo "2. Start development servers: 'npm run dev'"
echo "3. Visit http://localhost:3000 to test the application"
echo "4. Configure Clerk authentication for full functionality"
echo "5. Import n8n workflows for automation features"

echo ""
echo "🚀 Quick start commands:"
echo "- Setup: './scripts/setup.sh'"
echo "- Start: 'npm run dev'"
echo "- Test: './scripts/test.sh'"
echo "- Stop: 'docker-compose down'"

echo ""
echo "For detailed instructions, see QUICK_START.md"