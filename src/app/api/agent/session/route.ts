import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/agent/session
 * Cria ou recupera uma thread do OpenAI ChatKit para um projeto
 * Body: { projectId }
 * Response: { threadId }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Temporariamente permitir sem autenticação para desenvolvimento
    // TODO: Restaurar verificação de autenticação em produção
    if (!userId) {
      console.log('[Agent Session] No userId - allowing for development');
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Buscar projeto e verificar se já tem threadId
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('agent_thread_id')
      .eq('id', projectId)
      .single();

    if (fetchError) {
      console.error('[Agent Session] Error fetching project:', fetchError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Se já existe threadId, retornar
    if (project.agent_thread_id) {
      return NextResponse.json({ 
        threadId: project.agent_thread_id,
        existing: true 
      }, { status: 200 });
    }

    // Criar nova thread no OpenAI
    const thread = await openai.beta.threads.create({
      metadata: {
        projectId,
        userId,
      }
    });

    // Salvar threadId no projeto
    const { error: updateError } = await supabase
      .from('projects')
      .update({ agent_thread_id: thread.id })
      .eq('id', projectId);

    if (updateError) {
      console.error('[Agent Session] Error saving threadId:', updateError);
      // Continuar mesmo com erro - thread já foi criada
    }

    return NextResponse.json({ 
      threadId: thread.id,
      existing: false 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Agent Session] Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to create session' 
    }, { status: 500 });
  }
}

