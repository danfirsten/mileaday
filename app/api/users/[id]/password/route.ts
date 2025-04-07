import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT handler to change user password
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("=== PUT /api/users/[id]/password ===");
  const userId = params.id;
  
  try {
    console.log("Changing password for user:", userId);
    
    // Validate UUID format for user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error("Invalid user ID format:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    console.log("Request body received (password hidden)");
    
    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }
    
    // Validate new password
    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }
    
    // Update password in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: body.newPassword
    });
    
    if (error) {
      console.error('Error changing password:', error);
      return NextResponse.json(
        { error: `Failed to change password: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Successfully changed password for user:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in password change API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 