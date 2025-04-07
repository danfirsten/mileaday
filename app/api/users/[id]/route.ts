import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE handler to delete a user account
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("=== DELETE /api/users/[id] ===");
  const userId = params.id;
  
  try {
    console.log("Deleting user account:", userId);
    
    // Validate UUID format for user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error("Invalid user ID format:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error checking if user exists:', userError);
      return NextResponse.json(
        { error: `Failed to check if user exists: ${userError.message}` },
        { status: 500 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Delete user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);
    
    if (settingsError) {
      console.error('Error deleting user settings:', settingsError);
      return NextResponse.json(
        { error: `Failed to delete user settings: ${settingsError.message}` },
        { status: 500 }
      );
    }
    
    // Delete user runs
    const { error: runsError } = await supabase
      .from('runs')
      .delete()
      .eq('user_id', userId);
    
    if (runsError) {
      console.error('Error deleting user runs:', runsError);
      return NextResponse.json(
        { error: `Failed to delete user runs: ${runsError.message}` },
        { status: 500 }
      );
    }
    
    // Delete user posts
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId);
    
    if (postsError) {
      console.error('Error deleting user posts:', postsError);
      return NextResponse.json(
        { error: `Failed to delete user posts: ${postsError.message}` },
        { status: 500 }
      );
    }
    
    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete user: ${deleteError.message}` },
        { status: 500 }
      );
    }
    
    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Error deleting user from auth:', authError);
      // We don't return an error here since the user data is already deleted
      // Just log the error and continue
    }
    
    console.log("Successfully deleted user account:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user deletion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 