import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

/**
 * GET /api/projects/[id]
 * Busca um projeto específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClerkSupabaseClientSsr();

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Erro ao buscar projeto:', error);
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Erro na API de projeto:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]
 * Atualiza um projeto
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, status } = body;

    const supabase = await createClerkSupabaseClientSsr();

    // Verificar se o projeto existe e pertence ao usuário
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar projeto:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Erro na API de projeto:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]
 * Deleta um projeto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClerkSupabaseClientSsr();

    // Verificar se o projeto existe e pertence ao usuário
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) {
      console.error('Erro ao deletar projeto:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API de projeto:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
