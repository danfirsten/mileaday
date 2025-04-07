"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getAvatarUrl } from "@/lib/constants"

type Post = {
  id: string
  user_id: string
  content: string
  date: string
  likes: number
}

type User = {
  id: string
  name: string
  email: string
  image: string
  total_miles: number
  monthly_miles: number
  pace_status: number
  streak: number
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newPost, setNewPost] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch posts and users from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch posts
        const postsResponse = await fetch('/api/posts')
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts')
        }
        const postsData = await postsResponse.json()
        
        // Fetch users
        const usersResponse = await fetch('/api/users')
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users')
        }
        const usersData = await usersResponse.json()
        
        setPosts(postsData)
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "There was a problem loading the community data. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    console.log("=== POST SUBMISSION DEBUGGING ===");
    console.log("New post content:", newPost);
    console.log("Current user:", user);
    
    setIsSubmitting(true)

    try {
      // Ensure we have a valid UUID for user_id
      const userId = user?.id || "00000000-0000-0000-0000-000000000001";
      console.log("User ID for post:", userId);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error("❌ Invalid user ID format:", userId);
        throw new Error("Invalid user ID format. Please log in again.");
      }
      console.log("✅ User ID format is valid");
      
      // Send post to API
      console.log("🔄 Sending post to API...");
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPost,
          user_id: userId,
        }),
      })
      
      console.log("📡 API Response received");
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response from post API:", errorData);
        throw new Error(errorData.error || 'Failed to create post');
      }
      
      const newPostObj = await response.json()
      console.log("✅ Successfully created post:", newPostObj);
      
      // Update local state
      console.log("🔄 Updating local state with new post");
      setPosts((prev) => {
        const updatedPosts = [newPostObj, ...prev];
        console.log("Updated posts count:", updatedPosts.length);
        return updatedPosts;
      });
      setNewPost("")

      toast({
        title: "Post created",
        description: "Your post has been published to the community.",
      })
      console.log("✅ Post submission completed successfully");
    } catch (error) {
      console.error('❌ Error in handleSubmitPost function:', error);
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "There was a problem publishing your post. Please try again.",
      })
    } finally {
      setIsSubmitting(false);
      console.log("=== END POST SUBMISSION DEBUGGING ===");
    }
  }

  const getUserById = (userId: string) => {
    return (
      users.find((u) => u.id === userId) || {
        id: userId,
        name: "Unknown User",
        email: "",
        image: "/placeholder.svg?height=40&width=40",
        total_miles: 0,
        monthly_miles: 0,
        pace_status: 0,
        streak: 0,
      }
    )
  }

  const handleLike = async (postId: string) => {
    try {
      console.log("Attempting to like post:", postId);
      
      // Validate UUID format for postId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(postId)) {
        console.error("Invalid post ID format:", postId);
        throw new Error("Invalid post ID format.");
      }
      
      // Send like to API
      console.log("Sending like request to API...");
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      
      console.log("Like API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from like API:", errorData);
        throw new Error(errorData.error || 'Failed to like post');
      }
      
      const updatedPost = await response.json();
      console.log("Successfully liked post:", updatedPost);
      
      // Update local state
      setPosts((prev) => prev.map((post) => 
        post.id === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        variant: "destructive",
        title: "Failed to like post",
        description: error instanceof Error ? error.message : "There was a problem liking the post. Please try again.",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Community</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="space-y-4 md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Progress</CardTitle>
              <CardDescription>Post updates, achievements, or motivate others in the challenge</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitPost}>
              <CardContent>
                <Textarea
                  id="post-content"
                  name="post-content"
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !newPost.trim()}>
                  {isSubmitting ? "Posting..." : "Post Update"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">No posts yet. Be the first to share!</div>
            ) : (
              posts.map((post) => {
                const postUser = getUserById(post.user_id)
                return (
                  <Card key={post.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={getAvatarUrl(postUser.image || 'default')} alt={postUser.name} />
                          <AvatarFallback>{postUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{postUser.name}</CardTitle>
                          <CardDescription>
                            {new Date(post.date).toLocaleDateString()} at {new Date(post.date).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                        ❤️ {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        💬 Comment
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>People currently in the challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-4">No active users found.</div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(user.image || 'default')} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.total_miles.toFixed(1)} miles</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

