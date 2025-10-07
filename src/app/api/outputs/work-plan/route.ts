import { NextRequest, NextResponse } from 'next/server';
import { OutputService } from '@/lib/services/OutputService';

/**
 * POST /api/outputs/work-plan?project_id=xxx
 * Gera o Work Plan para um projeto
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ 
        error: 'Missing project_id query parameter' 
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { regenerate = false } = body;

    // Gerar Work Plan usando OutputService
    const output = await OutputService.generate({
      projectId,
      type: 'work-plan',
      regenerate,
    });

    return NextResponse.json({ output }, { status: 200 });
  } catch (e) {
    console.error('[API] Work Plan generation error:', e);
    return NextResponse.json({ 
      error: 'Failed to generate work plan',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/outputs/work-plan?project_id=xxx
 * Busca Work Plans existentes de um projeto
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ 
        error: 'Missing project_id query parameter' 
      }, { status: 400 });
    }

    const outputs = await OutputService.getByProject(projectId, 'work-plan');

    return NextResponse.json({ outputs }, { status: 200 });
  } catch (e) {
    console.error('[API] Fetch work plan error:', e);
    return NextResponse.json({ 
      error: 'Failed to fetch work plan',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
