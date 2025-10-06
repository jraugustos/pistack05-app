import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge, Skeleton } from '@/components/foundation';
import { CardHeader, CardBody, CardFooter, AIPanel, ProgressDrawer } from '@/components/molecules';
import { IdeaBaseCard, UnderstandingCard, ScopeFeaturesCard, TechStackCard } from '@/components/cards';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3, 
  Magnet, 
  Settings, 
  Download, 
  Share2,
  ArrowLeft,
  MoreVertical,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import type { Project, Card } from '@/types';

export interface CanvasPageProps {
  projectId?: string;
  project?: Project;
  cards?: Card[];
  isLoading?: boolean;
  zoom?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  isAIPanelOpen?: boolean;
  isProgressDrawerOpen?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onToggleGrid?: () => void;
  onToggleSnap?: () => void;
  onToggleAIPanel?: () => void;
  onToggleProgressDrawer?: () => void;
  onCardChange?: (cardId: string, changes: Partial<Card>) => void;
  onCardCreate?: (stageKey: string, typeKey: string) => void;
  onCardDelete?: (cardId: string) => void;
  onCardDuplicate?: (cardId: string) => void;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

// Mock data para demonstração
const mockProject: Project = {
  id: '1',
  name: 'E-commerce Platform',
  description: 'Plataforma completa de e-commerce com carrinho, pagamentos e gestão de produtos',
  status: 'active',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  category: 'web',
  template: 'ecommerce'
};

const mockCards: Card[] = [
  {
    id: 'card-1',
    stageKey: 'ideia-base',
    typeKey: 'problem-statement',
    title: 'Problema Principal',
    content: 'Os usuários têm dificuldade para encontrar produtos específicos na plataforma atual',
    position: { x: 100, y: 100 },
    size: { width: 300, height: 200 },
    status: 'draft',
    priority: 'must',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'card-2',
    stageKey: 'entendimento',
    typeKey: 'user-persona',
    title: 'Persona Principal',
    content: 'João, 35 anos, empresário, busca praticidade nas compras online',
    position: { x: 500, y: 100 },
    size: { width: 300, height: 200 },
    status: 'draft',
    priority: 'should',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const CanvasPage = React.forwardRef<HTMLDivElement, CanvasPageProps>(
  (
    {
      projectId = '1',
      project = mockProject,
      cards = mockCards,
      isLoading = false,
      zoom = 1,
      showGrid = true,
      snapToGrid = true,
      isAIPanelOpen = false,
      isProgressDrawerOpen = false,
      onZoomIn = () => {},
      onZoomOut = () => {},
      onZoomFit = () => {},
      onToggleGrid = () => {},
      onToggleSnap = () => {},
      onToggleAIPanel = () => {},
      onToggleProgressDrawer = () => {},
      onCardChange = () => {},
      onCardCreate = () => {},
      onCardDelete = () => {},
      onCardDuplicate = () => {},
      onSave = () => {},
      onExport = () => {},
      onShare = () => {},
      onBack = () => {},
      ...props
    },
    ref
  ) => {
    const stageCards = React.useMemo(() => {
      const stages = {
        'ideia-base': cards.filter(card => card.stageKey === 'ideia-base'),
        'entendimento': cards.filter(card => card.stageKey === 'entendimento'),
        'escopo': cards.filter(card => card.stageKey === 'escopo'),
        'design': cards.filter(card => card.stageKey === 'design'),
        'desenvolvimento': cards.filter(card => card.stageKey === 'desenvolvimento'),
        'testes': cards.filter(card => card.stageKey === 'testes'),
        'deploy': cards.filter(card => card.stageKey === 'deploy'),
        'manutencao': cards.filter(card => card.stageKey === 'manutencao')
      };
      return stages;
    }, [cards]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-bg">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="h-screen bg-bg flex flex-col" {...props}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke bg-bg-elev">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-text">{project.name}</h1>
              <p className="text-sm text-text-dim">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-stroke bg-bg-elev">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-text-dim min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onZoomFit}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant={showGrid ? "primary" : "ghost"} 
              size="sm" 
              onClick={onToggleGrid}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={snapToGrid ? "primary" : "ghost"} 
              size="sm" 
              onClick={onToggleSnap}
            >
              <Magnet className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleAIPanel}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleProgressDrawer}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 relative overflow-auto">
            <div 
              className="relative min-h-full min-w-full p-8"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Grid Background */}
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Stage Columns */}
              <div className="grid grid-cols-4 gap-8 min-h-[800px]">
                {/* Ideia Base */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-4 border border-primary/20">
                    <h3 className="text-lg font-semibold text-primary">Ideia Base</h3>
                    <p className="text-sm text-text-dim">Definição do problema e solução</p>
                  </div>
                  <div className="space-y-4">
                    {stageCards['ideia-base'].map((card) => (
                      <IdeaBaseCard 
                        key={card.id} 
                        idea={{
                          title: card.title,
                          description: card.content || '',
                          problem: '',
                          solution: '',
                          targetAudience: '',
                          valueProposition: ''
                        }}
                        status="DRAFT"
                        onUpdate={() => {}}
                        onAIGenerate={() => {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Entendimento */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-success/20 to-success/5 rounded-lg p-4 border border-success/20">
                    <h3 className="text-lg font-semibold text-success">Entendimento</h3>
                    <p className="text-sm text-text-dim">Pesquisa e descoberta</p>
                  </div>
                  <div className="space-y-4">
                    {stageCards['entendimento'].map((card) => (
                      <UnderstandingCard 
                        key={card.id} 
                        card={card}
                        onUpdate={() => {}}
                        onAIGenerate={() => {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Escopo */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-warning/20 to-warning/5 rounded-lg p-4 border border-warning/20">
                    <h3 className="text-lg font-semibold text-warning">Escopo</h3>
                    <p className="text-sm text-text-dim">Definição de funcionalidades</p>
                  </div>
                  <div className="space-y-4">
                    {stageCards['escopo'].map((card) => (
                      <ScopeFeaturesCard 
                        key={card.id} 
                        card={card}
                        onUpdate={() => {}}
                        onAIGenerate={() => {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-info/20 to-info/5 rounded-lg p-4 border border-info/20">
                    <h3 className="text-lg font-semibold text-info">Tech Stack</h3>
                    <p className="text-sm text-text-dim">Tecnologias e arquitetura</p>
                  </div>
                  <div className="space-y-4">
                    {stageCards['design'].map((card) => (
                      <TechStackCard 
                        key={card.id} 
                        card={card}
                        onUpdate={() => {}}
                        onAIGenerate={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panels */}
          {isAIPanelOpen && (
            <div className="w-80 border-l border-stroke bg-bg-elev">
              <AIPanel />
            </div>
          )}

          {isProgressDrawerOpen && (
            <div className="w-80 border-l border-stroke bg-bg-elev">
              <ProgressDrawer />
            </div>
          )}
        </div>
      </div>
    );
  }
);

CanvasPage.displayName = 'CanvasPage';

export { CanvasPage };