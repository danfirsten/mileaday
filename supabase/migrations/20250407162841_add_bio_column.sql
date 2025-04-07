-- Add bio column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update existing users with a default bio
UPDATE users SET bio = 'Runner and 365-Mile Challenge participant' WHERE bio IS NULL;
