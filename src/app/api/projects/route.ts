import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

/**
 * GET /api/projects
 * Lista projetos do usuário com paginação, busca e ordenação
 */
export async function GET(request: NextRequest) {
  try {
    // Temporariamente retornar dados mock para testar
    return NextResponse.json({
      projects: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      }
    });

  } catch (error) {
    console.error('Erro na API de projetos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Cria um novo projeto
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, template_id = 'site-app' } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        template_id,
        owner_id: userId,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar projeto:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });

  } catch (error) {
    console.error('Erro na API de projetos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
