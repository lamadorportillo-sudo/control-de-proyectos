import { LEGACY_SESSION_KEY, supabase, supabaseBaseUrl, supabasePublishableKey } from './supabaseClient.ts';

export interface LoginSeed {
  user: { id: string; email?: string | null };
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  security_session_id?: string;
  device_label?: string;
  mfa_required?: boolean;
  mfa_factor_id?: string;
  mfa_factor_type?: string;
  mfa_enrollment_required?: boolean;
}

export interface LoginResult {
  status: 'authenticated' | 'mfa_required';
  seed: LoginSeed;
}

const jsonHeaders = () => ({
  apikey: supabasePublishableKey,
  'Content-Type': 'application/json',
});

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(data?.error || data?.message || 'No se pudo completar la operación.'));
  }
  return data;
}

export async function persistProductiveSession(seed: LoginSeed): Promise<void> {
  const accessToken = String(seed.access_token || '');
  const refreshToken = String(seed.refresh_token || '');
  if (!accessToken || !refreshToken || !seed.user?.id) {
    throw new Error('La sesión recibida está incompleta.');
  }

  const expiresAt = Date.now() + Math.max(60, Number(seed.expires_in || 3600)) * 1000;
  localStorage.setItem(LEGACY_SESSION_KEY, JSON.stringify({
    userId: seed.user.id,
    email: seed.user.email || '',
    accessToken,
    refreshToken,
    expiresAt,
    securitySessionId: seed.security_session_id || '',
    deviceLabel: seed.device_label || '',
  }));

  if (supabase) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }
}

export async function secureLogin(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${supabaseBaseUrl}/functions/v1/secure-login`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    cache: 'no-store',
  });
  const seed = await parseResponse(response) as LoginSeed;

  if (!seed.user?.id || !seed.access_token || !seed.refresh_token) {
    throw new Error('No se pudo iniciar una sesión protegida.');
  }

  if (seed.mfa_enrollment_required) {
    throw new Error('Esta cuenta necesita completar la configuración de verificación en dos pasos desde el acceso de seguridad.');
  }

  if (seed.mfa_required) return { status: 'mfa_required', seed };

  await persistProductiveSession(seed);
  return { status: 'authenticated', seed };
}

export async function verifyMfaLogin(seed: LoginSeed, code: string): Promise<void> {
  const response = await fetch(`${supabaseBaseUrl}/functions/v1/secure-mfa`, {
    method: 'POST',
    headers: {
      ...jsonHeaders(),
      Authorization: `Bearer ${seed.access_token}`,
    },
    body: JSON.stringify({
      action: 'verify_login',
      refresh_token: seed.refresh_token,
      factor_id: seed.mfa_factor_id || '',
      code: code.replace(/\D/g, ''),
    }),
    cache: 'no-store',
  });

  const data = await parseResponse(response);
  await persistProductiveSession({
    ...seed,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    expires_at: data.expires_at,
    security_session_id: data.security_session_id,
    device_label: data.device_label,
    mfa_required: false,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const redirectTo = `${window.location.origin}/control-de-proyectos/v2/`;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
}

export function recoveryModeRequested(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  return hash.get('type') === 'recovery' || query.get('type') === 'recovery';
}

export async function updateRecoveredPassword(password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  history.replaceState(null, '', `${window.location.origin}/control-de-proyectos/v2/`);
}

export interface AccessRequestInput {
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  requestedRole: 'consulta' | 'editor';
}

export async function requestAccess(input: AccessRequestInput): Promise<{ emailSent: boolean }> {
  const response = await fetch(`${supabaseBaseUrl}/functions/v1/request-access`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || '',
      position: input.position?.trim() || '',
      requested_role: input.requestedRole,
      website: '',
    }),
  });
  const data = await parseResponse(response);
  return { emailSent: data.email_sent === true };
}

function strongPassword(password: string) {
  const groups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  return password.length >= 12 && password.length <= 128 && groups >= 3;
}

export async function completeAccessRegistration(input: {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
}): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  if (!strongPassword(input.password)) {
    throw new Error('La contraseña debe tener al menos 12 caracteres y combinar tres tipos: mayúsculas, minúsculas, números o símbolos.');
  }
  const code = input.inviteCode.trim().toUpperCase();
  if (code.length !== 12) throw new Error('Escribe el código personal de 12 caracteres.');

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        workspace_invite_code: code,
      },
    },
  });
  if (error) throw error;

  if (data.session?.access_token && data.session.refresh_token && data.user?.id) {
    await supabase.auth.signOut();
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}

export async function logoutV2(): Promise<void> {
  try {
    await supabase?.auth.signOut();
  } finally {
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}
