/**
 * AgentRegistry
 * Mantém configuração de agentes (Orchestrator + Domain Agents) e políticas.
 */

export type AgentKind = 'orchestrator' | 'scope' | 'tech' | 'design' | 'plan' | 'enricher' | 'target-audience';

export interface AgentConfig {
  id: string; // ID do agente no Agent Builder (quando disponível)
  kind: AgentKind;
  name: string;
  description?: string;
  // Sinais para roteamento (cards/typeKeys atendidos por este agente)
  handlesTypeKeys?: string[];
}

export class AgentRegistry {
  static get orchestrator(): AgentConfig {
    return {
      id: process.env.AGENT_ORCHESTRATOR_ID || 'orchestrator.local',
      kind: 'orchestrator',
      name: 'OrchestratorAgent',
      description: 'Coordena agentes por domínio e aplica políticas/gates',
    };
  }

  static get scope(): AgentConfig {
    return {
      id: process.env.AGENT_SCOPE_ID || 'scope.local',
      kind: 'scope',
      name: 'ScopeAgent',
      description: 'Gera/expande/revisa escopo (scope.features, scope.requirements)',
      handlesTypeKeys: ['scope.features', 'scope.requirements'],
    };
  }

  static get tech(): AgentConfig {
    return {
      id: process.env.AGENT_TECH_ID || 'tech.local',
      kind: 'tech',
      name: 'TechAgent',
      description: 'Sugerir/validar stack e arquitetura (tech.stack, tech.arch)',
      handlesTypeKeys: ['tech.stack', 'tech.arch'],
    };
  }

  static get design(): AgentConfig {
    return {
      id: process.env.AGENT_DESIGN_ID || 'design.local',
      kind: 'design',
      name: 'DesignAgent',
      description: 'Derivar conceitos/fluxos (design.concept, design.flow)',
      handlesTypeKeys: ['design.concept', 'design.flow'],
    };
  }

  static get plan(): AgentConfig {
    return {
      id: process.env.AGENT_PLAN_ID || 'plan.local',
      kind: 'plan',
      name: 'PlanAgent',
      description: 'Planejamento e milestones (plan.release, plan.roadmap)',
      handlesTypeKeys: ['plan.release', 'plan.roadmap'],
    };
  }

  static get enricher(): AgentConfig {
    return {
      id: process.env.AGENT_ENRICHER_ID || 'enricher.local',
      kind: 'enricher',
      name: 'IdeaEnricherAgent',
      description: 'Enriquece e expande a ideia base com contexto estruturado',
      handlesTypeKeys: ['idea.enricher'],
    };
  }

  static get targetAudience(): AgentConfig {
    return {
      id: process.env.AGENT_TARGET_AUDIENCE_ID || 'target-audience.local',
      kind: 'target-audience',
      name: 'TargetAudienceAgent',
      description: 'Define e detalha o público-alvo do produto/serviço',
      handlesTypeKeys: ['idea.target-audience'],
    };
  }

  /**
   * Seleciona agente de domínio com base no typeKey do card
   */
  static selectDomainAgentByTypeKey(typeKey?: string): AgentConfig | null {
    if (!typeKey) return null;
    const agents = [this.scope, this.tech, this.design, this.plan, this.enricher, this.targetAudience];
    return agents.find(a => a.handlesTypeKeys?.includes(typeKey)) || null;
  }
}



