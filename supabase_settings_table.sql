-- ============================================
-- Settings Table for A3 Distributors Admin Panel
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_settings CHECK (id = 1)
);

-- Add comment
COMMENT ON TABLE settings IS 'Stores application settings as JSON. Only one row allowed.';

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings"
    ON settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to update settings
CREATE POLICY "Allow authenticated users to update settings"
    ON settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to insert settings
CREATE POLICY "Allow authenticated users to insert settings"
    ON settings
    FOR INSERT
    TO authenticated
    WITH CHECK (id = 1);

-- Insert default settings row
INSERT INTO settings (id, config) 
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Settings table created successfully!';
    RAISE NOTICE 'You can now use the settings page in the admin panel.';
END $$;
