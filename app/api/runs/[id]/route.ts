import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET handler to fetch a single run
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== GET /api/runs/[id] ===");
  try {
    const runId = params.id;
    console.log("Run ID:", runId);
    
    // Validate UUID format for runId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(runId)) {
      console.error("Invalid run ID format:", runId);
      return NextResponse.json(
        { error: 'Invalid run ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }
    
    console.log("Fetching run from Supabase...");
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single();
    
    if (error) {
      console.error('Error fetching run:', error);
      
      if (error.code === 'PGRST116') {
        console.error("Run not found:", runId);
        return NextResponse.json(
          { error: 'Run not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch run: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Successfully fetched run:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in run API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler to update a run
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== PUT /api/runs/[id] ===");
  try {
    const runId = params.id;
    console.log("Run ID:", runId);
    
    const body = await request.json();
    console.log("Request body:", body);
    
    // Validate UUID format for runId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(runId)) {
      console.error("Invalid run ID format:", runId);
      return NextResponse.json(
        { error: 'Invalid run ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }
    
    // Validate the request body
    if (!body.date || !body.distance) {
      console.error("Missing required fields:", { 
        date: !!body.date, 
        distance: !!body.distance 
      });
      return NextResponse.json(
        { error: 'Date and distance are required' },
        { status: 400 }
      );
    }
    
    // Check if run exists
    console.log("Checking if run exists...");
    const { data: existingRun, error: fetchError } = await supabase
      .from('runs')
      .select('id')
      .eq('id', runId)
      .single();
    
    if (fetchError || !existingRun) {
      console.error("Run not found:", fetchError);
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }
    
    // Update the run
    const updatedRun = {
      date: body.date,
      distance: body.distance,
      note: body.note || null,
    };
    
    console.log("Updating run:", updatedRun);
    
    const { data, error } = await supabase
      .from('runs')
      .update(updatedRun)
      .eq('id', runId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating run:', error);
      
      if (error.code === 'PGRST116') {
        console.error("Run not found:", runId);
        return NextResponse.json(
          { error: 'Run not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to update run: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Successfully updated run:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in run API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a run
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== DELETE /api/runs/[id] ===");
  try {
    const runId = params.id;
    console.log("Run ID:", runId);
    
    // Validate UUID format for runId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(runId)) {
      console.error("Invalid run ID format:", runId);
      return NextResponse.json(
        { error: 'Invalid run ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }
    
    // Check if run exists
    console.log("Checking if run exists...");
    const { data: existingRun, error: fetchError } = await supabase
      .from('runs')
      .select('id')
      .eq('id', runId)
      .single();
    
    if (fetchError || !existingRun) {
      console.error("Run not found:", fetchError);
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }
    
    console.log("Deleting run...");
    const { error } = await supabase
      .from('runs')
      .delete()
      .eq('id', runId);
    
    if (error) {
      console.error('Error deleting run:', error);
      
      if (error.code === 'PGRST116') {
        console.error("Run not found:", runId);
        return NextResponse.json(
          { error: 'Run not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to delete run: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Successfully deleted run:", runId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in run API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 