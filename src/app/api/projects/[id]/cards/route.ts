import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

/**
 * GET /api/projects/:id/cards
 * Retorna todos os cards de um projeto
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    const { data: cards, error } = await supabase
      .from('cards')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API] Fetch cards error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch cards',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ cards: cards || [] }, { status: 200 });
  } catch (e) {
    console.error('[API] Project cards GET error:', e);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
