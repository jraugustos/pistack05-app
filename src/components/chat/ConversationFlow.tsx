'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from '@/components/molecules/TypingIndicator';
import { ProjectCreationLoader } from '@/components/molecules/ProjectCreationLoader';
import { Button } from '@/components/foundation';
import { Layout, Code, BookOpen, FolderOpen, CheckCircle, ArrowLeft, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectTemplate } from '@/types';

export interface ConversationFlowProps {
  onComplete: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export interface ProjectFormData {
  template_id: ProjectTemplate;
  description: string;
  name: string;
}

enum ConversationStep {
  WELCOME = 'welcome',
  ASK_TYPE = 'ask_type',
  CONFIRM_TYPE = 'confirm_type',
  ASK_DESCRIPTION = 'ask_description',
  CONFIRM_DESCRIPTION = 'confirm_description',
  ASK_NAME = 'ask_name',
  CREATING = 'creating',
}

interface Message {
  id: string;
  content: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  useTypewriter?: boolean;
  component?: React.ReactNode;
}

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

export const ConversationFlow: React.FC<ConversationFlowProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = React.useState<ConversationStep>(ConversationStep.WELCOME);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<ProjectFormData>>({});
  const [showInput, setShowInput] = React.useState(false);
  const [inputPlaceholder, setInputPlaceholder] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  // Evita iniciar a conversa duas vezes em dev (React StrictMode re-render)
  const hasStartedRef = React.useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    // Iniciar conversa
    startConversation();
  }, []);

  const addMessage = (content: string, sender: 'bot' | 'user', useTypewriter = false, component?: React.ReactNode) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      content,
      sender,
      timestamp: new Date(),
      useTypewriter,
      component,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (content: string, useTypewriter = true, component?: React.ReactNode, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(content, 'bot', useTypewriter, component);
    }, delay);
  };

  const startConversation = () => {
    const welcomeComponent = (
      <div className="flex gap-3 mt-2">
        <Button
          variant="primary"
          size="md"
          onClick={() => moveToStep(ConversationStep.ASK_TYPE)}
          className="flex-1"
        >
          Sim, vamos lá! ✨
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    );

    addBotMessage(
      'Olá! Vou te ajudar a criar um novo projeto.\n\nVamos começar?',
      true,
      welcomeComponent
    );
  };

  const moveToStep = (nextStep: ConversationStep) => {
    setStep(nextStep);

    switch (nextStep) {
      case ConversationStep.ASK_TYPE:
        askProjectType();
        break;
      case ConversationStep.ASK_DESCRIPTION:
        askDescription();
        break;
      case ConversationStep.ASK_NAME:
        askName();
        break;
      case ConversationStep.CREATING:
        createProject();
        break;
    }
  };

  const askProjectType = () => {
    const templateCards = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 w-full">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectTemplate(template.id, template.name)}
            className={cn(
              "border rounded-xl p-4 cursor-pointer transition-all",
              "bg-bg-elev border-stroke hover:border-primary/50",
              "hover:shadow-lg hover:bg-bg-soft"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                {template.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text">{template.name}</h4>
                <p className="text-xs text-text-dim mt-0.5">{template.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );

    addBotMessage('O que vamos criar hoje?\n\nEscolha um tipo de projeto para começar.', true, templateCards);
  };

  const selectTemplate = (templateId: ProjectTemplate, templateName: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId)!;
    
    setFormData(prev => ({ ...prev, template_id: templateId }));
    addMessage(`${templateName}`, 'user');

    const stagesList = selectedTemplate.stages.join(', ');
    const featuresList = selectedTemplate.features.join(', ');

    const confirmComponent = (
      <div className="mt-2 p-4 bg-bg-elev border border-stroke rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 text-primary rounded-lg">
            {selectedTemplate.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-text">{selectedTemplate.name}</h4>
            <p className="text-xs text-text-dim">{selectedTemplate.description}</p>
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="text-sm text-text">
            <span className="text-text-dim">Como funcionam as etapas:</span>{' '}
            Você será guiado pelo canvas passando por {stagesList}. Em cada etapa coletamos o essencial para estruturar o projeto.
          </div>
          <div className="text-sm text-text">
            <span className="text-text-dim">O que você recebe de funcionalidades:</span>{' '}
            geramos um plano de trabalho com itens como {featuresList}. Você poderá priorizar e ajustar depois.
          </div>
        </div>
        <p className="text-xs text-text-dim mt-2">Você pode ver e editar todos os detalhes no canvas após a criação.</p>
      </div>
    );

    addBotMessage(`Perfeito! Vamos criar um ${templateName} 🎉`, true, confirmComponent, 500);

    setTimeout(() => {
      moveToStep(ConversationStep.ASK_DESCRIPTION);
    }, 2000);
  };

  const askDescription = () => {
    setShowInput(true);
    setInputPlaceholder('Descreva sua ideia em poucas palavras...');
    
    const skipButton = (
      <div className="flex gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => skipDescription()}
        >
          Pular essa etapa
        </Button>
      </div>
    );

    addBotMessage(
      'Agora me conta: qual é a sua ideia?\n\nDescreva brevemente o que você quer construir.',
      true,
      skipButton,
      500
    );
  };

  const handleDescriptionSubmit = (description: string) => {
    setShowInput(false);
    setFormData(prev => ({ ...prev, description }));
    addMessage(description, 'user');

    const confirmComponent = (
      <div className="flex gap-2 mt-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => moveToStep(ConversationStep.ASK_NAME)}
        >
          Sim, continuar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editDescription()}
        >
          <Edit2 className="h-4 w-4" />
          Editar
        </Button>
      </div>
    );

    addBotMessage(
      `Ótimo! Entendi que você quer criar:\n\n"${description}"\n\nEstá correto?`,
      true,
      confirmComponent,
      500
    );
  };

  const skipDescription = () => {
    setShowInput(false);
    setFormData(prev => ({ ...prev, description: '' }));
    addMessage('Vou pular a descrição', 'user');
    
    addBotMessage('Sem problemas! Você pode adicionar depois.', true, null, 500);
    
    setTimeout(() => {
      moveToStep(ConversationStep.ASK_NAME);
    }, 1500);
  };

  const editDescription = () => {
    setShowInput(true);
    addBotMessage('Claro! Digite novamente a descrição:', true, null, 500);
  };

  const askName = () => {
    setShowInput(true);
    setInputPlaceholder('Ex: Meu E-commerce de Roupas');
    
    const backButton = (
      <div className="flex gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveToStep(ConversationStep.ASK_DESCRIPTION)}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    );

    addBotMessage(
      'Por último, como você quer chamar esse projeto?',
      true,
      backButton,
      500
    );
  };

  const handleNameSubmit = (name: string) => {
    setShowInput(false);
    setFormData(prev => ({ ...prev, name }));
    addMessage(name, 'user');

    const selectedTemplate = templates.find(t => t.id === formData.template_id);

    const summaryComponent = (
      <div className="mt-3 p-4 bg-bg-elev border border-primary/30 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          <h4 className="font-semibold text-text">Resumo do Projeto</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-text-dim">Nome:</span>{' '}
            <span className="text-text font-medium">{name}</span>
          </div>
          <div>
            <span className="text-text-dim">Tipo:</span>{' '}
            <span className="text-text font-medium">{selectedTemplate?.name}</span>
          </div>
          {formData.description && (
            <div>
              <span className="text-text-dim">Descrição:</span>{' '}
              <span className="text-text">{formData.description}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2 border-t border-stroke">
          <Button
            variant="primary"
            size="md"
            onClick={() => moveToStep(ConversationStep.CREATING)}
            className="flex-1"
          >
            Criar Projeto ✨
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );

    addBotMessage(
      `Perfeito! "${name}" é um ótimo nome! 🎉\n\nVamos confirmar tudo:`,
      true,
      summaryComponent,
      500
    );
  };

  const createProject = () => {
    setShowInput(false);
    setIsTyping(false);
    
    // Call parent's onComplete with the form data
    const payload: ProjectFormData = {
      name: (formData.name || 'Novo Projeto') as string,
      description: (formData.description || '') as string,
      template_id: (formData.template_id || 'site-app') as ProjectTemplate,
    };
    onComplete(payload);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-8 md:py-10">
        <div className="mx-auto max-w-3xl px-4 md:px-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.content}
                sender={message.sender}
                timestamp={message.timestamp}
                useTypewriter={message.useTypewriter}
              >
                {message.component}
              </ChatMessage>
            ))}
            
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {showInput && !isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg"
        >
          <div className="mx-auto max-w-3xl px-4 md:px-6 py-4">
            <ChatInput
              onSend={step === ConversationStep.ASK_NAME ? handleNameSubmit : handleDescriptionSubmit}
              placeholder={inputPlaceholder}
              multiline={step === ConversationStep.ASK_DESCRIPTION}
              maxLength={step === ConversationStep.ASK_DESCRIPTION ? 500 : 100}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

