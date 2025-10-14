import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { AgentRegistry } from '@/lib/services/AgentRegistry';
import { ContextService } from '@/lib/services/ContextService';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';
import type { IdeaEnricherFields } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/agent/enrich-idea
 * Enriquece automaticamente uma ideia base usando o agent builder
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();
    
    // Temporariamente permitir sem autenticação para desenvolvimento
    // TODO: Restaurar verificação de autenticação em produção
    if (!userId) {
      console.log('[Agent Enrichment] No userId - allowing for development');
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, ideaBaseCardId } = body || {};

    if (!projectId || !ideaBaseCardId) {
      return NextResponse.json({ 
        error: 'Missing required fields: projectId, ideaBaseCardId' 
      }, { status: 400 });
    }

    // Buscar contexto da ideia base
    const projectContext = await ContextService.getProjectContext(projectId);
    
    if (!projectContext.ideaBase?.pitch) {
      return NextResponse.json({ 
        error: 'Idea base must have a pitch/description to be enriched' 
      }, { status: 400 });
    }

    // Criar thread exclusiva para o enriquecimento
    const thread = await openai.beta.threads.create({
      metadata: {
        projectId,
        ideaBaseCardId,
        purpose: 'idea-enrichment',
      }
    });

    console.log('[Enrichment] Thread created:', thread.id);

    if (!thread || !thread.id) {
      console.error('[Enrichment] Thread creation failed:', thread);
      return NextResponse.json({
        error: 'Failed to create thread'
      }, { status: 500 });
    }

    // Configurar o agente - usar orquestrador se não houver agente enricher específico
    const enricherAgent = AgentRegistry.enricher;
    const assistantId = enricherAgent.id.includes('.local') 
      ? AgentRegistry.orchestrator.id 
      : enricherAgent.id;
    
    // Se ainda não temos um ID válido, retornar erro
    if (assistantId.includes('.local')) {
      return NextResponse.json({ 
        error: 'OpenAI Assistant ID not configured. Please set AGENT_ORCHESTRATOR_ID or AGENT_ENRICHER_ID environment variable.' 
      }, { status: 400 });
    }
    
    // Montar prompt estruturado para enriquecimento (JSON puro, sem tools)
    const enrichmentPrompt = `Você é um especialista em análise de ideias de produtos e serviços. Analise a seguinte ideia base e estruture as informações de forma detalhada e objetiva.

**Ideia Base:**
"${projectContext.ideaBase.pitch}"

Retorne APENAS um objeto JSON válido com as seguintes chaves (sem markdown, sem explicações adicionais):

{
  "whatWeWantToCreate": "Descrição clara e detalhada do produto/serviço que queremos construir",
  "problemSolved": "Problema ou dor específica que a solução resolve, de forma clara",
  "proposedSolution": "Como a solução funciona e resolve o problema identificado",
  "constraintsAssumptions": "Limitações técnicas, de negócio ou premissas que estamos assumindo"
}

Seja específico, detalhado e objetivo. Cada campo deve ter pelo menos 2-3 frases. Retorne apenas o JSON válido, sem código markdown nem explicações extras.`;

    // Adicionar mensagem do usuário à thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: enrichmentPrompt,
    });

    // Criar run com o agente (sem tools - esperamos JSON puro)
    console.log('[Enrichment] Creating run with thread:', thread.id, 'assistant:', assistantId);
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: `You are an idea enrichment specialist. Analyze the provided idea base and return a structured JSON with enriched information. Do not use any tools or function calls. Return ONLY valid JSON without markdown code blocks.`,
    });

    console.log('[Enrichment] Run created:', run.id);
    console.log('[Enrichment] Thread ID before retrieve:', thread.id);

    // Polling do status do run (nova API: runId primeiro, depois threadId)
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    let attempts = 0;
    const maxAttempts = 90; // 90s timeout (LLMs podem demorar)

    while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && runStatus.status !== 'cancelled' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      attempts++;

      console.log(`[Enrichment] Polling attempt ${attempts}/${maxAttempts}, status: ${runStatus.status}`);
    }

    // Verificar se o run falhou ou timeout
    if (runStatus.status === 'failed') {
      console.error('[Enrichment] Agent run failed:', runStatus.last_error);
      return NextResponse.json({
        error: `Agent run failed: ${runStatus.last_error?.message || 'Unknown error'}`
      }, { status: 500 });
    }

    if (runStatus.status === 'cancelled') {
      return NextResponse.json({
        error: 'Agent run was cancelled'
      }, { status: 500 });
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({
        error: 'Enrichment timeout - agent took too long to respond (>90s)'
      }, { status: 500 });
    }

    // Buscar mensagens do assistente para extrair JSON
    const messages = await openai.beta.threads.messages.list(thread.id, {
      order: 'desc',
      limit: 5,
    });

    const assistantMessages = messages.data
      .filter(m => m.role === 'assistant' && m.run_id === run.id)
      .map(m => ({
        content: m.content
          .filter((c): c is OpenAI.Beta.Threads.Messages.TextContentBlock => c.type === 'text')
          .map(c => c.text.value)
          .join('\n'),
      }));

    if (assistantMessages.length === 0) {
      return NextResponse.json({
        error: 'No response from agent'
      }, { status: 500 });
    }

    // Extrair JSON da resposta do assistente
    let enrichedFields: IdeaEnricherFields;
    const response = assistantMessages[0].content;
    console.log('[Enrichment] Agent response:', response);

    try {
      // Tentar remover markdown code blocks se houver
      let jsonString = response.trim();

      // Remover ```json e ``` se existir
      jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

      // Parse JSON
      const parsedJson = JSON.parse(jsonString) as Partial<IdeaEnricherFields>;

      // Validar campos obrigatórios
      const requiredFields: (keyof IdeaEnricherFields)[] = ['whatWeWantToCreate', 'problemSolved', 'proposedSolution'];
      const missingFields = requiredFields.filter(field => !parsedJson[field] || parsedJson[field]!.trim().length === 0);

      if (missingFields.length > 0) {
        console.error('[Enrichment] Missing required fields:', missingFields);
        return NextResponse.json({
          error: `Agent response is missing required fields: ${missingFields.join(', ')}`
        }, { status: 500 });
      }

      enrichedFields = parsedJson as IdeaEnricherFields;
      console.log('[Enrichment] Successfully parsed enriched fields');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Enrichment] Failed to parse JSON:', error);
      return NextResponse.json({
        error: `Failed to parse agent response as JSON: ${errorMessage}`
      }, { status: 500 });
    }

    // Calcular posição do novo card (cascade ou próximo ao IdeaBase)
    const supabase = await createClerkSupabaseClientSsr();

    // Buscar IdeaBase card para calcular posição
    const { data: ideaBaseCard } = await supabase
      .from('cards')
      .select('*')
      .eq('id', ideaBaseCardId)
      .single();

    const position = ideaBaseCard
      ? { x: ideaBaseCard.x + 500, y: ideaBaseCard.y + 50 } // À direita e abaixo do IdeaBase
      : { x: 580, y: 130 }; // Fallback

    // Criar card IdeaEnricher já com campos preenchidos
    const { data: newCard, error: createError } = await supabase
      .from('cards')
      .insert({
        project_id: projectId,
        stage_key: 'entendimento',
        type_key: 'idea.enricher',
        title: 'Enriquecimento da Ideia',
        summary: enrichedFields.whatWeWantToCreate?.slice(0, 150) || '',
        fields: enrichedFields,
        status: 'DRAFT',
        x: position.x,
        y: position.y,
        w: 400,
        h: 600,
      })
      .select()
      .single();

    if (createError || !newCard) {
      console.error('[Enrichment] Failed to create card:', createError);
      return NextResponse.json({
        error: `Failed to create enricher card: ${createError?.message || 'Unknown error'}`
      }, { status: 500 });
    }

    const cardId = newCard.id;
    console.log('[Enrichment] Created card:', cardId);

    // Criar edge IdeaBase → IdeaEnricher
    const { error: edgeError } = await supabase
      .from('edges')
      .insert({
        project_id: projectId,
        source_card_id: ideaBaseCardId,
        target_card_id: cardId,
        label: 'enriquece',
      });

    if (edgeError) {
      console.warn('[Enrichment] Failed to create edge (non-critical):', edgeError);
      // Não falhar a request por causa da edge
    } else {
      console.log('[Enrichment] Created edge:', ideaBaseCardId, '->', cardId);
    }

    console.log(`[Enrichment] Completed in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      cardId,
      fields: enrichedFields,
      threadId: thread.id,
      duration: Date.now() - startTime,
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during enrichment';
    console.error('[Agent Enrichment] Error:', error);
    return NextResponse.json({
      error: errorMessage
    }, { status: 500 });
  }
}
