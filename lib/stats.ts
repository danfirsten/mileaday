import type { Run } from "./types"

export function calculateStats(runs: Run[]) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31)

  // Calculate days elapsed and days left in the year
  const daysElapsed = Math.floor((today.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const daysInYear = Math.floor((endOfYear.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1
  const daysLeft = daysInYear - daysElapsed

  // Calculate total miles
  const totalMiles = runs.reduce((sum, run) => sum + run.distance, 0)

  // Calculate progress percentage
  const progressPercentage = (totalMiles / 365) * 100

  // Calculate pace status (ahead or behind)
  const targetMilesToDate = daysElapsed // 1 mile per day
  const paceStatus = totalMiles - targetMilesToDate

  // Calculate miles left
  const milesLeft = 365 - totalMiles

  // Calculate required miles per day to finish
  const requiredMilesPerDay = daysLeft > 0 ? milesLeft / daysLeft : 0

  // Calculate average miles per day
  const milesPerDay = daysElapsed > 0 ? totalMiles / daysElapsed : 0

  return {
    totalMiles,
    progressPercentage,
    paceStatus,
    milesPerDay,
    requiredMilesPerDay,
    daysLeft,
    milesLeft,
  }
}

/**
 * Calculate streak information based on run history
 * @param runs Array of run objects with date property
 * @returns Object containing current streak and longest streak
 */
export function calculateStreaks(runs: Run[]): { currentStreak: number; longestStreak: number } {
  if (!runs || runs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort runs by date in descending order (newest first)
  const sortedRuns = [...runs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get today's date and yesterday's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the most recent run was today or yesterday
  const mostRecentRunDate = new Date(sortedRuns[0].date);
  mostRecentRunDate.setHours(0, 0, 0, 0);
  
  // If the most recent run is older than yesterday, streak is broken
  if (mostRecentRunDate < yesterday) {
    return { currentStreak: 0, longestStreak: calculateLongestStreak(sortedRuns) };
  }

  // Calculate current streak
  let currentStreak = 1;
  let currentDate = mostRecentRunDate;
  
  for (let i = 1; i < sortedRuns.length; i++) {
    const runDate = new Date(sortedRuns[i].date);
    runDate.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const diffTime = Math.abs(currentDate.getTime() - runDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If the run is exactly one day before the current date, it's part of the streak
    if (diffDays === 1) {
      currentStreak++;
      currentDate = runDate;
    } else {
      // Streak is broken
      break;
    }
  }

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(sortedRuns);

  return { currentStreak, longestStreak };
}

/**
 * Calculate monthly miles based on run history
 * @param runs Array of run objects with date property
 * @returns Total miles for the current month
 */
export function calculateMonthlyMiles(runs: Run[]): number {
  if (!runs || runs.length === 0) {
    return 0;
  }

  // Get the first day of the current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  // Filter runs from the current month
  const monthlyRuns = runs.filter(run => {
    const runDate = new Date(run.date);
    return runDate >= firstDayOfMonth;
  });

  // Calculate total miles for the month
  const monthlyMiles = monthlyRuns.reduce((sum, run) => sum + run.distance, 0);

  return monthlyMiles;
}

/**
 * Helper function to calculate the longest streak from run history
 * @param sortedRuns Array of run objects sorted by date (newest first)
 * @returns The longest streak in days
 */
function calculateLongestStreak(sortedRuns: Run[]): number {
  if (sortedRuns.length === 0) return 0;
  
  // Sort runs by date in ascending order (oldest first) for streak calculation
  const chronologicalRuns = [...sortedRuns].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let longestStreak = 1;
  let currentStreak = 1;
  let currentDate = new Date(chronologicalRuns[0].date);
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < chronologicalRuns.length; i++) {
    const runDate = new Date(chronologicalRuns[i].date);
    runDate.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const diffTime = Math.abs(runDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If the run is exactly one day after the current date, it's part of the streak
    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      // Streak is broken, start a new one
      currentStreak = 1;
    }
    
    currentDate = runDate;
  }
  
  return longestStreak;
}

