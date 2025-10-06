import * as React from 'react';
import { MoreHorizontal, Calendar, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/foundation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/foundation';
import { IconButton } from '@/components/foundation';
import { cn } from '@/lib/utils';

export interface ProjectTileProps {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  updatedAt: string | Date;
  template?: string;
  progress?: number; // 0-100
  onOpen: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const ProjectTile = React.forwardRef<HTMLDivElement, ProjectTileProps>(
  (
    {
      id,
      name,
      status,
      updatedAt,
      template = 'Site/App',
      progress = 0,
      onOpen,
      onRename,
      onDuplicate,
      onArchive,
      onDelete,
      className,
    },
    ref
  ) => {
    const formatDate = (date: string | Date) => {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const getStatusVariant = (status: ProjectTileProps['status']) => {
      switch (status) {
        case 'active':
          return 'ready';
        case 'draft':
          return 'draft';
        case 'archived':
          return 'default';
        default:
          return 'draft';
      }
    };

    const getStatusLabel = (status: ProjectTileProps['status']) => {
      switch (status) {
        case 'active':
          return 'Ativo';
        case 'draft':
          return 'Rascunho';
        case 'archived':
          return 'Arquivado';
        default:
          return 'Rascunho';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-bg-elev border border-stroke rounded-lg p-4 hover:border-primary/50 transition-all duration-200 cursor-pointer',
          'hover:shadow-1 hover:-translate-y-0.5',
          className
        )}
        onClick={() => onOpen(id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-text truncate">{name}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge status={getStatusVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <IconButton
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename?.(id, name); }}>
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(id); }}>
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onArchive?.(id); }}
                  className="text-warning"
                >
                  {status === 'archived' ? 'Desarquivar' : 'Arquivar'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                  className="text-danger"
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Template */}
        <div className="text-xs text-text-dim mb-3">
          {template}
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-text-dim mb-1">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-stroke rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-text-dim">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Atualizado em {formatDate(updatedAt)}</span>
          </div>
        </div>
      </div>
    );
  }
);

ProjectTile.displayName = 'ProjectTile';

export { ProjectTile };


