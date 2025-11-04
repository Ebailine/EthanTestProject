# Pathfinder MVP Troubleshooting Guide

This guide covers common issues and solutions for setting up and running Pathfinder MVP.

## Table of Contents

- [Docker Issues](#docker-issues)
- [npm Install Failures](#npm-install-failures)
- [Database Connection Problems](#database-connection-problems)
- [Environment File Issues](#environment-file-issues)
- [Platform-Specific Problems](#platform-specific-problems)
- [Application Issues](#application-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Docker Issues

### Docker daemon not running

**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# On Mac
open /Applications/Docker.app

# On Linux (Ubuntu/Debian)
sudo systemctl start docker
sudo systemctl enable docker

# On Windows
Start Docker Desktop from Start Menu
```

### Port conflicts

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use the cleanup script
./cleanup.sh
```

**Common ports used by Pathfinder**:
- `3000` - Frontend (Next.js)
- `5432` - Database (PostgreSQL)
- `6379` - Cache (Redis)
- `8108` - Search (Typesense)
- `5678` - Automation (n8n)

### Permission denied errors

**Error**: `permission denied while trying to connect to the Docker daemon`

**Solution**:
```bash
# On Linux, add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

### Docker image pull failures

**Error**: `image pull timeout` or `manifest unknown`

**Solution**:
```bash
# Check internet connection
ping google.com

# Clear Docker cache
docker system prune -a

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# Restart Docker Desktop       # Mac/Windows
```

---

## npm Install Failures

### Peer dependency conflicts

**Error**: `Could not resolve dependency between next@14.0.0 and @clerk/nextjs@4.31.8`

**Solution**:
This has been fixed in the updated `app/package.json`. If you still see this:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules app/node_modules ingestion/node_modules

# Re-run setup
./setup.sh
```

### Invalid package names

**Error**: `404 Not Found - '@typesense/typesense@^1.0.0' is not in this registry`

**Solution**:
This has been fixed in the updated `app/package.json`. The correct package name is `typesense` (without `@typesense/` prefix).

```bash
# Ensure you're using the updated package.json
git pull origin main

# Clean and reinstall
./cleanup.sh
./setup.sh
```

### Network timeouts

**Error**: `npm ERR! network request timeout`

**Solution**:
```bash
# Check internet connection
ping registry.npmjs.org

# Use different registry
npm config set registry https://registry.npmjs.org/

# Increase timeout
npm config set fetch-timeout 600000

# Or use yarn instead
npm install -g yarn
yarn install
```

### Permission issues

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or use nvm for better Node.js management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

## Database Connection Problems

### Database permission denied

**Error**: `P1010: User 'pathfinder' was denied access on the database 'pathfinder.public'`

**Solution**:
The updated setup script should handle this automatically. If issues persist:

```bash
# Reset database completely
docker-compose down -v
docker-compose up -d postgres

# Wait for postgres to be healthy
docker-compose logs -f postgres

# Re-run setup
./setup.sh
```

### Database doesn't exist

**Error**: `database "pathfinder" does not exist`

**Solution**:
```bash
# Check if postgres is running
docker-compose ps postgres

# Restart postgres with init script
docker-compose down postgres
docker-compose up -d postgres

# Re-run database setup
cd app && npm run db:migrate && cd ..
```

### Connection refused

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres health
docker-compose logs postgres

# Restart services
docker-compose restart postgres
```

### Prisma client generation fails

**Error**: `Error: P1010: User 'pathfinder' was denied access`

**Solution**:
```bash
# Check environment file exists
ls -la .env app/.env

# Verify DATABASE_URL format
grep DATABASE_URL .env

# Regenerate after fixing permissions
cd app && npm run db:generate && cd ..
```

---

## Environment File Issues

### .env file not found

**Error**: `Environment variable not found: DATABASE_URL`

**Solution**:
```bash
# Copy from example (setup script does this automatically)
cp .env.example .env
cp .env.example app/.env

# Or re-run setup
./setup.sh
```

### DATABASE_URL format issues

**Error**: `Invalid connection string`

**Solution**:
Ensure your DATABASE_URL follows this format:
```
DATABASE_URL=postgresql://pathfinder:pathfinder_dev@localhost:5432/pathfinder
```

### Missing required variables

**Error**: Various missing environment variable errors

**Solution**:
Check `.env.example` for all required variables:
```bash
# Compare your .env with .env.example
diff .env .env.example

# Add missing variables
nano .env  # or use your preferred editor
```

---

## Platform-Specific Problems

### macOS Specific Issues

#### Docker Desktop not starting
**Solution**:
```bash
# Reset Docker Desktop
# Click Docker Desktop icon > Troubleshoot > Reset to factory defaults

# Or restart Docker daemon
sudo killall Docker
open /Applications/Docker.app
```

#### Port 5432 conflicts with PostgreSQL.app
**Solution**:
```bash
# Stop PostgreSQL.app if running
# Use Activity Monitor to quit PostgreSQL.app

# Or change Docker port
# Edit docker-compose.yml:
# ports:
#   - "5433:5432"  # Use 5433 instead
```

### Linux Specific Issues

#### Docker daemon not starting
**Solution**:
```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

#### Firewall blocking Docker
**Solution**:
```bash
# Allow Docker through firewall
sudo ufw allow 2376/tcp  # Docker daemon
sudo ufw allow 2377/tcp  # Docker swarm
sudo ufw reload
```

### Windows Specific Issues

#### WSL2 issues
**Error**: `docker: command not found`

**Solution**:
```bash
# Ensure WSL2 is installed
wsl --install

# Use Docker Desktop with WSL2 integration
# Settings > Resources > WSL Integration > Enable
```

#### Path issues in Git Bash
**Error**: `//./pipe/docker_engine: the system cannot find the file specified`

**Solution**:
```bash
# Use PowerShell or Command Prompt instead of Git Bash
# Or use Docker Desktop terminal
```

---

## Application Issues

### Frontend won't start

**Error**: `Error: listen EADDRINUSE :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
cd app
PORT=3001 npm run dev
```

### TypeScript compilation errors

**Error**: Various TypeScript errors

**Solution**:
```bash
# Check TypeScript version
cd app && npx tsc --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for type errors
npm run typecheck
```

### Build failures

**Error**: `Build failed` or compilation errors

**Solution**:
```bash
# Clear Next.js cache
cd app
rm -rf .next

# Check for syntax errors
npm run typecheck

# Try building again
npm run build
```

### API endpoints not working

**Error**: 404 errors or API not responding

**Solution**:
```bash
# Check if frontend is running
curl http://localhost:3000

# Check API routes
curl http://localhost:3000/api/health

# Check logs
cd app && npm run dev
```

---

## Performance Issues

### Slow startup times

**Symptoms**: Setup takes more than 5 minutes

**Solutions**:
```bash
# Check Docker resource limits
# Docker Desktop > Settings > Resources > Increase memory/CPU

# Use SSD storage for better performance

# Close unnecessary applications

# Check network speed for npm installs
```

### High memory usage

**Symptoms**: System becomes slow after setup

**Solutions**:
```bash
# Check Docker container memory usage
docker stats

# Restart containers
docker-compose restart

# Limit container resources in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 512M
```

---

## Getting Help

### Before asking for help

1. **Run the test script**:
   ```bash
   ./scripts/test.sh
   ```

2. **Check logs**:
   ```bash
   # Docker logs
   docker-compose logs postgres
   docker-compose logs redis
   docker-compose logs typesense
   docker-compose logs n8n

   # Application logs
   cd app && npm run dev  # Check console output
   ```

3. **Try a clean reset**:
   ```bash
   ./cleanup.sh
   ./setup.sh
   ```

### Useful commands for debugging

```bash
# Check system status
docker-compose ps
docker-compose logs --tail=50

# Database debugging
docker-compose exec postgres psql -U pathfinder -d pathfinder -c "\dt"

# Network debugging
netstat -tulpn | grep :3000
curl -I http://localhost:3000

# Node.js debugging
cd app && npm run typecheck
npm run build
```

### What to include when asking for help

When reporting issues, please include:

1. **Operating system**: Mac/Linux/Windows (and version)
2. **Docker version**: `docker --version` and `docker-compose --version`
3. **Node.js version**: `node --version` and `npm --version`
4. **Error messages**: Full error output, not just summaries
5. **Steps taken**: What you did and what happened
6. **Test script output**: `./scripts/test.sh` results

### Where to get help

1. **Check this guide first** - Most common issues are covered here
2. **Run the test script** - `./scripts/test.sh` provides diagnostic information
3. **Check GitHub Issues** - Search for similar problems
4. **Create a new issue** - Include all debugging information

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Docker not running | Start Docker Desktop/daemon |
| Port conflict | `./cleanup.sh` or kill process |
| npm install fails | `npm cache clean --force && ./cleanup.sh && ./setup.sh` |
| Database errors | `docker-compose down -v && ./setup.sh` |
| Environment issues | `./setup.sh` (creates .env files) |
| Build fails | `cd app && rm -rf .next && npm run build` |
| API not working | Check if `npm run dev` is running |

---

## Common Workflows

### Fresh start
```bash
./cleanup.sh
./setup.sh
npm run dev
```

### Debug database issues
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U pathfinder -d pathfinder -c "\dt"
```

### Reset just the database
```bash
docker-compose down postgres
docker-compose up -d postgres
cd app && npm run db:migrate && npm run db:seed
```

### Check system health
```bash
./scripts/test.sh
docker-compose ps
docker stats --no-stream
```