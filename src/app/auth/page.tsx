'use client';

import { Button } from '@/components/foundation/Button';
import { Input } from '@/components/foundation/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/foundation/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/foundation/Tabs';
import { useState } from 'react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular login
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular registro
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">PIStack</h1>
          <p className="text-text-dim">Sua plataforma de gestão de projetos</p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Entre na sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-text">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-text">
                      Senha
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    isLoading={isLoading}
                  >
                    Entrar
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-text">
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email-register" className="text-sm font-medium text-text">
                      Email
                    </label>
                    <Input
                      id="email-register"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password-register" className="text-sm font-medium text-text">
                      Senha
                    </label>
                    <Input
                      id="password-register"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    isLoading={isLoading}
                  >
                    Criar conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
