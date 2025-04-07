-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  total_miles DECIMAL(10, 2) DEFAULT 0,
  monthly_miles DECIMAL(10, 2) DEFAULT 0,
  pace_status INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create runs table
CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_date ON runs(date);

-- Insert sample users
INSERT INTO users (id, name, email, image, total_miles, monthly_miles, pace_status, streak)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', 'https://i.pravatar.cc/150?u=john', 125.5, 42.3, 1, 15),
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', 'https://i.pravatar.cc/150?u=jane', 87.2, 28.7, 0, 8),
  ('00000000-0000-0000-0000-000000000003', 'Mike Johnson', 'mike@example.com', 'https://i.pravatar.cc/150?u=mike', 210.8, 65.2, 2, 22),
  ('00000000-0000-0000-0000-000000000004', 'Sarah Williams', 'sarah@example.com', 'https://i.pravatar.cc/150?u=sarah', 156.3, 48.9, 1, 12),
  ('00000000-0000-0000-0000-000000000005', 'David Brown', 'david@example.com', 'https://i.pravatar.cc/150?u=david', 178.6, 52.1, 1, 18)
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (id, user_id, content, date, likes)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Just completed my longest run yet! 8 miles and feeling great. #365MileChallenge', '2023-02-15T10:30:00Z', 5),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Morning run in the rain. Not my favorite conditions but got it done! 3.5 miles closer to the goal.', '2023-02-14T08:15:00Z', 3),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Hit the 50 mile mark today! Only 315 to go. Who else is on track with their challenge?', '2023-02-13T16:45:00Z', 7)
ON CONFLICT (id) DO NOTHING;

-- Insert sample runs
INSERT INTO runs (id, user_id, date, distance, note)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2023-02-15T07:30:00Z', 3.5, 'Morning run, feeling good'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2023-02-13T18:15:00Z', 4.2, 'Evening run after work'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2023-02-10T08:00:00Z', 5.0, 'Long run on the weekend'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2023-02-14T06:45:00Z', 3.0, 'Early morning run'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2023-02-12T17:30:00Z', 4.5, 'Afternoon run')
ON CONFLICT (id) DO NOTHING; 