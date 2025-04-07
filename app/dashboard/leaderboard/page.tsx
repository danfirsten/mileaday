"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { getAvatarUrl } from "@/lib/constants"

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"total" | "monthly" | "streak">("total")
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      console.log("=== FETCHING USERS FOR LEADERBOARD ===");
      setIsLoading(true);
      
      try {
        // Fetch users with calculated stats from the leaderboard API
        console.log("Fetching users for leaderboard");
        const response = await fetch('/api/users/leaderboard');
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from API:", errorData);
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        
        const data = await response.json();
        console.log(`Successfully fetched ${data.length} users with stats`);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Failed to load leaderboard",
          description: error instanceof Error ? error.message : "There was a problem loading the leaderboard. Please try again.",
        });
      } finally {
        setIsLoading(false);
        console.log("=== END FETCHING USERS FOR LEADERBOARD ===");
      }
    };

    fetchUsers();
  }, [toast]);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === "total") {
      return b.totalMiles - a.totalMiles
    } else if (sortBy === "monthly") {
      return b.monthlyMiles - a.monthlyMiles
    } else {
      return b.streak - a.streak
    }
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
      </div>
      <Tabs defaultValue="total" className="space-y-4" onValueChange={(value) => setSortBy(value as any)}>
        <TabsList>
          <TabsTrigger value="total">Total Miles</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Miles</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
        </TabsList>
        <TabsContent value="total" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Miles Leaderboard</CardTitle>
              <CardDescription>See who's leading the 365-mile challenge</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading leaderboard data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(user.image || 'default')} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Status</span>
                              <span className="text-sm">
                                {(user.paceStatus ?? 0) >= 0 ? "Ahead of pace" : "Behind pace"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Badge>Leader</Badge>}
                          <span className="font-bold">{user.totalMiles?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No users found. Be the first to join the challenge!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Miles Leaderboard</CardTitle>
              <CardDescription>Who's putting in the most miles this month</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading leaderboard data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(user.image || 'default')} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Status</span>
                              <span className="text-sm">
                                {(user.monthlyMiles ?? 0) > 30 ? "Crushing it!" : "Steady progress"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Badge>Monthly Leader</Badge>}
                          <span className="font-bold">{user.monthlyMiles?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No users found. Be the first to join the challenge!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="streak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consistency Leaderboard</CardTitle>
              <CardDescription>Who has the longest active running streak</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading leaderboard data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(user.image || 'default')} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Status</span>
                              <span className="text-sm">
                                {(user.streak ?? 0) > 5 ? "Consistent runner" : "Building momentum"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Badge>Most Consistent</Badge>}
                          <span className="font-bold">{user.streak || 0} days</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No users found. Be the first to join the challenge!
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

