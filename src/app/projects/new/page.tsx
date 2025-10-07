'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Layout, Code, BookOpen, FolderOpen, CheckCircle } from 'lucide-react';
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Chip } from '@/components/foundation';
import { cn } from '@/lib/utils';
import type { Project, ProjectTemplate } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '' as ProjectTemplate | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const selectedTemplate = templates.find(t => t.id === formData.template_id);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.template_id) {
      newErrors.template_id = 'Template é obrigatório';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          template_id: formData.template_id,
          status: 'draft',
          seed: {
            ideaBase: {
              name: formData.name.trim(),
              pitch: formData.description.trim() || undefined,
              description: formData.description.trim() || undefined,
            }
          }
        }),
      });

      let payload:any = null;
      try { payload = await response.json(); } catch {}
      if (!response.ok && !payload?.project) {
        throw new Error(payload?.error || `Erro ao criar projeto (status ${response.status})`);
      }
      const project = payload?.project || { id: 'dev-project' };
      
      // Redirecionar para o canvas do projeto com onboarding
      router.push(`/projects/${project.id}?onboarding=1`);
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      setErrors({ submit: err instanceof Error ? err.message : 'Erro ao criar projeto' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="relative border-b border-stroke bg-gradient-to-r from-bg-elev via-bg-soft to-bg-elev">
        {/* Gradient overlay for extra depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 hover:bg-bg-soft/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-stroke-strong" />
            <div>
              <h1 className="text-2xl font-bold text-text">Novo Projeto</h1>
              <p className="text-sm text-text-dim mt-1">Crie um novo projeto e comece a transformar sua ideia em realidade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-text">Informações Básicas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
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
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <Layout className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-text">Escolha um Template</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Template *
              </label>
              <Select value={formData.template_id} onValueChange={(value) => handleInputChange('template_id', value)}>
                <SelectTrigger className="w-full h-12 bg-bg-elev border-stroke hover:border-stroke-strong focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Selecione um template para seu projeto">
                    {selectedTemplate && (
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/20 text-primary rounded-md">
                          {selectedTemplate.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-text">{selectedTemplate.name}</div>
                          <div className="text-xs text-text-dim">{selectedTemplate.description}</div>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-bg-elev border-stroke shadow-xl">
                  {templates.map((template) => (
                    <SelectItem 
                      key={template.id} 
                      value={template.id}
                      className="hover:bg-bg-soft focus:bg-bg-soft cursor-pointer"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <div className="p-1.5 bg-primary/20 text-primary rounded-md">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-text">{template.name}</div>
                          <div className="text-xs text-text-dim">{template.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.template_id && (
                <p className="text-sm text-danger mt-2">{errors.template_id}</p>
              )}
            </div>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/20 text-success rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-text">Estrutura do Template</h2>
              </div>
              
              <div className="border border-stroke rounded-xl p-6 bg-bg-elev">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/20 text-primary rounded-lg">
                    {selectedTemplate.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text text-lg">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-text-dim">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">Funcionalidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.features.map((feature) => (
                        <Badge key={feature} status="draft" className="text-xs px-2 py-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stages */}
                  <div>
                    <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">Etapas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.stages.map((stage) => (
                        <Chip key={stage} variant="could" className="text-xs px-2 py-1">
                          {stage}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-stroke">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.name.trim() || !formData.template_id}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Criar Projeto
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
