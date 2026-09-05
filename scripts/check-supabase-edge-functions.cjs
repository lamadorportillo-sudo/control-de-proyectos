const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'supabase','functions-manifest.json');
const functionsDir=path.join(root,'supabase','functions');

function fail(message){
  console.error(`\n[edge-functions] ERROR: ${message}`);
  process.exitCode=1;
}

function sorted(values){return [...values].sort((a,b)=>a.localeCompare(b));}
function same(a,b){return JSON.stringify(sorted(a))===JSON.stringify(sorted(b));}

if(!fs.existsSync(manifestPath)){
  fail('Falta supabase/functions-manifest.json.');
  process.exit();
}
if(!fs.existsSync(functionsDir)){
  fail('Falta el directorio supabase/functions.');
  process.exit();
}

const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const entries=Array.isArray(manifest.functions)?manifest.functions:[];
const slugs=entries.map(x=>String(x?.slug||'').trim()).filter(Boolean);
const unique=new Set(slugs);
if(!manifest.project_ref)fail('El manifiesto no define project_ref.');
if(slugs.length!==entries.length)fail('Hay entradas sin slug en el manifiesto.');
if(unique.size!==slugs.length)fail('Hay slugs duplicados en el manifiesto.');

const local=fs.readdirSync(functionsDir,{withFileTypes:true})
  .filter(d=>d.isDirectory()&&fs.existsSync(path.join(functionsDir,d.name,'index.ts')))
  .map(d=>d.name);

const missing=slugs.filter(x=>!local.includes(x));
const unmanaged=local.filter(x=>!unique.has(x));
if(missing.length)fail(`Funciones del manifiesto sin código versionado: ${missing.join(', ')}`);
if(unmanaged.length)fail(`Funciones versionadas fuera del manifiesto: ${unmanaged.join(', ')}`);

for(const entry of entries){
  const source=path.join(functionsDir,entry.slug,'index.ts');
  if(!fs.existsSync(source)){continue;}
  const stat=fs.statSync(source);
  if(stat.size<80)fail(`${entry.slug}/index.ts parece vacío o incompleto (${stat.size} bytes).`);
  if(typeof entry.verify_jwt!=='boolean')fail(`${entry.slug} no declara verify_jwt como booleano.`);
}

if(process.exitCode){process.exit();}

console.log(`[edge-functions] Inventario local correcto: ${slugs.length} funciones con fuente versionada.`);

async function checkRemote(){
  const token=String(process.env.SUPABASE_ACCESS_TOKEN||'').trim();
  if(!token){
    console.log('[edge-functions] Validación remota omitida: SUPABASE_ACCESS_TOKEN no está configurado en este entorno.');
    return;
  }

  const ref=manifest.project_ref;
  const response=await fetch(`https://api.supabase.com/v1/projects/${encodeURIComponent(ref)}/functions`,{
    headers:{Authorization:`Bearer ${token}`,'User-Agent':'control-de-proyectos-edge-audit/1.0'}
  });
  if(!response.ok){
    throw new Error(`Management API respondió ${response.status}.`);
  }
  const remote=await response.json();
  if(!Array.isArray(remote))throw new Error('La respuesta remota de Edge Functions no es una lista.');

  const remoteSlugs=remote.map(x=>String(x?.slug||'').trim()).filter(Boolean);
  if(!same(slugs,remoteSlugs)){
    const onlyRemote=remoteSlugs.filter(x=>!unique.has(x));
    const onlyRepo=slugs.filter(x=>!remoteSlugs.includes(x));
    if(onlyRemote.length)fail(`Funciones desplegadas sin código/manifiesto: ${onlyRemote.join(', ')}`);
    if(onlyRepo.length)fail(`Funciones del repositorio no desplegadas: ${onlyRepo.join(', ')}`);
  }

  const bySlug=new Map(entries.map(x=>[x.slug,x]));
  for(const fn of remote){
    const expected=bySlug.get(fn.slug);
    if(!expected)continue;
    if(Boolean(fn.verify_jwt)!==expected.verify_jwt){
      fail(`${fn.slug}: verify_jwt remoto=${Boolean(fn.verify_jwt)} pero manifiesto=${expected.verify_jwt}.`);
    }
  }

  if(process.exitCode)process.exit();
  console.log(`[edge-functions] Despliegue remoto sincronizado con el repositorio: ${remoteSlugs.length} funciones.`);
}

checkRemote().catch(err=>{
  console.error(`[edge-functions] ERROR remoto: ${err?.message||err}`);
  process.exitCode=1;
});
