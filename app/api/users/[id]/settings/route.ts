import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler to fetch user settings
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("=== GET /api/users/[id]/settings ===");
  
  try {
    const { id: userId } = await params;
    console.log("Fetching settings for user:", userId);
    
    // Fetch user settings from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, image')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        { error: `Failed to fetch user settings: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Return the user data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 