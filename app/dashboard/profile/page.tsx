"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { calculateStats, calculateStreaks } from "@/lib/stats"
import { getAvatarUrl } from "@/lib/constants"
import { useUserRuns } from "@/lib/hooks"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: runs = [], isLoading } = useUserRuns(user?.id)
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Miles</span>
                  <span className="text-sm font-medium">{stats.totalMiles.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Miles Left</span>
                  <span className="text-sm font-medium">{stats.milesLeft.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Days Left</span>
                  <span className="text-sm font-medium">{stats.daysLeft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Required Miles/Day</span>
                  <span className="text-sm font-medium">{stats.requiredMilesPerDay.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your running statistics and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRuns}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Longest Run</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{longestRun.toFixed(1)} mi</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Run</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRun.toFixed(1)} mi</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{streaks.currentStreak} days</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{streaks.longestStreak} days</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pace Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.paceStatus === 0 && "Behind"}
                    {stats.paceStatus === 1 && "On Track"}
                    {stats.paceStatus === 2 && "Ahead"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Track your milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {achievement.title}
                    </CardTitle>
                    {achievement.earned ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-300"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

