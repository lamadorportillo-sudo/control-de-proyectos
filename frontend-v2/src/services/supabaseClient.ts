import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://flethujkrharehjikwgj.supabase.co';
// Publishable client key: designed by Supabase to be exposed in browser applications.
// Authorization continues to be enforced by Auth + RLS; no service-role secret is embedded here.
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_UqstbAXxbwLd8NqeiyEQrA_IOESNT-6';
export const LEGACY_SESSION_KEY = 'control_contractual_session_v3';

const runtimeConfig = typeof window !== 'undefined'
  ? (window as any).__CC_V2_CONFIG__ || {}
  : {};

const supabaseUrl = String(
  runtimeConfig.supabaseUrl ||
  import.meta.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
).trim();

export const supabasePublishableKey = String(
  runtimeConfig.supabasePublishableKey ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
).trim();

export const supabaseBaseUrl = supabaseUrl;
export const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Reuses the authenticated session that the current production application
 * already stores on the same GitHub Pages origin. This avoids a second login
 * system while frontend-v2 is integrated.
 */
export async function ensureSupabaseSession(): Promise<Session | null> {
  if (!supabase || typeof window === 'undefined') return null;

  const now = Math.floor(Date.now() / 1000);
  const current = (await supabase.auth.getSession()).data.session;
  if (current?.access_token && (!current.expires_at || current.expires_at > now + 30)) return current;

  if (current?.refresh_token) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.data.session?.access_token) return refreshed.data.session;
  }

  let legacy: any = null;
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_SESSION_KEY) || 'null');
  } catch {
    legacy = null;
  }

  const accessToken = String(legacy?.accessToken || '');
  const refreshToken = String(legacy?.refreshToken || '');
  if (!accessToken || !refreshToken) return null;

  const bridged = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (bridged.error || !bridged.data.session?.access_token) {
    console.warn('No se pudo reutilizar la sesión productiva en frontend-v2:', bridged.error?.message || 'sesión vacía');
    return null;
  }

  return bridged.data.session;
}

export async function getV2AuthState() {
  if (!supabase) return { authenticated: false, user: null, session: null };
  const session = await ensureSupabaseSession();
  return {
    authenticated: Boolean(session?.user),
    user: session?.user || null,
    session,
  };
}
