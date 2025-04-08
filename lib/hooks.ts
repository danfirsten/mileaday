import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Run, User } from "./types"

// Fetch user runs
export function useUserRuns(userId: string | undefined) {
  return useQuery({
    queryKey: ["runs", userId],
    queryFn: async () => {
      if (!userId) return []
      const response = await fetch(`/api/runs?user_id=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch runs")
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
  })
}

// Fetch user profile
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null
      const response = await fetch(`/api/users/${userId}/settings`)
      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
  })
}

// Fetch leaderboard data
export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/users/leaderboard")
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard")
      }
      return response.json()
    },
    staleTime: 300000, // 5 minutes
  })
}

// Add run mutation
export function useAddRun() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newRun: Partial<Run>) => {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRun),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add run")
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch runs for this user
      queryClient.invalidateQueries({ queryKey: ["runs", variables.user_id] })
      // Invalidate leaderboard as totals have changed
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update profile")
      }
      
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] })
    },
  })
} 