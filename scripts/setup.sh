#!/bin/bash

# Pathfinder Setup Script
# This script sets up the development environment for Pathfinder

echo "🚀 Setting up Pathfinder development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker from https://docker.com"
    exit 1
fi
echo "✅ Docker $(docker --version) found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi
echo "✅ Docker Compose $(docker-compose --version) found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ -d "app" ]; then
    echo "Installing app dependencies..."
    cd app
    npm install
    cd ..
fi

if [ -d "ingestion" ]; then
    echo "Installing ingestion dependencies..."
    cd ingestion
    npm install
    cd ..
fi

# Setup environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Setup database
echo "🗄️ Setting up database..."
cd app

# Generate Prisma client
echo "Generating Prisma client..."
npm run db:generate

# Run migrations
echo "Running database migrations..."
npm run db:migrate

# Return to root
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration (especially Clerk keys)"
echo "2. Run 'npm run dev' to start the development servers"
echo "3. Visit http://localhost:3000 to see the application"
echo "4. Visit http://localhost:5678 for n8n dashboard"
echo "5. Visit http://localhost:8108 for Typesense dashboard"
echo ""
echo "For more information, see QUICK_START.md"