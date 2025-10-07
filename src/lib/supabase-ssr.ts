import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

/**
 * Helper para criar cliente Supabase no servidor (SSR)
 * Usa integração nativa Clerk + Supabase (nova abordagem)
 */
export async function createClerkSupabaseClientSsr() {
  const { getToken } = await auth()
  let token: string | undefined
  try {
    token = await getToken({ template: 'supabase' }) || undefined
  } catch {
    token = undefined
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        fetch: async (url: string, options: any = {}) => {
          const headers = new Headers(options?.headers)
          if (token) headers.set('Authorization', `Bearer ${token}`)
          return fetch(url, { ...options, headers })
        },
      },
    }
  )

  return supabase
}
