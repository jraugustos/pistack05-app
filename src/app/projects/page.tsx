'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Grid, List, SortAsc, SortDesc, FolderOpen } from 'lucide-react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/foundation';
import { ProjectTile } from '@/components/molecules';
// Removed NewProjectModal import - using dedicated page instead
import { EmptyState } from '@/components/foundation';
import { cn } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/types';

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'status' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Removed modal state - using dedicated page instead
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Função para buscar projetos
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/projects?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Usuário não autenticado, redirecionar para home
          router.push('/');
          return;
        }
        throw new Error('Erro ao carregar projetos');
      }

      const data: ProjectsResponse = await response.json();
      setProjects(data.projects || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      });
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, sortBy, sortOrder, router]);

  // Buscar projetos quando os filtros mudarem
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Project creation moved to dedicated page /projects/new

  // Função para abrir projeto
  const handleOpenProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  // Função para renomear projeto
  const handleRenameProject = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Erro ao renomear projeto');
      }

      // Atualizar lista de projetos
      await fetchProjects();
    } catch (err) {
      console.error('Erro ao renomear projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao renomear projeto');
    }
  };

  // Função para arquivar projeto
  const handleArchiveProject = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;

      const newStatus = project.status === 'archived' ? 'active' : 'archived';
      
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao arquivar projeto');
      }

      // Atualizar lista de projetos
      await fetchProjects();
    } catch (err) {
      console.error('Erro ao arquivar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao arquivar projeto');
    }
  };

  // Função para deletar projeto
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir projeto');
      }

      // Atualizar lista de projetos
      await fetchProjects();
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir projeto');
    }
  };

  const getTemplateDisplayName = (templateId: string) => {
    const templates: Record<string, string> = {
      'site-app': 'Site/App',
      'mobile-app': 'Mobile App',
      'api-service': 'API/Service',
      'landing-page': 'Landing Page'
    };
    return templates[templateId] || templateId;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-stroke rounded w-48"></div>
            <div className="h-12 bg-stroke rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 bg-stroke rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Meus Projetos</h1>
            <p className="text-text-dim mt-1">
              {pagination.total} projeto{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Button
            onClick={() => router.push('/projects/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-dim" />
              <Input
                placeholder="Buscar projetos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Atualizado</SelectItem>
              <SelectItem value="created_at">Criado</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="gap-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>

          {/* View Mode */}
          <div className="flex border border-stroke rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && projects.length === 0 && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 && !loading ? (
          <EmptyState
            icon={<FolderOpen className="h-8 w-8" />}
            title={search || statusFilter !== 'all' ? "Nenhum projeto encontrado" : "Nenhum projeto encontrado"}
            description={
              search || statusFilter !== 'all'
                ? "Tente ajustar os filtros para encontrar seus projetos."
                : "Comece criando seu primeiro projeto para transformar ideias em realidade."
            }
            action={
              !search && statusFilter === 'all' && !error ? {
                label: "Criar Primeiro Projeto",
                onClick: () => router.push('/projects/new')
              } : undefined
            }
          />
        ) : projects.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid'
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {projects.map((project) => (
              <ProjectTile
                key={project.id}
                id={project.id}
                name={project.name}
                status={project.status}
                updatedAt={project.updated_at}
                template={getTemplateDisplayName(project.template_id)}
                onOpen={handleOpenProject}
                onRename={handleRenameProject}
                onArchive={handleArchiveProject}
                onDelete={handleDeleteProject}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            ))}
          </div>
        ) : null}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            
            <span className="text-text-dim px-4">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Modal removed - using dedicated page instead */}
    </div>
  );
}
