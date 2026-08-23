import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const origins = new Set([
  "https://lamadorportillo-sudo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);
const rate = new Map<string, { at: number; count: number }>();

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && origins.has(origin) ? origin : "https://lamadorportillo-sudo.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const securityHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};
const json = (body: unknown, status: number, origin: string | null) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors(origin), ...securityHeaders, "Content-Type": "application/json; charset=utf-8" },
});

function strongPassword(value: unknown) {
  const p = String(value || "");
  if (p.length < 12 || p.length > 128) return "Use una contraseña de 12 a 128 caracteres.";
  let groups = 0;
  if (/[a-z]/.test(p)) groups++;
  if (/[A-Z]/.test(p)) groups++;
  if (/[0-9]/.test(p)) groups++;
  if (/[^A-Za-z0-9]/.test(p)) groups++;
  if (groups < 3) return "Combine al menos tres tipos: mayúsculas, minúsculas, números o símbolos.";
  if (/^(123456|password|contrase|qwerty|admin|letmein)/i.test(p)) return "La contraseña es demasiado predecible.";
  return "";
}
const clean = (v: unknown, max = 180) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

function jwtClaims(token: string) {
  try {
    const part = token.split(".")[1] || "";
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {} as any;
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: { ...cors(origin), ...securityHeaders } });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405, origin);
  if (origin && !origins.has(origin)) return json({ error: "Origen no autorizado." }, 403, origin);
  if (Number(req.headers.get("content-length") || 0) > 20_000) return json({ error: "Solicitud demasiado grande." }, 413, origin);

  try {
    const url = Deno.env.get("SUPABASE_URL") || "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return json({ error: "Sesión no válida." }, 401, origin);

    const key = auth.user.id;
    const nowMs = Date.now();
    const bucket = rate.get(key);
    if (!bucket || nowMs - bucket.at > 60_000) rate.set(key, { at: nowMs, count: 1 });
    else {
      bucket.count += 1;
      if (bucket.count > 40) return json({ error: "Demasiadas operaciones. Espere un minuto." }, 429, origin);
    }

    const body = await req.json();
    const action = clean(body?.action, 60);
    const { data: membership } = await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id", auth.user.id).eq("active", true).limit(1).maybeSingle();
    if (!membership) return json({ error: "No pertenece a un espacio activo." }, 403, origin);
    const { data: profile } = await admin.from("profiles").select("active,must_change_password,temporary_password_expires_at,security_force_reauth,security_valid_after").eq("user_id", auth.user.id).maybeSingle();
    if (profile?.active === false) return json({ error: "Esta cuenta está desactivada." }, 403, origin);

    const claims: any = jwtClaims(token);
    const issuedAt = Number(claims?.iat || 0) * 1000;
    const validAfter = profile?.security_valid_after ? new Date(profile.security_valid_after).getTime() : 0;
    const { data: hasMfa } = await admin.rpc("service_user_has_verified_mfa", { p_user_id: auth.user.id });
    const strongSession = issuedAt >= validAfter && profile?.security_force_reauth !== true && (!hasMfa || claims?.aal === "aal2");

    if (action === "end_session") {
      const sessionId = clean(body.security_session_id, 80);
      const reason = clean(body.reason, 100) || "logout";
      const now = new Date().toISOString();
      if (sessionId) {
        await admin.from("security_sessions").update({ ended_at: now, end_reason: reason }).eq("id", sessionId).eq("user_id", auth.user.id).is("ended_at", null);
        await admin.from("security_events").insert({ workspace_id: membership.workspace_id, user_id: auth.user.id, email: auth.user.email || null, event_type: "logout", success: true, severity: "info", session_id: sessionId, metadata: { reason } });
      }
      return json({ ok: true }, 200, origin);
    }

    if (!strongSession) return json({ error: hasMfa ? "Complete la verificación en dos pasos e ingrese nuevamente." : "Debe autenticarse nuevamente antes de continuar." }, 403, origin);

    if (action === "heartbeat") {
      const sessionId = clean(body.security_session_id, 80);
      if (!sessionId) return json({ ok: true, legacy: true }, 200, origin);
      const { data: s } = await admin.from("security_sessions").select("id,revoked_at,ended_at").eq("id", sessionId).eq("user_id", auth.user.id).maybeSingle();
      if (!s || s.revoked_at || s.ended_at) return json({ ok: false, revoked: true, reason: "La sesión fue cerrada por seguridad." }, 403, origin);
      await admin.from("security_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", sessionId).eq("user_id", auth.user.id);
      return json({ ok: true, revoked: false }, 200, origin);
    }

    if (action === "complete_password_change") return json({ error: "Flujo de seguridad obsoleto. Use el cambio protegido de contraseña." }, 400, origin);

    if (action === "change_password") {
      const password = String(body.password || "");
      const weakness = strongPassword(password);
      if (weakness) return json({ error: weakness }, 400, origin);
      const { error: updateAuthError } = await admin.auth.admin.updateUserById(auth.user.id, { password });
      if (updateAuthError) return json({ error: "No se pudo actualizar la contraseña." }, 400, origin);
      const now = new Date().toISOString();
      const { error: updateProfileError } = await admin.from("profiles").update({ must_change_password: false, temporary_password_expires_at: null, security_force_reauth: false, last_password_change_at: now, updated_at: now }).eq("user_id", auth.user.id);
      if (updateProfileError) throw updateProfileError;
      await admin.from("security_events").insert({ workspace_id: membership.workspace_id, user_id: auth.user.id, email: auth.user.email || null, event_type: "password_changed", success: true, severity: "info", metadata: { self_service: true } });
      return json({ ok: true }, 200, origin);
    }

    if (membership.role !== "admin") return json({ error: "Solo un administrador puede gestionar usuarios." }, 403, origin);

    const audit = async (event_type: string, target: string | null, email: string | null, severity = "info", metadata: Record<string, unknown> = {}) => {
      await admin.from("security_events").insert({ workspace_id: membership.workspace_id, user_id: target || null, email, event_type, success: true, severity, metadata: { actor_user_id: auth.user.id, ...metadata } });
    };

    if (action === "list") {
      const { data: members, error } = await admin.from("workspace_members").select("user_id,role,active,created_at").eq("workspace_id", membership.workspace_id).order("created_at");
      if (error) throw error;
      const memberIds = (members || []).map((m: any) => m.user_id);
      const { data: profiles, error: profileListError } = memberIds.length
        ? await admin.from("profiles").select("user_id,full_name,active,must_change_password,temporary_password_expires_at,security_force_reauth,last_login_at,last_password_change_at").in("user_id", memberIds)
        : { data: [], error: null } as any;
      if (profileListError) throw profileListError;
      const profileById = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const { data: authUsers, error: userError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (userError) throw userError;
      const authById = new Map(authUsers.users.map((u: any) => [u.id, u]));
      return json({ users: (members || []).map((m: any) => {
        const p: any = profileById.get(m.user_id) || {};
        const u: any = authById.get(m.user_id) || {};
        const mfaEnabled = Array.isArray(u.factors) && u.factors.some((f: any) => f?.status === "verified");
        return { user_id: m.user_id, email: u.email || "", role: m.role, active: m.active !== false && p.active !== false, full_name: p.full_name || "", must_change_password: !!p.must_change_password, temporary_password_expires_at: p.temporary_password_expires_at || null, security_force_reauth: !!p.security_force_reauth, last_login_at: p.last_login_at || null, last_password_change_at: p.last_password_change_at || null, mfa_enabled: mfaEnabled };
      }) }, 200, origin);
    }

    if (action === "security_overview") {
      const { data: members } = await admin.from("workspace_members").select("user_id,role,active").eq("workspace_id", membership.workspace_id);
      const ids = (members || []).map((m: any) => m.user_id);
      const { data: profiles } = ids.length ? await admin.from("profiles").select("user_id,full_name,active,last_login_at,security_force_reauth").in("user_id", ids) : { data: [] } as any;
      const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const authById = new Map(authUsers.users.map((u: any) => [u.id, u]));
      const emailById = new Map(authUsers.users.map((u: any) => [u.id, u.email || ""]));
      const memberEmails = new Set(ids.map((id: string) => String(emailById.get(id) || "").toLowerCase()).filter(Boolean));
      const profileById = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const { data: sessions } = await admin.from("security_sessions").select("id,user_id,email,device_label,started_at,last_seen_at,ended_at,revoked_at,end_reason").eq("workspace_id", membership.workspace_id).order("started_at", { ascending: false }).limit(100);
      const { data: workspaceEvents } = await admin.from("security_events").select("id,user_id,email,event_type,success,severity,device_label,created_at,session_id,metadata").eq("workspace_id", membership.workspace_id).order("created_at", { ascending: false }).limit(180);
      const { data: orphanEvents } = await admin.from("security_events").select("id,user_id,email,event_type,success,severity,device_label,created_at,session_id,metadata").is("workspace_id", null).order("created_at", { ascending: false }).limit(180);
      const external = (orphanEvents || []).filter((e: any) => memberEmails.has(String(e.email || "").toLowerCase()));
      const events = [...(workspaceEvents || []), ...external].sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 220);
      const users = (members || []).map((m: any) => {
        const p: any = profileById.get(m.user_id) || {};
        const u: any = authById.get(m.user_id) || {};
        return { user_id: m.user_id, email: emailById.get(m.user_id) || "", full_name: p.full_name || "", role: m.role, active: m.active !== false && p.active !== false, last_login_at: p.last_login_at || null, security_force_reauth: !!p.security_force_reauth, mfa_enabled: Array.isArray(u.factors) && u.factors.some((f: any) => f?.status === "verified") };
      });
      const since24 = Date.now() - 86_400_000;
      const activeCut = Date.now() - 15 * 60_000;
      const success24 = events.filter((e: any) => e.event_type === "login_success" && new Date(e.created_at).getTime() >= since24).length;
      const fail24 = events.filter((e: any) => ["login_failure", "login_blocked", "login_rate_limited", "mfa_failure"].includes(e.event_type) && new Date(e.created_at).getTime() >= since24).length;
      const activeSessions = (sessions || []).filter((s: any) => !s.ended_at && !s.revoked_at && new Date(s.last_seen_at).getTime() >= activeCut).length;
      const inactiveUsers = users.filter((u: any) => !u.active || u.security_force_reauth).length;
      return json({ summary: { success_24h: success24, failed_24h: fail24, active_sessions: activeSessions, restricted_users: inactiveUsers }, users, sessions: sessions || [], events }, 200, origin);
    }

    if (action === "revoke_sessions") {
      const target = clean(body.user_id, 80);
      if (!target) return json({ error: "Usuario no válido." }, 400, origin);
      if (target === auth.user.id) return json({ error: "No puede cerrar sus propias sesiones desde este panel." }, 400, origin);
      const { data: targetMember } = await admin.from("workspace_members").select("user_id").eq("workspace_id", membership.workspace_id).eq("user_id", target).maybeSingle();
      if (!targetMember) return json({ error: "Usuario fuera de este espacio de trabajo." }, 404, origin);
      const now = new Date().toISOString();
      await admin.from("profiles").update({ security_force_reauth: true, updated_at: now }).eq("user_id", target);
      await admin.from("security_sessions").update({ revoked_at: now, end_reason: "admin_revoked" }).eq("workspace_id", membership.workspace_id).eq("user_id", target).is("ended_at", null).is("revoked_at", null);
      const { data: u } = await admin.auth.admin.getUserById(target);
      await audit("session_revoked", target, u.user?.email || null, "critical", { reason: "admin_revoked" });
      return json({ ok: true }, 200, origin);
    }

    if (action === "set_active") {
      const target = clean(body.user_id, 80);
      const active = body.active === true;
      if (!target) return json({ error: "Usuario no válido." }, 400, origin);
      if (target === auth.user.id && !active) return json({ error: "No puede desactivar su propia cuenta." }, 400, origin);
      const { data: targetMember } = await admin.from("workspace_members").select("role,active").eq("workspace_id", membership.workspace_id).eq("user_id", target).maybeSingle();
      if (!targetMember) return json({ error: "Usuario fuera de este espacio de trabajo." }, 404, origin);
      if (!active && targetMember.role === "admin") {
        const { count } = await admin.from("workspace_members").select("user_id", { count: "exact", head: true }).eq("workspace_id", membership.workspace_id).eq("role", "admin").eq("active", true);
        if ((count || 0) <= 1) return json({ error: "No se puede desactivar al último administrador activo." }, 400, origin);
      }
      const now = new Date().toISOString();
      const { error: mErr } = await admin.from("workspace_members").update({ active }).eq("workspace_id", membership.workspace_id).eq("user_id", target);
      if (mErr) throw mErr;
      const { error: pErr } = await admin.from("profiles").update({ active, security_force_reauth: !active, updated_at: now }).eq("user_id", target);
      if (pErr) throw pErr;
      if (!active) await admin.from("security_sessions").update({ revoked_at: now, end_reason: "account_disabled" }).eq("workspace_id", membership.workspace_id).eq("user_id", target).is("ended_at", null).is("revoked_at", null);
      const { data: u } = await admin.auth.admin.getUserById(target);
      await audit(active ? "account_reactivated" : "account_disabled", target, u.user?.email || null, active ? "info" : "critical", {});
      return json({ ok: true, active }, 200, origin);
    }

    if (action === "reset_password") {
      const target = clean(body.user_id, 80);
      const password = String(body.password || "");
      const hours = Math.min(168, Math.max(1, Number(body.expires_in_hours) || 24));
      const weakness = strongPassword(password);
      if (!target) return json({ error: "Usuario no válido." }, 400, origin);
      if (weakness) return json({ error: `Contraseña temporal: ${weakness}` }, 400, origin);
      const { data: targetMember } = await admin.from("workspace_members").select("user_id").eq("workspace_id", membership.workspace_id).eq("user_id", target).maybeSingle();
      if (!targetMember) return json({ error: "Usuario fuera de este espacio de trabajo." }, 404, origin);
      const { error: aErr } = await admin.auth.admin.updateUserById(target, { password });
      if (aErr) return json({ error: "No se pudo establecer la contraseña temporal." }, 400, origin);
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + hours * 3_600_000).toISOString();
      const { error: pErr } = await admin.from("profiles").update({ must_change_password: true, temporary_password_expires_at: expiresAt, security_force_reauth: true, updated_at: now }).eq("user_id", target);
      if (pErr) throw pErr;
      await admin.from("security_sessions").update({ revoked_at: now, end_reason: "password_reset" }).eq("workspace_id", membership.workspace_id).eq("user_id", target).is("ended_at", null).is("revoked_at", null);
      const { data: u } = await admin.auth.admin.getUserById(target);
      await audit("password_reset_by_admin", target, u.user?.email || null, "warning", { expires_at: expiresAt });
      return json({ ok: true, expires_at: expiresAt }, 200, origin);
    }

    if (action === "create") {
      const fullName = clean(body.full_name, 120);
      const email = clean(body.email, 180).toLowerCase();
      const password = String(body.password || "");
      const role = ["admin", "editor", "consulta"].includes(String(body.role)) ? String(body.role) : "consulta";
      const hours = Math.min(168, Math.max(1, Number(body.expires_in_hours) || 24));
      const weakness = strongPassword(password);
      if (fullName.length < 3) return json({ error: "Escriba el nombre completo." }, 400, origin);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Correo no válido." }, 400, origin);
      if (weakness) return json({ error: weakness }, 400, origin);
      const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
      if (createError || !created.user) return json({ error: createError?.message || "No se pudo crear el usuario." }, 400, origin);
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + hours * 3_600_000).toISOString();
      try {
        const { error: profileError } = await admin.from("profiles").upsert({ user_id: created.user.id, full_name: fullName, active: true, must_change_password: true, temporary_password_expires_at: expiresAt, security_force_reauth: false, updated_at: now }, { onConflict: "user_id" });
        if (profileError) throw profileError;
        const { error: memberError } = await admin.from("workspace_members").upsert({ workspace_id: membership.workspace_id, user_id: created.user.id, role, active: true }, { onConflict: "workspace_id,user_id" });
        if (memberError) throw memberError;
      } catch (e) {
        try { await admin.auth.admin.deleteUser(created.user.id); } catch {}
        throw e;
      }
      await audit("user_created", created.user.id, email, "info", { role, expires_at: expiresAt });
      return json({ ok: true, user_id: created.user.id, expires_at: expiresAt }, 200, origin);
    }

    return json({ error: "Operación no reconocida." }, 400, origin);
  } catch (error) {
    console.error("manage-users", error instanceof Error ? error.message : "unknown");
    return json({ error: "No se pudo completar la operación de usuarios." }, 500, origin);
  }
});
