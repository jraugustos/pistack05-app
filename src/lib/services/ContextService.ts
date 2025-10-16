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
  readyCards: Array<{ // Nome mantido por compatibilidade, mas agora inclui DRAFT + READY
    id: string;
    stageKey: string;
    typeKey: string;
    title: string;
    summary: string;
    fields: Record<string, any>;
    status: string; // DRAFT ou READY
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

    // Filtrar cards READY e DRAFT (incluir todos os cards, não só READY)
    const readyCards = cards?.filter(c => c.type_key !== 'idea.base') || [];

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
        status: c.status, // Incluir status para diferenciar DRAFT vs READY
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
      prompt += `## Cards do Projeto\n\n`;
      for (const card of context.readyCards) {
        prompt += `### ${card.title} (${card.typeKey}) - ${card.status}\n`;
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

  /**
   * Formata contexto de card específico para o prompt
   */
  static formatCardContextForPrompt(card: any, projectContext: ProjectContext): string {
    let prompt = `# Contexto: Card "${card.title}"\n\n`;

    prompt += `**Tipo:** ${card.type_key}\n`;
    prompt += `**Stage:** ${card.stage_key}\n`;
    prompt += `**Status:** ${card.status}\n\n`;

    if (card.summary) {
      prompt += `**Resumo:**\n${card.summary}\n\n`;
    }

    if (card.fields && Object.keys(card.fields).length > 0) {
      prompt += `**Campos Atuais:**\n`;
      for (const [key, value] of Object.entries(card.fields)) {
        if (value && typeof value === 'string' && value.trim().length > 0) {
          prompt += `- **${key}:** ${value}\n`;
        }
      }
      prompt += `\n`;
    }

    // Adicionar contexto do projeto
    prompt += `---\n\n`;
    prompt += `## Contexto do Projeto: ${projectContext.projectName}\n\n`;

    if (projectContext.ideaBase) {
      prompt += `**Ideia Base:**\n`;
      if (projectContext.ideaBase.pitch) {
        prompt += `${projectContext.ideaBase.pitch}\n\n`;
      }
    }

    return prompt;
  }

  /**
   * Gera instructions dinâmicas para o agent baseadas no contexto
   */
  static buildAgentInstructions(params: {
    projectName: string;
    contextType: 'global' | 'card';
    cardTitle?: string;
    cardTypeKey?: string;
    cardFields?: Record<string, any>;
  }): string {
    const { projectName, contextType, cardTitle, cardTypeKey, cardFields } = params;

    if (contextType === 'global') {
      return `You are the Project Orchestrator for "${projectName}".

The user wants to discuss the project as a whole and make decisions about the overall direction.

Your capabilities:
- Create new cards for different stages (idea, understanding, scope, design, tech, plan)
- Update existing card fields
- Guide the user through the workflow
- Provide strategic advice about the project

Context: You have access to the project's idea base and all READY cards.

Be proactive, ask clarifying questions, and help the user make progress on their project.`;
    } else {
      // Card-specific context
      const fieldsList = cardFields
        ? Object.keys(cardFields).map(k => `- ${k}`).join('\n')
        : 'No fields defined yet';

      return `You are focusing on the card "${cardTitle}" (${cardTypeKey}) in project "${projectName}".

The user wants to work specifically on this card. Your job is to help them:
- Fill in missing fields
- Expand or improve existing content
- Validate the card is ready to be confirmed
- Answer questions about this specific card

**Available fields for this card:**
${fieldsList}

**Current context:** Card-specific assistance mode. Focus your responses and actions on this card only.

Be helpful, concise, and focused. When the user asks to update content, use the update_card_fields tool with the specific field names.`;
    }
  }

  /**
   * Constrói contexto completo para criação de novo card derivado
   * Busca TODOS os cards (DRAFT + READY) e trabalha com qualquer subset disponível
   */
  static async buildFullContextForNewCard(params: {
    projectId: string;
    targetTypeKey: string;
    mentionedCardIds?: string[];
  }): Promise<string> {
    const { projectId, targetTypeKey, mentionedCardIds = [] } = params;

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

    // Buscar TODOS os cards (DRAFT + READY)
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('project_id', projectId);

    if (cardsError) {
      throw new Error('Failed to fetch cards');
    }

    // Separar Ideia Base e outros cards
    const ideaBaseCard = cards?.find(c => c.type_key === 'idea.base');
    const otherCards = cards?.filter(c => c.type_key !== 'idea.base') || [];

    // Construir contexto
    let context = `# Contexto Completo do Projeto: ${project.name}\n\n`;
    context += `**Criando card do tipo:** ${targetTypeKey}\n\n`;

    // Ideia Base (sempre relevante)
    if (ideaBaseCard?.fields) {
      context += `## Ideia Base (Origem do Projeto)\n\n`;
      if (ideaBaseCard.fields.name) context += `**Nome:** ${ideaBaseCard.fields.name}\n`;
      if (ideaBaseCard.fields.pitch) context += `**Pitch:** ${ideaBaseCard.fields.pitch}\n`;
      if (ideaBaseCard.fields.problem) context += `**Problema:** ${ideaBaseCard.fields.problem}\n`;
      if (ideaBaseCard.fields.solution) context += `**Solução:** ${ideaBaseCard.fields.solution}\n`;
      if (ideaBaseCard.fields.targetAudience) context += `**Público-alvo:** ${ideaBaseCard.fields.targetAudience}\n`;
      if (ideaBaseCard.fields.valueProposition) context += `**Proposta de Valor:** ${ideaBaseCard.fields.valueProposition}\n`;
      context += `\n`;
    } else {
      context += `## Ideia Base\n\n⚠️ Ideia Base não encontrada ou vazia. Trabalhe com o contexto disponível.\n\n`;
    }

    // Outros cards existentes (qualquer status)
    if (otherCards.length > 0) {
      context += `## Cards Existentes no Projeto\n\n`;
      context += `Você tem acesso a ${otherCards.length} card(s) já criado(s). Use-os como referência:\n\n`;

      for (const card of otherCards) {
        context += `### ${card.title} (${card.type_key})\n`;
        context += `- **Status:** ${card.status}\n`;
        context += `- **Stage:** ${card.stage_key}\n`;

        if (card.summary) {
          context += `- **Resumo:** ${card.summary}\n`;
        }

        if (card.fields && Object.keys(card.fields).length > 0) {
          context += `- **Conteúdo:**\n`;
          for (const [key, value] of Object.entries(card.fields)) {
            if (value && typeof value === 'string' && value.trim().length > 0) {
              const shortValue = value.length > 150 ? value.slice(0, 150) + '...' : value;
              context += `  - **${key}:** ${shortValue}\n`;
            } else if (Array.isArray(value) && value.length > 0) {
              context += `  - **${key}:** [${value.length} items]\n`;
            } else if (typeof value === 'object' && value !== null) {
              context += `  - **${key}:** [object with ${Object.keys(value).length} keys]\n`;
            }
          }
        }

        context += '\n';
      }
    } else {
      context += `## Cards Existentes\n\n⚠️ Nenhum outro card criado ainda. Este será um dos primeiros cards derivados!\n\n`;
    }

    // Adicionar contexto de cards mencionados (se houver)
    if (mentionedCardIds.length > 0) {
      const mentionedContext = await this.formatMentionedCardsContext(mentionedCardIds);
      if (mentionedContext) {
        context += mentionedContext;
      }
    }

    // Adicionar dicas flexíveis baseadas no que existe
    const hints = this.buildFlexibleHints(targetTypeKey, otherCards);
    context += hints;

    return context;
  }

  /**
   * Gera dicas adaptativas baseadas nos cards existentes
   */
  private static buildFlexibleHints(
    targetTypeKey: string,
    existingCards: any[]
  ): string {
    let hints = `\n---\n\n## Diretrizes de Trabalho\n\n`;

    // Verificar quais tipos de cards existem
    const hasTargetAudience = existingCards.some(c => c.type_key === 'idea.target-audience');
    const hasScope = existingCards.some(c => c.type_key === 'scope.features');
    const hasInterface = existingCards.some(c => c.type_key === 'design.interface');
    const hasTech = existingCards.some(c => c.type_key === 'tech.stack');

    hints += `**Contexto Disponível:**\n`;
    hints += hasTargetAudience ? `✅ Público-alvo definido\n` : `⚠️ Público-alvo ainda não definido\n`;
    hints += hasScope ? `✅ Escopo de funcionalidades definido\n` : `⚠️ Escopo ainda não definido\n`;
    hints += hasInterface ? `✅ Interface/Design definido\n` : `⚠️ Interface ainda não definida\n`;
    hints += hasTech ? `✅ Tech Stack definida\n` : `⚠️ Tech Stack ainda não definida\n`;

    hints += `\n**Importante:**\n`;
    hints += `- Trabalhe com o contexto que está disponível acima\n`;
    hints += `- Se algum card relevante não existe, faça suposições razoáveis baseadas na Ideia Base\n`;
    hints += `- Não bloqueie ou falhe por falta de informação - seja criativo e adaptativo\n`;
    hints += `- Cards podem ser criados em qualquer ordem - o sistema é não-linear\n`;

    // Dicas específicas por tipo de card sendo criado
    hints += `\n**Para o card ${targetTypeKey}:**\n`;

    switch (targetTypeKey) {
      case 'idea.target-audience':
        hints += `- Defina personas detalhadas baseadas no problema e solução da Ideia Base\n`;
        hints += hasScope ? `- Considere as funcionalidades já definidas no Escopo\n` : `- Crie personas mesmo sem escopo definido ainda\n`;
        hints += `- Pense em demografias, comportamentos, dores e objetivos\n`;
        break;

      case 'scope.features':
        hints += `- Liste funcionalidades principais que resolvem o problema da Ideia Base\n`;
        hints += hasTargetAudience ? `- Alinhe features com as necessidades do público-alvo\n` : `- Derive features da proposta de valor mesmo sem personas definidas\n`;
        hints += `- Priorize MVP vs features futuras\n`;
        break;

      case 'design.interface':
        hints += `- Defina style guide, paleta de cores, tipografia, componentes\n`;
        hints += hasTargetAudience ? `- Considere preferências estéticas do público-alvo\n` : `- Baseie-se no tom e personalidade da Ideia Base\n`;
        hints += hasScope ? `- Pense na UI/UX das funcionalidades já definidas\n` : `- Crie diretrizes gerais de design\n`;
        break;

      case 'tech.stack':
        hints += `- Sugira tecnologias (frontend, backend, database, infra)\n`;
        hints += hasScope ? `- Considere requisitos técnicos das funcionalidades\n` : `- Sugira stack genérica adequada ao problema\n`;
        hints += hasInterface ? `- Alinhe com decisões de design/componentização\n` : `- Foque em tecnologias versáteis\n`;
        break;

      default:
        hints += `- Use todo o contexto disponível para criar conteúdo relevante\n`;
        hints += `- Faça conexões com outros cards quando apropriado\n`;
    }

    hints += `\n`;

    return hints;
  }

  /**
   * Formata contexto de cards mencionados para incluir nas instruções
   */
  static async formatMentionedCardsContext(mentionedCardIds: string[]): Promise<string> {
    if (!mentionedCardIds || mentionedCardIds.length === 0) {
      return '';
    }

    const supabase = await createClerkSupabaseClientSsr();

    try {
      // Buscar cards mencionados
      const { data: mentionedCards, error } = await supabase
        .from('cards')
        .select('*')
        .in('id', mentionedCardIds);

      if (error || !mentionedCards || mentionedCards.length === 0) {
        console.warn('[ContextService] Failed to fetch mentioned cards:', error);
        return '';
      }

      // Formatar contexto de cada card mencionado
      let context = '\n\n**Cards Mencionados pelo Usuário:**\n\n';

      for (const card of mentionedCards) {
        context += `### ${card.title} (${card.type_key})\n`;
        context += `- **Status:** ${card.status}\n`;
        context += `- **Stage:** ${card.stage_key}\n`;

        if (card.summary) {
          context += `- **Summary:** ${card.summary}\n`;
        }

        if (card.fields && Object.keys(card.fields).length > 0) {
          context += `- **Campos:**\n`;
          for (const [key, value] of Object.entries(card.fields)) {
            if (value && typeof value === 'string' && value.trim().length > 0) {
              const shortValue = value.length > 100 ? value.slice(0, 100) + '...' : value;
              context += `  - **${key}:** ${shortValue}\n`;
            }
          }
        }

        context += '\n';
      }

      return context;
    } catch (error) {
      console.error('[ContextService] Error formatting mentioned cards:', error);
      return '';
    }
  }
}

