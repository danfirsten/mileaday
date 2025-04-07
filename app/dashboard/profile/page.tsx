"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DashboardChart } from "@/components/dashboard-chart"
import { MonthlyChart } from "@/components/monthly-chart"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import type { Run } from "@/lib/types"
import { calculateStats, calculateStreaks } from "@/lib/stats"
import { Award, Calendar, Clock, MapPin, Trophy } from "lucide-react"
import { getAvatarUrl } from "@/lib/constants"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
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

  // Mock achievements - in a real app, these would come from the API
  const achievements = [
    { id: 1, title: "First Mile", description: "Logged your first mile", earned: true },
    { id: 2, title: "10 Mile Club", description: "Reached 10 total miles", earned: true },
    { id: 3, title: "25 Mile Club", description: "Reached 25 total miles", earned: true },
    { id: 4, title: "50 Mile Club", description: "Reached 50 total miles", earned: false },
    { id: 5, title: "100 Mile Club", description: "Reached 100 total miles", earned: false },
    { id: 6, title: "Consistent Runner", description: "Logged runs for 7 days in a row", earned: false },
  ]

  useEffect(() => {
    const fetchRuns = async () => {
      console.log("=== FETCHING RUNS FOR PROFILE PAGE ===");
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
            description: "Please log in to view your profile.",
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
        console.log("=== END FETCHING RUNS FOR PROFILE PAGE ===");
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

  // Calculate some additional stats
  const totalRuns = runs.length
  const longestRun = Math.max(...runs.map((run) => run.distance), 0)
  const averageRun = totalRuns > 0 ? stats.totalMiles / totalRuns : 0
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src={getAvatarUrl(user?.image || 'default')} alt={user?.name || ""} />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-center">{user?.name}</CardTitle>
              <CardDescription className="text-center">{user?.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Challenge Progress</span>
                  <span className="text-sm font-medium">{stats.progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={stats.progressPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total Miles</span>
                  <span className="text-xl font-bold">{stats.totalMiles.toFixed(1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Pace Status</span>
                  <span className="text-xl font-bold">
                    {stats.paceStatus > 0 ? "+" : ""}
                    {stats.paceStatus.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total Runs</span>
                  <span className="text-xl font-bold">{totalRuns}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Current Streak</span>
                  <span className="text-xl font-bold">{streaks.currentStreak} days</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Longest Streak</span>
                  <span className="text-xl font-bold">{streaks.longestStreak} days</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>New York, NY</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined January 2023</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-5">
          <Tabs defaultValue="stats" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Running Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Clock className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Average Run</span>
                      <span className="text-2xl font-bold">{averageRun.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">miles</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <MapPin className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Longest Run</span>
                      <span className="text-2xl font-bold">{longestRun.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">miles</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Trophy className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Longest Streak</span>
                      <span className="text-2xl font-bold">{streaks.longestStreak}</span>
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress Chart</CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Distribution</CardTitle>
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
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Badges and milestones you've earned on your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg ${
                          achievement.earned ? "" : "opacity-50"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            achievement.earned ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.earned && (
                            <Badge variant="outline" className="mt-1">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest runs and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">Loading activity data...</p>
                    </div>
                  ) : runs.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">No runs logged yet. Start your journey today!</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {runs.slice(0, 5).map((run, index) => (
                        <div key={run.id} className="flex">
                          <div className="mr-4 flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="h-full w-px bg-border"></div>
                          </div>
                          <div className="space-y-1 pt-1">
                            <p className="text-sm font-medium leading-none">
                              Logged a {run.distance.toFixed(2)} mile run
                            </p>
                            <p className="text-sm text-muted-foreground">{new Date(run.date).toLocaleDateString()}</p>
                            {run.note && (
                              <p className="text-sm text-muted-foreground mt-2 border-l-2 pl-2 italic">"{run.note}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

