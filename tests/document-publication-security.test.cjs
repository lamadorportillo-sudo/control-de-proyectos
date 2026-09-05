const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const publisher=fs.readFileSync('supabase/functions/document-publisher/index.ts','utf8');
const publicDoc=fs.readFileSync('supabase/functions/document-public/index.ts','utf8');

test('la publicación digital exige origen permitido, sesión válida y rol con edición',()=>{
  assert.match(publisher,/const allowedOrigins=new Set\(/,'debe existir una lista explícita de orígenes web permitidos');
  assert.match(publisher,/req\.method==="OPTIONS"/,'debe responder correctamente el preflight CORS del navegador');
  assert.match(publisher,/origin&&!allowedOrigins\.has\(origin\)/,'debe bloquear orígenes no autorizados');
  assert.match(publisher,/Number\(req\.headers\.get\("content-length"\)\|\|0\)>10_000_000/,'debe limitar el tamaño máximo de la solicitud');
  assert.match(publisher,/client\.auth\.getUser\(\)/,'debe resolver al usuario desde el bearer token');
  assert.match(publisher,/!\['admin','editor'\]\.includes\(role\)/,'un usuario de consulta no puede publicar un documento usando service role');
  assert.match(publisher,/profile\?\.active/,'la cuenta debe estar activa');
  assert.match(publisher,/profile\.security_force_reauth===true/,'una sesión marcada para reautenticación debe quedar bloqueada');
  assert.match(publisher,/profile\.security_valid_after/,'la publicación debe respetar la invalidación global de sesiones');
  assert.match(publisher,/getAuthenticatorAssuranceLevel\(accessToken\)/,'debe comprobar el nivel MFA real de la sesión');
  assert.match(publisher,/nextAal==="aal2"&&currentAal!=="aal2"/,'si existe un factor MFA pendiente de elevar a AAL2 no se permite publicar');
  assert.match(publisher,/role==="admin"&&profile\.mfa_required_after/,'el plazo obligatorio MFA de administradores debe aplicarse también a la publicación');
  assert.doesNotMatch(publisher,/return json\(\{ok:false,error:clean\(e instanceof Error/,'no debe devolver detalles internos de excepciones al cliente');
});

test('el documento público no filtra el token por Referer y confina HTML activo',()=>{
  assert.match(publicDoc,/"referrer-policy":"no-referrer"/,'el token público no debe viajar como Referer hacia recursos externos');
  assert.match(publicDoc,/rel="noopener noreferrer"/,'el enlace de apertura debe impedir navegación con referencia al documento-token');
  assert.match(publicDoc,/"x-frame-options":"DENY"/,'la página pública no debe ser embebible por terceros');
  assert.match(publicDoc,/frame-ancestors 'none'/,'la CSP debe impedir clickjacking');
  assert.match(publicDoc,/"content-security-policy":"sandbox; default-src 'none'/,'el HTML generado por informes debe ejecutarse dentro de un sandbox CSP');
  assert.match(publicDoc,/connect-src 'none'/,'el HTML público no debe realizar llamadas de red activas');
  assert.match(publicDoc,/object-src 'none'/,'el HTML público no debe ejecutar objetos o plugins');
  assert.match(publicDoc,/cache-control":"no-store, max-age=0"/,'los documentos con token no deben persistirse en cachés compartidas');
  assert.match(publicDoc,/const uuid=\/\^\[0-9a-f\]/,'el token público debe validarse como UUID antes de consultar la base');
});

test('los tokens e identificadores públicos se generan con aleatoriedad criptográfica',()=>{
  assert.match(publisher,/const reportId=crypto\.randomUUID\(\),token=crypto\.randomUUID\(\)/);
  assert.doesNotMatch(publisher,/Math\.random\(/,'no deben crearse tokens públicos con Math.random');
});
