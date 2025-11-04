-- Create outreach_batches table for tracking outreach campaigns
CREATE TABLE IF NOT EXISTS outreach_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('draft', 'approved', 'sent', 'responded')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create outreach_emails table for individual email tracking
CREATE TABLE IF NOT EXISTS outreach_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES outreach_batches(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    angle_tag TEXT CHECK (angle_tag IN ('curiosity', 'mission_fit', 'project_relevance', 'specific_question', 'timeline')) NOT NULL,
    sources_cited JSONB,
    status TEXT CHECK (status IN ('draft', 'approved', 'sent', 'replied', 'bounced')) DEFAULT 'draft',
    sent_at TIMESTAMP,
    reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for outreach_batches table
CREATE INDEX IF NOT EXISTS idx_outreach_batches_user_id ON outreach_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_batches_job_id ON outreach_batches(job_id);
CREATE INDEX IF NOT EXISTS idx_outreach_batches_company_id ON outreach_batches(company_id);
CREATE INDEX IF NOT EXISTS idx_outreach_batches_status ON outreach_batches(status);
CREATE INDEX IF NOT EXISTS idx_outreach_batches_created_at ON outreach_batches(created_at);

-- Create indexes for outreach_emails table
CREATE INDEX IF NOT EXISTS idx_outreach_emails_batch_id ON outreach_emails(batch_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_contact_id ON outreach_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_angle_tag ON outreach_emails(angle_tag);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_status ON outreach_emails(status);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_sent_at ON outreach_emails(sent_at);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_reply_at ON outreach_emails(reply_at);

-- Create triggers to update updated_at timestamps
CREATE TRIGGER update_outreach_batches_updated_at BEFORE UPDATE ON outreach_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_emails_updated_at BEFORE UPDATE ON outreach_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for data integrity
ALTER TABLE outreach_batches ADD CONSTRAINT unique_user_job_company
    UNIQUE (user_id, job_id, company_id);