import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://flethujkrharehjikwgj.supabase.co';
// Publishable client key: designed by Supabase to be exposed in browser applications.
// Authorization continues to be enforced by Auth + RLS; no service-role secret is embedded here.
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_UqstbAXxbwLd8NqeiyEQrA_IOESNT-6';
const LEGACY_SESSION_KEY = 'control_contractual_session_v3';

const runtimeConfig = typeof window !== 'undefined'
  ? (window as any).__CC_V2_CONFIG__ || {}
  : {};

const supabaseUrl = String(
  runtimeConfig.supabaseUrl ||
  import.meta.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
).trim();

const supabasePublishableKey = String(
  runtimeConfig.supabasePublishableKey ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
).trim();

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
export async function ensureSupabaseSession(): Promise<void> {
  if (!supabase || typeof window === 'undefined') return;

  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return;

  let legacy: any = null;
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_SESSION_KEY) || 'null');
  } catch {
    legacy = null;
  }

  const accessToken = String(legacy?.accessToken || '');
  const refreshToken = String(legacy?.refreshToken || '');
  if (!accessToken || !refreshToken) return;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.warn('No se pudo reutilizar la sesión productiva en frontend-v2:', error.message);
  }
}

export async function getV2AuthState() {
  if (!supabase) return { authenticated: false, user: null, session: null };
  await ensureSupabaseSession();
  const { data } = await supabase.auth.getSession();
  return {
    authenticated: Boolean(data.session?.user),
    user: data.session?.user || null,
    session: data.session || null,
  };
}
