-- Create main pathfinder database with correct permissions
CREATE DATABASE pathfinder;
ALTER DATABASE pathfinder OWNER TO pathfinder;

-- Connect to pathfinder database and set permissions
\c pathfinder;
GRANT ALL PRIVILEGES ON SCHEMA public TO pathfinder;
ALTER SCHEMA public OWNER TO pathfinder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pathfinder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pathfinder;

-- Create n8n database (existing functionality)
CREATE DATABASE pathfinder_n8n;
GRANT ALL PRIVILEGES ON DATABASE pathfinder_n8n TO pathfinder;