-- Create moments table for extracted research insights
CREATE TABLE IF NOT EXISTS moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    timestamp_start TEXT, -- Format: "HH:MM:SS" for audio/video timestamps
    timestamp_end TEXT,   -- Format: "HH:MM:SS" for audio/video timestamps
    quote TEXT NOT NULL CHECK (length(quote) <= 500),
    label TEXT CHECK (label IN ('pain', 'plan', 'metric', 'hiring', 'mission')) NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    summary TEXT CHECK (length(summary) <= 200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for moments table
CREATE INDEX IF NOT EXISTS idx_moments_company_id ON moments(company_id);
CREATE INDEX IF NOT EXISTS idx_moments_source_id ON moments(source_id);
CREATE INDEX IF NOT EXISTS idx_moments_label ON moments(label);
CREATE INDEX IF NOT EXISTS idx_moments_confidence ON moments(confidence);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at);

-- Add constraint for timestamp validation
ALTER TABLE moments ADD CONSTRAINT valid_timestamp_format
    CHECK (
        (timestamp_start IS NULL OR timestamp_start ~ '^\d{2}:\d{2}:\d{2}$') AND
        (timestamp_end IS NULL OR timestamp_end ~ '^\d{2}:\d{2}:\d{2}$')
    );