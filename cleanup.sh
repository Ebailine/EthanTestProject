#!/bin/bash

# Pathfinder Cleanup Script
# This script provides a clean reset for re-testing setup

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

# Parse command line arguments
CLEAN_ENV=false
DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --env)
            CLEAN_ENV=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Pathfinder Cleanup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --env       Also remove .env files"
            echo "  --dry-run   Show what would be deleted without actually deleting"
            echo "  --help, -h  Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Clean containers and volumes"
            echo "  $0 --env        # Clean everything including .env files"
            echo "  $0 --dry-run    # Preview what would be cleaned"
            exit 0
            ;;
    esac
done

# Main cleanup function
main() {
    print_header "🧹 Pathfinder Cleanup Starting"

    if [ "$DRY_RUN" = true ]; then
        print_warning "DRY RUN MODE - No files will be deleted"
    fi

    # 1. Stop Docker services
    print_header "🛑 Stopping Docker Services"

    if docker-compose ps -q | grep -q .; then
        print_info "Stopping running containers..."
        if [ "$DRY_RUN" = false ]; then
            docker-compose down
            print_success "All Docker services stopped"
        else
            print_info "Would stop: $(docker-compose ps --services | tr '\n' ' ')"
        fi
    else
        print_info "No Docker services are currently running"
    fi

    # 2. Remove Docker containers and volumes
    print_header "🗑️ Removing Docker Containers and Volumes"

    # Remove containers
    if docker ps -a | grep -q "pathfinder-"; then
        print_info "Removing Pathfinder containers..."
        if [ "$DRY_RUN" = false ]; then
            docker ps -a --filter "name=pathfinder-" -q | xargs -r docker rm -f
            print_success "Pathfinder containers removed"
        else
            print_info "Would remove containers: $(docker ps -a --filter "name=pathfinder-" --format "{{.Names}}" | tr '\n' ' ')"
        fi
    else
        print_info "No Pathfinder containers to remove"
    fi

    # Remove volumes
    if docker volume ls | grep -q "pathfinder"; then
        print_info "Removing Pathfinder volumes..."
        if [ "$DRY_RUN" = false ]; then
            docker volume ls --filter "name=pathfinder" -q | xargs -r docker volume rm
            print_success "Pathfinder volumes removed"
        else
            print_info "Would remove volumes: $(docker volume ls --filter "name=pathfinder" --format "{{.Name}}" | tr '\n' ' ')"
        fi
    else
        print_info "No Pathfinder volumes to remove"
    fi

    # 3. Remove node_modules directories
    print_header "📦 Removing Node Modules"

    NODE_MODULES_DIRS=("node_modules" "app/node_modules" "ingestion/node_modules")
    REMOVED_COUNT=0

    for dir in "${NODE_MODULES_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            print_info "Removing $dir..."
            if [ "$DRY_RUN" = false ]; then
                rm -rf "$dir"
                print_success "Removed $dir"
            else
                print_info "Would remove: $dir"
            fi
            REMOVED_COUNT=$((REMOVED_COUNT + 1))
        else
            print_info "$dir does not exist"
        fi
    done

    if [ "$REMOVED_COUNT" -eq 0 ]; then
        print_info "No node_modules directories to remove"
    fi

    # 4. Remove .env files (optional)
    if [ "$CLEAN_ENV" = true ]; then
        print_header "📝 Removing Environment Files"

        ENV_FILES=(".env" "app/.env")
        for file in "${ENV_FILES[@]}"; do
            if [ -f "$file" ]; then
                print_info "Removing $file..."
                if [ "$DRY_RUN" = false ]; then
                    rm "$file"
                    print_success "Removed $file"
                else
                    print_info "Would remove: $file"
                fi
            else
                print_info "$file does not exist"
            fi
        done
    else
        print_info "Environment files preserved (use --env to remove them)"
    fi

    # 5. Clean Docker system (optional)
    if [ "$DRY_RUN" = false ]; then
        print_header "🧽 Docker System Cleanup"

        print_info "Cleaning up unused Docker resources..."
        docker system prune -f >/dev/null 2>&1 || true
        print_success "Docker system cleanup completed"
    fi

    # 6. Clean npm cache (optional)
    if [ "$DRY_RUN" = false ]; then
        print_header "💾 npm Cache Cleanup"

        print_info "Cleaning npm cache..."
        npm cache clean --force >/dev/null 2>&1 || true
        print_success "npm cache cleaned"
    fi

    # 7. Final status check
    print_header "📋 Final Status Check"

    # Check if any Docker remnants exist
    if docker ps -a | grep -q "pathfinder-"; then
        print_warning "Some Pathfinder containers still exist"
    else
        print_success "No Pathfinder containers found"
    fi

    if docker volume ls | grep -q "pathfinder"; then
        print_warning "Some Pathfinder volumes still exist"
    else
        print_success "No Pathfinder volumes found"
    fi

    # Check if node_modules still exist
    REMAINING_DIRS=0
    for dir in "${NODE_MODULES_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            REMAINING_DIRS=$((REMAINING_DIRS + 1))
        fi
    done

    if [ "$REMAINING_DIRS" -gt 0 ]; then
        print_warning "$REMAINING_DIRS node_modules directories still exist"
    else
        print_success "All node_modules directories removed"
    fi

    # 8. Success message
    print_header "✨ Cleanup Complete!"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}Dry run completed. Run without --dry-run to actually clean.${NC}"
    else
        echo -e "${GREEN}Pathfinder has been completely cleaned and reset.${NC}"
    fi

    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "${BLUE}1. Run setup to start fresh:${NC}"
    echo -e "   ${YELLOW}./setup.sh${NC}"
    echo ""
    echo -e "${BLUE}2. For a completely fresh clone:${NC}"
    echo -e "   ${YELLOW}cd .. && rm -rf EthanTestProject${NC}"
    echo -e "   ${YELLOW}git clone https://github.com/ebailine/EthanTestProject.git${NC}"
    echo -e "   ${YELLOW}cd EthanTestProject && ./setup.sh${NC}"
    echo ""

    if [ "$DRY_RUN" = false ]; then
        echo -e "${GREEN}🎯 Ready for a fresh setup!${NC}"
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi