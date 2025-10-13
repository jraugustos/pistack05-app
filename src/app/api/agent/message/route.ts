import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { AgentRegistry } from '@/lib/services/AgentRegistry';
import { AgentTools, AGENT_TOOL_DEFINITIONS } from '@/lib/services/AgentTools';
import { TelemetryService } from '@/lib/services/TelemetryService';
import { mapSupabaseCardToCard } from '@/lib/utils/mappers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ToolResult {
  tool: string;
  result: any;
}

/**
 * POST /api/agent/message
 * Processa mensagem do usuário usando OpenAI Agent Builder com tool calls
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, message, threadId, cardId, typeKey } = body || {};

    if (!projectId || !message || !threadId) {
      return NextResponse.json({ 
        error: 'Missing required fields: projectId, message, threadId' 
      }, { status: 400 });
    }

    // Adicionar mensagem do usuário à thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Criar run com orchestrator agent
    const orchestrator = AgentRegistry.orchestrator;
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: orchestrator.id,
      tools: AGENT_TOOL_DEFINITIONS,
      instructions: `You are assisting with project ${projectId}. ${cardId ? `Current card: ${cardId} (${typeKey})` : ''}`,
    });

    // Polling do status do run
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    const toolResults: ToolResult[] = [];
    let attempts = 0;
    const maxAttempts = 30; // 30s timeout

    while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      attempts++;

      // Processar tool calls
      if (runStatus.status === 'requires_action' && runStatus.required_action?.type === 'submit_tool_outputs') {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
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

        // Submeter tool outputs
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs,
        });
      }
    }

    // Verificar se o run falhou ou timeout
    if (runStatus.status === 'failed') {
      TelemetryService.agentError({
        projectId,
        userId,
        error: 'Run failed',
        context: { runId: run.id, status: runStatus.status },
      });
      return NextResponse.json({ 
        error: 'Agent run failed' 
      }, { status: 500 });
    }

    if (attempts >= maxAttempts) {
      TelemetryService.agentError({
        projectId,
        userId,
        error: 'Run timeout',
        context: { runId: run.id, attempts },
      });
      return NextResponse.json({ 
        error: 'Agent run timeout' 
      }, { status: 500 });
    }

    // Buscar mensagens do assistente
    const messages = await openai.beta.threads.messages.list(threadId, {
      order: 'desc',
      limit: 5,
    });

    const assistantMessages = messages.data
      .filter(m => m.role === 'assistant' && m.run_id === run.id)
      .map(m => ({
        role: 'assistant' as const,
        content: m.content
          .filter((c): c is OpenAI.Beta.Threads.Messages.TextContentBlock => c.type === 'text')
          .map(c => c.text.value)
          .join('\n'),
      }));

    // Telemetria de mensagem
    const latency = Date.now() - startTime;
    TelemetryService.agentMessage({
      projectId,
      userId,
      message,
      latency,
      tokensUsed: runStatus.usage?.total_tokens,
    });

    return NextResponse.json({
      messages: assistantMessages,
      toolResults,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Agent Message] Error:', error);
    
    const body = await req.json().catch(() => ({}));
    if (body.projectId && body.userId) {
      TelemetryService.agentError({
        projectId: body.projectId,
        userId: body.userId,
        error: error?.message || 'Unknown error',
      });
    }

    return NextResponse.json({ 
      error: error?.message || 'Internal server error' 
    }, { status: 500 });
  }
}



