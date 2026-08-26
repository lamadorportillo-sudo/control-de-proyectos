import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins = new Set([
  "https://lamadorportillo-sudo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);

function cors(origin: string | null) {
  const safeOrigin = origin && allowedOrigins.has(origin) ? origin : "https://lamadorportillo-sudo.github.io";
  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY"
    }
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origen no autorizado." }, 403, origin);

  const length = Number(req.headers.get("content-length") || 0);
  if (length > 12000) return json({ error: "Solicitud demasiado grande." }, 413, origin);

  try {
    const body = await req.json();
    if (String(body.website || "").trim()) return json({ ok: true }, 200, origin);

    const fullName = String(body.full_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim().slice(0, 40);
    const position = String(body.position || "").trim().slice(0, 100);
    const role = body.requested_role === "editor" ? "editor" : "consulta";

    if (fullName.length < 3 || fullName.length > 120) return json({ error: "Escriba su nombre completo." }, 400, origin);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) return json({ error: "Correo no válido." }, 400, origin);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: requestId, error: requestError } = await supabase.rpc("submit_access_request", {
      p_full_name: fullName,
      p_email: email,
      p_phone: phone || null,
      p_position: position || null,
      p_requested_role: role
    });
    if (requestError) {
      const message = requestError.message.includes("DEMASIADAS") ? "Ya se recibieron varias solicitudes. Espere antes de intentarlo nuevamente." : "No se pudo registrar la solicitud.";
      return json({ error: message }, 400, origin);
    }

    let ownerEmail = String(Deno.env.get("ACCESS_REQUEST_EMAIL") || "").trim().toLowerCase();
    if (!ownerEmail) {
      const { data: admins } = await supabase.from("workspace_members").select("user_id").eq("role", "admin").eq("active", true).limit(1);
      const adminId = admins?.[0]?.user_id;
      if (adminId) {
        const { data } = await supabase.auth.admin.getUserById(adminId);
        ownerEmail = data.user?.email || "";
      }
    }

    let emailSent = false;
    let notificationError = "";
    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    if (resendKey && ownerEmail) {
      const from = Deno.env.get("ACCESS_REQUEST_FROM") || "Control Contractual <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [ownerEmail],
          subject: "Nueva solicitud de acceso · Control Contractual",
          html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#172033"><h2>Nueva solicitud de acceso</h2><p><b>Nombre:</b> ${fullName.replace(/[<>&]/g, "")}</p><p><b>Correo:</b> ${email.replace(/[<>&]/g, "")}</p><p><b>Teléfono:</b> ${phone.replace(/[<>&]/g, "") || "No indicado"}</p><p><b>Cargo:</b> ${position.replace(/[<>&]/g, "") || "No indicado"}</p><p><b>Acceso solicitado:</b> ${role === "editor" ? "Editor" : "Solo consulta"}</p><p>Ingrese a Control Contractual, abra <b>Equipo</b> y apruebe o rechace la solicitud. Al aprobarla, el sistema generará un código único ligado a ese correo.</p></div>`
        })
      });
      emailSent = response.ok;
      if (!response.ok) notificationError = `Resend ${response.status}`;
    } else {
      notificationError = resendKey ? "No se encontró el correo del administrador." : "Falta configurar RESEND_API_KEY.";
    }

    await supabase.from("access_requests").update({
      notification_sent: emailSent,
      notification_error: emailSent ? null : notificationError
    }).eq("id", requestId);

    return json({ ok: true, request_id: requestId, email_sent: emailSent }, 200, origin);
  } catch (error) {
    console.error(error);
    return json({ error: "No se pudo procesar la solicitud. Intente nuevamente." }, 500, origin);
  }
});
