import { NextRequest, NextResponse } from 'next/server';
import { AIGenerationService, AIMode } from '@/lib/services/AIGenerationService';

/**
 * POST /api/cards/:id/generate
 * Gera conteúdo de IA para um card
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    const body = await req.json();
    const { mode = 'generate', prompt } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    if (!['generate', 'expand', 'review'].includes(mode)) {
      return NextResponse.json({ 
        error: 'Invalid mode. Must be: generate, expand, or review' 
      }, { status: 400 });
    }

    // Gerar conteúdo usando AIGenerationService
    const result = await AIGenerationService.generate({
      cardId,
      mode: mode as AIMode,
      prompt,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error('[API] AI Generate error:', e);
    return NextResponse.json({ 
      error: 'Failed to generate AI content',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
