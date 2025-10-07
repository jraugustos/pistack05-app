import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';
import { CardSchemaService } from '@/lib/services/CardSchemaService';

/**
 * POST /api/cards
 * Cria um novo card com validação de schema
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      project_id, 
      stage_key, 
      type_key, 
      title, 
      summary = '', 
      fields = {}, 
      x = 80, 
      y = 80, 
      w = 360, 
      h = 240 
    } = body;

    // Validações básicas
    if (!project_id || !stage_key || !type_key || !title) {
      return NextResponse.json({ 
        error: 'Missing required fields: project_id, stage_key, type_key, title' 
      }, { status: 400 });
    }

    // Merge com defaults e valida schema
    const mergedFields = CardSchemaService.mergeWithDefaults(type_key, fields);
    const validation = CardSchemaService.validateFields(type_key, mergedFields);
    
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid card fields', 
        details: validation.errors 
      }, { status: 400 });
    }

    // Insere no Supabase
    const supabase = await createClerkSupabaseClientSsr();
    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        project_id,
        stage_key,
        type_key,
        title,
        summary,
        fields: mergedFields,
        status: 'DRAFT',
        x,
        y,
        w,
        h,
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Create card error:', error);
      return NextResponse.json({ 
        error: 'Failed to create card',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ card }, { status: 201 });
  } catch (e) {
    console.error('[API] Cards POST error:', e);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
