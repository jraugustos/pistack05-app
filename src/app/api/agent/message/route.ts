/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { AgentRegistry } from '@/lib/services/AgentRegistry';
import { AgentTools, AGENT_TOOL_DEFINITIONS } from '@/lib/services/AgentTools';
import { TelemetryService } from '@/lib/services/TelemetryService';
import { ContextService } from '@/lib/services/ContextService';
import { mapSupabaseCardToCard } from '@/lib/utils/mappers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ToolResult {
  tool: string;
  result: any;
}

/**
 * Cria um run usando Workflows API (Agent Builder)
 * Para contexto global - usa orchestrator workflow
 *
 * NOTE: A Workflows API da OpenAI ainda está em preview e pode não estar disponível.
 * Por enquanto, vamos usar uma abordagem híbrida: tentar Workflows, se falhar, usar Assistants.
 */
async function createWorkflowRun(params: {
  threadId: string;
  workflowId: string;
  message: string;
  instructions: string;
  projectId: string;
  contextType: string;
}) {
  const { threadId, workflowId, message, instructions, projectId, contextType } = params;

  // 1. Adicionar mensagem do usuário à thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });

  // 2. Criar run do assistant (Agent Builder via Assistants API)
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: workflowId,
    additional_instructions: instructions,
  });

  return run;
}

/**
 * Polling de workflow run até completar
 *
 * NOTE: Por enquanto usa a mesma lógica de Assistants, pois o Agent Builder
 * ainda funciona via Assistants API até que Workflows API esteja completa.
 */
async function pollWorkflowRun(params: {
  workflowId: string;
  runId: string;
  threadId: string;
  maxAttempts?: number;
  onToolCalls?: (toolCalls: any[]) => Promise<any[]>;
}) {
  const { workflowId, runId, threadId, maxAttempts = 30, onToolCalls } = params;

  let attempts = 0;
  let runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });

  while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
    attempts++;

    // Se requer tool calls
    if (runStatus.status === 'requires_action' && runStatus.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;

      if (onToolCalls) {
        const toolOutputs = await onToolCalls(toolCalls);

        // Submeter tool outputs
        await openai.beta.threads.runs.submitToolOutputs(runId, {
          thread_id: threadId,
          tool_outputs: toolOutputs,
        });
      }
    }
  }

  if (runStatus.status === 'failed') {
    throw new Error('Workflow run failed');
  }

  if (attempts >= maxAttempts) {
    throw new Error('Workflow run timeout');
  }

  return runStatus;
}

/**
 * Cria um run usando Assistants API
 * Para contexto de card específico - usa assistant individual
 */
async function createAssistantRun(params: {
  threadId: string;
  assistantId: string;
  message?: string;
  instructions: string;
  tools?: any[];
  metadata?: Record<string, any>;
}) {
  const { threadId, assistantId, message, instructions, tools, metadata } = params;

  // 1. Adicionar mensagem do usuário à thread (se fornecida)
  if (message) {
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  }

  // 2. Criar run do assistant
  const runParams: any = {
    assistant_id: assistantId,
    instructions,
  };

  if (tools && tools.length > 0) {
    runParams.tools = tools;
  }

  if (metadata) {
    runParams.metadata = metadata;
  }

  return await openai.beta.threads.runs.create(threadId, runParams);
}

/**
 * Polling de assistant run até completar
 */
async function pollAssistantRun(params: {
  threadId: string;
  runId: string;
  maxAttempts?: number;
  onToolCalls?: (toolCalls: any[]) => Promise<any[]>;
}) {
  const { threadId, runId, maxAttempts = 30, onToolCalls } = params;

  let attempts = 0;
  let runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
  console.log(`[Poll] Initial status: ${runStatus.status}`);

  while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
    attempts++;
    console.log(`[Poll] Attempt ${attempts}/${maxAttempts} - Status: ${runStatus.status}`);

    // Processar tool calls
    if (runStatus.status === 'requires_action' && runStatus.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
      console.log(`[Poll] Tool calls required:`, toolCalls.map(tc => ({
        id: tc.id,
        function: tc.function.name,
        args: tc.function.arguments,
      })));

      if (onToolCalls) {
        const toolOutputs = await onToolCalls(toolCalls);
        console.log(`[Poll] Submitting ${toolOutputs.length} tool outputs...`);

        // Submeter tool outputs
        await openai.beta.threads.runs.submitToolOutputs(runId, {
          thread_id: threadId,
          tool_outputs: toolOutputs,
        });
        console.log(`[Poll] Tool outputs submitted successfully`);
      }
    }
  }

  if (runStatus.status === 'failed') {
    throw new Error('Assistant run failed');
  }

  if (attempts >= maxAttempts) {
    throw new Error('Assistant run timeout');
  }

  return runStatus;
}

/**
 * POST /api/agent/message
 * Processa mensagem do usuário usando OpenAI Agent Builder com tool calls
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();
    if (!userId) {
      console.error('[Agent API] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, message, threadId, cardId, typeKey, mentionedCardIds = [] } = body || {};

    console.log('[Agent API] Request received:', {
      projectId,
      messageLength: message?.length,
      threadId,
      cardId,
      typeKey,
      mentionedCount: mentionedCardIds?.length,
    });

    if (!projectId || !message || !threadId) {
      console.error('[Agent API] Missing required fields:', {
        hasProjectId: !!projectId,
        hasMessage: !!message,
        hasThreadId: !!threadId,
      });
      return NextResponse.json({
        error: 'Missing required fields: projectId, message, threadId'
      }, { status: 400 });
    }

    // Buscar contexto do projeto
    const projectContext = await ContextService.getProjectContext(projectId);

    // Determinar tipo de contexto e buscar dados do card se necessário
    let contextType: 'global' | 'card' = 'global';
    let cardData: any = null;
    let instructions = '';

    if (cardId && typeKey) {
      // Contexto de card específico
      contextType = 'card';
      console.log(`[Agent Context] Card context detected - cardId: ${cardId}, typeKey: ${typeKey}`);
      try {
        const cardContext = await ContextService.getCardContext(cardId);
        cardData = cardContext.card;
        console.log(`[Agent Context] Card loaded:`, {
          id: cardData.id,
          title: cardData.title,
          status: cardData.status,
          hasFields: !!cardData.fields,
          fieldCount: cardData.fields ? Object.keys(cardData.fields).length : 0,
        });

        // Verificar se o card está vazio (DRAFT sem campos preenchidos)
        const isEmpty = cardData.status === 'DRAFT' && (
          !cardData.fields ||
          Object.keys(cardData.fields).length === 0 ||
          Object.values(cardData.fields).every((v: any) =>
            v === '' || v === null || v === undefined ||
            (Array.isArray(v) && v.length === 0) ||
            (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
          )
        );

        if (isEmpty) {
          // Card vazio: incluir contexto completo do projeto para preenchimento
          console.log('[Agent] Card is empty, building full context for new card');
          const fullContext = await ContextService.buildFullContextForNewCard({
            projectId,
            targetTypeKey: typeKey,
            mentionedCardIds,
          });

          instructions = `Você é um assistente especializado em "${cardData.title}" (${typeKey}).

**Tarefa:** Preencher este card vazio com informações relevantes baseadas no contexto completo do projeto.

**Contexto Completo do Projeto:**
${fullContext}

**Instruções Específicas:**
1. Use o tool "update_card_fields" para preencher TODOS os campos do card
2. Base suas respostas no contexto fornecido acima
3. Se informações específicas não existirem, use inferências inteligentes baseadas na Ideia Base
4. Mantenha consistência com outros cards existentes
5. Seja específico e detalhado

**Card a preencher:**
- ID: ${cardData.id}
- Título: ${cardData.title}
- Tipo: ${typeKey}
- Status: ${cardData.status}
`;
        } else {
          // Card já tem conteúdo: usar contexto padrão
          instructions = ContextService.buildAgentInstructions({
            projectName: projectContext.projectName,
            contextType: 'card',
            cardTitle: cardData.title,
            cardTypeKey: cardData.type_key,
            cardFields: cardData.fields || {},
          });
        }
      } catch (error) {
        console.warn('[Agent] Failed to fetch card context, falling back to global:', error);
        contextType = 'global';
      }
    }

    if (contextType === 'global') {
      // Contexto global do projeto
      instructions = ContextService.buildAgentInstructions({
        projectName: projectContext.projectName,
        contextType: 'global',
      });

      // Adicionar instrução sobre criação de cards derivados
      instructions += `\n\n**IMPORTANTE - Criação de Cards Derivados:**
Quando criar novos cards derivados (Público-Alvo, Escopo, Interface, Tech Stack), você DEVE:
1. Usar o tool create_card para criar o card
2. Imediatamente após, usar update_card_fields para preencher os campos do card com conteúdo baseado em TODO o contexto do projeto
3. Considerar a Ideia Base e TODOS os outros cards existentes (DRAFT ou READY)
4. Fazer conexões inteligentes entre os cards
5. Adaptar o conteúdo baseado no que já existe, sem assumir ordem de criação
6. Se um card relevante não existe, usar a Ideia Base para inferir informações razoáveis

**Cards disponíveis para derivar:**
- idea.target-audience (Público-Alvo): Define personas e audiência
- scope.features (Escopo): Define funcionalidades principais
- design.interface (Interface): Define design, UI/UX, componentes
- tech.stack (Tech Stack): Define tecnologias, arquitetura

Você tem acesso ao contexto completo do projeto nos cards existentes listados acima.`;
    }

    // Adicionar contexto dos cards mencionados (se houver)
    if (mentionedCardIds && mentionedCardIds.length > 0) {
      const mentionedContext = await ContextService.formatMentionedCardsContext(mentionedCardIds);
      if (mentionedContext) {
        instructions += mentionedContext;
        console.log(`[Agent] Added context for ${mentionedCardIds.length} mentioned card(s)`);
      }
    }

    // Adicionar mensagem do usuário à thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Log de contexto para debugging
    console.log(`[Agent] Context: ${contextType}, Project: ${projectContext.projectName}${cardData ? `, Card: ${cardData.title}` : ''}`);

    // ==========================================
    // LÓGICA SEPARADA: Workflows vs Assistants
    // ==========================================

    const toolResults: ToolResult[] = [];
    let runStatus: any;
    let runId: string;

    // Handler de tool calls compartilhado
    const handleToolCalls = async (toolCalls: any[]) => {
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        const toolStartTime = Date.now();
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        try {
          console.log(`[Agent] Executing tool: ${functionName}`, functionArgs);

          // Executar tool
          let result: any;
          if (functionName in AgentTools) {
            result = await (AgentTools as any)[functionName](functionArgs);
          } else {
            throw new Error(`Unknown tool: ${functionName}`);
          }

          // Capturar resultado para sincronizar frontend
          toolResults.push({
            tool: functionName,
            result,
          });

          // Telemetria de sucesso
          TelemetryService.agentToolCall({
            projectId,
            userId,
            toolName: functionName,
            success: true,
            duration: Date.now() - toolStartTime,
          });

          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result),
          });
        } catch (error: any) {
          console.error(`[Agent] Tool error (${functionName}):`, error);

          // Telemetria de erro
          TelemetryService.agentToolCall({
            projectId,
            userId,
            toolName: functionName,
            success: false,
            duration: Date.now() - toolStartTime,
            error: error.message,
          });

          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify({ error: error.message }),
          });
        }
      }

      return toolOutputs;
    };

    if (contextType === 'global') {
      // ===================================
      // CONTEXTO GLOBAL: Usar Workflows API
      // ===================================
      console.log('[Agent] Using Workflows API (Agent Builder)');

      const orchestrator = AgentRegistry.orchestrator;

      try {
        // Criar workflow run
        const workflowRun = await createWorkflowRun({
          threadId,
          workflowId: orchestrator.id,
          message,
          instructions,
          projectId,
          contextType,
        });

        runId = workflowRun.id;

        // Polling com tool calls
        runStatus = await pollWorkflowRun({
          workflowId: orchestrator.id,
          runId,
          threadId,
          maxAttempts: 30,
          onToolCalls: handleToolCalls,
        });

      } catch (error: any) {
        console.error('[Agent] Workflow error:', error);
        TelemetryService.agentError({
          projectId,
          userId,
          error: error.message,
          context: { contextType: 'global', workflowId: orchestrator.id },
        });
        return NextResponse.json({
          error: `Workflow error: ${error.message}`
        }, { status: 500 });
      }

    } else {
      // ====================================
      // CONTEXTO DE CARD: Usar Assistants API
      // ====================================
      console.log('[Agent] Using Assistants API (individual assistant)');

      // Selecionar assistant específico baseado no typeKey
      const domainAgent = AgentRegistry.selectDomainAgentByTypeKey(typeKey);
      console.log(`[Agent Selection] TypeKey: ${typeKey} → Domain Agent:`, domainAgent ? {
        name: domainAgent.name,
        id: domainAgent.id,
        kind: domainAgent.kind,
      } : 'NOT FOUND');

      if (!domainAgent) {
        console.warn(`[Agent] No domain agent found for typeKey: ${typeKey}, using orchestrator`);
        const orchestrator = AgentRegistry.orchestrator;

        const run = await createAssistantRun({
          threadId,
          assistantId: orchestrator.id,
          message,
          instructions,
          // Usar tools do orchestrator configuradas no assistant
          metadata: {
            contextType,
            cardId,
            projectId,
          },
        });

        runId = run.id;

        try {
          runStatus = await pollAssistantRun({
            threadId,
            runId,
            maxAttempts: 30,
            onToolCalls: handleToolCalls,
          });
        } catch (error: any) {
          console.error('[Agent] Assistant error:', error);
          TelemetryService.agentError({
            projectId,
            userId,
            error: error.message,
            context: { contextType: 'card', assistantId: orchestrator.id },
          });
          return NextResponse.json({
            error: `Assistant error: ${error.message}`
          }, { status: 500 });
        }

      } else {
        // Usar domain agent específico
        console.log(`[Agent] Using domain agent: ${domainAgent.name} (${domainAgent.id})`);
        console.log(`[Agent] Instructions preview: ${instructions.substring(0, 200)}...`);

        const run = await createAssistantRun({
          threadId,
          assistantId: domainAgent.id,
          message,
          instructions,
          // Não passar tools aqui - usar as tools já configuradas no assistant
          metadata: {
            contextType,
            cardId,
            projectId,
            typeKey,
          },
        });

        runId = run.id;
        console.log(`[Agent] Run created: ${runId}`);

        try {
          console.log(`[Agent Polling] Starting polling for run ${runId}...`);
          runStatus = await pollAssistantRun({
            threadId,
            runId,
            maxAttempts: 30,
            onToolCalls: handleToolCalls,
          });
          console.log(`[Agent Polling] Completed with status: ${runStatus.status}`);
        } catch (error: any) {
          console.error('[Agent] Assistant error:', error);
          console.error('[Agent] Error details:', {
            assistantId: domainAgent.id,
            typeKey,
            cardId,
            runId,
            threadId,
          });
          TelemetryService.agentError({
            projectId,
            userId,
            error: error.message,
            context: { contextType: 'card', assistantId: domainAgent.id, typeKey },
          });
          return NextResponse.json({
            error: `Assistant error: ${error.message}`
          }, { status: 500 });
        }
      }
    }

    // Buscar mensagens do assistente
    const messages = await openai.beta.threads.messages.list(threadId, {
      order: 'desc',
      limit: 5,
    });

    const assistantMessages = messages.data
      .filter(m => m.role === 'assistant' && m.run_id === runId)
      .map(m => ({
        role: 'assistant' as const,
        content: m.content
          .filter((c): c is OpenAI.Beta.Threads.Messages.TextContentBlock => c.type === 'text')
          .map(c => c.text.value)
          .join('\n'),
      }));

    // Telemetria de mensagem com contexto
    const latency = Date.now() - startTime;
    TelemetryService.agentMessage({
      projectId,
      userId,
      message,
      latency,
      tokensUsed: runStatus.usage?.total_tokens,
    });

    // Log adicional para telemetria de contexto
    console.log(`[Agent] Message completed: ${latency}ms, Context: ${contextType}, Tokens: ${runStatus.usage?.total_tokens || 0}`);

    return NextResponse.json({
      messages: assistantMessages,
      toolResults,
      contextType, // Retornar tipo de contexto usado
      cardId: cardId || null,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Agent Message] Error:', error);
    console.error('[Agent Message] Stack:', error?.stack);

    return NextResponse.json({
      error: error?.message || 'Internal server error'
    }, { status: 500 });
  }
}



