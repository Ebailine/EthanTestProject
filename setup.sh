#!/bin/bash

# Pathfinder MVP One-Command Setup Script
# This script handles EVERYTHING automatically for a fresh GitHub clone

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Error handling
error_exit() {
    print_error "$1"
    echo -e "${RED}Setup failed. Please check the error above and try again.${NC}"
    echo -e "${YELLOW}For troubleshooting, see TROUBLESHOOTING.md${NC}"
    exit 1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for service health check
wait_for_service() {
    local service_name="$1"
    local max_attempts=30
    local attempt=1

    print_info "Waiting for $service_name to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "$service_name.*healthy"; then
            print_success "$service_name is healthy"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo
    error_exit "$service_name failed to become healthy after $((max_attempts * 2)) seconds"
}

# Check port availability
check_port() {
    local port="$1"
    local service="$2"

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        error_exit "Port $port is already in use by another service. Please stop the service using port $port and try again."
    fi

    print_success "Port $port is available for $service"
}

# Retry npm install with cleanup
retry_npm_install() {
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if npm install; then
            return 0
        fi

        print_warning "Attempt $attempt failed, cleaning and retrying..."
        rm -rf node_modules package-lock.json
        npm cache clean --force >/dev/null 2>&1
        attempt=$((attempt + 1))
        sleep 2
    done

    return 1
}

# Main setup function
main() {
    print_header "🚀 Pathfinder MVP Setup Starting"

    # Record start time
    start_time=$(date +%s)

    # 0. Pre-flight checks
    print_header "🔍 Running Pre-flight Checks"

    # Check available disk space
    if command_exists df; then
        AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
        if [ "$AVAILABLE_SPACE" -lt 5 ] 2>/dev/null; then
            print_warning "Less than 5GB disk space available. Setup may fail."
        else
            print_success "Sufficient disk space available (${AVAILABLE_SPACE}GB)"
        fi
    fi

    # Check available RAM (if possible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        AVAILABLE_RAM=$(sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1073741824)}')
        if [ ! -z "$AVAILABLE_RAM" ] && [ "$AVAILABLE_RAM" -lt 4 ]; then
            print_warning "Less than 4GB RAM available. Docker services may be slow."
        elif [ ! -z "$AVAILABLE_RAM" ]; then
            print_success "Sufficient RAM available (${AVAILABLE_RAM}GB)"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists free; then
            AVAILABLE_RAM=$(free -g | awk 'NR==2 {print $7}')
            if [ "$AVAILABLE_RAM" -lt 4 ] 2>/dev/null; then
                print_warning "Less than 4GB RAM available. Docker services may be slow."
            else
                print_success "Sufficient RAM available"
            fi
        fi
    fi

    # Check internet connectivity
    if ping -c 1 google.com >/dev/null 2>&1 || ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        print_success "Internet connection available"
    else
        print_warning "No internet connection detected. This may cause issues downloading dependencies."
    fi

    # 1. Check prerequisites
    print_header "📋 Checking Prerequisites"

    # Check Node.js
    if ! command_exists node; then
        error_exit "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error_exit "Node.js version 18+ is required. Current version: $(node -v)"
    fi
    print_success "Node.js $(node -v) found"

    # Check npm
    if ! command_exists npm; then
        error_exit "npm is not installed"
    fi
    print_success "npm $(npm -v) found"

    # Check Docker
    if ! command_exists docker; then
        error_exit "Docker is not installed. Please install Docker from https://docker.com"
    fi

    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker daemon is not running. Please start Docker and try again"
    fi
    print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) found and running"

    # Check Docker Compose
    if ! command_exists docker-compose; then
        error_exit "Docker Compose is not installed"
    fi
    print_success "Docker Compose $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1) found"

    # 2. Check port availability
    print_header "🔌 Checking Port Availability"

    check_port 3000 "Frontend (Next.js)"
    check_port 5432 "Database (PostgreSQL)"
    check_port 6379 "Cache (Redis)"
    check_port 8108 "Search (Typesense)"
    check_port 5678 "Automation (n8n)"

    # 3. Environment setup
    print_header "📝 Setting Up Environment Files"

    # Copy .env.example to .env in root
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file in root directory"
        else
            error_exit ".env.example file not found. Cannot create environment configuration."
        fi
    else
        print_info ".env file already exists in root directory"
    fi

    # Copy .env.example to app/.env for Prisma
    if [ ! -f "app/.env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example app/.env
            print_success "Created .env file in app directory for Prisma"
        else
            error_exit ".env.example file not found. Cannot create app environment configuration."
        fi
    else
        print_info ".env file already exists in app directory"
    fi

    # Verify DATABASE_URL format
    if grep -q "DATABASE_URL=" .env; then
        print_success "DATABASE_URL found in environment file"
    else
        error_exit "DATABASE_URL not found in environment file. Please check .env.example"
    fi

    # 4. Start Docker services with health checks
    print_header "🐳 Starting Docker Services"

    # Stop any existing services
    print_info "Stopping any existing services..."
    docker-compose down 2>/dev/null || true

    # Start services
    print_info "Starting Docker services..."
    if ! docker-compose up -d; then
        error_exit "Failed to start Docker services. Please check Docker configuration."
    fi

    print_success "Docker services started"

    # 5. Wait for services to be healthy
    print_header "⏳ Waiting for Services to Be Ready"

    wait_for_service "postgres"
    wait_for_service "redis"
    wait_for_service "typesense"
    wait_for_service "n8n"

    print_success "All services are healthy and ready"

    # 6. Install dependencies
    print_header "📦 Installing Dependencies"

    # Install root dependencies
    print_info "Installing root dependencies..."
    if ! retry_npm_install; then
        error_exit "Failed to install root dependencies after 3 attempts. Check npm logs for details."
    fi
    print_success "Root dependencies installed"

    # Install app dependencies
    if [ -d "app" ]; then
        print_info "Installing app dependencies (this may take a few minutes)..."
        cd app
        if ! retry_npm_install; then
            error_exit "Failed to install app dependencies after 3 attempts. Check npm logs for details."
        fi
        print_success "App dependencies installed"
        cd ..
    else
        error_exit "App directory not found. Repository structure may be corrupted."
    fi

    # Install ingestion dependencies
    if [ -d "ingestion" ]; then
        print_info "Installing ingestion dependencies..."
        cd ingestion
        if ! retry_npm_install; then
            print_warning "Failed to install ingestion dependencies. You can install them manually later with: cd ingestion && npm install"
        else
            print_success "Ingestion dependencies installed"
        fi
        cd ..
    fi

    # 7. Database setup
    print_header "🗄️ Setting Up Database"

    if [ -d "app" ]; then
        cd app

        # Generate Prisma client
        print_info "Generating Prisma client..."
        if ! npm run db:generate; then
            error_exit "Failed to generate Prisma client. Check Prisma configuration."
        fi
        print_success "Prisma client generated"

        # Run migrations
        print_info "Running database migrations..."
        if ! npm run db:migrate; then
            error_exit "Failed to run database migrations. Check database connection and permissions."
        fi
        print_success "Database migrations completed"

        # Run seed script
        print_info "Seeding database with sample data..."
        if ! npm run db:seed; then
            print_warning "Database seeding failed. You can run 'npm run db:seed' manually later."
        else
            print_success "Database seeded with sample data"
        fi

        cd ..
    fi

    # 8. Verification
    print_header "🔍 Verifying Setup"

    # Test database connection
    print_info "Testing database connection..."
    if docker-compose exec -T postgres pg_isready -U pathfinder -d pathfinder >/dev/null 2>&1; then
        print_success "Database connection verified"
    else
        error_exit "Database connection failed. Please check database configuration."
    fi

    # Verify frontend builds
    print_info "Verifying frontend builds..."
    if [ -d "app" ]; then
        cd app
        if npm run build >/dev/null 2>&1; then
            print_success "Frontend builds successfully"
        else
            print_warning "Frontend build failed. Check for compilation errors when running 'npm run dev'"
        fi
        cd ..
    fi

    # Check sample data
    print_info "Checking for sample data..."
    if docker-compose exec -T postgres psql -U pathfinder -d pathfinder -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Job';" | grep -q "1"; then
        JOB_COUNT=$(docker-compose exec -T postgres psql -U pathfinder -d pathfinder -c "SELECT COUNT(*) FROM \"Job\";" -t | tr -d ' ')
        if [ "$JOB_COUNT" -gt 0 ]; then
            print_success "Sample data verified: $JOB_COUNT jobs found in database"
        else
            print_warning "No sample jobs found. You can run 'npm run db:seed' in app directory to add sample data."
        fi
    else
        print_warning "Job table not found. Database may not be fully set up."
    fi

    # Calculate setup time
    end_time=$(date +%s)
    setup_duration=$((end_time - start_time))
    setup_minutes=$((setup_duration / 60))
    setup_seconds=$((setup_duration % 60))

    # 9. Success message
    print_header "🎉 Setup Complete!"

    echo -e "${GREEN}Pathfinder MVP has been successfully set up in ${setup_minutes}m ${setup_seconds}s${NC}"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "${BLUE}1. Run the development server:${NC}"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${BLUE}2. Open your browser and visit:${NC}"
    echo -e "   ${YELLOW}http://localhost:3000${NC} - Main application"
    echo -e "   ${YELLOW}http://localhost:3000/jobs${NC} - Job search page"
    echo ""
    echo -e "${BLUE}3. Additional services:${NC}"
    echo -e "   ${YELLOW}http://localhost:5678${NC} - n8n automation dashboard"
    echo -e "   ${YELLOW}http://localhost:8108${NC} - Typesense search dashboard"
    echo ""
    echo -e "${BLUE}4. Run tests:${NC}"
    echo -e "   ${YELLOW}./scripts/test.sh${NC}"
    echo ""
    echo -e "${BLUE}5. For troubleshooting:${NC}"
    echo -e "   ${YELLOW}See TROUBLESHOOTING.md${NC}"
    echo ""
    echo -e "${GREEN}🎯 Ready to start developing!${NC}"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi