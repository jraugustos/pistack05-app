-- PIStack - Configuração de RLS Policies
-- Execute este SQL no Supabase SQL Editor

-- 1. Habilitar RLS nas tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- 2. Policies para PROJECTS
-- Permitir usuários verem seus próprios projetos
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (auth.uid()::text = owner_id);

-- Permitir usuários criarem projetos
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

-- Permitir usuários atualizarem seus próprios projetos
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid()::text = owner_id);

-- Permitir usuários deletarem seus próprios projetos
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid()::text = owner_id);

-- 3. Policies para CARDS
-- Permitir usuários verem cards dos seus projetos
CREATE POLICY "Users can view cards from their projects"
ON cards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = cards.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- Permitir usuários criarem cards nos seus projetos
CREATE POLICY "Users can create cards in their projects"
ON cards FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = cards.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- Permitir usuários atualizarem cards dos seus projetos
CREATE POLICY "Users can update cards from their projects"
ON cards FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = cards.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- Permitir usuários deletarem cards dos seus projetos
CREATE POLICY "Users can delete cards from their projects"
ON cards FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = cards.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- 4. Policies para OUTPUTS
-- Permitir usuários verem outputs dos seus projetos
CREATE POLICY "Users can view outputs from their projects"
ON outputs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = outputs.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- Permitir usuários criarem outputs nos seus projetos
CREATE POLICY "Users can create outputs in their projects"
ON outputs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = outputs.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- Permitir usuários atualizarem outputs dos seus projetos
CREATE POLICY "Users can update outputs from their projects"
ON outputs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = outputs.project_id
    AND projects.owner_id = auth.uid()::text
  )
);

-- 5. IMPORTANTE: Policies de desenvolvimento (REMOVER EM PRODUÇÃO)
-- Estas policies permitem operações sem autenticação para testes locais
-- COMENTE ou REMOVA quando for para produção!

CREATE POLICY "Dev: Allow all operations on projects"
ON projects FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Dev: Allow all operations on cards"
ON cards FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Dev: Allow all operations on outputs"
ON outputs FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Verificar se as policies foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('projects', 'cards', 'outputs')
ORDER BY tablename, policyname;

