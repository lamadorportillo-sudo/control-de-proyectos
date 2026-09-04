import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const securityHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: securityHeaders });

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(10000000 + (bytes[0] % 90000000));
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authError } = await admin.auth.getUser(bearer);
  if (authError || !auth.user) return json({ error: "Sesión no válida" }, 401);

  const { data: membership } = await admin
    .from("workspace_members")
    .select("workspace_id,role,active")
    .eq("user_id", auth.user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!membership) return json({ error: "No tienes un espacio de trabajo activo" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { /* empty */ }
  const action = String(body?.action ?? "status").toLowerCase();

  if (action === "status") {
    const { data: link } = await admin
      .from("telegram_links")
      .select("status,telegram_username,telegram_first_name,verified_at,link_code_expires_at")
      .eq("workspace_id", membership.workspace_id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    return json({ linked: link?.status === "active", link: link ?? null });
  }

  if (action === "revoke") {
    await admin.from("telegram_links").upsert({
      workspace_id: membership.workspace_id,
      user_id: auth.user.id,
      status: "revoked",
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null,
      telegram_first_name: null,
      telegram_last_name: null,
      link_code_hash: null,
      link_code_expires_at: null,
      verified_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "workspace_id,user_id" });
    return json({ ok: true, linked: false });
  }

  if (action !== "create") return json({ error: "Acción no válida" }, 400);

  const code = makeCode();
  const hash = await sha256(code);
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const { error } = await admin.from("telegram_links").upsert({
    workspace_id: membership.workspace_id,
    user_id: auth.user.id,
    status: "pending",
    telegram_user_id: null,
    telegram_chat_id: null,
    telegram_username: null,
    telegram_first_name: null,
    telegram_last_name: null,
    link_code_hash: hash,
    link_code_expires_at: expires,
    verified_at: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "workspace_id,user_id" });
  if (error) {
    console.error("telegram-link upsert", error.message);
    return json({ error: "No se pudo crear el código de vinculación" }, 500);
  }

  return json({
    ok: true,
    code,
    expires_at: expires,
    instruction: `Envía /start ${code} al bot de Control Contractual en Telegram.`,
  });
});