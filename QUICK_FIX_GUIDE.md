# 🔧 Guia de Correção Rápida - 2 Erros

## ✅ Erro 1: `getSelectedNodes is not a function` - CORRIGIDO

**Status**: ✅ **RESOLVIDO** - Adicionei o método `getSelectedNodes` ao `ReactFlowCanvas`

## ⚠️ Erro 2: `Failed to initialize agent session` - PRECISA CORREÇÃO

### Problema Identificado

A `OPENAI_API_KEY` no `.env.local` está mal formatada:
```bash
# ATUAL (INCORRETO)
OPENAI_API_KEY=sk-proj-***[CHAVE_OCULTA]***
```

Note o `sk-proj-sk-proj-` duplicado no início.

### Solução

1. **Corrigir a API Key**:

Edite o arquivo `.env.local` e remova o `sk-proj-` duplicado:

```bash
# CORRETO
OPENAI_API_KEY=sk-proj-***[CHAVE_OCULTA]***
```

2. **Executar Migration do Banco** (se ainda não foi feito):

Acesse o Supabase Dashboard:
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em "SQL Editor"
4. Clique em "New query"
5. Cole o conteúdo de `supabase-migrations/add_agent_thread_id.sql`:

```sql
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS agent_thread_id TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_agent_thread_id ON projects(agent_thread_id);

COMMENT ON COLUMN projects.agent_thread_id IS 'OpenAI ChatKit thread ID for agent conversations in this project';
```

6. Execute (`Ctrl+Enter` ou botão "Run")

3. **Reiniciar o Servidor**:

```bash
# Parar servidor atual (Ctrl+C)
npm run dev
```

### Verificação

Após as correções:

1. **Acesse um projeto**: `http://localhost:3001/projects/[id]`
2. **Abra o Console** (`F12` → Console)
3. **Procure por**: `[Agent] Session initialized: thread_...`

Se aparecer essa mensagem, o erro foi corrigido! ✅

### Se Ainda Der Erro

1. **Verificar se API Key é válida**:
   - Acesse: https://platform.openai.com/api-keys
   - Verifique se a chave está ativa
   - Teste com uma chave nova se necessário

2. **Verificar créditos na OpenAI**:
   - Acesse: https://platform.openai.com/usage
   - Verifique se há créditos disponíveis

3. **Verificar logs do servidor**:
   - No terminal onde roda `npm run dev`
   - Procurar por erros relacionados ao OpenAI

### Teste Rápido

Após corrigir, teste enviando uma mensagem no chat do agente:
```
Olá, você pode me ajudar?
```

Se o agente responder, está funcionando! 🎉

---

## Resumo das Correções

1. ✅ **Erro 1**: Adicionado `getSelectedNodes()` ao ReactFlowCanvas
2. 🔧 **Erro 2**: Corrigir `OPENAI_API_KEY` duplicada no `.env.local`
3. 🔧 **Erro 2**: Executar migration SQL no Supabase (se necessário)
4. 🔧 **Erro 2**: Reiniciar servidor

Depois dessas correções, ambos os erros devem estar resolvidos!
