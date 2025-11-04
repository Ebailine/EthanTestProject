-- Create additional database for n8n
CREATE DATABASE pathfinder_n8n;

-- Create user for n8n if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'n8n') THEN

      CREATE ROLE n8n LOGIN PASSWORD 'n8n_password';
   END IF;
END
$do$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE pathfinder_n8n TO n8n;