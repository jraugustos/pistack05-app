import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr'

/**
 * ProjectGate - Página intermediária pós-autenticação
 * 
 * Lógica:
 * 1. Verifica se usuário tem projetos
 * 2. Se não tem: cria projeto draft e redireciona para Canvas com onboarding
 * 3. Se tem: redireciona para lista de projetos
 */
export default async function PostAuthGate() {
  const { userId } = await auth()
  
  // Se não está autenticado, redireciona para home
  // (não deveria acontecer, mas é uma proteção)
  if (!userId) {
    redirect('/')
  }

  try {
    const supabase = await createClerkSupabaseClientSsr()

    // Contar projetos do usuário
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Erro ao verificar projetos:', error)
      // Em caso de erro, redireciona para projetos (fallback)
      redirect('/projects')
    }

    // Se não tem projetos, cria um draft
    if ((count ?? 0) === 0) {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({ 
          name: 'Untitled Project', 
          template_id: 'site-app', 
          status: 'draft',
          owner_id: userId
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Erro ao criar projeto draft:', insertError)
        redirect('/projects')
      }

      // Redireciona para Canvas com onboarding
      redirect(`/projects/${data.id}?onboarding=1`)
    }

    // Se tem projetos, vai para lista
    redirect('/projects')

  } catch (error) {
    console.error('Erro no ProjectGate:', error)
    // Em caso de erro, redireciona para projetos
    redirect('/projects')
  }
}
