'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/foundation';
import { ConversationFlow, ProjectFormData } from '@/components/chat';
import { ProjectCreationLoader } from '@/components/molecules/ProjectCreationLoader';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewProjectV2Page() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleComplete = async (data: ProjectFormData) => {
    if (!data || typeof data !== 'object') return;
    const safeName = data.name?.trim?.() || 'Novo Projeto';
    const safeDesc = data.description?.trim?.() || undefined;
    const safeTemplate = data.template_id || 'site-app';
    setIsCreating(true);
    setProjectName(safeName);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: safeName,
          description: safeDesc,
          template_id: safeTemplate,
          status: 'draft',
          seed: {
            ideaBase: {
              name: safeName,
              pitch: safeDesc,
              description: safeDesc,
            }
          }
        }),
      });

      let payload: any = null;
      try { payload = await response.json(); } catch {}
      if (!response.ok && !payload?.project) {
        throw new Error(payload?.error || `Erro ao criar projeto (status ${response.status})`);
      }
      const project = payload?.project || { id: 'dev-project' };
      
      // Pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirecionar para o canvas do projeto
      router.push(`/projects/${project.id}?onboarding=1`);
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      setIsCreating(false);
      // TODO: Adicionar toast de erro
      alert('Erro ao criar projeto. Tente novamente.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="relative border-b border-stroke flex-shrink-0">
        {/* Gradient com personalidade (similar ao card) */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_-10%_-50%,_rgba(122,162,255,0.25),_transparent_60%),radial-gradient(800px_300px_at_110%_-10%,_rgba(138,211,255,0.18),_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2 hover:bg-bg-soft/50"
              disabled={isCreating}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-stroke-strong" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-lg shadow-[0_0_0_1px_rgba(122,162,255,0.25)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-text">Novo Projeto</h1>
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                    v2 Chat
                  </span>
                </div>
                <p className="text-sm text-text-dim mt-1">
                  Vamos criar seu projeto através de uma conversa guiada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-10 pb-10">
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <ProjectCreationLoader projectName={projectName} />
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <ConversationFlow onComplete={handleComplete} onCancel={handleCancel} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

