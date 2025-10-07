import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';
import { ContextService } from './ContextService';

/**
 * OutputService
 * Gera e persiste outputs do projeto (Work Plan, PRD, Prompt Pack)
 */

export type OutputType = 'work-plan' | 'prd' | 'prompt-pack';

export interface GenerateOutputRequest {
  projectId: string;
  type: OutputType;
  regenerate?: boolean;
}

export interface Output {
  id: string;
  projectId: string;
  type: OutputType;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class OutputService {
  /**
   * Verifica se o projeto atende ao gate para gerar o output
   */
  static async checkGate(projectId: string, type: OutputType): Promise<{ allowed: boolean; reason?: string }> {
    const supabase = await createClerkSupabaseClientSsr();

    const { data: cards } = await supabase
      .from('cards')
      .select('id, status')
      .eq('project_id', projectId);

    const readyCount = cards?.filter(c => c.status === 'READY').length || 0;

    switch (type) {
      case 'work-plan':
        if (readyCount < 2) {
          return { 
            allowed: false, 
            reason: `Work Plan requer pelo menos 2 cards READY. Você tem ${readyCount}.` 
          };
        }
        return { allowed: true };

      case 'prd':
        if (readyCount < 3) {
          return { 
            allowed: false, 
            reason: `PRD requer pelo menos 3 cards READY. Você tem ${readyCount}.` 
          };
        }
        return { allowed: true };

      case 'prompt-pack':
        if (readyCount < 4) {
          return { 
            allowed: false, 
            reason: `Prompt Pack requer pelo menos 4 cards READY. Você tem ${readyCount}.` 
          };
        }
        return { allowed: true };

      default:
        return { allowed: false, reason: 'Unknown output type' };
    }
  }

  /**
   * Gera o conteúdo do output
   */
  static async generateContent(projectId: string, type: OutputType): Promise<string> {
    const context = await ContextService.getProjectContext(projectId);

    switch (type) {
      case 'work-plan':
        return this.generateWorkPlan(context);
      case 'prd':
        return this.generatePRD(context);
      case 'prompt-pack':
        return this.generatePromptPack(context);
      default:
        throw new Error(`Unknown output type: ${type}`);
    }
  }

  /**
   * Gera um Work Plan baseado nos cards READY
   */
  private static generateWorkPlan(context: any): string {
    let content = `# Work Plan - ${context.projectName}\n\n`;
    
    content += `## 📋 Resumo do Projeto\n\n`;
    if (context.ideaBase) {
      content += `**Nome:** ${context.ideaBase.name}\n`;
      if (context.ideaBase.pitch) content += `**Pitch:** ${context.ideaBase.pitch}\n`;
      if (context.ideaBase.problem) content += `**Problema:** ${context.ideaBase.problem}\n`;
      if (context.ideaBase.solution) content += `**Solução:** ${context.ideaBase.solution}\n`;
    }
    content += `\n`;

    content += `## 🎯 Funcionalidades Priorizadas\n\n`;
    const scopeCard = context.readyCards.find((c: any) => c.typeKey === 'scope.features');
    if (scopeCard?.fields?.features) {
      const features = scopeCard.fields.features;
      const grouped = {
        must: features.filter((f: any) => f.moscow === 'must'),
        should: features.filter((f: any) => f.moscow === 'should'),
        could: features.filter((f: any) => f.moscow === 'could'),
      };

      content += `### Must Have\n`;
      grouped.must.forEach((f: any) => {
        content += `- **${f.name}** (${f.effort}) - ${f.description}\n`;
      });

      content += `\n### Should Have\n`;
      grouped.should.forEach((f: any) => {
        content += `- **${f.name}** (${f.effort}) - ${f.description}\n`;
      });

      content += `\n### Could Have\n`;
      grouped.could.forEach((f: any) => {
        content += `- **${f.name}** (${f.effort}) - ${f.description}\n`;
      });
    }
    content += `\n`;

    content += `## 🛠️ Stack Tecnológico\n\n`;
    const techCard = context.readyCards.find((c: any) => c.typeKey === 'tech.stack');
    if (techCard?.fields) {
      if (techCard.fields.frontend?.length) {
        content += `**Frontend:** ${techCard.fields.frontend.join(', ')}\n`;
      }
      if (techCard.fields.backend?.length) {
        content += `**Backend:** ${techCard.fields.backend.join(', ')}\n`;
      }
      if (techCard.fields.database?.length) {
        content += `**Database:** ${techCard.fields.database.join(', ')}\n`;
      }
      if (techCard.fields.infrastructure?.length) {
        content += `**Infrastructure:** ${techCard.fields.infrastructure.join(', ')}\n`;
      }
    }
    content += `\n`;

    content += `## 📅 Cronograma Sugerido\n\n`;
    content += `### Sprint 1 (2 semanas)\n`;
    content += `- Setup inicial do projeto\n`;
    content += `- Configuração da stack\n`;
    content += `- Primeira funcionalidade Must Have\n\n`;

    content += `### Sprint 2-3 (4 semanas)\n`;
    content += `- Implementação das demais Must Have\n`;
    content += `- Testes iniciais\n\n`;

    content += `### Sprint 4+ (a definir)\n`;
    content += `- Should Have e Could Have\n`;
    content += `- Refinamentos e otimizações\n\n`;

    content += `---\n`;
    content += `*Gerado automaticamente pelo PIStack*\n`;

    return content;
  }

  /**
   * Gera um PRD (stub)
   */
  private static generatePRD(context: any): string {
    return `# PRD - ${context.projectName}\n\n## TODO: Implementar geração completa de PRD\n\n`;
  }

  /**
   * Gera um Prompt Pack (stub)
   */
  private static generatePromptPack(context: any): string {
    return `# Prompt Pack - ${context.projectName}\n\n## TODO: Implementar geração de Prompt Pack\n\n`;
  }

  /**
   * Persiste o output no banco
   */
  static async save(output: Omit<Output, 'id' | 'createdAt' | 'updatedAt'>): Promise<Output> {
    const supabase = await createClerkSupabaseClientSsr();

    const { data, error } = await supabase
      .from('outputs')
      .insert({
        project_id: output.projectId,
        type: output.type,
        content: output.content,
        metadata: output.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save output: ${error.message}`);
    }

    return {
      id: data.id,
      projectId: data.project_id,
      type: data.type,
      content: data.content,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Busca outputs de um projeto
   */
  static async getByProject(projectId: string, type?: OutputType): Promise<Output[]> {
    const supabase = await createClerkSupabaseClientSsr();

    let query = supabase
      .from('outputs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch outputs: ${error.message}`);
    }

    return (data || []).map(d => ({
      id: d.id,
      projectId: d.project_id,
      type: d.type,
      content: d.content,
      metadata: d.metadata,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  /**
   * Gera ou retorna output existente
   */
  static async generate(request: GenerateOutputRequest): Promise<Output> {
    const { projectId, type, regenerate = false } = request;

    // Verificar gate
    const gate = await this.checkGate(projectId, type);
    if (!gate.allowed) {
      throw new Error(gate.reason || 'Gate not met');
    }

    // Se não for regenerar, buscar existente
    if (!regenerate) {
      const existing = await this.getByProject(projectId, type);
      if (existing.length > 0) {
        return existing[0];
      }
    }

    // Gerar novo conteúdo
    const content = await this.generateContent(projectId, type);

    // Salvar
    return this.save({
      projectId,
      type,
      content,
      metadata: { readyCardsCount: (await ContextService.getProjectContext(projectId)).readyCards.length },
    });
  }
}

