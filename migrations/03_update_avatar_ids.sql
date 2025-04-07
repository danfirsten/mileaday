-- Set all users to default avatar
UPDATE users 
SET image = 'default';

-- Add the constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS valid_avatar_id;

ALTER TABLE users
ADD CONSTRAINT valid_avatar_id CHECK (
    image IN (
        'default',
        'runner1',
        'runner2',
        'runner3',
        'runner4'
    )
); 