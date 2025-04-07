import type { Run, User } from "./types"

// Generate some mock run data
export const mockRuns: Run[] = [
  {
    id: "1",
    date: "2023-01-05T12:00:00Z",
    distance: 3.2,
    note: "Morning run in the park",
  },
  {
    id: "2",
    date: "2023-01-08T12:00:00Z",
    distance: 2.5,
    note: "Evening jog",
  },
  {
    id: "3",
    date: "2023-01-10T12:00:00Z",
    distance: 5.0,
    note: "Weekend long run",
  },
  {
    id: "4",
    date: "2023-01-15T12:00:00Z",
    distance: 3.7,
  },
  {
    id: "5",
    date: "2023-01-18T12:00:00Z",
    distance: 2.8,
    note: "Rainy day run",
  },
  {
    id: "6",
    date: "2023-01-22T12:00:00Z",
    distance: 4.2,
  },
  {
    id: "7",
    date: "2023-01-25T12:00:00Z",
    distance: 3.5,
    note: "Felt good today",
  },
  {
    id: "8",
    date: "2023-01-28T12:00:00Z",
    distance: 6.1,
    note: "New personal best",
  },
  {
    id: "9",
    date: "2023-02-02T12:00:00Z",
    distance: 3.3,
  },
  {
    id: "10",
    date: "2023-02-05T12:00:00Z",
    distance: 4.0,
    note: "Trail run",
  },
  {
    id: "11",
    date: "2023-02-10T12:00:00Z",
    distance: 3.8,
  },
  {
    id: "12",
    date: "2023-02-15T12:00:00Z",
    distance: 5.5,
    note: "Hilly route",
  },
]

// Generate mock user data for leaderboard
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    image: "/placeholder.svg?height=40&width=40",
    totalMiles: 45.6,
    monthlyMiles: 15.2,
    paceStatus: 5.6,
    streak: 3,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    image: "/placeholder.svg?height=40&width=40",
    totalMiles: 52.3,
    monthlyMiles: 18.7,
    paceStatus: 12.3,
    streak: 7,
  },
  {
    id: "3",
    name: "John Doe",
    email: "john@example.com",
    image: "/placeholder.svg?height=40&width=40",
    totalMiles: 38.9,
    monthlyMiles: 12.5,
    paceStatus: -1.1,
    streak: 2,
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    image: "/placeholder.svg?height=40&width=40",
    totalMiles: 67.2,
    monthlyMiles: 22.1,
    paceStatus: 27.2,
    streak: 5,
  },
  {
    id: "5",
    name: "Mike Wilson",
    email: "mike@example.com",
    image: "/placeholder.svg?height=40&width=40",
    totalMiles: 41.5,
    monthlyMiles: 14.3,
    paceStatus: 1.5,
    streak: 4,
  },
]

