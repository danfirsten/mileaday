import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler to fetch all users
export async function GET() {
  console.log("=== GET /api/users ===");
  try {
    console.log("Fetching users from Supabase...");
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: `Failed to fetch users: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${data?.length || 0} users`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 