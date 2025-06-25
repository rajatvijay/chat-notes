-- Create task_completions table to track completed tasks
CREATE TABLE task_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_task_completions_note_id ON task_completions(note_id);
CREATE INDEX idx_task_completions_completed_at ON task_completions(completed_at DESC);

-- Add unique constraint to prevent duplicate completions
CREATE UNIQUE INDEX idx_task_completions_unique_note ON task_completions(note_id);