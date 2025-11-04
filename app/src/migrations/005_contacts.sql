-- Create contacts table for company hiring contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    dept TEXT CHECK (dept IN ('HR', 'Recruiting', 'Team', 'EA', 'Other')) NOT NULL,
    email TEXT UNIQUE,
    email_confidence DECIMAL(3,2) CHECK (email_confidence >= 0 AND email_confidence <= 1),
    linkedin_url TEXT UNIQUE,
    is_role_account BOOLEAN DEFAULT FALSE,
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_linkedin_url ON contacts(linkedin_url) WHERE linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_dept ON contacts(dept);
CREATE INDEX IF NOT EXISTS idx_contacts_email_confidence ON contacts(email_confidence);
CREATE INDEX IF NOT EXISTS idx_contacts_is_role_account ON contacts(is_role_account);
CREATE INDEX IF NOT EXISTS idx_contacts_last_verified_at ON contacts(last_verified_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();