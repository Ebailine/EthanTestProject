-- =============================================================================
-- Pathfinder Database Initialization Script
-- =============================================================================
-- This script ensures robust database setup with proper permissions

-- Create main pathfinder database with correct permissions
DROP DATABASE IF EXISTS pathfinder;
CREATE DATABASE pathfinder;

-- Create dedicated user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'pathfinder') THEN
    CREATE USER pathfinder WITH PASSWORD 'pathfinder_dev';
  END IF;
END
$$;

-- Grant privileges
ALTER DATABASE pathfinder OWNER TO pathfinder;
GRANT ALL PRIVILEGES ON DATABASE pathfinder TO pathfinder;

-- Connect and set schema permissions
\c pathfinder;

-- Ensure schema ownership
ALTER SCHEMA public OWNER TO pathfinder;
GRANT ALL PRIVILEGES ON SCHEMA public TO pathfinder;
GRANT ALL ON ALL TABLES IN SCHEMA public TO pathfinder;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO pathfinder;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO pathfinder;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pathfinder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pathfinder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO pathfinder;

-- Create n8n database
\c postgres;
DROP DATABASE IF EXISTS pathfinder_n8n;
CREATE DATABASE pathfinder_n8n;
ALTER DATABASE pathfinder_n8n OWNER TO pathfinder;
GRANT ALL PRIVILEGES ON DATABASE pathfinder_n8n TO pathfinder;

-- Grant connect privileges
GRANT CONNECT ON DATABASE pathfinder TO pathfinder;
GRANT CONNECT ON DATABASE pathfinder_n8n TO pathfinder;