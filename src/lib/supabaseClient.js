import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificação básica para evitar erros em build/deploy se as envs não estiverem setadas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não encontradas!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,       // Atualiza o token automaticamente (padrão true, mas bom explicitar)
    persistSession: true,         // Salva a sessão no localStorage (padrão true)
    detectSessionInUrl: true,     // Importante para magic links, OAuth redirects, reset password, etc.
    flowType: 'pkce',             // Fluxo recomendado e mais seguro para SPAs (substitui o antigo implicit flow)
    
    // Opcional: se quiser customizar o storage (normalmente não precisa)
    // storage: localStorage,
    // storageKey: 'sb-minha-app-auth-token', // muda se quiser evitar conflito com outros apps
  },
  
  // Outras opções úteis (opcional, mas comum adicionar)
  global: {
    headers: {
      // 'x-my-custom-header': 'valor'  // se precisar
    }
  }
})