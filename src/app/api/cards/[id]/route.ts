import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';
import { CardSchemaService } from '@/lib/services/CardSchemaService';

/**
 * PUT /api/cards/:id
 * Atualiza um card existente com validação de schema
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const cardId = idParam;
    const body = await req.json();
    const { title, summary, fields, status, position, size } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Buscar card atual para obter o type_key
    const { data: currentCard, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (fetchError || !currentCard) {
      return NextResponse.json({ 
        error: 'Card not found',
        details: fetchError?.message 
      }, { status: 404 });
    }

    // Preparar updates
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (title !== undefined) updates.title = title;
    if (summary !== undefined) updates.summary = summary;
    if (status !== undefined) {
      if (!['DRAFT', 'READY'].includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be DRAFT or READY' 
        }, { status: 400 });
      }
      updates.status = status;
    }
    
    // Suportar updates de posição e tamanho
    if (position !== undefined) {
      updates.x = position.x;
      updates.y = position.y;
    }
    if (size !== undefined) {
      updates.w = size.width;
      updates.h = size.height;
    }

    // Validar fields se fornecidos
    if (fields !== undefined) {
      const mergedFields = CardSchemaService.mergeWithDefaults(
        currentCard.type_key,
        { ...currentCard.fields, ...fields }
      );
      
      const validation = CardSchemaService.validateFields(
        currentCard.type_key,
        mergedFields
      );

      if (!validation.valid) {
        return NextResponse.json({ 
          error: 'Invalid card fields',
          details: validation.errors 
        }, { status: 400 });
      }

      updates.fields = mergedFields;
    }

    // Atualizar card
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();

    if (updateError) {
      console.error('[API] Update card error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update card',
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ card: updatedCard }, { status: 200 });
  } catch (e) {
    console.error('[API] Cards PUT error:', e);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/cards/:id
 * Remove um card
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const cardId = idParam;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('[API] Delete card error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete card',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error('[API] Cards DELETE error:', e);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
