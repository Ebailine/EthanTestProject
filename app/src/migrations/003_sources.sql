-- Create sources table for company research content
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('site_page', 'podcast', 'video', 'press', 'award', 'blog')) NOT NULL,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    published_at TIMESTAMP,
    transcript_text TEXT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sources table
CREATE INDEX IF NOT EXISTS idx_sources_company_id ON sources(company_id);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(url);
CREATE INDEX IF NOT EXISTS idx_sources_published_at ON sources(published_at);
CREATE INDEX IF NOT EXISTS idx_sources_fetched_at ON sources(fetched_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();