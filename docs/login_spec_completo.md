# Login — Spec Completo (Visual + Funcional + Técnico) — v1

> Documento único que consolida **UI/UX**, **comportamento**, **integração técnica** e **QA** da página de **Login** com **Clerk** e **Supabase (RLS)**. Abrange também o fluxo pós‑auth (**ProjectGate** em `/post-auth`).

---

## 1) Visão Geral
- **Objetivo:** permitir **entrar** rapidamente no produto com segurança e acessibilidade, mantendo a identidade visual.
- **Escopo:** `/sign-in` (Login). Opcional: `/auth` (tabs SignIn/SignUp) e `/sign-up` (Registro).
- **Pós‑auth:** `/post-auth` (SSR) executa **ProjectGate**.
- **Público:** makers (PM/UX/Dev) e solo makers.

### 1.1 Fora de escopo (Login)
- Gestão de conta/perfil, 2FA, recovery de e‑mail (mantidos pelo Clerk sem customizações no MVP).

---

## 2) User Stories
- **US‑L01** Como usuário, quero **entrar com e‑mail/senha** para acessar meus projetos.
- **US‑L02** Como novo usuário, quero **registrar** e ser levado direto para começar um projeto (via SignUp, caso exista `/auth`/`/sign-up`).
- **US‑L03** Como usuário, quero **mensagens claras de erro** e **feedback de loading** durante o login.

---

## 3) Fluxos

### 3.1 Login (existente)
1. Visitar `/sign-in`.
2. Preencher credenciais no **Clerk SignIn**.
3. Sucesso → redireciona para **`/post-auth`**.
4. **ProjectGate** consulta Supabase:
   - **Nenhum projeto**: cria projeto **draft** (template: `site-app`) → **`/projects/:id?onboarding=1`**.
   - **Há projetos**: **`/projects`**.

### 3.2 Registro (opcional no MVP da página de Login)
1. Visitar `/sign-up` ou aba “Registrar” em `/auth`.
2. Sucesso → **`/post-auth`** → ProjectGate como acima.

### 3.3 SignedOut em rota protegida
- Acessar `/projects` ou `/projects/:id` sem sessão → redirect do middleware para **`/sign-in`**.

### 3.4 Visitar `/sign-in` já autenticado
- Detectar sessão → redirect para **`/projects`** (ou `/post-auth`).

---

## 4) Padrões Visuais (resumo aplicado)
- **Tema:** escuro (dark);
- **Container:** 480–560px, centralizado (grid `place-items-center`), padding 24–48px;
- **Card:** bg `--bg-elev`, borda `--stroke`, radius 12px, sombra leve;
- **Tipografia:** H1 28–32/600, subtítulo 14–16/400 dim;
- **Botão primário:** `--primary` com texto `#0B1022`;
- **Estados:** hover/active sutis, focus com **outline 2px** primário;
- **A11y:** contraste AA, alvos ≥44px, `aria-live` para erros.

> Tokens/cores: ver **Guia Visual**.

---

## 5) Microcopy (PT‑BR)
- **Título:** “Bem‑vindo de volta”
- **Subtítulo:** “Acesse seus projetos e continue de onde parou.”
- **Botão:** “Entrar”
- **Link registro:** “Criar conta”
- **Erro:** “Credenciais inválidas. Verifique seu e‑mail e senha.”
- **Rodapé:** “Ao continuar, você concorda com nossos Termos e Política de Privacidade.”

---

## 6) Integração técnica — Clerk

### 6.1 Dependências & Env
- `@clerk/nextjs`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### 6.2 Provider (App Router)
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-br"><body>{children}</body></html>
    </ClerkProvider>
  )
}
```

### 6.3 Middleware
```ts
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  publicRoutes: ['/','/auth(.*)?','/sign-in(.*)?','/sign-up(.*)?','/api/webhooks/clerk']
})
export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
```

### 6.4 Página `/sign-in`
```tsx
// app/sign-in/page.tsx
import { SignIn } from '@clerk/nextjs'
import { signInAppearance } from '@/styles/clerk-appearance'

export default function SignInPage(){
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-[520px] space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-[28px] font-semibold text-[var(--text)]">Bem‑vindo de volta</h1>
          <p className="text-[14px] text-[var(--text-dim)]">Acesse seus projetos e continue de onde parou.</p>
        </div>
        <SignIn routing="path" afterSignInUrl="/post-auth" appearance={signInAppearance} />
        <p className="text-center text-[12px] text-[var(--text-dim)]">Ao continuar, você concorda com nossos Termos e Política de Privacidade.</p>
      </div>
    </main>
  )
}
```

### 6.5 Aparência do Clerk (dark)
```ts
// styles/clerk-appearance.ts
export const signInAppearance = {
  variables: { colorPrimary: 'var(--primary)' },
  elements: {
    rootBox: { display: 'flex', justifyContent: 'center' },
    card: { backgroundColor: 'var(--bg-elev)', border: '1px solid var(--stroke)', borderRadius: '12px', boxShadow: 'var(--shadow-1)' },
    headerTitle: { color: 'var(--text)' },
    headerSubtitle: { color: 'var(--text-dim)' },
    formFieldLabel: { color: 'var(--text)' },
    formFieldInput: { backgroundColor: 'var(--bg)', borderColor: 'var(--stroke)', color: 'var(--text)' },
    formFieldInput__error: { borderColor: 'var(--danger)' },
    formButtonPrimary: { backgroundColor: 'var(--primary)', color: '#0B1022' },
    footer: { color: 'var(--text-dim)' }
  }
} as const
```

### 6.6 Redirecionamento pós‑auth
- Configurar `<SignIn afterSignInUrl="/post-auth" />` (e `<SignUp afterSignUpUrl="/post-auth" />` se aplicável).

---

## 7) Integração técnica — Supabase (RLS) no ProjectGate

### 7.1 Helper SSR com token do Clerk
```ts
// lib/supabase-ssr.ts
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function supabaseSsr(){
  const { getToken } = auth()
  const token = await getToken({ template: 'supabase' })
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global: { fetch: (url, opts:any={}) => {
      const headers = new Headers(opts.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(url, { ...opts, headers })
    }}
  })
}
```

### 7.2 `/post-auth` (SSR ProjectGate)
```tsx
// app/post-auth/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabaseSsr } from '@/lib/supabase-ssr'

export default async function PostAuthGate(){
  const { userId } = auth();
  if (!userId) redirect('/sign-in')
  const supabase = await supabaseSsr()

  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) === 0) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: 'Untitled Project', template_id: 'site-app', status: 'draft' })
      .select()
      .single()
    if (error) redirect('/projects')
    return redirect(`/projects/${data.id}?onboarding=1`)
  }
  return redirect('/projects')
}
```

> **RLS** garante que o usuário só conte/crie nos próprios projetos (policies configuradas no schema Supabase).

---

## 8) Estados & Acessibilidade
- **Loading:** spinner no botão; inputs desabilitados.
- **Erro:** banner com `aria-live="assertive"`; foco programático no título do erro.
- **Keyboard:** Tab order lógico; Enter envia; Esc fecha modais (se houver).
- **Responsivo:** stacking < 768px; evitar overflows horizontais; tocar alvos ≥44px.

---

## 9) Segurança
- **Sessão/CSRF/cookies:** delegados ao Clerk (cookies `HttpOnly`, `Secure`).
- **RLS:** policies garantem que somente o dono (claim `sub`) veja/modele seus registros.
- **Rate limit:** proteger `/post-auth` e rotas de IA/outputs (middleware/API) — não aplicável diretamente ao SignIn (Clerk já limita).
- **Dados sensíveis:** nenhum campo de senha na nossa DB; evitar logs de tokens.

---

## 10) Telemetria
- **Eventos:** `login_view`, `clerk_sign_in_success`, `clerk_sign_in_error`, `post_auth_gate_create_draft`, `post_auth_gate_to_projects`.
- **Atributos:** `provider` (email, oauth), `latency_ms`, `error_code`.

---

## 11) Testes
- **E2E:** `/sign-in → /post-auth → /projects` (com e sem projetos); redirecionar SignedOut de rota protegida.
- **Visual:** contraste AA, foco visível, estados (idle/loading/erro).
- **Integração:** ProjectGate cria projeto com token do usuário (sem service‑role); RLS funciona.
- **A11y:** navegação por teclado, leitores de tela anunciam erros.

---

## 12) Performance
- **Orçamento:** TTI < 2.5s em rede 3G rápida; CLS ~0; carregamento do widget do Clerk sem bloqueio (lazy/layout shift mínimo).
- **Assets:** evitar imagens pesadas; usar fontes do sistema.

---

## 13) Erros & Mensagens (mapa)
- `INVALID_CREDENTIALS` (Clerk) → “Credenciais inválidas…”
- `USER_LOCKED` (Clerk) → “Muitas tentativas. Tente mais tarde.”
- `NETWORK_ERROR` → “Sem conexão. Verifique sua internet.”
- `/post-auth` falhou criar projeto → seguir para `/projects` e exibir toast “Não foi possível iniciar o projeto automaticamente.”

---

## 14) I18N
- Preparar strings do título, subtítulo e rodapé para i18n (PT‑BR → EN futuramente). Clerk já possui i18n no widget.

---

## 15) Definition of Done (DoD)
- Página **acessível** (AA), responsiva e com **appearance** aplicado.
- Login funcional (Clerk) com redirect para `/post-auth`.
- **ProjectGate** operacional: cria draft quando necessário.
- Telemetria ativa e test cases E2E/integração passando.

---

## 16) Checklist de Implementação
- [ ] Instalar Clerk e configurar Provider/Middleware
- [ ] Criar `/sign-in` com `SignIn` + `appearance`
- [ ] Implementar `/post-auth` (ProjectGate) com Supabase RLS
- [ ] Configurar policies no Supabase (projects/cards)
- [ ] Telemetria + A11y QA + testes E2E

---

## 17) Riscos & Mitigações
- **Indisponibilidade do Clerk** → mensagem de status + link de tentativa novamente.
- **Falha Supabase no `/post-auth`** → fallback para `/projects` + toast informativo.
- **RLS mal configurada** → testes de policies; revisão SQL em PR.
