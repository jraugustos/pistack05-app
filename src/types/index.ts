// ============================================
// PIStack — Type Definitions
// ============================================

// === Project Types ===
export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  status: ProjectStatus;
  owner_id: string;
  graph?: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export type ProjectTemplate = 'site-app' | 'mobile-app' | 'api-service' | 'landing-page';

// === Card Types ===
export type CardStatus = 'DRAFT' | 'READY';

export type StageKey =
  | 'ideia-base'
  | 'entendimento'
  | 'escopo'
  | 'design'
  | 'tecnologia'
  | 'planejamento';

export type CardTypeKey =
  | 'idea.base'
  | 'idea.enricher'
  | 'idea.target-audience'
  | 'understanding.discovery'
  | 'understanding.value-prop'
  | 'scope.features'
  | 'scope.requirements'
  | 'design.concept'
  | 'design.flow'
  | 'design.interface'
  | 'tech.stack'
  | 'tech.arch'
  | 'plan.release'
  | 'plan.roadmap';

export interface Card {
  id: string;
  projectId: string;
  stageKey: StageKey;
  typeKey: CardTypeKey;
  title: string;
  summary: string | null;
  fields: Record<string, any>;
  status: CardStatus;
  position: { x: number; y: number };
  size: { width: number; height: number };
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// === Edge Types ===
export type EdgeType = 'derives' | 'depends' | 'references';

export interface Edge {
  id: string;
  projectId: string;
  sourceCardId: string;
  targetCardId: string;
  label?: string | null;
  edgeType?: EdgeType; // Tipo de conexão (derives, depends, references)
  color?: string; // Cor customizada (opcional)
  createdAt: Date;
  updatedAt: Date;
}

// === Graph Types ===
export interface GraphNode {
  id: string;
  type: CardTypeKey;
  position: { x: number; y: number };
  data: {
    title: string;
    status: CardStatus;
    stageKey: StageKey;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphJSON {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// === Output Types ===
export type OutputType = 'prd' | 'prompt-pack' | 'work-plan';

export interface Output {
  id: string;
  projectId: string;
  templateId: string;
  type: OutputType;
  content: string;
  status: 'draft' | 'generating' | 'ready';
  createdAt: string;
  updatedAt?: string;
}

// === AI Types ===
export type AIModeType = 'Generate' | 'Expand' | 'Review';

export interface AITrace {
  id: string;
  cardId: string;
  prompt: string;
  model: string;
  tokens: number;
  cost: number;
  createdAt: string;
}

// === MoSCoW Priority ===
export type MoSCoWPriority = 'must' | 'should' | 'could' | 'wont';

// === Template Types ===
export interface Template {
  id: string;
  name: string;
  description: string;
  stages: TemplateStage[];
}

export interface TemplateStage {
  key: StageKey;
  name: string;
  description: string;
  cardTypes: CardType[];
}

export interface CardType {
  key: CardTypeKey;
  name: string;
  description: string;
  schema: Record<string, any>;
  defaultFields: Record<string, any>;
}

// === Checklist Types ===
export interface ChecklistItem {
  id: string;
  label: string;
  targetStageKey: StageKey;
  targetTypeKey: CardTypeKey;
  done: boolean;
}

// === Component Props Types ===
export interface BaseComponentProps {
  className?: string;
}

// === IdeaEnricher Fields ===
export interface IdeaEnricherFields {
  whatWeWantToCreate: string; // O que queremos criar
  problemSolved: string; // Problema/dor que resolve
  proposedSolution: string; // Solução proposta
  constraintsAssumptions: string; // Restrições e suposições
}

// === TargetAudience Fields ===
export interface TargetAudienceFields {
  primaryAudience: string; // Público principal
  secondaryAudience: string; // Público secundário
  demographics: string; // Demografia (idade, localização, renda, etc)
  psychographics: string; // Psicografia (interesses, valores, estilo de vida)
  painPoints: string; // Dores e necessidades
  behaviors: string; // Comportamentos e hábitos
}

// === DesignInterface Fields ===
export interface DesignInterfaceFields {
  styleGuide: string; // Guia de estilo geral
  colorPalette: string[]; // Paleta de cores
  typography: Record<string, any>; // Tipografia (fonts, tamanhos, pesos)
  componentLibrary: string; // Biblioteca de componentes sugerida
  designSystem: string; // Sistema de design (Material, Ant, Custom, etc)
  accessibility: string; // Diretrizes de acessibilidade
  responsiveness: string; // Estratégia de responsividade
  inspiration: string[]; // Referências e inspirações visuais
  layoutGuidelines: string; // Diretrizes de layout (grids, espaçamentos)
  interactions: string; // Interações e micro-animações
}

