'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useMemo } from 'react'

/**
 * Hook simples para obter o client do Supabase no browser.
 * Não tenta "setar usuário" (não existe `auth.setUser` no client v2). 
 * A autenticação é tratada no SSR por header Authorization quando necessário.
 */
export function useSupabaseClient() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    )
  }, [])

  return supabase
}
