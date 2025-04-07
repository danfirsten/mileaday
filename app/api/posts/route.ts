import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler to fetch all posts
export async function GET() {
  console.log("=== GET /api/posts ===");
  try {
    console.log("Fetching posts from Supabase...");
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { error: `Failed to fetch posts: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${data?.length || 0} posts`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler to create a new post
export async function POST(request: NextRequest) {
  console.log("=== POST /api/posts ===");
  try {
    const body = await request.json();
    console.log("Request body:", body);
    
    // Validate the request body
    if (!body.content || !body.user_id) {
      console.error("Missing required fields:", { content: !!body.content, user_id: !!body.user_id });
      return NextResponse.json(
        { error: 'Content and user_id are required' },
        { status: 400 }
      );
    }
    
    // Validate UUID format for user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.user_id)) {
      console.error("Invalid user_id format:", body.user_id);
      return NextResponse.json(
        { error: 'Invalid user_id format. Must be a valid UUID.' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    console.log("Checking if user exists...");
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', body.user_id)
      .single();
    
    if (userError || !user) {
      console.error("User not found:", userError);
      return NextResponse.json(
        { error: 'User not found. Please use a valid user ID.' },
        { status: 400 }
      );
    }
    
    // Create a new post
    const newPost = {
      user_id: body.user_id,
      content: body.content,
      date: new Date().toISOString(),
      likes: 0,
    };
    
    console.log("Creating new post:", newPost);
    
    // Insert the new post into Supabase
    const { data, error } = await supabase
      .from('posts')
      .insert(newPost)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      
      // Check for specific error types
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'User not found. Please use a valid user ID.' },
          { status: 400 }
        );
      }
      
      if (error.code === '22P02') {
        return NextResponse.json(
          { error: 'Invalid UUID format for user_id.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to create post: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Successfully created post:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 