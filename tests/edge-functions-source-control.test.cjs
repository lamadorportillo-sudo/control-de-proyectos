const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'supabase','functions-manifest.json');
const functionsDir=path.join(root,'supabase','functions');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));

function localFunctionSlugs(){
  return fs.readdirSync(functionsDir,{withFileTypes:true})
    .filter(d=>d.isDirectory()&&fs.existsSync(path.join(functionsDir,d.name,'index.ts')))
    .map(d=>d.name)
    .sort();
}

function manifestSlugs(){
  return manifest.functions.map(x=>x.slug).sort();
}

test('el inventario canónico conserva las 22 Edge Functions activas auditadas',()=>{
  assert.equal(manifest.project_ref,'flethujkrharehjikwgj');
  assert.equal(manifest.functions.length,22);
  assert.equal(new Set(manifest.functions.map(x=>x.slug)).size,22,'no debe haber slugs duplicados');
});

test('cada Edge Function del manifiesto tiene código fuente versionado y no hay funciones huérfanas',()=>{
  assert.deepEqual(localFunctionSlugs(),manifestSlugs());
});

test('cada Edge Function tiene un index.ts no vacío y declara verify_jwt',()=>{
  for(const fn of manifest.functions){
    const file=path.join(functionsDir,fn.slug,'index.ts');
    assert.ok(fs.existsSync(file),`${fn.slug}: falta index.ts`);
    assert.ok(fs.statSync(file).size>=80,`${fn.slug}: index.ts parece incompleto`);
    assert.equal(typeof fn.verify_jwt,'boolean',`${fn.slug}: verify_jwt debe ser booleano`);
  }
});

test('las funciones sin verify_jwt de Supabase no contienen por accidente una service role hardcodeada',()=>{
  const secretLike=/SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'`]eyJ[a-zA-Z0-9._-]+/;
  for(const fn of manifest.functions.filter(x=>x.verify_jwt===false)){
    const source=fs.readFileSync(path.join(functionsDir,fn.slug,'index.ts'),'utf8');
    assert.doesNotMatch(source,secretLike,`${fn.slug}: posible service role hardcodeada`);
  }
});
