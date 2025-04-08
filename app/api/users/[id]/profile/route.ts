import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT handler to update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== PUT /api/users/[id]/profile ===");
  
  try {
    const { id: userId } = await params;
    console.log("Updating profile for user:", userId);
    
    // Check if request body is empty
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    // Get the raw text first to check if it's empty
    const rawText = await request.text();
    if (!rawText) {
      return NextResponse.json(
        { error: 'Request body is empty' },
        { status: 400 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.log("Request body:", body);
    
    // Extract profile data
    const { name, email, image } = body;
    
    // Update user profile in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ name, email, image })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { error: `Failed to update user profile: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Return updated user data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 