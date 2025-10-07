import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/projects/[id]/graph
 * Carrega o layout salvo do canvas
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = await createClerkSupabaseClientSsr();

    const { data: project, error } = await supabase
      .from('projects')
      .select('graph')
      .eq('id', id)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ graph: project.graph || null });
  } catch (error) {
    console.error('[API] Error loading graph:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]/graph
 * Salva o layout do canvas
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { graph } = body;

    if (!graph || typeof graph !== 'object') {
      return NextResponse.json(
        { error: 'Invalid graph data' },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClientSsr();

    const { error } = await supabase
      .from('projects')
      .update({ graph })
      .eq('id', id);

    if (error) {
      console.error('[API] Error saving graph:', error);
      return NextResponse.json(
        { error: 'Failed to save graph', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error in PUT graph:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

