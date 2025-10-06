import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Input, Textarea, Select, Badge, Chip } from '@/components/foundation';
import { Modal } from '@/components/foundation';
import { 
  Plus, 
  Sparkles, 
  FolderOpen, 
  Lightbulb, 
  BookOpen, 
  Layout, 
  Code,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Project, ProjectTemplate } from '@/types';

export interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Partial<Project>) => void;
  isLoading?: boolean;
}

const NewProjectModal = React.forwardRef<HTMLDivElement, NewProjectModalProps>(
  (
    {
      isOpen,
      onClose,
      onCreate,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    const [formData, setFormData] = React.useState({
      name: '',
      description: '',
      template: 'site-app' as ProjectTemplate,
      category: 'web' as 'web' | 'mobile' | 'desktop' | 'api' | 'other',
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const templates = [
      {
        id: 'site-app' as ProjectTemplate,
        name: 'Site/App',
        description: 'Aplicação web completa com frontend e backend',
        icon: <Layout className="h-5 w-5" />,
        features: ['Frontend', 'Backend', 'Database', 'Deploy'],
        stages: ['Ideia Base', 'Entendimento', 'Escopo', 'Design', 'Tecnologia', 'Planejamento']
      },
      {
        id: 'mobile-app' as ProjectTemplate,
        name: 'Mobile App',
        description: 'Aplicativo móvel nativo ou híbrido',
        icon: <Code className="h-5 w-5" />,
        features: ['iOS/Android', 'API', 'Push Notifications', 'Offline'],
        stages: ['Ideia Base', 'Entendimento', 'Escopo', 'Design', 'Tecnologia', 'Planejamento']
      },
      {
        id: 'api-service' as ProjectTemplate,
        name: 'API/Service',
        description: 'Serviço ou API para integração',
        icon: <BookOpen className="h-5 w-5" />,
        features: ['REST API', 'Database', 'Authentication', 'Documentation'],
        stages: ['Ideia Base', 'Entendimento', 'Escopo', 'Tecnologia', 'Planejamento']
      },
      {
        id: 'landing-page' as ProjectTemplate,
        name: 'Landing Page',
        description: 'Página de destino para marketing',
        icon: <FolderOpen className="h-5 w-5" />,
        features: ['Design', 'Forms', 'Analytics', 'SEO'],
        stages: ['Ideia Base', 'Entendimento', 'Escopo', 'Design', 'Tecnologia']
      }
    ];

    const categories = [
      { id: 'web', name: 'Web', icon: <Layout className="h-4 w-4" /> },
      { id: 'mobile', name: 'Mobile', icon: <Code className="h-4 w-4" /> },
      { id: 'desktop', name: 'Desktop', icon: <FolderOpen className="h-4 w-4" /> },
      { id: 'api', name: 'API', icon: <BookOpen className="h-4 w-4" /> },
      { id: 'other', name: 'Outro', icon: <Lightbulb className="h-4 w-4" /> },
    ];

    const selectedTemplate = templates.find(t => t.id === formData.template);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      }

      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      onCreate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        template: formData.template,
        category: formData.category,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        template: 'site-app',
        category: 'web',
      });
      setErrors({});
    };

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        title="Novo Projeto"
        className="max-w-2xl"
        {...props}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Informações Básicas
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nome do Projeto *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: E-commerce de Roupas"
                  error={errors.name}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Descrição (opcional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva brevemente o projeto..."
                  rows={3}
                  error={errors.description}
                  className="w-full"
                />
                <p className="text-xs text-text-dim mt-1">
                  {formData.description.length}/500 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      variant={formData.category === category.id ? 'must' : 'could'}
                      onClick={() => handleInputChange('category', category.id)}
                      className="cursor-pointer"
                    >
                      {category.icon}
                      <span className="ml-1">{category.name}</span>
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Escolha um Template
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all",
                    formData.template === template.id
                      ? "border-primary bg-primary/5"
                      : "border-stroke hover:border-primary/50"
                  )}
                  onClick={() => handleInputChange('template', template.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      formData.template === template.id
                        ? "bg-primary/20 text-primary"
                        : "bg-bg-elev text-text-dim"
                    )}>
                      {template.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-text">{template.name}</h4>
                        {formData.template === template.id && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-text-dim mb-3">{template.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-text-dim mb-1">Funcionalidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature) => (
                              <Badge key={feature} status="DRAFT" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-text-dim mb-1">Etapas:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.stages.map((stage) => (
                              <Chip key={stage} variant="should" className="text-xs">
                                {stage}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedTemplate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Preview do Projeto
              </h3>
              
              <div className="border border-stroke rounded-lg p-4 bg-bg-elev">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg">
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">
                      {formData.name || 'Nome do Projeto'}
                    </h4>
                    <p className="text-sm text-text-dim">
                      {formData.description || 'Descrição do projeto...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-text-dim">
                  <span className="flex items-center gap-1">
                    <Badge status="DRAFT">Rascunho</Badge>
                  </span>
                  <span>Template: {selectedTemplate.name}</span>
                  <span>Categoria: {categories.find(c => c.id === formData.category)?.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.name.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Projeto
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
);

NewProjectModal.displayName = 'NewProjectModal';

export { NewProjectModal };


