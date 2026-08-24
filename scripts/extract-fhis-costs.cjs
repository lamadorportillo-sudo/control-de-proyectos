const fs=require('fs');
const path=require('path');

const root=process.argv[2];
const out=process.argv[3];
if(!root||!out)throw new Error('Uso: node extract-fhis-costs.cjs <xlsx-extraido> <salida-js>');

const decode=s=>{
  let v=String(s??'').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/\s+/g,' ').trim();
  if(/[ÃÂ]/.test(v)){const fixed=Buffer.from(v,'latin1').toString('utf8');if(!fixed.includes('�'))v=fixed}
  return v;
};
const xml=p=>fs.readFileSync(path.join(root,p),'utf8');
const strings=[];
const ss=xml('xl/sharedStrings.xml');
for(const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g))strings.push(decode([...m[1].matchAll(/<t(?: [^>]*)?>([\s\S]*?)<\/t>/g)].map(x=>x[1]).join('')));

const wb=xml('xl/workbook.xml');
const rel=xml('xl/_rels/workbook.xml.rels');
const rels={};
for(const m of rel.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g))rels[m[1]]=m[2].replace(/^\//,'');
const sheets=[];
for(const m of wb.matchAll(/<sheet name="([^"]+)"[^>]*r:id="([^"]+)"\/>/g))sheets.push({name:decode(m[1]),file:'xl/'+rels[m[2]].replace(/^xl\//,'')});

function cells(file){
  const src=xml(file),map={};
  for(const m of src.matchAll(/<c\s+([^>]*\br="([A-Z]+\d+)"[^>]*)(?<!\/)>([\s\S]*?)<\/c>/g)){
    const attrs=m[1],body=m[3],type=(attrs.match(/\bt="([^"]+)"/)||[])[1]||'';
    const value=(body.match(/<v>([\s\S]*?)<\/v>/)||[])[1];
    const inline=[...body.matchAll(/<t(?: [^>]*)?>([\s\S]*?)<\/t>/g)].map(x=>x[1]).join('');
    const formula=decode((body.match(/<f(?: [^>]*)?>([\s\S]*?)<\/f>/)||[])[1]||'');
    let v=inline?decode(inline):decode(value||'');
    if(type==='s')v=strings[Number(v)]??v;
    else if(v!==''&&!['str','inlineStr'].includes(type)&&Number.isFinite(Number(v)))v=Number(v);
    map[m[2]]={v,formula};
  }
  return map;
}
const V=(m,a)=>m[a]?.v??'';
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const text=v=>String(v??'').trim();
const norm=v=>text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();

function catalog(sheet,kind,prefix){
  const c=cells(sheet.file),rows=[];
  for(let r=1;r<2500;r++){
    const name=text(V(c,`A${r}`)),b=V(c,`B${r}`),cValue=V(c,`C${r}`),d=V(c,`D${r}`),e=V(c,`E${r}`);
    if(!name)continue;
    let unit='',price=0;
    if(kind==='Mano de obra'){unit='JDR';price=num(b)}
    else if(kind==='Equipo'){unit=text(b);price=num(cValue)}
    else{unit=typeof b==='string'?text(b):'';price=num(cValue)||num(e)||num(d)||(typeof b==='number'?num(b):0)}
    if(!(price>0))continue;
    rows.push({code:`FHIS-${prefix}-${String(rows.length+1).padStart(3,'0')}`,description:name,unit:unit||'UND',price,kind,source:'Tabla Excel FHIS/TSC · referencia 2021',sourceSheet:sheet.name,sourceRow:r,date:'2021'});
  }
  return rows;
}

const catalogs={labor:catalog(sheets[1],'Mano de obra','MO'),materials:catalog(sheets[2],'Material','MAT'),equipment:catalog(sheets[3],'Equipo','EQ')};
const fichas=[];
for(const sheet of sheets.slice(4)){
  const m=cells(sheet.file),code=text(V(m,'B14'))||sheet.name.replace(/\s*\(\d+\)$/,''),description=text(V(m,'B12'))||text(V(m,'A12'));
  if(!/^F\d/i.test(code)||!description)continue;
  const resources=[];
  let section='';
  for(let r=15;r<=65;r++){
    const a=text(V(m,'A'+r)),b=text(V(m,'B'+r)),c=text(V(m,'C'+r)),d=num(V(m,'D'+r)),f=num(V(m,'F'+r)),g=num(V(m,'G'+r));
    const marker=norm(a+' '+b);
    if(/MATERIAL/.test(marker)){section='Material';continue}
    if(/MANO DE OBRA/.test(marker)){section='Mano de obra';continue}
    if(/HERRAMIENTA|EQUIPO/.test(marker)){section='Equipo';continue}
    if(/TOTAL/.test(marker)){continue}
    const resourceCode=/^(MN|MO|HE|F)\s*[-\d]/i.test(a);
    if(b&&(d||f||g)&&(section||resourceCode)){
      const type=/^HE/i.test(a)?'Equipo':/^(MO|ON)/i.test(a)||(/^JDR$/i.test(c)&&!/^HE/i.test(a))?'Mano de obra':/^F/i.test(a)?'Rubro':section||'Material';
      resources.push({type,code:a,description:b,unit:c,quantity:d,unitCost:f,total:g||d*f});
    }
  }
  const total=num(V(m,'G45'))||resources.reduce((s,x)=>s+x.total,0);
  fichas.push({id:sheet.name,code,description,unit:text(V(m,'F14'))||text(V(m,'G14')),yield:num(V(m,'G14'))||1,total,resources});
}

const data={version:1,source:'FICHAS_DE_COSTO_TSC_2011_BASE_FHIS.xlsx',importedAt:'2026-08-23',currency:'HNL',institutionReference:'FHIS / TSC',stats:{sheets:sheets.length,fichas:fichas.length,resources:fichas.reduce((s,x)=>s+x.resources.length,0)},catalogs,fichas};
fs.writeFileSync(out,`/* Base FHIS/TSC importada del libro proporcionado por el usuario. */\nwindow.__ccFhisCostData=${JSON.stringify(data)};\n`,'utf8');
console.log(JSON.stringify(data.stats));
