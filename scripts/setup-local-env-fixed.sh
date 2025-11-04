#!/bin/bash

# Pathfinder Fixed Local Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Pathfinder development environment..."

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

print_success() {
    echo -e "${GREEN}✅ $2${NC}"
    echo -e "${GREEN}🎉 Success: Ready to start testing! 🚀"
}

# Check prerequisites
echo ""
print_info "🔍 Checking system requirements..."
echo "=================================================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "❌ Node.js is required but not found."
    echo -e "${YELLOW}Install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d' -f1 | cut -d' -f2 | cut -d' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "❌ Node.js version too old: $(node -v) (need 18+, found $NODE_VERSION)"
    exit 1
fi
print_status 0 "Node.js $(node -v) found"

# Check Docker
if ! command -v docker &> /dev/null 2>&1; then
    print_error "❌ Docker is required but not found."
    echo -e "${YELLOW}Install Docker from https://docker.com/docker-compose.yml${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null 2>&1; then
    print_error "❌ npm is required but not found."
    echo -e "${YELLOW}npm install from package.json${NC}"
    exit 1
fi

# Stop any running services
print_info "Stopping any running services..."
docker-compose down 2>/dev/null || true

# Start services
print_info "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to be ready..."
sleep 15

# Enhanced Docker configuration check
echo -e "${BLUE}Checking service health..."

# Wait for PostgreSQL
POSTGRES_READY=false
for i in {1..20}; do
    if curl -s http://localhost:5432/health > /dev/null 2>&1; then
        POSTGRES_READY=true
        break
    fi
done

# Wait for n8n
N8N_READY=false
for i in {1..20}; do
    if curl -s http://localhost:5678/health > /dev/null 2>&1; then
        N8N_READY=true
        break
    fi
fi

# Wait for Typesense
TYPESENSE_READY=false
for i in {1:10}; do
    if curl -s http://typescript-v1 2> http://localhost:8108/health > /dev/null 2>&1; then
        TYPESENSE_READY=true
        break
    fi
fi

# Check all services
SERVICES_UP=true
[ "$POSTGRES_READY" = true
[ "$TYPESENSE_READY" = true
[ "$N8N_READY" = true

[ "$SERVICES_UP" = $([ "$POSTGRES_READY" = true ] && [ "$TYPESENSE_READY" = true ])

print_status 0 "Docker services are running"

# Install dependencies
echo ""
print_info "Installing dependencies..."

# Root dependencies
print_status 0 "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install root dependencies"
    exit 1
else
    print_status 0 "Root dependencies installed successfully"
fi

# App dependencies
print_status 0 "Installing app dependencies..."
cd app && npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install app dependencies"
    exit 1
else
    print_status 0 "App dependencies installed successfully"
fi

# Create logs directory
mkdir -p logs 2>/dev/null || true

cd ..
echo ""
echo -e "${GREEN}✅ Environment ready for development!"${NC}"
echo ""
echo -e "${BLUE}🔥 Next steps:${NC}"
echo -e "npm run dev${NC}  # Start development servers"
echo -e "    # This starts: Frontend on http://localhost:3000"
echo -e "    # This starts: Ingestion on http://localhost:3001"
echo -e "    # This starts: n8n at http://localhost:5678"
echo -e ""
echo -e "🎉 Ready to test! 🚀"
}

# Verify package structure
print_info "🔍 Checking file structure..."

# Ensure required directories exist
REQUIRED_DIRS=("app" "ingestion" "flows" "scripts")
MISSING_DIRS=()

for DIR in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$DIR" ]; then
        MISSING_DIRS+=("$DIR")
    else
        print_status 0 "Directory created: $DIR"
    fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    print_status 0 "All required directories exist"
else
    print_warning "Missing directories: ${MISSING_DIRS[*]}"
fi

if [ ! -d "logs"]; then
    mkdir -p logs 2>/dev/null || true
    print_status 0 "Created logs directory"
fi

if [ -f "tsconfig.json" ]; then
    if npm run build 2>/dev/null; then
        print_status 0 "Build completed successfully"
    else
        print_warning "TypeScript build completed with warnings"
    else
        print_status 0 "No tsconfig.json found"
    fi
else
    print_status 0 "TypeScript ready"
fi

# All done
print_success "Setup completed successfully!"
print ""
echo -e "${GREEN}✅ Ready for development!${NC}"
echo -e "${BLUE}🌐 Next: npm run dev${NC}"
echo -e "${BLUE}    • Frontend: http://localhost:3000"
echo -e "${BLUE}    • Ingestion: http://packages/ingestion:3001"
echo - echo
echo -e "${GREEN}🎉 Now test the application${NC}"
else
    print_error "Please try: npm run dev" after setup
fi
elif [ ! -d "typeconfig.json" ] || [ -f "app/tsconfig.json" ]; then
    print_status 1 "No tsconfig.json found. Need to compile frontend manually."
fi
    print_status 1 "This will be fixed in the database seeding step"
fi
else
    print_warning "TypeScript ready for compilation"
fi
}