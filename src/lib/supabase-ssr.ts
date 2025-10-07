import { createServerClient } from '@supabase/ssr'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'

/**
 * Helper para criar cliente Supabase no servidor (SSR)
 * Usa integração nativa Clerk + Supabase (nova abordagem)
 */
export async function createClerkSupabaseClientSsr() {
  const { userId } = await auth()
  
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // Se o usuário está autenticado, definir o user_id para RLS
  if (userId) {
    await supabase.auth.setUser({
      id: userId,
      // Adicionar outros campos se necessário
    })
  }

  return supabase
}
