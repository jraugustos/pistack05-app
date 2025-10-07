'use client';

import { useState } from 'react';

export default function ProjectsPageSimple() {
  const [projects] = useState([]);

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Meus Projetos</h1>
            <p className="text-text-dim mt-1">
              {projects.length} projeto{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-bg-elev text-text-dim">
              📁
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text">Nenhum projeto encontrado</h3>
              <p className="text-sm text-text-dim max-w-md">
                Comece criando seu primeiro projeto para transformar ideias em realidade.
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary bg-gradient-to-br from-[#4A6CF7] to-[#7A9FFF] text-white hover:from-[#5A7CFF] hover:to-[#8AAFFF] active:from-[#3A5CE7] active:to-[#6A8FEF] shadow-lg hover:shadow-xl h-10 px-6">
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div>Projetos aqui</div>
        )}
      </div>
    </div>
  );
}
