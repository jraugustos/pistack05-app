# PRD — Template “Quero criar um site / aplicativo” — v2.1

> PRD específico do **template MVP**. Define etapas, modelos de card, regras de IA e outputs.

---

## 1) Objetivo do Template
Guiar o usuário de **Ideia** → **Plano Executável** para sites/apps com coerência entre **Entendimento**, **Escopo**, **Design**, **Tecnologia** e **Planejamento**.

---

## 2) Etapas e Card Types
1) **Ideia Base** — `idea.base`
   - **Campos**: Nome, Pitch (1 linha), Problema, Público, Proposta de Valor, KPIs iniciais, Riscos.
   - **Checklist**: Entendimento → `understanding.discovery`; Escopo → `scope.features`; Design → `design.concept`; Tecnologia → `tech.stack`; Planejamento → `plan.release`.
   - **Ação**: **Work Plan** (desabilitado até ≥2 READY).

2) **Entendimento**
   - `understanding.discovery`: hipóteses, personas rápidas, dores, suposições críticas, perguntas de pesquisa.
   - `understanding.value-prop`: proposta detalhada, alternativas/concorrência, diferenciais.

3) **Escopo**
   - `scope.features`: **sugestões (MoSCoW)**, seleção de funcionalidades, dependências.
   - `scope.requirements`: requisitos funcionais e não‑funcionais + critérios de aceite.

4) **Design**
   - `design.concept`: princípios de UI, mood, heurísticas prioritárias.
   - `design.flow`: telas, objetivos, CTAs, estados vazios, eventos sucesso/erro; linka a features.

5) **Tecnologia**
   - `tech.stack`: front/back/DB/infra, integrações, riscos técnicos, prós/cons.
   - `tech.arch`: camadas, módulos, APIs/contratos de alto nível.

6) **Planejamento**
   - `plan.release`: objetivos do MVP, critérios de lançamento, métricas, riscos.
   - `plan.roadmap`: milestones, sprints, dependências.

---

## 3) Regras de IA (CIA — Context Informed AI)
- **Contexto**: Ideia Base + **resumo (≤1200 chars)** de cada card **READY**.
- **Modos**: **Generate**, **Expand**, **Review**.
- **Validação**: saída deve respeitar **schema** do card‑type; bloquear confirmação se inválida.
- **Cross‑links**: confirmar `scope.features` propaga sugestões para `design.flow` e `tech.stack`.

---

## 4) Outputs do Template
- **Work Plan** *(gate: ≥2 READY)*: backlog inicial (épicos/tarefas), dependências, milestones e riscos.
- **PRD**: visão → problema → objetivos → público → RF/RNF → fluxos/telas → stack/arquitetura → MVP → riscos → métricas.
- **Prompt Pack**: prompts por card‑type (com variáveis do projeto).

---

## 5) Critérios de Aceitação por Etapa
- **Ideia Base**: Checklist cria cards corretos; botão Work Plan aparece (desabilitado inicialmente).
- **Entendimento**: personas/hipóteses coerentes com a ideia.
- **Escopo**: funcionalidades rotuladas em MoSCoW; seleção persistida.
- **Design**: telas e CTAs coerentes com features.
- **Tecnologia**: stack compatível com features e riscos mapeados.
- **Planejamento**: MVP priorizado e critérios de lançamento definidos.

---

## 6) KPIs do Template
- Tempo até **1º card READY**.
- % de projetos que geram **Work Plan** (atingiram gate ≥2 READY).
- Taxa de geração de **PRD** e **Prompt Pack**.

---

## 7) Dependências
- **Clerk** (auth) → acesso ao Canvas e filtros por usuário.
- **LLM** (IA server‑side) → geração/expansão/revisão de cards.
- **DB** → projetos/cards/outputs/AITrace.

---

## 8) Riscos & Mitigações
- **Sugerir excesso de features** → limite de 12 e forçar MoSCoW.
- **Fluxos inconsistentes** → **Review** de coerência ao confirmar cards críticos.

---

## 9) Release Plan (MVP)
- **S1**: `idea.base`, `scope.features`, `tech.stack`, **Work Plan**.
- **S2**: `design.concept`, `design.flow`, `scope.requirements`, `plan.release`, **PRD** e **Prompt Pack**.

---

## 10) Glossário
**MoSCoW**: must/should/could/won’t; **READY**: card confirmado; **ContextService**: agregador de contexto; **Prompt Pack**: coleção de prompts por etapa.

