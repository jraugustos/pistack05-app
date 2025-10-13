# Resumo da Integração Agent Builder + ChatKit

## ✅ Implementado

### 1. Session Management (`/api/agent/session`)
- ✅ Endpoint POST criado em `src/app/api/agent/session/route.ts`
- ✅ Cria ou recupera threadId do OpenAI por projeto
- ✅ Persiste threadId na tabela `projects` (coluna `agent_thread_id`)
- ✅ Autenticação com Clerk
- ✅ Migration SQL criada em `supabase-migrations/add_agent_thread_id.sql`

### 2. Telemetria de Agente
- ✅ Adicionados 3 novos métodos em `TelemetryService.ts`:
  - `agentMessage()` - Track latência, tokens usados
  - `agentToolCall()` - Track execução de tools (sucesso/falha, duração)
  - `agentError()` - Track erros do agente
- ✅ Integrado em `/api/agent/message` para rastrear todas as operações

### 3. Tool Definitions OpenAI
- ✅ Exportado `AGENT_TOOL_DEFINITIONS` em `AgentTools.ts`
- ✅ 8 tools definidas no formato OpenAI Function Calling:
  1. `get_project_context`
  2. `create_card`
  3. `update_card_fields`
  4. `confirm_card_ready`
  5. `create_edge`
  6. `delete_edge`
  7. `get_ready_count`
  8. `generate_output`

### 4. OpenAI Agent Builder Real
- ✅ Atualizado `/api/agent/message` com integração completa:
  - Cria mensagem na thread (`openai.beta.threads.messages.create`)
  - Cria run com orchestrator agent (`openai.beta.threads.runs.create`)
  - Polling de status (30s timeout)
  - Processa tool calls:
    - Extrai function name e arguments
    - Executa via `AgentTools[toolName](args)`
    - Submete resultado (`submitToolOutputs`)
  - Retorna mensagens do assistente
  - Retorna `toolResults` para sincronizar frontend
  - Telemetria em cada etapa

### 5. Frontend - ThreadId e ToolResults
- ✅ Estado `agentThreadId` adicionado em `CanvasPage.tsx`
- ✅ useEffect para inicializar session ao montar componente
- ✅ `handleSendAgentMessage` atualizado:
  - Envia `threadId` no body
  - Processa `toolResults` do backend
  - Sincroniza `useCardsStore` para cada tool:
    - `create_card` → `addCard()`
    - `update_card_fields` → `updateCard()`
    - `confirm_card_ready` → `updateCard({ status: 'READY' })`
    - `create_edge` → `setEdges()`
  - Toast notifications para cada ação do agente

### 6. Delegação AIGenerationService
- ✅ Adicionado path via agente com feature flag em `AIGenerationService.ts`:
  - `generate()` verifica `NEXT_PUBLIC_AGENT_ENABLED`
  - Se habilitado, chama `generateViaAgent()`
  - Fallback seguro para `generateLegacy()` em caso de erro
  - Stub criado (integração completa requer threadId do frontend)

---

## 🔧 Como Usar

### 1. Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-proj-...

# Feature Flag do Agente
NEXT_PUBLIC_AGENT_ENABLED=true

# IDs dos Agentes (opcional - usar mock IDs se não tiver)
AGENT_ORCHESTRATOR_ID=ag_orchestrator_mock_id
AGENT_SCOPE_ID=ag_scope_mock_id
AGENT_TECH_ID=ag_tech_mock_id
AGENT_DESIGN_ID=ag_design_mock_id
AGENT_PLAN_ID=ag_plan_mock_id
```

### 2. Executar Migration do Banco

Execute a migration para adicionar a coluna `agent_thread_id`:

```bash
psql -h localhost -U postgres -d pistack -f supabase-migrations/add_agent_thread_id.sql
```

Ou via Supabase Dashboard:
- Acesse SQL Editor
- Cole o conteúdo de `supabase-migrations/add_agent_thread_id.sql`
- Execute

### 3. Criar Agente no OpenAI Platform

1. Acesse https://platform.openai.com/playground/assistants
2. Crie um novo Assistant (Orchestrator):
   - **Name**: PiStack Orchestrator
   - **Instructions**: "You are an expert project manager helping users build their project ideas. Guide them through creating cards for Scope, Tech, Design, and Planning. Use the provided tools to create and update cards on the canvas."
   - **Model**: gpt-4-turbo ou gpt-4o
   - **Tools**: Habilitar "Function Calling"
3. Copie o Assistant ID (ex: `asst_abc123...`)
4. Cole no `.env.local` como `AGENT_ORCHESTRATOR_ID`

### 4. Testar o Agente

1. Reinicie o servidor: `npm run dev`
2. Acesse um projeto: `http://localhost:3000/projects/[id]`
3. Abra o painel lateral de IA (se `NEXT_PUBLIC_AGENT_ENABLED=true`)
4. Envie uma mensagem: "Crie um card de Escopo com 3 funcionalidades"
5. O agente deve:
   - Processar a mensagem
   - Chamar tool `create_card`
   - Retornar resposta
   - Card aparecer no canvas automaticamente

### 5. Verificar Telemetria

Abra o console do navegador e busque por:
- `[Telemetry] agent_message`
- `[Telemetry] agent_tool_call`
- `[Agent] Executing tool: create_card`
- `[Agent] Processing tool result: create_card`

---

## 🧪 Testes Recomendados

### Teste 1: Session Initialization
1. Abrir projeto pela primeira vez
2. Console deve mostrar: `[Agent] Session initialized: thread_...`
3. Verificar no DB: `SELECT agent_thread_id FROM projects WHERE id = '...'`

### Teste 2: Create Card via Agent
1. Enviar mensagem: "Crie um card de Tech Stack"
2. Verificar:
   - Tool call executado: `[Agent] Executing tool: create_card`
   - Card criado no store
   - Card aparece no canvas
   - Toast: "Card criado pelo agente"

### Teste 3: Update Card via Agent
1. Enviar mensagem: "Adicione React e TypeScript no tech stack"
2. Verificar:
   - Tool call: `update_card_fields`
   - Card atualizado no store
   - Toast: "Card atualizado pelo agente"

### Teste 4: Confirm Ready via Agent
1. Enviar mensagem: "Confirme o card de Escopo como pronto"
2. Verificar:
   - Tool call: `confirm_card_ready`
   - Status do card muda para READY
   - Badge visual atualiza
   - Toast: "Card confirmado como READY"

### Teste 5: Fallback (desabilitar agente)
1. Definir `NEXT_PUBLIC_AGENT_ENABLED=false`
2. Usar botões "Gerar" no card
3. Verificar que mock ainda funciona (fallback)

### Teste 6: Error Handling
1. Desconectar internet ou usar API key inválida
2. Enviar mensagem ao agente
3. Verificar:
   - Erro capturado
   - Telemetria de erro registrada
   - Mensagem de erro amigável exibida

---

## 📊 Arquivos Modificados/Criados

### Criados
- `src/app/api/agent/session/route.ts` - Session management
- `supabase-migrations/add_agent_thread_id.sql` - DB migration
- `docs/AGENT_INTEGRATION_SUMMARY.md` - Este arquivo

### Modificados
- `src/app/api/agent/message/route.ts` - OpenAI real integration
- `src/lib/services/TelemetryService.ts` - 3 novos eventos
- `src/lib/services/AgentTools.ts` - Tool definitions exportadas
- `src/lib/services/AIGenerationService.ts` - Delegação com fallback
- `src/components/organisms/CanvasPage.tsx` - ThreadId + toolResults sync

---

## 🚀 Próximos Passos (Futuro)

### Melhorias Futuras (Não Implementadas)
1. **Streaming SSE** - Substituir polling por Server-Sent Events
2. **Suggested Actions** - Botões de ação rápida no AIPanel
3. **Domain Agents Especializados** - Scope, Tech, Design, Plan
4. **A/B Testing** - Feature flags por usuário/projeto
5. **Custo/Tokens Dashboard** - Visualizar gastos com IA
6. **Undo/Redo para Tool Calls** - Reverter ações do agente
7. **Agent Memory** - Persistir contexto longo da conversa
8. **Multi-Agent Orchestration** - Orquestrador delegar para agentes especializados

---

## ⚠️ Notas Importantes

### Limitações Atuais
1. **Assistant ID**: Atualmente usando mock IDs. Substitua por IDs reais do OpenAI Platform.
2. **generateViaAgent()**: Stub implementado - requer threadId gerenciado pelo frontend para funcionar completamente.
3. **Polling**: Usa polling com 1s de intervalo. Pode ser otimizado com streaming.
4. **Error Messages**: Mensagens de erro genéricas - podem ser melhoradas.

### Segurança
- ✅ Autenticação Clerk em todas as rotas
- ✅ Validação de projectId/threadId
- ✅ API Key da OpenAI em variável de ambiente server-side
- ⚠️ RLS do Supabase deve estar habilitado na coluna `agent_thread_id`

### Performance
- Polling de 1s pode gerar muitas requisições
- Tool calls executam sequencialmente (pode ser paralelizado)
- ThreadId é buscado do DB a cada session init (considerar cache)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do console do navegador
2. Verificar logs do servidor (`npm run dev`)
3. Verificar telemetria no console: `[Telemetry]`, `[Agent]`
4. Consultar documentação OpenAI: https://platform.openai.com/docs

