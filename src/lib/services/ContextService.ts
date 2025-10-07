import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';

/**
 * ContextService
 * Agrega contexto de cards READY para geração de IA
 */

export interface ProjectContext {
  projectId: string;
  projectName: string;
  ideaBase?: {
    name: string;
    pitch?: string;
    problem?: string;
    solution?: string;
    targetAudience?: string;
    valueProposition?: string;
  };
  readyCards: Array<{
    id: string;
    stageKey: string;
    typeKey: string;
    title: string;
    summary: string;
    fields: Record<string, any>;
  }>;
}

export class ContextService {
  /**
   * Busca e agrega contexto completo de um projeto
   */
  static async getProjectContext(projectId: string): Promise<ProjectContext> {
    const supabase = await createClerkSupabaseClientSsr();

    // Buscar projeto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Buscar todos os cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('project_id', projectId);

    if (cardsError) {
      throw new Error('Failed to fetch cards');
    }

    // Separar Ideia Base
    const ideaBaseCard = cards?.find(c => c.type_key === 'idea.base');
    
    // Filtrar cards READY
    const readyCards = cards?.filter(c => c.status === 'READY' && c.type_key !== 'idea.base') || [];

    return {
      projectId: project.id,
      projectName: project.name,
      ideaBase: ideaBaseCard?.fields,
      readyCards: readyCards.map(c => ({
        id: c.id,
        stageKey: c.stage_key,
        typeKey: c.type_key,
        title: c.title,
        summary: c.summary || '',
        fields: c.fields || {},
      })),
    };
  }

  /**
   * Monta um prompt formatado com o contexto do projeto
   */
  static formatContextForPrompt(context: ProjectContext): string {
    let prompt = `# Contexto do Projeto: ${context.projectName}\n\n`;

    if (context.ideaBase) {
      prompt += `## Ideia Base\n`;
      if (context.ideaBase.name) prompt += `**Nome:** ${context.ideaBase.name}\n`;
      if (context.ideaBase.pitch) prompt += `**Pitch:** ${context.ideaBase.pitch}\n`;
      if (context.ideaBase.problem) prompt += `**Problema:** ${context.ideaBase.problem}\n`;
      if (context.ideaBase.solution) prompt += `**Solução:** ${context.ideaBase.solution}\n`;
      if (context.ideaBase.targetAudience) prompt += `**Público-alvo:** ${context.ideaBase.targetAudience}\n`;
      if (context.ideaBase.valueProposition) prompt += `**Proposta de Valor:** ${context.ideaBase.valueProposition}\n`;
      prompt += `\n`;
    }

    if (context.readyCards.length > 0) {
      prompt += `## Cards Confirmados (READY)\n\n`;
      for (const card of context.readyCards) {
        prompt += `### ${card.title} (${card.typeKey})\n`;
        if (card.summary) prompt += `${card.summary}\n`;
        prompt += `\n`;
      }
    }

    return prompt;
  }

  /**
   * Busca contexto específico de um card
   */
  static async getCardContext(cardId: string): Promise<{
    card: any;
    projectContext: ProjectContext;
  }> {
    const supabase = await createClerkSupabaseClientSsr();

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      throw new Error('Card not found');
    }

    const projectContext = await this.getProjectContext(card.project_id);

    return { card, projectContext };
  }
}

