import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT handler to update user notification preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== PUT /api/users/[id]/notifications ===");
  
  try {
    // Await params.id to fix the Next.js warning
    const userId = await Promise.resolve(params.id);
    console.log("Updating notification preferences for user:", userId);
    
    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);
    
    // Extract notification preferences
    const { email, achievements, weeklyReport, friendActivity } = body;
    
    // Check if user settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error checking user settings:", checkError);
      return NextResponse.json(
        { error: `Failed to check user settings: ${checkError.message}` },
        { status: 500 }
      );
    }
    
    let result;
    
    // If settings exist, update them
    if (existingSettings) {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          email_notifications: email,
          achievement_notifications: achievements,
          weekly_report: weeklyReport,
          friend_activity: friendActivity,
        })
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error("Error updating notification preferences:", error);
        return NextResponse.json(
          { error: `Failed to update notification preferences: ${error.message}` },
          { status: 500 }
        );
      }
      
      result = data[0];
    } else {
      // If settings don't exist, create them
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          email_notifications: email,
          achievement_notifications: achievements,
          weekly_report: weeklyReport,
          friend_activity: friendActivity,
        })
        .select();
      
      if (error) {
        console.error("Error creating notification preferences:", error);
        return NextResponse.json(
          { error: `Failed to create notification preferences: ${error.message}` },
          { status: 500 }
        );
      }
      
      result = data[0];
    }
    
    // Return the updated notification preferences
    return NextResponse.json({
      email: result.email_notifications,
      achievements: result.achievement_notifications,
      weeklyReport: result.weekly_report,
      friendActivity: result.friend_activity,
    });
  } catch (error) {
    console.error("Error in notifications API:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 