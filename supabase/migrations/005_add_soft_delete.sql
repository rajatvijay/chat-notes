-- Add soft delete column to notes table
ALTER TABLE notes ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for deleted_at column to optimize queries
CREATE INDEX idx_notes_deleted_at ON notes(deleted_at);

-- Create a view for active (non-deleted) notes
CREATE VIEW active_notes AS
SELECT * FROM notes WHERE deleted_at IS NULL;