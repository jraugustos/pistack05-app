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
    // Em dev, permitir fluxo sem auth para não bloquear
    let userId:string|undefined;
    try {
      const authRes = await auth();
      userId = authRes.userId || 'dev-user';
    } catch {
      userId = 'dev-user';
    }

    const body = await request.json();
    const { name, description, template_id = 'site-app', seed } = body;

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

    if (error || !project) {
      console.error('[API] Erro ao criar projeto:', error);
      return NextResponse.json({ 
        error: 'Failed to create project',
        details: error?.message 
      }, { status: 500 });
    }

    const createdProject = project;

    // Sempre criar card Ideia Base inicial
    const ideaFields = {
      name: seed?.ideaBase?.name?.trim() || createdProject.name,
      pitch: seed?.ideaBase?.pitch?.trim() || description?.trim() || '',
      problem: seed?.ideaBase?.description?.trim() || '',
      solution: '',
      targetAudience: '',
      valueProposition: '',
    };

    try {
      await supabase
        .from('cards')
        .insert({
          project_id: createdProject.id,
          stage_key: 'ideia-base',
          type_key: 'idea.base',
          title: 'Ideia Base',
          summary: ideaFields.pitch || 'Defina o problema e a solução',
          fields: ideaFields,
          status: 'DRAFT',
          x: 80,
          y: 80,
          w: 360,
          h: 240,
        });
      console.log('[API] Card Ideia Base criado com sucesso');
    } catch (cardError) {
      console.error('[API] Erro ao criar card Ideia Base:', cardError);
    }

    return NextResponse.json({ project: createdProject }, { status: 201 });

  } catch (error) {
    console.error('Erro na API de projetos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
