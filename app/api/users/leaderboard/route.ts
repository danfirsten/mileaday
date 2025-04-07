import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateStats, calculateMonthlyMiles } from '@/lib/stats';
import type { Run } from '@/lib/types';

// GET handler to fetch users with calculated stats for leaderboard
export async function GET() {
  console.log("=== GET /api/users/leaderboard ===");
  try {
    console.log("Fetching users for leaderboard...");
    
    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: `Failed to fetch users: ${usersError.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${users?.length || 0} users`);
    
    // Fetch all runs
    const { data: runs, error: runsError } = await supabase
      .from('runs')
      .select('*');
    
    if (runsError) {
      console.error('Error fetching runs:', runsError);
      return NextResponse.json(
        { error: `Failed to fetch runs: ${runsError.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${runs?.length || 0} runs`);
    
    // Calculate stats for each user
    const usersWithStats = users.map(user => {
      // Filter runs for this user
      const userRuns = runs.filter(run => run.user_id === user.id) as Run[];
      
      // Calculate total miles and other stats
      const stats = calculateStats(userRuns);
      
      // Calculate monthly miles
      const monthlyMiles = calculateMonthlyMiles(userRuns);
      
      // Return user with calculated stats
      return {
        ...user,
        totalMiles: stats.totalMiles,
        monthlyMiles: monthlyMiles,
        paceStatus: stats.paceStatus,
        streak: stats.currentStreak || 0,
      };
    });
    
    console.log("Successfully calculated stats for all users");
    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 