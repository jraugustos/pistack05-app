import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';
import { mapSupabaseEdges } from '@/lib/utils/mappers';

/**
 * GET /api/edges?project_id=xxx
 * Lista todas as edges de um projeto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    const { data: edges, error } = await supabase
      .from('edges')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API] Error loading edges:', error);
      return NextResponse.json(
        { error: 'Failed to load edges', details: error.message },
        { status: 500 }
      );
    }

    const mappedEdges = edges ? mapSupabaseEdges(edges) : [];

    return NextResponse.json({ edges: mappedEdges }, { status: 200 });
  } catch (error) {
    console.error('[API] Edges GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/edges
 * Cria uma nova edge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, source_card_id, target_card_id, label } = body;

    if (!project_id || !source_card_id || !target_card_id) {
      return NextResponse.json(
        { error: 'project_id, source_card_id and target_card_id are required' },
        { status: 400 }
      );
    }

    // Validar que source e target são diferentes
    if (source_card_id === target_card_id) {
      return NextResponse.json(
        { error: 'source_card_id and target_card_id must be different' },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Verificar se edge já existe
    const { data: existing } = await supabase
      .from('edges')
      .select('id')
      .eq('project_id', project_id)
      .eq('source_card_id', source_card_id)
      .eq('target_card_id', target_card_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Edge already exists' },
        { status: 409 }
      );
    }

    const { data: edge, error } = await supabase
      .from('edges')
      .insert({
        project_id,
        source_card_id,
        target_card_id,
        label: label || null,
      })
      .select()
      .single();

    if (error || !edge) {
      console.error('[API] Error creating edge:', error);
      return NextResponse.json(
        { error: 'Failed to create edge', details: error?.message },
        { status: 500 }
      );
    }

    const mappedEdge = mapSupabaseEdges([edge])[0];

    return NextResponse.json({ edge: mappedEdge }, { status: 201 });
  } catch (error) {
    console.error('[API] Edges POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

