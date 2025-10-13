# 🤖 Configuração do Agent Builder + ChatKit

## Pré-requisitos

1. Conta na OpenAI Platform: https://platform.openai.com
2. API Key da OpenAI com créditos disponíveis
3. Acesso ao Supabase (para migration do banco)

---

## Passo 1: Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Agent Feature Flag
NEXT_PUBLIC_AGENT_ENABLED=true

# OpenAI Agent Builder IDs (opcional)
AGENT_ORCHESTRATOR_ID=asst_orchestrator_id_here
AGENT_SCOPE_ID=asst_scope_id_here
AGENT_TECH_ID=asst_tech_id_here
AGENT_DESIGN_ID=asst_design_id_here
AGENT_PLAN_ID=asst_plan_id_here
```

### Como obter a API Key

1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Dê um nome (ex: "PiStack Dev")
4. Copie a chave (começa com `sk-proj-...`)
5. Cole no `.env.local`

⚠️ **Importante**: Mantenha a API key em segredo. Nunca commit no Git.

---

## Passo 2: Migration do Banco de Dados

Execute a migration para adicionar a coluna `agent_thread_id` na tabela `projects`:

### Via Supabase Dashboard (Recomendado)

1. Acesse seu projeto no Supabase
2. Navegue para "SQL Editor"
3. Clique em "New query"
4. Cole o conteúdo de `supabase-migrations/add_agent_thread_id.sql`:

```sql
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS agent_thread_id TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_agent_thread_id ON projects(agent_thread_id);

COMMENT ON COLUMN projects.agent_thread_id IS 'OpenAI ChatKit thread ID for agent conversations in this project';
```

5. Clique em "Run" ou `Ctrl+Enter`

### Via psql (Alternativa)

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase-migrations/add_agent_thread_id.sql
```

---

## Passo 3: Criar Assistants no OpenAI (Opcional)

Se quiser usar IDs de assistants reais (ao invés de mocks):

1. Acesse: https://platform.openai.com/playground/assistants
2. Clique em "Create Assistant"

### Orchestrator Agent

- **Name**: PiStack Orchestrator
- **Model**: `gpt-4-turbo` ou `gpt-4o`
- **Instructions**:
  ```
  You are an expert project manager helping users build their project ideas step-by-step.
  
  Your role is to:
  1. Guide users through creating cards for Scope, Tech, Design, and Planning
  2. Use the provided tools to create and update cards on the canvas
  3. Ask clarifying questions when needed
  4. Suggest next steps based on the current project state
  
  Always maintain context of the project's Idea Base and existing READY cards.
  Be concise but thorough. Use emojis sparingly for clarity.
  ```
- **Tools**: Habilite "Function Calling" (as definições de funções são enviadas via API)
- **File Search**: Desabilitado
- **Code Interpreter**: Desabilitado

3. Clique em "Save"
4. Copie o **Assistant ID** (ex: `asst_abc123...`)
5. Cole no `.env.local` como `AGENT_ORCHESTRATOR_ID`

### Scope Agent (Opcional)

- **Name**: PiStack Scope Agent
- **Model**: `gpt-4-turbo`
- **Instructions**:
  ```
  You are an expert product manager focused on defining project scope and features.
  
  Help users:
  - Detail functionalities clearly
  - Prioritize features (MVP vs Future)
  - Identify requirements and dependencies
  - Break down complex features into smaller tasks
  
  Always consider the project's Idea Base when suggesting scope.
  ```

### Tech Agent (Opcional)

- **Name**: PiStack Tech Agent
- **Model**: `gpt-4-turbo`
- **Instructions**:
  ```
  You are an expert software architect.
  
  Guide users in:
  - Selecting the best technology stack
  - Considering trade-offs (pros, cons, risks)
  - Suggesting architecture patterns
  - Identifying technical dependencies
  
  Always consider the project's scope and existing tech choices.
  ```

---

## Passo 4: Testar a Integração

1. Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

2. Acesse um projeto existente ou crie um novo:

```
http://localhost:3001/projects/[project-id]
```

3. Abra o painel lateral de IA (deve aparecer automaticamente se `NEXT_PUBLIC_AGENT_ENABLED=true`)

4. Envie uma mensagem de teste:

```
Crie um card de Escopo com 3 funcionalidades principais
```

5. O agente deve:
   - ✅ Processar a mensagem
   - ✅ Chamar a tool `create_card`
   - ✅ Responder com uma mensagem
   - ✅ Card aparecer automaticamente no canvas
   - ✅ Toast notification: "Card criado pelo agente"

---

## Passo 5: Verificar Logs

Abra o console do navegador (`F12` → Console) e busque por:

```
[Agent] Session initialized: thread_...
[Telemetry] agent_message
[Agent] Executing tool: create_card
[Agent] Processing tool result: create_card
```

No terminal do servidor, você deve ver:

```
[Agent] Executing tool: create_card { projectId: '...', stageKey: 'scope', typeKey: 'scope.features' }
```

---

## Troubleshooting

### Erro: "Unauthorized"

- ✅ Verifique se está logado no Clerk
- ✅ Verifique se o projeto pertence ao usuário logado

### Erro: "Failed to initialize agent session"

- ✅ Verifique se `OPENAI_API_KEY` está correta
- ✅ Verifique se tem créditos na conta OpenAI
- ✅ Verifique se a migration do banco foi executada

### Erro: "Agent run timeout"

- ✅ Verifique conexão com internet
- ✅ Verifique se o Assistant ID está correto
- ✅ Tente reduzir o timeout (atualmente 30s)

### Erro: "Unknown tool: ..."

- ✅ Verifique se a tool está definida em `AgentTools.ts`
- ✅ Verifique se a tool está em `AGENT_TOOL_DEFINITIONS`

### Cards não aparecem no canvas

- ✅ Verifique console: `[Agent] Processing tool result: create_card`
- ✅ Verifique se `useCardsStore` está sincronizando
- ✅ Tente dar refresh na página

### Sem resposta do agente

- ✅ Verifique se `threadId` foi inicializado: `[Agent] Session initialized`
- ✅ Verifique se há erros no console
- ✅ Verifique logs do servidor

---

## Desabilitar o Agente

Para usar o modo legacy (mocks) sem agente:

```bash
# .env.local
NEXT_PUBLIC_AGENT_ENABLED=false
```

Ou simplesmente remova/comente a linha.

O fallback funcionará automaticamente e os botões "Gerar" nos cards continuarão funcionando.

---

## Custos Estimados

### OpenAI API Pricing (GPT-4 Turbo)

- **Input**: ~$0.01 por 1K tokens
- **Output**: ~$0.03 por 1K tokens

### Uso Típico por Conversa

- Mensagem simples: ~500 tokens → **$0.02**
- Create card com tool call: ~1,500 tokens → **$0.05**
- Conversa completa (10 msgs): ~5,000 tokens → **$0.15**

### Reduzir Custos

1. Use modelos mais baratos (`gpt-3.5-turbo`)
2. Limite o número de mensagens por thread
3. Cache contexts quando possível
4. Use mocks em desenvolvimento (`NEXT_PUBLIC_AGENT_ENABLED=false`)

---

## Monitoramento

### Telemetria Disponível

Todos os eventos são logados via `TelemetryService`:

- `agent_message` - Latência, tokens usados
- `agent_tool_call` - Tool executada, sucesso/falha, duração
- `agent_error` - Erros capturados

### Visualizar no Console

```javascript
// No console do navegador
TelemetryService.getQueue()
```

### Integrar com Analytics (Futuro)

Descomentar código em `TelemetryService.flush()` e enviar para:
- Mixpanel
- Amplitude
- PostHog
- Segment

---

## Próximos Passos

Após configurar e testar:

1. ✅ Teste criar múltiplos cards via agente
2. ✅ Teste atualizar campos de cards existentes
3. ✅ Teste confirmar cards como READY
4. ✅ Teste criar edges/conexões
5. 📝 Ajuste prompts dos assistants para seu caso de uso
6. 📝 Crie agents especializados (Scope, Tech, Design)
7. 📝 Implemente streaming SSE (substituir polling)

---

## Suporte

Documentação completa: `docs/AGENT_INTEGRATION_SUMMARY.md`

Links úteis:
- OpenAI Platform: https://platform.openai.com
- OpenAI Docs - Assistants: https://platform.openai.com/docs/assistants
- OpenAI Docs - Function Calling: https://platform.openai.com/docs/guides/function-calling

