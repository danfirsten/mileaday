import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// POST handler to like a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== POST /api/posts/[id]/like ===");
  try {
    console.log("Like API called with params:", params);
    
    // Ensure params is properly awaited
    const postId = params.id;
    console.log("Post ID to like:", postId);

    // Validate UUID format for postId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      console.error("Invalid post ID format:", postId);
      return NextResponse.json(
        { error: "Invalid post ID format" },
        { status: 400 }
      );
    }

    // Check if the post exists
    console.log("Checking if post exists...");
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.error("Error fetching post:", fetchError);
      
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch post: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!post) {
      console.error("Post not found:", postId);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Update the likes count
    console.log("Updating likes count...");
    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .update({ likes: (post.likes || 0) + 1 })
      .eq("id", postId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating post likes:", updateError);
      return NextResponse.json(
        { error: `Failed to update post likes: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log("Successfully liked post:", updatedPost);
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Unexpected error in like API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 