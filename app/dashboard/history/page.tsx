"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Run } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

export default function RunHistoryPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [filteredRuns, setFilteredRuns] = useState<Run[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Run | null
    direction: "ascending" | "descending"
  }>({
    key: "date",
    direction: "descending",
  })
  const [isLoading, setIsLoading] = useState(true)

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRun, setEditingRun] = useState<Run | null>(null)
  const [editDate, setEditDate] = useState<Date | undefined>(undefined)
  const [editDistance, setEditDistance] = useState("")
  const [editNote, setEditNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Add new run dialog state
  const [isNewRunDialogOpen, setIsNewRunDialogOpen] = useState(false)
  const [newRunDate, setNewRunDate] = useState<Date | undefined>(new Date())
  const [newRunDistance, setNewRunDistance] = useState("")
  const [newRunNote, setNewRunNote] = useState("")
  const [isCreatingRun, setIsCreatingRun] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch runs from API
  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setIsLoading(true)
        
        // Get the user_id from the auth context
        const userId = user?.id || "00000000-0000-0000-0000-000000000001";
        
        // Validate UUID format for user_id
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          throw new Error("Invalid user ID format. Please log in again.");
        }
        
        // Fetch runs from API
        const response = await fetch(`/api/runs?user_id=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch runs');
        }
        
        const runsData = await response.json();
        
        // Sort runs by date
        const sortedRuns = [...runsData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setRuns(sortedRuns);
        setFilteredRuns(sortedRuns);
      } catch (error) {
        console.error('Error fetching runs:', error);
        toast({
          variant: "destructive",
          title: "Error loading runs",
          description: error instanceof Error ? error.message : "There was a problem loading your run history. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRuns();
  }, [toast, user]);

  useEffect(() => {
    // Filter runs based on search query
    const filtered = runs.filter(
      (run) =>
        run.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        format(new Date(run.date), "PPP").toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort filtered runs
    const sorted = [...filtered].sort((a, b) => {
      if (!sortConfig.key) return 0

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (sortConfig.key === "date") {
        return sortConfig.direction === "ascending"
          ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
          : new Date(bValue as string).getTime() - new Date(aValue as string).getTime()
      }

      if (sortConfig.key === "distance") {
        return sortConfig.direction === "ascending"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }

      return 0
    })

    setFilteredRuns(sorted)
  }, [runs, searchQuery, sortConfig])

  const handleSort = (key: keyof Run) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending",
    })
  }

  const openEditDialog = (run: Run) => {
    setEditingRun(run)
    setEditDate(new Date(run.date))
    setEditDistance(run.distance.toString())
    setEditNote(run.note || "")
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingRun || !editDate) return
    
    setIsSubmitting(true)
    
    try {
      // Validate UUID format for runId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(editingRun.id)) {
        throw new Error("Invalid run ID format.");
      }
      
      // Update run via API
      const response = await fetch(`/api/runs/${editingRun.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: editDate.toISOString(),
          distance: Number.parseFloat(editDistance),
          note: editNote,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update run');
      }
      
      const updatedRun = await response.json();
      
      // Update local state
      const updatedRuns = runs.map((run) => (run.id === updatedRun.id ? updatedRun : run));
      setRuns(updatedRuns);
      
      toast({
        title: "Run updated",
        description: `Your run on ${format(editDate, "PPP")} has been updated.`,
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating run:', error);
      toast({
        variant: "destructive",
        title: "Failed to update run",
        description: error instanceof Error ? error.message : "There was a problem updating your run. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const openDeleteDialog = (runId: string) => {
    setDeletingRunId(runId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingRunId) return
    
    setIsDeleting(true);
    
    try {
      // Validate UUID format for runId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(deletingRunId)) {
        throw new Error("Invalid run ID format.");
      }
      
      // Delete run via API
      const response = await fetch(`/api/runs/${deletingRunId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete run');
      }
      
      // Update local state
      const updatedRuns = runs.filter((run) => run.id !== deletingRunId);
      setRuns(updatedRuns);
      
      toast({
        title: "Run deleted",
        description: "Your run has been deleted from your history.",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingRunId(null);
    } catch (error) {
      console.error('Error deleting run:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete run",
        description: error instanceof Error ? error.message : "There was a problem deleting your run. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCreateRun = async () => {
    if (!newRunDate || !newRunDistance) return
    
    setIsCreatingRun(true)
    
    try {
      // Get the user_id from the auth context
      const userId = user?.id || "00000000-0000-0000-0000-000000000001";
      
      // Validate UUID format for user_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error("Invalid user ID format. Please log in again.");
      }
      
      // Create run via API
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: newRunDate.toISOString(),
          distance: Number.parseFloat(newRunDistance),
          note: newRunNote || null,
          user_id: userId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create run');
      }
      
      const newRun = await response.json();
      
      // Update local state
      setRuns((prev) => [newRun, ...prev]);
      
      toast({
        title: "Run added",
        description: `Your run on ${format(newRunDate, "PPP")} has been added to your history.`,
      });
      
      // Reset form
      setNewRunDate(new Date());
      setNewRunDistance("");
      setNewRunNote("");
      setIsNewRunDialogOpen(false);
    } catch (error) {
      console.error('Error creating run:', error);
      toast({
        variant: "destructive",
        title: "Failed to add run",
        description: error instanceof Error ? error.message : "There was a problem adding your run. Please try again.",
      });
    } finally {
      setIsCreatingRun(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Run History</h2>
        <Button onClick={() => setIsNewRunDialogOpen(true)}>
          Add New Run
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Runs</CardTitle>
          <CardDescription>View and manage your complete running history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search runs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 h-auto font-medium"
                      onClick={() => handleSort("distance")}
                    >
                      Distance
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading runs...
                    </TableCell>
                  </TableRow>
                ) : filteredRuns.length > 0 ? (
                  filteredRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{format(new Date(run.date), "PPP")}</TableCell>
                      <TableCell>{run.distance.toFixed(2)} miles</TableCell>
                      <TableCell className="hidden md:table-cell">{run.note || "No notes"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(run)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(run.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No runs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Run Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Run</DialogTitle>
            <DialogDescription>Make changes to your run details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !editDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={editDate} onSelect={setEditDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-distance">Distance (miles)</Label>
              <Input
                id="edit-distance"
                type="number"
                step="0.01"
                min="0"
                value={editDistance}
                onChange={(e) => setEditDistance(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-note">Note (optional)</Label>
              <Textarea
                id="edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Add any notes about your run"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Run Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this run from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Run Dialog */}
      <Dialog open={isNewRunDialogOpen} onOpenChange={setIsNewRunDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Run</DialogTitle>
            <DialogDescription>Record a new run in your history.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-run-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="new-run-date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newRunDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newRunDate ? format(newRunDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={newRunDate} onSelect={setNewRunDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-run-distance">Distance (miles)</Label>
              <Input
                id="new-run-distance"
                type="number"
                step="0.01"
                min="0"
                value={newRunDistance}
                onChange={(e) => setNewRunDistance(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-run-note">Note (optional)</Label>
              <Textarea
                id="new-run-note"
                value={newRunNote}
                onChange={(e) => setNewRunNote(e.target.value)}
                placeholder="Add any notes about your run"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRunDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRun} disabled={isCreatingRun || !newRunDate || !newRunDistance}>
              {isCreatingRun ? "Adding..." : "Add Run"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
