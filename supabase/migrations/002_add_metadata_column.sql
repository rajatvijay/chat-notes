-- Add metadata column to notes table
ALTER TABLE notes ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create index for metadata queries
CREATE INDEX idx_notes_metadata ON notes USING gin(metadata);