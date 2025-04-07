# Testing Your Supabase Implementation

This guide will help you verify that your Supabase integration is working correctly.

## 1. Check Environment Variables

First, make sure your environment variables are properly set:

```bash
npm run check-env
```

This will verify that your `.env.local` file contains the necessary Supabase credentials.

## 2. Verify Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following query to check if your tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'posts');
```

You should see both tables listed.

## 3. Test API Endpoints

### Test Users API

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api/users
   ```

3. You should see a JSON response with an array of users.

### Test Posts API

1. Navigate to:
   ```
   http://localhost:3000/api/posts
   ```

2. You should see a JSON response with an array of posts.

## 4. Test the Community Page

1. Navigate to:
   ```
   http://localhost:3000/dashboard/community
   ```

2. You should see:
   - A list of posts from the database
   - A list of active users
   - A form to create new posts

3. Try creating a new post:
   - Fill in the textarea and click "Post Update"
   - You should see a success toast notification
   - The new post should appear at the top of the list

4. Try liking a post:
   - Click the heart button on a post
   - The like count should increase
   - The change should be persisted in the database

## 5. Check the Network Tab

1. Open your browser's developer tools (F12)
2. Go to the Network tab
3. Refresh the page
4. You should see API calls to:
   - `/api/posts`
   - `/api/users`

5. When you create a post or like a post, you should see additional API calls.

## 6. Check the Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the `posts` table
4. You should see your new posts listed there

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify that your environment variables are correct
4. Make sure your database schema matches the one in `supabase/schema.sql`
5. Try clearing your browser's local storage and logging in again

If you're still having issues, please provide the specific error message and we'll help you troubleshoot further. 