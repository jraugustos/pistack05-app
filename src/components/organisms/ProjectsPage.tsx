import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge, EmptyState, Skeleton } from '@/components/foundation';
import { SearchInput, ProjectTile } from '@/components/molecules';
import { Plus, Grid, List, Filter, SortAsc, Archive, MoreHorizontal } from 'lucide-react';
import type { Project } from '@/types';

export interface ProjectsPageProps {
  projects?: Project[];
  isLoading?: boolean;
  searchQuery?: string;
  sortBy?: 'name' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  statusFilter?: 'all' | 'draft' | 'active' | 'archived';
  viewMode?: 'grid' | 'list';
  onSearchChange?: (query: string) => void;
  onSortChange?: (sortBy: ProjectsPageProps['sortBy'], order: ProjectsPageProps['sortOrder']) => void;
  onStatusFilterChange?: (status: ProjectsPageProps['statusFilter']) => void;
  onViewModeChange?: (mode: ProjectsPageProps['viewMode']) => void;
  onNewProject?: () => void;
  onProjectOpen?: (id: string) => void;
  onProjectRename?: (id: string, name: string) => void;
  onProjectDuplicate?: (id: string) => void;
  onProjectArchive?: (id: string) => void;
  onProjectDelete?: (id: string) => void;
}

// Mock data para demonstração
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Plataforma completa de e-commerce com carrinho, pagamentos e gestão de produtos',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    category: 'web',
    template: 'ecommerce'
  },
  {
    id: '2',
    name: 'Mobile App MVP',
    description: 'Aplicativo móvel para delivery de comida com integração de mapas',
    status: 'draft',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    category: 'mobile',
    template: 'mobile'
  },
  {
    id: '3',
    name: 'Dashboard Analytics',
    description: 'Dashboard de analytics com gráficos interativos e relatórios em tempo real',
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22'),
    category: 'web',
    template: 'dashboard'
  }
];

const ProjectsPage = React.forwardRef<HTMLDivElement, ProjectsPageProps>(
  (
    {
      projects = mockProjects,
      isLoading = false,
      searchQuery = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      statusFilter = 'all',
      viewMode = 'grid',
      onSearchChange = () => {},
      onSortChange = () => {},
      onStatusFilterChange = () => {},
      onViewModeChange = () => {},
      onNewProject = () => {},
      onProjectOpen = () => {},
      onProjectRename = () => {},
      onProjectDuplicate = () => {},
      onProjectArchive = () => {},
      onProjectDelete = () => {},
      ...props
    },
    ref
  ) => {
    const filteredProjects = React.useMemo(() => {
      let filtered = projects;

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(project => project.status === statusFilter);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(project =>
          project.name.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
        );
      }

      // Sort projects
      filtered.sort((a, b) => {
        let aValue: string | Date;
        let bValue: string | Date;

        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    }, [projects, searchQuery, sortBy, sortOrder, statusFilter]);

    const statusCounts = React.useMemo(() => {
      return {
        all: projects.length,
        draft: projects.filter(p => p.status === 'draft').length,
        active: projects.filter(p => p.status === 'active').length,
        archived: projects.filter(p => p.status === 'archived').length,
      };
    }, [projects]);

    if (isLoading) {
      return (
        <div ref={ref} className="min-h-screen bg-bg p-6" {...props}>
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-48 bg-bg-elev rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-bg-elev rounded-lg animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-80 bg-bg-elev rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-bg-elev rounded-lg animate-pulse" />
                <div className="h-10 w-24 bg-bg-elev rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="card" className="h-48" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="min-h-screen bg-bg p-6" {...props}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text mb-2">Meus Projetos</h1>
                <p className="text-text-dim">
                  {filteredProjects.length} de {projects.length} projetos
                </p>
              </div>
              <Button onClick={onNewProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="Buscar projetos..."
                  value={searchQuery}
                  onChange={onSearchChange}
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onStatusFilterChange('all')}
                >
                  Todos ({statusCounts.all})
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onStatusFilterChange('draft')}
                >
                  Rascunho ({statusCounts.draft})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onStatusFilterChange('active')}
                >
                  Ativo ({statusCounts.active})
                </Button>
                <Button
                  variant={statusFilter === 'archived' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onStatusFilterChange('archived')}
                >
                  Arquivado ({statusCounts.archived})
                </Button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="gap-2"
                >
                  <SortAsc className={cn("h-4 w-4", sortOrder === 'desc' && "rotate-180")} />
                  {sortBy === 'name' ? 'Nome' : sortBy === 'updatedAt' ? 'Atualizado' : 'Criado'}
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 border border-stroke rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={<Archive className="h-12 w-12 text-text-dim" />}
              title="Nenhum projeto encontrado"
              description={
                searchQuery.trim()
                  ? "Tente ajustar os filtros de busca para encontrar seus projetos."
                  : "Comece criando seu primeiro projeto para organizar suas ideias."
              }
              action={
                !searchQuery.trim() ? (
                  <Button onClick={onNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {filteredProjects.map((project) => (
                <ProjectTile
                  key={project.id}
                  project={project}
                  onOpen={onProjectOpen}
                  onRename={onProjectRename}
                  onDuplicate={onProjectDuplicate}
                  onArchive={onProjectArchive}
                  onDelete={onProjectDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProjectsPage.displayName = 'ProjectsPage';

export { ProjectsPage };


