export type Run = {
  id: string
  date: string
  distance: number
  note?: string
}

export type User = {
  id: string
  name: string
  email: string
  image?: string
  totalMiles: number
  monthlyMiles: number
  paceStatus: number
  streak: number
}

