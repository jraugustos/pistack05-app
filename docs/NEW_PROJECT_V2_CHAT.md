# Nova Experiência de Criação de Projetos - Versão Chat (v2)

## 📋 Visão Geral

Implementação de uma experiência conversacional para criação de novos projetos, transformando o formulário tradicional em um fluxo de chat guiado e interativo.

## 🎯 Objetivos

- **UX mais amigável**: Interface conversacional menos intimidadora que formulários
- **Guiado**: Usuário sabe exatamente o que fazer em cada etapa
- **Validação progressiva**: Erros detectados cedo no processo
- **Engajamento**: Sensação de diálogo aumenta a conexão com o produto
- **Mobile-friendly**: Interface simplificada e adaptada para dispositivos móveis

## 📂 Estrutura de Arquivos

```
src/
├── app/
│   └── projects/
│       ├── new/                        # V1 - Formulário tradicional
│       │   └── page.tsx
│       └── new-v2/                     # V2 - Chat conversacional ✨
│           └── page.tsx
│
├── components/
│   ├── chat/                           # Novos componentes de chat
│   │   ├── ChatBubble.tsx              # Bolha de mensagem individual
│   │   ├── ChatInput.tsx               # Input de chat com envio
│   │   ├── ChatMessage.tsx             # Mensagem completa (bot/usuário)
│   │   ├── TypewriterText.tsx          # Efeito de digitação
│   │   ├── ConversationFlow.tsx        # Orquestrador do fluxo
│   │   └── index.ts
│   │
│   └── molecules/
│       ├── TypingIndicator.tsx         # Indicador "digitando..."
│       └── ProjectCreationLoader.tsx   # Loading animado de criação
```

## 🎭 Fluxo Conversacional

### 1. Boas-vindas
```
🤖 "Olá! Vou te ajudar a criar um novo projeto.
    Vamos começar?"
    
    [Sim, vamos lá!] [Cancelar]
```

### 2. Seleção de Tipo
```
🤖 "O que vamos criar hoje?"

[Cards clicáveis com templates]
- Site/App
- Mobile App
- API/Service
- Landing Page
```

### 3. Confirmação do Tipo
```
🤖 "Perfeito! Vamos criar um Site/App 🎉"
    [Features e etapas do template]
```

### 4. Descrição do Projeto
```
🤖 "Agora me conta: qual é a sua ideia?
    Descreva brevemente o que você quer construir."
    
    [Textarea com 500 caracteres]
    [Pular essa etapa] [Enviar]
```

### 5. Confirmação da Descrição
```
👤 "Uma plataforma de e-commerce para roupas..."

🤖 "Ótimo! Entendi que você quer criar:
    'Uma plataforma de e-commerce para roupas...'
    
    Está correto?"
    
    [Sim, continuar] [Editar]
```

### 6. Nome do Projeto
```
🤖 "Por último, como você quer chamar esse projeto?"
    
    [Input de texto]
    [Voltar] [Criar Projeto]
```

### 7. Resumo e Confirmação
```
🤖 "Perfeito! 'Loja de Roupas' é um ótimo nome! 🎉
    Vamos confirmar tudo:"
    
    [Card com resumo completo]
    - Nome: Loja de Roupas
    - Tipo: Site/App
    - Descrição: Uma plataforma de...
    
    [Criar Projeto ✨] [Cancelar]
```

### 8. Criação
```
    ✨ Criando seu projeto
       "Loja de Roupas"
       
    Preparando o canvas...
    [Spinner animado]
```

### 9. Redirecionamento
```
// Automático para /projects/{id}
```

## 🎨 Componentes Detalhados

### ChatBubble
Bolha de mensagem básica com suporte para bot e usuário.

**Props:**
```typescript
{
  message: string;
  sender: 'bot' | 'user';
  timestamp?: Date;
  className?: string;
}
```

**Estilo:**
- Bot: Lado esquerdo, fundo `bg-elev`, ícone `Sparkles`
- Usuário: Lado direito, gradiente `primary`

### ChatMessage
Mensagem completa com suporte para conteúdo adicional (cards, botões).

**Props:**
```typescript
{
  message: string;
  sender: 'bot' | 'user';
  timestamp?: Date;
  useTypewriter?: boolean;
  onTypewriterComplete?: () => void;
  children?: React.ReactNode;
}
```

### ChatInput
Input conversacional com auto-resize e suporte para multilinhas.

**Props:**
```typescript
{
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  multiline?: boolean;
}
```

**Funcionalidades:**
- Enter para enviar (Shift+Enter para nova linha em modo multiline)
- Auto-focus e auto-resize
- Contador de caracteres
- Botão de enviar com ícone

### TypewriterText
Efeito de digitação para mensagens do bot.

**Props:**
```typescript
{
  text: string;
  speed?: number; // ms por caractere (padrão: 30)
  onComplete?: () => void;
}
```

### TypingIndicator
Indicador animado de "digitando...".

**Animação:**
- 3 bolinhas com animação sequencial
- Loop infinito com framer-motion

### ProjectCreationLoader
Loading animado durante a criação do projeto.

**Funcionalidades:**
- Spinner animado com gradiente
- Pulsos de fundo
- Mensagem personalizada com nome do projeto

### ConversationFlow
Orquestrador principal do fluxo conversacional.

**Props:**
```typescript
{
  onComplete: (data: ProjectFormData) => void;
  onCancel: () => void;
}
```

**Estados:**
```typescript
enum ConversationStep {
  WELCOME = 'welcome',
  ASK_TYPE = 'ask_type',
  CONFIRM_TYPE = 'confirm_type',
  ASK_DESCRIPTION = 'ask_description',
  CONFIRM_DESCRIPTION = 'confirm_description',
  ASK_NAME = 'ask_name',
  CREATING = 'creating',
}
```

## 🎨 Design System

### Cores
```css
/* Bot messages */
background: var(--bg-elev)
border: var(--stroke)
color: var(--text)
icon: var(--primary)

/* User messages */
background: linear-gradient(135deg, var(--primary), #5A7CFF)
color: white
```

### Animações
```typescript
// Entrada de mensagem
{
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.3, ease: "easeOut" }
}

// Hover de card
{
  scale: 1.02,
  borderColor: "var(--primary)",
  transition: { duration: 0.2 }
}
```

## 🚀 Como Acessar

### Na Página de Projetos
Clique em "Novo Projeto" e escolha uma das opções:

1. **Formulário Completo** (v1)
   - Versão tradicional
   - Todos os campos visíveis
   - Rota: `/projects/new`

2. **Chat Guiado ✨** (v2 - Beta)
   - Experiência conversacional
   - Fluxo guiado por etapas
   - Rota: `/projects/new-v2`

### Acesso Direto
```
# V1 - Formulário
/projects/new

# V2 - Chat
/projects/new-v2
```

## 🔄 Integração com API

Ambas as versões usam o mesmo endpoint:

```typescript
POST /api/projects
{
  name: string;
  description?: string;
  template_id: ProjectTemplate;
  status: 'draft';
}

Response:
{
  project: {
    id: string;
    name: string;
    ...
  }
}
```

## ✅ Validações

### Nome do Projeto
- Mínimo: 3 caracteres
- Obrigatório

### Descrição
- Máximo: 500 caracteres
- Opcional

### Template
- Obrigatório
- Valores: 'site-app' | 'mobile-app' | 'api-service' | 'landing-page'

## 🎯 Vantagens da Versão Chat

| Aspecto | V1 (Formulário) | V2 (Chat) |
|---------|----------------|-----------|
| **Complexidade Visual** | Todos os campos visíveis | Um passo por vez |
| **Orientação** | Usuário precisa saber o que fazer | Guiado ativamente |
| **Feedback** | Validação no final | Validação progressiva |
| **Engajamento** | Formulário estático | Conversação dinâmica |
| **Mobile** | Muitos campos para scroll | Interface otimizada |
| **Onboarding** | Curva de aprendizado | Descoberta guiada |

## 📊 Métricas Sugeridas

Para avaliar qual versão performa melhor:

1. **Taxa de Conclusão**
   - % de usuários que completam a criação
   - Tempo médio para concluir

2. **Abandono por Etapa**
   - Em qual passo usuários desistem
   - Taxa de retorno após abandono

3. **Satisfação**
   - NPS após criação
   - Feedback qualitativo

4. **Erros**
   - Quantidade de erros de validação
   - Tentativas de correção

## 🔮 Melhorias Futuras

### Curto Prazo
- [ ] Adicionar animações mais ricas
- [ ] Suporte para upload de imagens
- [ ] Histórico de mensagens salvo
- [ ] Atalhos de teclado

### Médio Prazo
- [ ] IA para sugestões contextuais
- [ ] Templates dinâmicos baseados em respostas
- [ ] Pré-visualização em tempo real
- [ ] Modo voz (speech-to-text)

### Longo Prazo
- [ ] Assistente IA completo
- [ ] Análise de sentimento nas respostas
- [ ] Recomendações personalizadas
- [ ] Onboarding adaptativo

## 🐛 Troubleshooting

### Typewriter muito rápido/lento
Ajuste o prop `speed` no TypewriterText:
```typescript
<TypewriterText text={message} speed={50} /> // mais lento
```

### Mensagens não rolam automaticamente
Verifique se `messagesEndRef` está sendo usado corretamente:
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

### Cards não aparecem depois da mensagem
Certifique-se de que `showContent` está gerenciado corretamente:
```typescript
const [showContent, setShowContent] = useState(!useTypewriter);
```

## 📝 Notas de Implementação

- **Acessibilidade**: Todos os componentes suportam navegação por teclado
- **Performance**: Componentes são lazy-loaded quando possível
- **Responsividade**: Layout mobile-first com breakpoints em 768px e 1024px
- **i18n Ready**: Strings centralizadas para internacionalização futura

## 🎓 Aprendizados

1. **Framer Motion** é essencial para animações fluidas
2. **Auto-scroll** precisa ser gerenciado cuidadosamente
3. **Typewriter effect** adiciona muito à experiência
4. **Estado do fluxo** deve ser simples e previsível
5. **Validação progressiva** reduz frustração do usuário

---

**Desenvolvido com ❤️ para PIStack**

