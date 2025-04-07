import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST handler to upload user avatar
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== POST /api/users/[id]/avatar ===");
  
  try {
    // Await params.id to fix the Next.js warning
    const userId = await Promise.resolve(params.id);
    console.log("Uploading avatar for user:", userId);
    
    // Get the form data from the request
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;
    
    if (!avatarFile) {
      return NextResponse.json(
        { error: "No avatar file provided" },
        { status: 400 }
      );
    }
    
    // Convert the file to a buffer
    const buffer = await avatarFile.arrayBuffer();
    
    // Generate a unique filename
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Check if the avatars bucket exists, if not create it
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return NextResponse.json(
        { error: `Failed to list buckets: ${bucketsError.message}` },
        { status: 500 }
      );
    }
    
    const avatarsBucketExists = buckets.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log("Creating avatars bucket");
      // Instead of creating the bucket programmatically, we'll use the existing one
      // or instruct the user to create it manually in the Supabase dashboard
      console.log("Please create an 'avatars' bucket in your Supabase dashboard");
      return NextResponse.json(
        { error: "Storage bucket 'avatars' not found. Please create it in your Supabase dashboard." },
        { status: 500 }
      );
    }
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      });
    
    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload avatar: ${uploadError.message}` },
        { status: 500 }
      );
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Update the user's avatar URL in the database
    const { data, error } = await supabase
      .from('users')
      .update({ image: publicUrl })
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error("Error updating user avatar URL:", error);
      return NextResponse.json(
        { error: `Failed to update user avatar URL: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Return the updated user data
    return NextResponse.json({
      avatar_url: publicUrl,
      user: data[0],
    });
  } catch (error) {
    console.error("Error in avatar API:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 