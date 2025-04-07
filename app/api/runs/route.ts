import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler to fetch all runs
export async function GET(request: NextRequest) {
  console.log("=== GET /api/runs ===");
  try {
    // Get the user_id from the query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    console.log("Request params:", { userId });
    
    let query = supabase
      .from('runs')
      .select('*')
      .order('date', { ascending: false });
    
    // If user_id is provided, filter by user_id
    if (userId) {
      // Validate UUID format for user_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error("Invalid user_id format:", userId);
        return NextResponse.json(
          { error: 'Invalid user_id format. Must be a valid UUID.' },
          { status: 400 }
        );
      }
      
      console.log("Filtering runs by user_id:", userId);
      query = query.eq('user_id', userId);
    }
    
    console.log("Executing Supabase query...");
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching runs:', error);
      return NextResponse.json(
        { error: `Failed to fetch runs: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${data?.length || 0} runs`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in runs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler to create a new run
export async function POST(request: NextRequest) {
  console.log("=== POST /api/runs ===");
  try {
    const body = await request.json();
    console.log("Request body:", body);
    
    // Validate the request body
    if (!body.date || !body.distance || !body.user_id) {
      console.error("Missing required fields:", { 
        date: !!body.date, 
        distance: !!body.distance, 
        user_id: !!body.user_id 
      });
      return NextResponse.json(
        { error: 'Date, distance, and user_id are required' },
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
    
    // Create a new run
    const newRun = {
      user_id: body.user_id,
      date: body.date,
      distance: body.distance,
      note: body.note || null,
    };
    
    console.log("Creating new run:", newRun);
    
    // Insert the new run into Supabase
    const { data, error } = await supabase
      .from('runs')
      .insert(newRun)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating run:', error);
      
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
        { error: `Failed to create run: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Successfully created run:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in runs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 