-- Seed data for chat-notes application

-- Insert default categories
INSERT INTO categories (name) VALUES 
  ('task'),
  ('idea'),
  ('journal'),
  ('meeting'),
  ('reading'),
  ('misc')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample notes for testing
INSERT INTO notes (content, category, source) VALUES 
  ('Buy groceries and milk from the store', 'task', 'manual'),
  ('Create a mobile app for note-taking with AI categorization', 'idea', 'auto'),
  ('Had a great conversation with the team about the new project direction', 'journal', 'manual'),
  ('Weekly standup meeting - discussed sprint goals and blockers', 'meeting', 'auto'),
  ('Finished reading "The Pragmatic Programmer" - great insights on code quality', 'reading', 'manual'),
  ('Remember to water the plants this weekend', 'misc', 'auto'),
  ('Build a dark mode toggle for the application', 'task', 'auto'),
  ('What if we used voice notes for faster input?', 'idea', 'manual'),
  ('Feeling productive today after organizing my workspace', 'journal', 'auto'),
  ('Client meeting at 3pm to review the prototype', 'meeting', 'manual')
ON CONFLICT DO NOTHING;