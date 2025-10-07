'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

/**
 * Hook para criar cliente Supabase no cliente (CSR)
 * Usa integração nativa Clerk + Supabase
 */
export function useSupabaseClient() {
  const { user } = useUser()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    )

    setSupabase(supabaseClient)

    // Se o usuário está autenticado, sincronizar com Supabase
    if (user) {
      supabaseClient.auth.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      })
    }
  }, [user])

  return supabase
}
