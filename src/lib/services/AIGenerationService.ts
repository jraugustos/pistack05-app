import { ContextService, ProjectContext } from './ContextService';
import { CardSchemaService } from './CardSchemaService';

/**
 * AIGenerationService
 * Gera conteúdo de cards usando IA com contexto do projeto
 * 
 * TODO: Integrar com OpenAI/Anthropic real
 * Por enquanto, retorna mocks estruturados
 */

export type AIMode = 'generate' | 'expand' | 'review';

export interface AIGenerationRequest {
  cardId: string;
  mode: AIMode;
  prompt?: string;
}

export interface AIGenerationResponse {
  fields: Record<string, any>;
  suggestions?: string[];
  warnings?: string[];
}

export class AIGenerationService {
  /**
   * Gera conteúdo para um card baseado no modo
   */
  static async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const { cardId, mode, prompt } = request;

    // Buscar contexto do card e do projeto
    const { card, projectContext } = await ContextService.getCardContext(cardId);

    // Montar contexto formatado
    const contextPrompt = ContextService.formatContextForPrompt(projectContext);

    // Gerar conteúdo baseado no modo
    switch (mode) {
      case 'generate':
        return this.generateContent(card, projectContext, prompt);
      case 'expand':
        return this.expandContent(card, projectContext, prompt);
      case 'review':
        return this.reviewContent(card, projectContext);
      default:
        throw new Error(`Unknown AI mode: ${mode}`);
    }
  }

  /**
   * Modo GENERATE: cria conteúdo inicial para o card
   */
  private static async generateContent(
    card: any,
    context: ProjectContext,
    customPrompt?: string
  ): Promise<AIGenerationResponse> {
    const typeKey = card.type_key;

    // TODO: Integrar com API de IA real
    // Por enquanto, retorna mocks estruturados por tipo

    if (typeKey === 'scope.features') {
      return {
        fields: {
          features: [
            { id: '1', name: 'Sistema de autenticação', description: 'Login e cadastro de usuários', moscow: 'must', effort: 'medium' },
            { id: '2', name: 'Dashboard principal', description: 'Visão geral do sistema', moscow: 'must', effort: 'high' },
            { id: '3', name: 'Gerenciamento de perfil', description: 'Edição de dados do usuário', moscow: 'should', effort: 'low' },
            { id: '4', name: 'Notificações push', description: 'Alertas em tempo real', moscow: 'could', effort: 'medium' },
          ],
          moscow: {
            must: ['Sistema de autenticação', 'Dashboard principal'],
            should: ['Gerenciamento de perfil'],
            could: ['Notificações push'],
            wont: [],
          },
          effort: {
            low: ['Gerenciamento de perfil'],
            medium: ['Sistema de autenticação', 'Notificações push'],
            high: ['Dashboard principal'],
          },
        },
        suggestions: [
          'Considere adicionar recuperação de senha',
          'Dashboard pode ser dividido em múltiplos widgets',
        ],
      };
    }

    if (typeKey === 'tech.stack') {
      return {
        fields: {
          frontend: ['React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'TypeScript'],
          database: ['PostgreSQL', 'Redis'],
          infrastructure: ['Vercel', 'Supabase', 'Cloudflare'],
          integrations: ['Stripe', 'SendGrid', 'Cloudinary'],
          risks: [
            'Escalabilidade do banco pode ser um problema com muitos usuários',
            'Custo de infraestrutura pode crescer rapidamente',
          ],
          pros: [
            'Stack moderna e bem documentada',
            'Boa performance e SEO',
            'Comunidade ativa',
          ],
          cons: [
            'Curva de aprendizado para TypeScript',
            'Dependência de serviços third-party',
          ],
        },
        suggestions: [
          'Considere usar Next.js ao invés de React puro',
          'Avalie custos de Vercel para escala',
        ],
      };
    }

    // Fallback para outros tipos
    const defaults = CardSchemaService.getDefaultFields(typeKey);
    return {
      fields: defaults,
      suggestions: ['Preencha os campos manualmente para este tipo de card'],
    };
  }

  /**
   * Modo EXPAND: expande conteúdo existente com mais detalhes
   */
  private static async expandContent(
    card: any,
    context: ProjectContext,
    customPrompt?: string
  ): Promise<AIGenerationResponse> {
    const currentFields = card.fields || {};
    const typeKey = card.type_key;

    // TODO: Integrar com API de IA real
    // Por enquanto, adiciona items aos arrays existentes

    if (typeKey === 'scope.features') {
      const currentFeatures = currentFields.features || [];
      return {
        fields: {
          ...currentFields,
          features: [
            ...currentFeatures,
            { id: Date.now().toString(), name: 'Nova funcionalidade sugerida', description: 'Baseado no contexto', moscow: 'should', effort: 'medium' },
          ],
        },
        suggestions: ['Adicionado 1 nova funcionalidade baseada no contexto'],
      };
    }

    if (typeKey === 'tech.stack') {
      return {
        fields: {
          ...currentFields,
          integrations: [...(currentFields.integrations || []), 'Nova integração sugerida'],
          pros: [...(currentFields.pros || []), 'Vantagem adicional identificada'],
        },
        suggestions: ['Adicionadas sugestões de integração e vantagens'],
      };
    }

    return {
      fields: currentFields,
      suggestions: ['Expansão não disponível para este tipo de card'],
    };
  }

  /**
   * Modo REVIEW: revisa conteúdo e sugere melhorias
   */
  private static async reviewContent(
    card: any,
    context: ProjectContext
  ): Promise<AIGenerationResponse> {
    const currentFields = card.fields || {};
    const typeKey = card.type_key;

    // TODO: Integrar com API de IA real
    // Por enquanto, retorna warnings genéricas

    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (typeKey === 'scope.features') {
      const features = currentFields.features || [];
      if (features.length < 3) {
        warnings.push('Poucas funcionalidades definidas. Considere adicionar mais.');
      }
      const mustFeatures = currentFields.moscow?.must || [];
      if (mustFeatures.length === 0) {
        warnings.push('Nenhuma funcionalidade marcada como "Must Have".');
      }
      suggestions.push('Valide prioridades com stakeholders');
      suggestions.push('Estime esforço baseado na complexidade técnica');
    }

    if (typeKey === 'tech.stack') {
      const frontend = currentFields.frontend || [];
      const backend = currentFields.backend || [];
      if (frontend.length === 0) warnings.push('Nenhuma tecnologia de frontend definida');
      if (backend.length === 0) warnings.push('Nenhuma tecnologia de backend definida');
      suggestions.push('Considere compatibilidade entre frontend e backend');
      suggestions.push('Avalie custos de licenciamento');
    }

    return {
      fields: currentFields,
      warnings,
      suggestions,
    };
  }
}

