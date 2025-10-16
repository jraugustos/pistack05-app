'use client';

import {
  Button,
  Badge,
  Chip,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  EmptyState,
  Switch,
  LoadingSpinner,
} from '@/components/foundation';
import {
  SearchInput,
  ProjectTile,
  CardHeader,
  CardBody,
  CardFooter,
  AIPanel,
  ProgressDrawer,
} from '@/components/molecules';
import {
  IdeaBaseCard,
  UnderstandingCard,
  ScopeFeaturesCard,
  TechStackCard,
} from '@/components/cards';
import {
  ProjectsPage,
  CanvasPage,
  OutputsModal,
  NewProjectModal,
} from '@/components/organisms';
import { Sparkles, FolderOpen, Atom, Layers, Building2 } from 'lucide-react';
import { toast } from '@/hooks/useToast';

export default function DesignSystemPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F1115', // bg-bg
      padding: '32px', // p-8
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div className="mb-12 pb-6 border-b border-stroke">
          <h1 className="text-4xl font-bold text-text mb-4 tracking-tight">
            PIStack — Design System Showcase v3
          </h1>
          <p className="text-lg text-text-dim leading-relaxed mb-8">
            Fundação + Moléculas + Cards implementados seguindo Atomic Design e Hierarquia Visual ✨
          </p>
          
          {/* Navigation Links */}
          <div className="bg-gradient-to-r from-primary/10 to-info/10 rounded-xl p-6 mb-8 border border-primary/20">
            <h3 className="text-lg font-semibold text-text mb-4 text-center">Navegação Rápida</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/projects" 
                className="px-6 py-3 bg-gradient-to-br from-[#4A6CF7] to-[#7A9FFF] text-white rounded-lg hover:from-[#5A7CFF] hover:to-[#8AAFFF] transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                📋 Lista de Projetos
              </a>
              <a 
                href="/projects/1" 
                className="px-6 py-3 bg-gradient-to-br from-[#22C55E] to-[#4ADE80] text-white rounded-lg hover:from-[#32D56E] hover:to-[#5AEE90] transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                🎨 Canvas do Projeto
              </a>
              <a 
                href="/sign-in" 
                className="px-6 py-3 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white rounded-lg hover:from-[#9B6CF6] hover:to-[#B78BFA] transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                🔐 Autenticação
              </a>
            </div>
          </div>
        </div>

        {/* ===========================================
            ÁTOMOS (Atoms) - Componentes Base
            =========================================== */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-primary rounded-xl">
            <Atom className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-text tracking-tight">
              Átomos (Atoms)
            </h2>
            <Badge status="READY" className="text-sm font-medium">16 Componentes</Badge>
          </div>

          {/* Buttons */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-text mb-4">Buttons</h3>
            <div className="card-elevated p-6">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Badges</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Badge status="DRAFT">Draft</Badge>
                <Badge status="READY">Ready</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
          </div>

          {/* Chips (MoSCoW) */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Chips (MoSCoW)</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Chip variant="must">Must Have</Chip>
                <Chip variant="should">Should Have</Chip>
                <Chip variant="could">Could Have</Chip>
                <Chip variant="wont">Won't Have</Chip>
                <Chip variant="must" onRemove={() => console.log('removed')}>Removable</Chip>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Inputs</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <Input placeholder="Nome do projeto" />
                <Input placeholder="Com prefix" prefix={<Sparkles className="h-4 w-4" />} />
                <Input placeholder="Com erro" error helperText="Este campo é obrigatório" />
                <Input placeholder="Disabled" disabled />
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Textarea</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <Textarea placeholder="Descreva a ideia do seu projeto..." rows={4} />
            </div>
          </div>

          {/* Select */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Select</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <Select>
                <SelectTrigger style={{ width: '280px' }}>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site-app">Site / Aplicativo</SelectItem>
                  <SelectItem value="produto-fisico">Produto Físico</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkbox & Switch */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Checkbox & Switch</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Switch id="notifications" />
                  <label htmlFor="notifications" style={{ fontSize: '14px', color: '#E6E9F2' }}>Notificações</label>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Skeleton</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton style={{ height: '48px', width: '100%' }} />
                <Skeleton style={{ height: '32px', width: '75%' }} />
                <Skeleton style={{ height: '32px', width: '50%' }} />
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Loading Spinner</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Empty State</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '8px' }}>
              <EmptyState
                icon={<FolderOpen style={{ height: '32px', width: '32px' }} />}
                title="Nenhum projeto criado"
                description="Crie seu primeiro projeto para começar a transformar ideias em ação"
                action={{
                  label: 'Criar Novo Projeto',
                  onClick: () => toast({ title: 'Criar Projeto', description: 'Ação de criar projeto' }),
                }}
              />
            </div>
          </div>

          {/* Toast Test */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Toast</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Button
                  variant="primary"
                  onClick={() =>
                    toast({
                      title: 'Sucesso!',
                      description: 'Projeto criado com sucesso',
                      variant: 'success',
                    })
                  }
                >
                  Toast Success
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    toast({
                      title: 'Erro!',
                      description: 'Não foi possível criar o projeto',
                      variant: 'danger',
                    })
                  }
                >
                  Toast Danger
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toast({
                      title: 'Atenção',
                      description: 'Você tem mudanças não salvas',
                      variant: 'warning',
                    })
                  }
                >
                  Toast Warning
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ===========================================
            MOLÉCULAS (Molecules) - Componentes Compostos
            =========================================== */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-success rounded-xl">
            <Layers className="h-8 w-8 text-success" />
            <h2 className="text-3xl font-bold text-text tracking-tight">
              Moléculas (Molecules)
            </h2>
            <Badge status="READY" className="text-sm font-medium">7 Componentes</Badge>
          </div>
          
          {/* SearchInput */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>SearchInput</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <SearchInput
                value=""
                onChange={(value) => console.log('Search:', value)}
                placeholder="Buscar projetos..."
                style={{ maxWidth: '400px' }}
              />
            </div>
          </div>

          {/* ProjectTile */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>ProjectTile</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <ProjectTile
                  id="1"
                  name="E-commerce Platform"
                  status="active"
                  updatedAt={new Date()}
                  template="Site/App"
                  progress={75}
                  onOpen={(id) => console.log('Open project:', id)}
                  onRename={(id, name) => console.log('Rename:', id, name)}
                  onDuplicate={(id) => console.log('Duplicate:', id)}
                  onArchive={(id) => console.log('Archive:', id)}
                  onDelete={(id) => console.log('Delete:', id)}
                />
                <ProjectTile
                  id="2"
                  name="Mobile App MVP"
                  status="draft"
                  updatedAt={new Date(Date.now() - 86400000)}
                  template="Site/App"
                  progress={25}
                  onOpen={(id) => console.log('Open project:', id)}
                  onRename={(id, name) => console.log('Rename:', id, name)}
                  onDuplicate={(id) => console.log('Duplicate:', id)}
                  onArchive={(id) => console.log('Archive:', id)}
                  onDelete={(id) => console.log('Delete:', id)}
                />
              </div>
            </div>
          </div>

          {/* Card Components */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#E6E9F2', marginBottom: '16px' }}>Card Components</h3>
            <div style={{ background: '#151821', border: '1px solid #242837', borderRadius: '12px', padding: '24px' }}>
              <div style={{ maxWidth: '500px' }}>
                <div style={{ background: '#0F1115', border: '1px solid #242837', borderRadius: '12px', overflow: 'hidden' }}>
                  <CardHeader
                    icon={<Sparkles style={{ height: '20px', width: '20px' }} />}
                    title="Ideia Base"
                    status="READY"
                    stageKey="ideia-base"
                    onMenuAction={(action) => console.log('Menu action:', action)}
                  />
                  <CardBody>
                    <p style={{ color: '#B9BECD', fontSize: '14px' }}>
                      Esta é uma demonstração do CardBody com conteúdo de exemplo.
                    </p>
                  </CardBody>
                  <CardFooter
                    updatedAt={new Date()}
                    author="João Silva"
                    aiGenerated={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===========================================
            CARDS ESPECÍFICOS - Por Etapa do PIStack
            =========================================== */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-info rounded-xl">
            <Building2 className="h-8 w-8 text-info" />
            <h2 className="text-3xl font-bold text-text tracking-tight">
              Cards por Etapa
            </h2>
            <Badge status="READY" className="text-sm font-medium">4 Cards</Badge>
          </div>
          
          {/* IdeaBaseCard */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Ideia Base</h3>
            <div className="max-w-4xl">
              <IdeaBaseCard
                card={{
                  id: "demo-idea-base",
                  stageKey: "idea",
                  typeKey: "idea_base",
                  status: "READY",
                  fields: {
                    name: "E-commerce Platform",
                    pitch: "Uma plataforma de e-commerce moderna com foco em UX e performance"
                  },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }}
                cards={[]}
                onUpdate={(fields) => console.log('Update:', fields)}
                onGenerate={(mode) => console.log('Generate:', mode)}
                onConfirmReady={() => console.log('Confirm Ready')}
                onChecklistClick={(target) => console.log('Checklist:', target)}
                onFocusCard={(cardId) => console.log('Focus:', cardId)}
                onEnrichIdea={() => console.log('Enrich Idea')}
              />
            </div>
          </div>

          {/* UnderstandingCard */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-info mb-4">Entendimento do Mercado</h3>
            <div className="max-w-4xl">
              <UnderstandingCard
                understanding={{
                  marketResearch: "O mercado de e-commerce no Brasil cresce 20% ao ano, com foco em mobile-first",
                  competitors: "Shopify, WooCommerce, Nuvemshop dominam o mercado",
                  userPersonas: "Empresários de 25-45 anos, tech-savvy, buscam simplicidade",
                  marketSize: "R$ 200 bilhões em 2024",
                  trends: "PWA, headless commerce, AI personalization",
                  opportunities: "Mercado B2B, integração com marketplaces"
                }}
                status="READY"
                onUpdate={(field, value) => console.log('Update understanding:', field, value)}
                onAIGenerate={(field) => console.log('AI generate:', field)}
                onMenuAction={(action) => console.log('Menu action:', action)}
              />
            </div>
          </div>

          {/* ScopeFeaturesCard */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-success mb-4">Escopo e Funcionalidades</h3>
            <div className="max-w-4xl">
              <ScopeFeaturesCard
                features={[
                  {
                    id: "1",
                    name: "Catálogo de Produtos",
                    description: "Sistema completo de gestão de produtos com variações",
                    moscow: "must",
                    effort: "high"
                  },
                  {
                    id: "2",
                    name: "Carrinho de Compras",
                    description: "Carrinho persistente com salvamento local",
                    moscow: "must",
                    effort: "medium"
                  },
                  {
                    id: "3",
                    name: "Checkout Otimizado",
                    description: "Processo de checkout em 1 clique",
                    moscow: "must",
                    effort: "high"
                  },
                  {
                    id: "4",
                    name: "Dashboard Analytics",
                    description: "Painel com métricas de vendas e conversão",
                    moscow: "should",
                    effort: "medium"
                  }
                ]}
                status="DRAFT"
                onUpdate={(updates) => console.log('Update scope:', updates)}
                onAIGenerate={(mode, prompt) => console.log('AI generate:', mode, prompt)}
                onConfirm={() => console.log('Confirm scope')}
                onMenuAction={(action) => console.log('Menu action:', action)}
              />
            </div>
          </div>

          {/* TechStackCard */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-cyan mb-4">Stack Tecnológico</h3>
            <div className="max-w-4xl">
              <TechStackCard
                stack={{
                  frontend: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS"],
                  backend: ["Node.js", "Express", "Prisma ORM"],
                  database: ["PostgreSQL", "Redis"],
                  infrastructure: ["Vercel", "Railway"],
                  integrations: ["Stripe", "SendGrid", "AWS S3"],
                  risks: ["Complexidade de deployment", "Dependência de serviços externos"],
                  pros: ["Performance", "Escalabilidade", "Developer Experience"],
                  cons: ["Curva de aprendizado", "Custo de infraestrutura"]
                }}
                status="READY"
                onUpdate={(updates) => console.log('Update tech:', updates)}
                onAIGenerate={(mode, prompt) => console.log('AI generate:', mode, prompt)}
                onConfirm={() => console.log('Confirm tech stack')}
                onMenuAction={(action) => console.log('Menu action:', action)}
              />
            </div>
          </div>
        </section>

        {/* ===========================================
            ORGANISMOS (Organisms) - Criados
            =========================================== */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-warning rounded-xl">
            <Building2 className="h-8 w-8 text-warning" />
            <h2 className="text-3xl font-bold text-text tracking-tight">
              Organismos (Organisms)
            </h2>
            <Badge status="READY" className="text-sm font-medium">Criados</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ProjectsPage */}
            <a href="/projects" className="card-elevated p-6 block cursor-pointer group">
              <h3 className="text-xl font-semibold text-primary mb-4">📋 ProjectsPage</h3>
              <p className="text-text-dim mb-4">
                Página principal para listar e gerenciar projetos com filtros, busca e visualizações.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge status="READY">Lista de Projetos</Badge>
                <Badge status="READY">Filtros</Badge>
                <Badge status="READY">Busca</Badge>
                <Badge status="READY">Ordenação</Badge>
              </div>
              <div className="text-sm text-primary font-medium">
                → Acessar Lista de Projetos
              </div>
            </a>

            {/* CanvasPage */}
            <a href="/projects/1" className="card-elevated p-6 block cursor-pointer group">
              <h3 className="text-xl font-semibold text-success mb-4">🎨 CanvasPage</h3>
              <p className="text-text-dim mb-4">
                Página do canvas com controles de zoom, grid, snap e painéis laterais.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge status="READY">Canvas Controls</Badge>
                <Badge status="READY">Zoom</Badge>
                <Badge status="READY">Grid</Badge>
                <Badge status="READY">AIPanel</Badge>
              </div>
              <div className="text-sm text-success font-medium">
                → Acessar Canvas do Projeto
              </div>
            </a>

            {/* OutputsModal */}
            <div className="card-elevated p-6 opacity-75">
              <h3 className="text-xl font-semibold text-info mb-4">📄 OutputsModal</h3>
              <p className="text-text-dim mb-4">
                Modal para visualizar e gerenciar outputs (PRD, Prompt Pack, Work Plan).
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge status="READY">Tabs</Badge>
                <Badge status="READY">Regenerar</Badge>
                <Badge status="READY">Download</Badge>
                <Badge status="READY">Copiar</Badge>
              </div>
              <div className="text-sm text-text-dim">
                Disponível no Canvas
              </div>
            </div>

            {/* NewProjectModal */}
            <div className="card-elevated p-6 opacity-75">
              <h3 className="text-xl font-semibold text-cyan mb-4">➕ NewProjectModal</h3>
              <p className="text-text-dim mb-4">
                Modal para criar novos projetos com templates e configurações.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge status="READY">Templates</Badge>
                <Badge status="READY">Categorias</Badge>
                <Badge status="READY">Preview</Badge>
                <Badge status="READY">Validação</Badge>
              </div>
              <div className="text-sm text-text-dim">
                Disponível na Lista de Projetos
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}