import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

interface RouteParams {
  params: { id: string };
}

/**
 * DELETE /api/edges/[id]
 * Remove uma edge
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Edge ID is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API] Delete edge error:', error);
      return NextResponse.json(
        { error: 'Failed to delete edge', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API] Edges DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

