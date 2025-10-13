-- Adicionar coluna agent_thread_id na tabela projects
-- Esta coluna armazena o threadId do OpenAI ChatKit para cada projeto

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS agent_thread_id TEXT;

-- Criar índice para melhor performance nas buscas por threadId
CREATE INDEX IF NOT EXISTS idx_projects_agent_thread_id ON projects(agent_thread_id);

-- Comentário explicando a coluna
COMMENT ON COLUMN projects.agent_thread_id IS 'OpenAI ChatKit thread ID for agent conversations in this project';

