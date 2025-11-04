-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    function TEXT CHECK (function IN ('engineering', 'product', 'design', 'marketing', 'sales', 'operations', 'finance', 'other')),
    major_tags TEXT[],
    location TEXT,
    remote_flag BOOLEAN DEFAULT FALSE,
    paid_flag BOOLEAN DEFAULT TRUE,
    pay_info JSONB,
    internship_type TEXT CHECK (internship_type IN ('summer', 'semester', 'co-op', 'year-round', 'other')),
    start_date DATE,
    end_date DATE,
    source_name TEXT NOT NULL,
    source_url TEXT UNIQUE NOT NULL,
    ats_type TEXT CHECK (ats_type IN ('greenhouse', 'lever', 'workday', 'other', 'manual')),
    posted_at DATE,
    last_verified_at DATE,
    status TEXT CHECK (status IN ('active', 'expired', 'closed', 'draft')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_major_tags ON jobs USING GIN(major_tags);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_function ON jobs(function);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_source_url ON jobs(source_url);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_flag ON jobs(remote_flag);
CREATE INDEX IF NOT EXISTS idx_jobs_paid_flag ON jobs(paid_flag);
CREATE INDEX IF NOT EXISTS idx_jobs_internship_type ON jobs(internship_type);
CREATE INDEX IF NOT EXISTS idx_jobs_ats_type ON jobs(ats_type);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();