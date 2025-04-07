"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardChart } from "@/components/dashboard-chart"
import { MonthlyChart } from "@/components/monthly-chart"
import { useToast } from "@/components/ui/use-toast"
import { calculateStats, calculateStreaks } from "@/lib/stats"
import type { Run } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
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
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchRuns = async () => {
      console.log("=== FETCHING RUNS FOR DASHBOARD ===");
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
            description: "Please log in to view your dashboard.",
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
        console.log("=== END FETCHING RUNS FOR DASHBOARD ===");
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/log">
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Log Run
            </Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Runs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMiles.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">{stats.milesLeft.toFixed(1)} miles left</p>
                <Progress value={stats.progressPercentage} className="mt-2" />
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
                <CardTitle className="text-sm font-medium">Days Left</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.daysLeft}</div>
                <p className="text-xs text-muted-foreground">until end of year</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <DashboardChart runs={runs} />
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Monthly Mileage</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <MonthlyChart runs={runs} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
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
            <Card>
              <CardHeader>
                <CardTitle>Yearly Stats</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading stats...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Average per run</div>
                      <div>{(stats.totalMiles / (runs.length || 1)).toFixed(2)} miles</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Longest run</div>
                      <div>{Math.max(...runs.map((run) => run.distance), 0).toFixed(2)} miles</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Total runs</div>
                      <div>{runs.length}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Current streak</div>
                      <div>{streaks.currentStreak} days</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Longest streak</div>
                      <div>{streaks.longestStreak} days</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
              <CardDescription>Your most recent logged runs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading recent runs...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {runs.slice(0, 5).map((run, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{new Date(run.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{run.note || "No notes"}</p>
                        </div>
                      </div>
                      <div className="font-medium">{run.distance.toFixed(2)} miles</div>
                    </div>
                  ))}
                  {runs.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No runs logged yet. Start logging your runs!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

