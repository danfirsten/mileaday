"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Run } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

export default function LogRunPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [distance, setDistance] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!distance) return
    
    setIsSubmitting(true)
    console.log("=== LOGGING NEW RUN ===")

    try {
      // Get the user_id from the auth context
      const userId = user?.id || "00000000-0000-0000-0000-000000000001";
      console.log("User ID:", userId);
      
      // Validate UUID format for user_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error("Invalid user ID format:", userId);
        throw new Error("Invalid user ID format. Please log in again.");
      }
      
      // Create run via API
      console.log("Creating run with data:", {
        date: date.toISOString(),
        distance: Number.parseFloat(distance),
        note: note || null,
        user_id: userId,
      });
      
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          distance: Number.parseFloat(distance),
          note: note || null,
          user_id: userId,
        }),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error(errorData.error || 'Failed to log run');
      }
      
      const newRun = await response.json();
      console.log("Successfully created run:", newRun);

      toast({
        title: "Run logged successfully",
        description: `You logged ${distance} miles on ${format(date, "PPP")}`,
      })

      // Redirect to the history page to see the updated run history
      router.push("/dashboard/history")
    } catch (error) {
      console.error('Error logging run:', error);
      toast({
        variant: "destructive",
        title: "Failed to log run",
        description: error instanceof Error ? error.message : "There was a problem logging your run. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
      console.log("=== END LOGGING NEW RUN ===");
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Log a Run</h2>
      </div>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Run</CardTitle>
          <CardDescription>Log your running distance for the 365-mile challenge</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter distance in miles"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any notes about your run"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging..." : "Log Run"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

