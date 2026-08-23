import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins = new Set([
  "https://lamadorportillo-sudo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function cors(origin: string | null) {
  const safeOrigin = origin && allowedOrigins.has(origin) ? origin : "https://lamadorportillo-sudo.github.io";
  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function clean(value: unknown, max = 220) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function deviceLabel(ua: string) {
  const s = ua.toLowerCase();
  const os = /iphone|ipad|ipod/.test(s) ? "iOS/iPadOS" : /android/.test(s) ? "Android" : /windows/.test(s) ? "Windows" : /mac os|macintosh/.test(s) ? "macOS" : /linux/.test(s) ? "Linux" : "Dispositivo";
  const browser = /edg\//.test(s) ? "Edge" : /opr\//.test(s) ? "Opera" : /chrome\//.test(s) && !/edg\//.test(s) ? "Chrome" : /firefox\//.test(s) ? "Firefox" : /safari\//.test(s) && !/chrome\//.test(s) ? "Safari" : "Navegador";
  return `${os} · ${browser}`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origen no autorizado." }, 403, origin);
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > 12_000) return json({ error: "Solicitud demasiado grande." }, 413, origin);

  const url = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const ua = clean(req.headers.get("user-agent"), 220);
  const device = deviceLabel(ua);

  try {
    const body = await req.json();
    const email = clean(body?.email, 180).toLowerCase();
    const password = String(body?.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 256) {
      return json({ error: "Correo o contraseña incorrectos." }, 400, origin);
    }

    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recentFails } = await admin
      .from("security_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "login_failure")
      .eq("email", email)
      .gte("created_at", since);
    if ((recentFails || 0) >= 12) {
      await admin.from("security_events").insert({ email, event_type: "login_rate_limited", success: false, severity: "warning", device_label: device, user_agent: ua, metadata: { origin: origin || "direct" } });
      return json({ error: "Demasiados intentos de ingreso. Espere unos minutos antes de intentarlo nuevamente." }, 429, origin);
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) {
      await admin.from("security_events").insert({ email, event_type: "login_failure", success: false, severity: "warning", device_label: device, user_agent: ua, metadata: { reason: "invalid_credentials", origin: origin || "direct" } });
      return json({ error: "Correo o contraseña incorrectos." }, 401, origin);
    }

    const userId = data.user.id;
    const { data: profile } = await admin.from("profiles").select("active,must_change_password,temporary_password_expires_at").eq("user_id", userId).maybeSingle();
    const { data: membership } = await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id", userId).eq("active", true).limit(1).maybeSingle();
    const workspaceId = membership?.workspace_id || null;

    if (!profile?.active || !membership?.active) {
      await admin.from("security_events").insert({ workspace_id: workspaceId, user_id: userId, email, event_type: "login_blocked", success: false, severity: "critical", device_label: device, user_agent: ua, metadata: { reason: "inactive_account" } });
      return json({ error: "Este acceso está desactivado. Comuníquese con el administrador." }, 403, origin);
    }
    if (profile.must_change_password && (!profile.temporary_password_expires_at || Date.now() > new Date(profile.temporary_password_expires_at).getTime())) {
      await admin.from("security_events").insert({ workspace_id: workspaceId, user_id: userId, email, event_type: "login_blocked", success: false, severity: "warning", device_label: device, user_agent: ua, metadata: { reason: "temporary_password_expired" } });
      return json({ error: "La contraseña temporal venció. Solicite al administrador una nueva clave." }, 403, origin);
    }

    const now = new Date().toISOString();
    await admin.from("profiles").update({ security_force_reauth: false, last_login_at: now, updated_at: now }).eq("user_id", userId);
    const { data: securitySession, error: sessionError } = await admin.from("security_sessions").insert({ workspace_id: workspaceId, user_id: userId, email, device_label: device, user_agent: ua, started_at: now, last_seen_at: now }).select("id").single();
    if (sessionError || !securitySession) throw sessionError || new Error("No se pudo registrar la sesión.");
    await admin.from("security_events").insert({ workspace_id: workspaceId, user_id: userId, email, event_type: "login_success", success: true, severity: "info", device_label: device, user_agent: ua, session_id: securitySession.id, metadata: { role: membership.role || "consulta" } });

    return json({
      user: { id: data.user.id, email: data.user.email },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      token_type: data.session.token_type,
      security_session_id: securitySession.id,
      device_label: device,
    }, 200, origin);
  } catch (error) {
    console.error("secure-login", error instanceof Error ? error.message : "unknown");
    return json({ error: "No se pudo completar el ingreso. Intente nuevamente." }, 500, origin);
  }
});
