'use client';

import { Button } from '@/components/foundation';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Sparkles, LayoutDashboard, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-text leading-tight tracking-tighter">
            Transforme Suas Ideias em Projetos Reais
          </h1>
          <p className="text-xl text-text-dim max-w-2xl mx-auto">
            Transforme suas ideias em planos acionáveis com IA e templates guiados.
            Planeje, execute e realize seus projetos com confiança.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/post-auth">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Começar Agora
              </Button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/projects">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Meus Projetos
              </Button>
            </Link>
          </SignedIn>
          
          <Link href="/design-system">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
              Ver Design System
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text">IA Inteligente</h3>
            <p className="text-text-dim">
              Gere ideias, expanda conceitos e revise conteúdos com a ajuda da nossa IA.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto">
              <LayoutDashboard className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-text">Templates Guiados</h3>
            <p className="text-text-dim">
              Utilize templates pré-definidos para estruturar seus projetos rapidamente.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center mx-auto">
              <Rocket className="h-6 w-6 text-info" />
            </div>
            <h3 className="text-xl font-semibold text-text">Execução Rápida</h3>
            <p className="text-text-dim">
              Transforme planos em ações com um fluxo de trabalho otimizado e eficiente.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
