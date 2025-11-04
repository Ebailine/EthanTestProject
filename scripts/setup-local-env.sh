#!/bin/bash

# Pathfinder Local Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Pathfinder local development environment..."

# Color output
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

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f1 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

print_status 0 "Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
print_status 0 "npm $(npm -v) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker from https://docker.com${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo -e "${YELLOW}ℹ️  You can use 'docker compose' (without dash) if your system has it${NC}"
    exit 1
fi
print_status 0 "Docker services ready"

# Stop any running services
print_info "Stopping any running Docker services..."
docker-compose down 2>/dev/null || true

# Start Docker services
print_info "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
print_info "Waiting for services to be healthy..."
sleep 15

# Check if services are running
SERVICES_UP=true
for SERVICE in postgres redis typesense n8n; do
    if ! docker-compose ps | grep -q "$SERVICE.*Up"; then
        SERVICES_UP=false
        break
    fi
done

if [ "$SERVICES_UP" = false ]; then
    echo -e "${RED}❌ Some Docker services failed to start${NC}"
    echo -e "${YELLOW}Check the logs with: docker-compose logs${NC}"
    exit 1
fi

print_status 0 "All Docker services are running"

# Install dependencies
print_info "Installing dependencies..."

# Root dependencies
if [ ! -f "package.json" ]; then
    print_status 1 "No package.json found in root, creating it..."
    # Create minimal package.json if it doesn't exist
    cat > package.json << 'EOF'
{
  "name": "pathfinder",
  "version": "0.1.0",
  "description": "Pathfinder - Internship discovery and outreach platform",
  "private": true,
  "workspaces": [
    "app",
    "ingestion"
  ]
}
EOF
fi

npm install
if [ $? -eq 0 ]; then
    print_status 0 "Root dependencies installed"
else
    print_warning "Root dependencies already present"
fi

# App dependencies
if [ -d "app" ] && [ -f "app/package.json" ]; then
    print_info "Installing app dependencies..."
    cd app
    npm install
    cd ..
    if [ $? -eq 0 ]; then
        print_status 0 "App dependencies installed"
    else
        print_warning "App dependencies may have issues"
    fi
else
    print_status 1 "App directory not found"
fi

# Ingestion dependencies
if [ -d "ingestion" ] && [ -f "ingestion/package.json" ]; then
    print_info "Installing ingestion dependencies..."
    cd ingestion
    npm install
    cd ..
    if [ $? -eq 0 ]; then
        print_status 0 "Ingestion dependencies installed"
    else
        print_warning "Ingestion dependencies may have issues"
    fi
else
    print_status 1 "Ingestion directory not found"
fi

# Setup environment file
if [ ! -f ".env" ]; then
    print_info "Creating environment file..."
    cp .env.example .env

    echo -e "${YELLOW}⚠️  Environment file created. Please edit it with your API keys:${NC}"
    echo -e "${BLUE}  - Get Clerk keys: https://dashboard.clerk.com${NC}"
    echo -e "${BLUE}  - Get LLM keys: https://console.anthropic.com and https://openai.com${NC}"
    echo -e "${BLUE}  - Update NEXTAUTH_URL to http://localhost:3000 if different${NC}"
    echo ""
else
    print_status 0 "Environment file already exists"
fi

# Setup database
print_info "Setting up database..."
cd app

# Generate Prisma client
print_info "Generating Prisma client..."
npm run db:generate
if [ $? -eq 0 ]; then
    print_status 0 "Prisma client generated"
else
    print_warning "Prisma client generation may have issues"
fi

# Run database migrations
print_info "Running database migrations..."
npm run db:migrate
if [ $? -eq 0 ]; then
    print_status 0 "Database migrations completed"
else
    print_warning "Database migrations may have issues"
fi

# Seed database with sample data
print_info "Seeding database with sample data..."
npm run db:seed
if [ $? -eq 0 ]; then
    print_status 0 "Database seeded successfully"
else
    print_warning "Database seeding may have issues"
fi

# Return to root
cd ..

# Initialize Typesense collection
print_info "Initializing Typesense search collection..."
TYPESENSE_API_KEY="${TYPESENSE_API_KEY:-xyz}"
TYPESENSE_HOST="${TYPESENSE_HOST:-localhost}"

# Wait a bit for Typesense to be ready
sleep 5

# Check if Typesense is accessible
if curl -s http://localhost:8108/health > /dev/null 2>&1; then
    print_status 0 "Typesense is accessible"

    # Initialize collection
    curl -X POST "http://localhost:8108/collections" \
      -H "X-TYPESENSE-API-KEY: pathfinder_dev_key" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "jobs",
        "fields": [
          {"name": "title", "type": "string"},
          {"name": "company_name", "type": "string", "facet": true},
          {"name": "function", "type": "string", "folder": true},
          {"name": "major_tags", "type": "string[]", "facet": true},
          {"name": "location", "type": "string", "facet": true},
          {"name": "remote_flag", "type": "bool", "facet": true},
          {"name": "paid_flag", "type": "bool", "facet": true},
          {"name": "internship_type", "type": "string", "facet": true},
          {"name": "ats_type", "type": "string", "facet": true},
          {"name": "posted_at", "type": "int64"},
          {"name": "last_verified_at", "type": "int64"},
          {"name": "source_name", "type": "string", "facet": true},
          {"name": "company_size_band", "type": "string", "facet": true},
          {"name": "industry_tags", "type": "string[]", "facet": true}
        ],
        "default_sorting_field": "posted_at"
      }' > /dev/null 2>&1 && print_status 0 "Typesense collection created"
else
    print_warning "Typesense not accessible, will initialize on first API call"
fi

# Import n8n workflows
print_info "Setting up n8n workflows..."
mkdir -p workflows 2>/dev/null || true

# Copy workflow files if they exist
if [ -d "flows" ]; then
    echo "n8n workflows directory found"
    # Workflows will be automatically mounted via Docker volume
else
    print_info "Creating workflows directory..."
fi

# Create logs directory
mkdir -p logs 2>/dev/null || true

# Create output directory for typesense
mkdir -p typesense 2>/dev/null || true

print_info ""
echo -e "${GREEN}✅ Local development setup complete!${NC}"
echo ""
echo -e "${BLUE}🌐 Services running:${NC}"
echo -e "  - Next.js App: http://localhost:3000"
echo -e "  - n8n: http://localhost:5678 (admin/pathfinder_dev)"
echo -e "  - PostgreSQL: localhost:5432"
echo -e "  - Redis: localhost:6379"
echo -e "  - Typesense: http://localhost:8108"
echo ""
echo -e "${GREEN}🚀 Quick start:${NC}"
echo -e "${BLUE}  npm run dev${NC}    # Start development servers"
echo ""
echo -e "${GREEN}📱 Access points:${NC}"
echo -e "  - Main application: http://localhost:3000/jobs"
echo -e "  - Job search with 50+ internships"
echo -e "  - n8n workflow automation: http://localhost:5678"
echo -e "  - Typesense search dashboard: http://localhost:8108"
echo ""
echo -e "${YELLOW}⚠️  First-time setup (optional but recommended):${NC}"
echo -e "  1. Get Clerk authentication keys: https://dashboard.clerk.com"
echo -e "   2. Add to your .env file:"
echo -e "     CLERK_PUBLISHABLE_KEY=pk_test_xxx"
echo -e "     CLERK_SECRET_KEY=sk_test_xxx"
echo -e "     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx"
echo -e ""
echo -e "${GREEN}📖 Testing:${NC}"
echo -e "  ./scripts/test.sh    # Run comprehensive tests"
echo -e ""
echo -e "${GREEN}🎯  Production deployment:${NC}"
echo -e "  - See docs/deployment.md"
echo -e "  - Follow BETA_CHECKLIST.md"
echo ""
echo -e "${GREEN}✨  Happy coding! 🚀${NC}"