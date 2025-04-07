"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardChart } from "@/components/dashboard-chart"
import { MonthlyChart } from "@/components/monthly-chart"
import type { Run } from "@/lib/types"
import { calculateStats, calculateStreaks } from "@/lib/stats"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function StatsPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMiles: 0,
    progressPercentage: 0,
    paceStatus: 0,
    milesPerDay: 0,
    requiredMilesPerDay: 0,
    daysLeft: 0,
    milesLeft: 0,
  })
  const [streaks, setStreaks] = useState({
    currentStreak: 0,
    longestStreak: 0,
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRuns = async () => {
      console.log("=== FETCHING RUNS FOR STATS PAGE ===");
      setIsLoading(true);
      
      try {
        // Get the user_id from the auth context
        const userId = user?.id;
        console.log("User ID:", userId);
        
        if (!userId) {
          console.error("No user ID found. User may not be logged in.");
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in to view your statistics.",
          });
          return;
        }
        
        // Validate UUID format for user_id
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          console.error("Invalid user ID format:", userId);
          toast({
            variant: "destructive",
            title: "Invalid User ID",
            description: "There was a problem with your account. Please log in again.",
          });
          return;
        }
        
        // Fetch runs from API
        console.log("Fetching runs for user:", userId);
        const response = await fetch(`/api/runs?user_id=${userId}`);
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from API:", errorData);
          throw new Error(errorData.error || 'Failed to fetch runs');
        }
        
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} runs`);
        setRuns(data);
      } catch (error) {
        console.error('Error fetching runs:', error);
        toast({
          variant: "destructive",
          title: "Failed to load runs",
          description: error instanceof Error ? error.message : "There was a problem loading your runs. Please try again.",
        });
      } finally {
        setIsLoading(false);
        console.log("=== END FETCHING RUNS FOR STATS PAGE ===");
      }
    };

    fetchRuns();
  }, [user, toast]);

  useEffect(() => {
    if (runs.length > 0) {
      const calculatedStats = calculateStats(runs)
      setStats(calculatedStats)
      
      // Calculate streaks
      const calculatedStreaks = calculateStreaks(runs)
      setStreaks(calculatedStreaks)
    }
  }, [runs])

  // Calculate monthly statistics
  const calculateMonthlyStats = () => {
    if (runs.length === 0) return { bestMonth: "N/A", bestMonthMiles: 0, currentMonth: "N/A", currentMonthMiles: 0, monthlyAverage: 0, targetMonthly: 30.4 };
    
    // Group runs by month
    const runsByMonth: Record<string, number> = {};
    runs.forEach(run => {
      const date = new Date(run.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      runsByMonth[monthKey] = (runsByMonth[monthKey] || 0) + run.distance;
    });
    
    // Find best month
    let bestMonth = "";
    let bestMonthMiles = 0;
    Object.entries(runsByMonth).forEach(([month, miles]) => {
      if (miles > bestMonthMiles) {
        bestMonthMiles = miles;
        bestMonth = month;
      }
    });
    
    // Get current month
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const currentMonthMiles = runsByMonth[currentMonthKey] || 0;
    
    // Calculate monthly average
    const monthlyAverage = Object.values(runsByMonth).reduce((sum, miles) => sum + miles, 0) / Object.keys(runsByMonth).length;
    
    return {
      bestMonth: bestMonth ? new Date(bestMonth).toLocaleString('default', { month: 'long' }) : "N/A",
      bestMonthMiles,
      currentMonth: now.toLocaleString('default', { month: 'long' }),
      currentMonthMiles,
      monthlyAverage,
      targetMonthly: 30.4
    };
  };

  const monthlyStats = calculateMonthlyStats();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMiles.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  out of 365 miles ({stats.progressPercentage.toFixed(1)}%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.milesPerDay.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">miles per day</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Required Pace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.requiredMilesPerDay.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">miles/day to finish</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pace Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.paceStatus > 0 ? "+" : ""}
                  {stats.paceStatus.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.paceStatus >= 0 ? "Ahead of pace" : "Behind pace"}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streaks.currentStreak}</div>
                <p className="text-xs text-muted-foreground">consecutive days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streaks.longestStreak}</div>
                <p className="text-xs text-muted-foreground">consecutive days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{runs.length}</div>
                <p className="text-xs text-muted-foreground">runs logged</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Run</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalMiles / (runs.length || 1)).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">miles per run</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Progress</CardTitle>
              <CardDescription>Your progress compared to the target pace of 1 mile per day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <DashboardChart runs={runs} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Your mileage by month compared to target pace</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <MonthlyChart runs={runs} showTarget={true} />
              )}
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.bestMonth}</div>
                <p className="text-xs text-muted-foreground">{monthlyStats.bestMonthMiles.toFixed(1)} miles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.currentMonth}</div>
                <p className="text-xs text-muted-foreground">{monthlyStats.currentMonthMiles.toFixed(1)} miles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.monthlyAverage.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Target: {monthlyStats.targetMonthly} miles/month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Run Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading statistics...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                        <p className="text-xl font-bold">{runs.length}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Average Distance</p>
                        <p className="text-xl font-bold">{(stats.totalMiles / (runs.length || 1)).toFixed(2)} miles</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Longest Run</p>
                        <p className="text-xl font-bold">
                          {Math.max(...runs.map((run) => run.distance), 0).toFixed(2)} miles
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Shortest Run</p>
                        <p className="text-xl font-bold">
                          {runs.length ? Math.min(...runs.map((run) => run.distance)).toFixed(2) : "0.00"} miles
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Challenge Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading progress data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Miles Left</p>
                        <p className="text-xl font-bold">{stats.milesLeft.toFixed(1)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Days Left</p>
                        <p className="text-xl font-bold">{stats.daysLeft}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Completion Date</p>
                        <p className="text-xl font-bold">
                          {stats.requiredMilesPerDay > 0
                            ? new Date(
                                Date.now() + (stats.milesLeft / stats.requiredMilesPerDay) * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Progress</p>
                        <p className="text-xl font-bold">{stats.progressPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

