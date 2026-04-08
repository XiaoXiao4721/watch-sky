import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Supabase env vars missing. VITE_SUPABASE_URL="${supabaseUrl}" VITE_SUPABASE_ANON_KEY="${supabaseAnonKey ? '[set]' : '[empty]'}"`
  )
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`VITE_SUPABASE_URL must start with https://, got: "${supabaseUrl}"`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
