(()=>{
  if(document.getElementById('portfolio-redesign-v1')) return;
  const css=`
  :root{color-scheme:light!important;--bg:#f4f6f3!important;--panel:#fff!important;--panel2:#f8faf7!important;--line:#dce4d9!important;--text:#172019!important;--muted:#6d786f!important;--accent:#5f7d4a!important;--accent2:#46643b!important;--shadow:0 14px 36px rgba(38,58,42,.08)!important}
  body{background:#f4f6f3!important;color:#172019!important}
  .shell{max-width:1440px!important;padding:18px 28px 38px!important}
  .topbar{background:rgba(255,255,255,.97)!important;border:1px solid #dfe6dc!important;border-radius:18px!important;padding:13px 18px!important;box-shadow:0 10px 35px rgba(31,50,35,.08)!important;position:sticky!important;top:10px!important;z-index:20!important}
  .brand .logo{background:linear-gradient(145deg,#466a39,#7b9b5d)!important;box-shadow:none!important;border-radius:10px!important}
  h1,h2,h3{color:#172019!important}.eyebrow{color:#6c8758!important}.muted{color:#68746b!important}
  .btn{background:#fff!important;color:#26322a!important;border-color:#d6dfd4!important;box-shadow:0 2px 8px rgba(0,0,0,.03)!important}.btn:hover{border-color:#8aa17c!important}.btn.primary{background:#587747!important;color:#fff!important;border-color:#587747!important}.btn.danger{color:#8b2f2f!important;border-color:#e2bdbd!important;background:#fff7f7!important}.btn.good{color:#32623f!important;border-color:#bcd6c2!important;background:#f5fbf6!important}
  .panel,.card,.kpi{background:#fff!important;color:#172019!important;border-color:#dfe6dc!important;box-shadow:0 10px 28px rgba(31,50,35,.07)!important}.panel{border-radius:18px!important}.card{border-radius:16px!important;overflow:hidden!important;transition:.2s ease!important}.card:hover{transform:translateY(-2px);box-shadow:0 15px 34px rgba(31,50,35,.12)!important}
  .project-grid{gap:16px!important}.card h3{color:#172019!important}.money{color:#263c28!important}.words,.notice,.footer-note{color:#718076!important}.code{color:#55754a!important}
  .tabs button{background:#fff!important;color:#536158!important;border-color:#dfe6dc!important}.tabs button.active{background:#587747!important;color:#fff!important;border-color:#587747!important}
  .info,.advance>div,.project-context{background:#f7f9f5!important;color:#172019!important;border-color:#dfe6dc!important}.project-context{background:linear-gradient(135deg,#f7faf5,#eef4eb)!important}.project-context small,.info small,.advance small{color:#6d786f!important}
  input,select,textarea,.input{background:#fff!important;color:#172019!important;border-color:#cfd9cc!important}.input:focus,input:focus,select:focus,textarea:focus{border-color:#6f8d5b!important;box-shadow:0 0 0 3px rgba(95,125,74,.12)!important}
  .table-wrap{border-color:#dfe6dc!important}.table th{background:#eef3eb!important;color:#536158!important}.table td{color:#26322a!important;border-color:#e5ebe3!important}
  .modal{background:#fff!important;color:#172019!important;border-color:#dfe6dc!important}.modal-head{background:#fff!important;border-color:#dfe6dc!important}.auth-card{background:#fff!important;color:#172019!important;border-color:#dfe6dc!important}.seg{background:#f0f4ee!important;border-color:#dfe6dc!important}.seg button{color:#59665d!important}.seg button.active{background:#587747!important;color:#fff!important}
  .hero-control-contractual{margin:18px 0;border-radius:22px;min-height:330px;position:relative;overflow:hidden;background:linear-gradient(105deg,rgba(20,36,22,.90),rgba(53,77,48,.62)),radial-gradient(circle at 78% 38%,rgba(222,235,215,.42),transparent 24%),linear-gradient(135deg,#2f4935 0%,#758d68 52%,#b8c5ae 100%);box-shadow:0 18px 50px rgba(31,50,35,.18);display:flex;align-items:center;padding:42px}
  .hero-control-contractual:before{content:'';position:absolute;right:-4%;top:-28%;width:56%;height:150%;transform:rotate(18deg);background:repeating-linear-gradient(90deg,rgba(255,255,255,.11) 0 2px,transparent 2px 52px);opacity:.55;pointer-events:none}.hero-control-contractual:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 68%,rgba(11,25,13,.18));pointer-events:none}
  .hero-copy{position:relative;z-index:2;max-width:760px;color:#fff}.hero-copy small{letter-spacing:.15em;text-transform:uppercase;font-weight:800;opacity:.82}.hero-copy h2{font-size:clamp(30px,5vw,56px)!important;line-height:1.02;margin:10px 0 12px;color:#fff!important;max-width:760px}.hero-copy p{font-size:16px;max-width:650px;color:#edf3e9;margin-bottom:20px}.hero-links{display:flex;gap:9px;flex-wrap:wrap}.hero-links button{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.95);color:#30442f;border-radius:10px;padding:11px 15px;font-weight:800;cursor:pointer}.hero-links button.secondary{background:rgba(20,35,22,.34);color:#fff}
  .service-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px}.service-tile{appearance:none;width:100%;font:inherit;background:#fff;border:1px solid #dfe6dc;border-radius:16px;padding:18px;text-align:center;box-shadow:0 8px 24px rgba(31,50,35,.05);cursor:pointer;transition:.18s ease;color:#172019}.service-tile:hover,.service-tile:focus-visible{transform:translateY(-2px);border-color:#8ea47f;box-shadow:0 12px 28px rgba(31,50,35,.10);outline:none}.service-tile:active{transform:translateY(0)}.service-icon{width:46px;height:46px;margin:0 auto;border-radius:50%;display:grid;place-items:center;background:#edf4e9;color:#587747;font-size:22px;font-weight:900}.service-tile b{display:block;margin:8px 0 3px;color:#263c28}.service-tile span{font-size:12px;color:#718076}
  .service-picker-bg{position:fixed;inset:0;z-index:120;background:rgba(27,38,30,.54);backdrop-filter:blur(3px);display:grid;place-items:center;padding:18px}.service-picker{width:min(920px,100%);max-height:88vh;overflow:hidden;background:#fff;border:1px solid #dbe4d8;border-radius:20px;box-shadow:0 30px 90px rgba(31,50,35,.24);display:flex;flex-direction:column}.service-picker-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 20px 13px;border-bottom:1px solid #e2e8df}.service-picker-head h2{margin:0 0 4px!important;font-size:21px!important}.service-picker-head p{margin:0;color:#6d786f;font-size:12px}.service-picker-close{border:1px solid #d6dfd4;background:#fff;color:#425046;width:38px;height:38px;border-radius:11px;font-size:18px;cursor:pointer}.service-picker-tools{padding:12px 20px;border-bottom:1px solid #edf1eb}.service-picker-tools input{margin:0}.service-picker-list{overflow:auto;padding:12px 20px 20px;display:grid;gap:9px}.service-project{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(190px,.7fr) auto;gap:12px;align-items:center;border:1px solid #e0e7dd;border-radius:14px;padding:12px;background:#fafcf9}.service-project:hover{border-color:#b9c9b3;background:#f7faf5}.service-project-code{font-size:10px;font-weight:900;color:#5f7d4a;letter-spacing:.04em}.service-project-name{font-weight:800;color:#243329;margin-top:2px;line-height:1.25}.service-project-meta{font-size:11px;color:#6d786f;line-height:1.35}.service-project .btn{white-space:nowrap}.service-picker-empty{text-align:center;padding:28px 12px;color:#718076;border:1px dashed #d6dfd4;border-radius:12px}
  .status,.pill{background:#f2f6f0!important;border-color:#d4ded1!important;color:#4b5d4d!important}.status.good,.pill.good{color:#28623a!important;border-color:#b9d9c0!important;background:#eef8f0!important}.status.warn,.pill.warn{color:#75640d!important;border-color:#ded39a!important;background:#fffbe8!important}.status.danger,.pill.danger{color:#8d3131!important;border-color:#e4bcbc!important;background:#fff3f3!important}.status.orange,.pill.orange{color:#8b511c!important;border-color:#e6c49d!important;background:#fff7ec!important}.status.blue,.pill.blue{color:#375d7d!important;border-color:#bdd1df!important;background:#f0f7fb!important}
  @media(max-width:900px){.service-strip{grid-template-columns:repeat(2,1fr)}.hero-control-contractual{min-height:280px;padding:30px}.topbar{position:static!important}.service-project{grid-template-columns:1fr auto}.service-project-meta{grid-column:1/-1;grid-row:2}}
  @media(max-width:620px){.shell{padding:10px 12px 28px!important}.topbar{border-radius:14px!important}.hero-control-contractual{min-height:350px;padding:25px 20px;border-radius:16px}.hero-copy p{font-size:14px}.service-strip{grid-template-columns:1fr 1fr;gap:8px}.service-tile{padding:13px 8px}.project-grid{grid-template-columns:1fr!important}.service-picker-bg{padding:7px}.service-picker{max-height:94vh;border-radius:15px}.service-picker-head,.service-picker-tools,.service-picker-list{padding-left:13px;padding-right:13px}.service-project{grid-template-columns:1fr}.service-project-meta{grid-column:auto;grid-row:auto}.service-project .btn{width:100%}}
  `;
  const style=document.createElement('style');style.id='portfolio-redesign-v1';style.textContent=css;document.head.appendChild(style);

  const A=v=>Array.isArray(v)?v:[];
  const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const N=v=>Number(v)||0;
  const money=v=>{try{return typeof fmtC==='function'?fmtC(N(v)):`L ${N(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`}catch{return`L ${N(v).toFixed(2)}`}};
  const date=v=>{try{return v&&typeof dmy==='function'?dmy(v):(v||'—')}catch{return v||'—'}};
  const activeProjects=()=>{try{return A(db?.projects).filter(p=>!p.deletedAt).sort((a,b)=>String(a.code||'').localeCompare(String(b.code||''),undefined,{numeric:true}))}catch{return[]}};
  const contractOf=p=>{try{return A(db?.contracts).find(c=>c.projectId===p.id)||null}catch{return null}};

  function moduleMeta(p,type){
    const c=contractOf(p);
    if(type==='payments'){
      const rows=A(db?.estimates).filter(e=>e.projectId===p.id||(c&&e.contractId===c.id));
      const total=rows.reduce((s,e)=>s+N(e.gross??e.amount??e.estimatedAmount),0);
      return `${rows.length} estimación${rows.length===1?'':'es'} registrada${rows.length===1?'':'s'}${rows.length?` · ${money(total)}`:''}`;
    }
    if(type==='guarantees'){
      const rows=A(db?.guarantees).filter(g=>g.projectId===p.id||(c&&g.contractId===c.id));
      const dates=rows.map(g=>g.end||g.endDate||g.expiry||'').filter(Boolean).sort();
      return `${rows.length} garantía${rows.length===1?'':'s'}${dates[0]?` · próxima vigencia ${date(dates[0])}`:''}`;
    }
    if(type==='visits'){
      const rows=A(db?.visits).filter(v=>v.projectId===p.id).sort((a,b)=>String(b.date||b.createdAt||'').localeCompare(String(a.date||a.createdAt||'')));
      return `${rows.length} visita${rows.length===1?'':'s'}${rows[0]?` · última ${date(rows[0].date||String(rows[0].createdAt||'').slice(0,10))}`:''}`;
    }
    return `${p.status||'Sin estado'}${p.location?` · ${p.location}`:''}`;
  }

  function closePicker(){document.querySelector('.service-picker-bg')?.remove()}

  function openProjectModule(id,type){
    closePicker();
    try{
      view.projectId=id;
      view.screen='project';
      view.tab=type==='payments'?'estimates':type==='guarantees'?'guarantees':type==='visits'?'visits':'summary';
      renderApp();
      let tries=0;
      const rx=type==='payments'?/estimaci|pago/i:type==='guarantees'?/garant/i:type==='visits'?/visita/i:/resumen/i;
      const ensure=()=>{
        const btn=[...document.querySelectorAll('nav.tabs button,.tabs button')].find(b=>rx.test(b.textContent||''));
        if(btn&&!btn.classList.contains('active'))btn.click();
        if(btn){setTimeout(()=>btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'}),50);return}
        if(++tries<15)setTimeout(ensure,90);
      };
      setTimeout(ensure,40);
    }catch(err){console.error(err);try{toast('No se pudo abrir el módulo seleccionado.')}catch{}}
  }

  function picker(type){
    closePicker();
    const titles={payments:['Pagos y estimaciones','Selecciona el proyecto cuyo control financiero deseas abrir.','Abrir pagos'],guarantees:['Garantías','Selecciona el proyecto para revisar vigencias, alertas y garantías.','Abrir garantías'],visits:['Visitas de campo','Selecciona el proyecto para revisar o registrar sus visitas independientes.','Abrir visitas']};
    const [title,desc,action]=titles[type]||['Proyectos','Selecciona un proyecto.','Abrir'];
    const ps=activeProjects();
    const bg=document.createElement('div');bg.className='service-picker-bg';
    bg.innerHTML=`<section class="service-picker" role="dialog" aria-modal="true" aria-label="${E(title)}"><div class="service-picker-head"><div><h2>${E(title)}</h2><p>${E(desc)}</p></div><button type="button" class="service-picker-close" aria-label="Cerrar">×</button></div><div class="service-picker-tools"><input type="search" placeholder="Buscar por código, proyecto o ubicación…" data-service-search></div><div class="service-picker-list">${ps.length?ps.map(p=>`<article class="service-project" data-service-row="${E(`${p.code||''} ${p.name||''} ${p.location||''}`.toLowerCase())}"><div><div class="service-project-code">${E(p.code||'SIN CÓDIGO')}</div><div class="service-project-name">${E(p.name||'Proyecto')}</div></div><div class="service-project-meta">${E(moduleMeta(p,type))}</div><button type="button" class="btn primary" data-service-open="${E(p.id)}">${E(action)}</button></article>`).join(''):'<div class="service-picker-empty">No hay proyectos disponibles.</div>'}</div></section>`;
    document.body.appendChild(bg);
    bg.querySelector('.service-picker-close').onclick=closePicker;
    bg.addEventListener('click',e=>{if(e.target===bg)closePicker()});
    bg.querySelectorAll('[data-service-open]').forEach(b=>b.onclick=()=>openProjectModule(b.dataset.serviceOpen,type));
    const q=bg.querySelector('[data-service-search]');
    if(q){q.oninput=()=>{const term=q.value.trim().toLowerCase();bg.querySelectorAll('[data-service-row]').forEach(r=>r.hidden=!!term&&!r.dataset.serviceRow.includes(term))};setTimeout(()=>q.focus(),30)}
  }

  function go(type){
    if(type==='projects'){
      try{view.screen='projects';view.projectId=null;renderApp();setTimeout(()=>document.querySelector('.project-grid,[data-project-list],#content .panel')?.scrollIntoView({behavior:'smooth',block:'start'}),70)}catch(err){console.error(err)}
      return;
    }
    if(type==='payments'||type==='guarantees'||type==='visits'){picker(type);return}
    if(type==='alerts'){
      const b=document.querySelector('[data-ccx="alerts"]');
      if(b){b.click();return}
      const p=[...document.querySelectorAll('.panel')].find(x=>/revisar|alert/i.test(x.textContent||''));
      if(p)p.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  function addHero(){
    const shell=document.querySelector('.shell'),top=document.querySelector('.topbar');
    if(!shell||!top||document.querySelector('.hero-control-contractual')) return;
    const hero=document.createElement('section');hero.className='hero-control-contractual';hero.innerHTML=`<div class="hero-copy"><small>CONTROL CONTRACTUAL · INGENIERÍA MUNICIPAL</small><h2>Proyectos bajo control, de principio a fin.</h2><p>Seguimiento técnico, contractual y financiero en una vista clara para supervisar obras, pagos, garantías, cambios e informes.</p><div class="hero-links"><button type="button" data-go="projects">Ver proyectos</button><button type="button" class="secondary" data-go="alerts">Asuntos por revisar</button></div></div>`;
    const services=document.createElement('section');services.className='service-strip';services.innerHTML=`<button type="button" class="service-tile" data-go="projects"><div class="service-icon">▦</div><b>Proyectos</b><span>Ficha y avance de obra</span></button><button type="button" class="service-tile" data-go="payments"><div class="service-icon">L</div><b>Pagos</b><span>Estimaciones y saldos</span></button><button type="button" class="service-tile" data-go="guarantees"><div class="service-icon">✓</div><b>Garantías</b><span>Vigencias y alertas</span></button><button type="button" class="service-tile" data-go="visits"><div class="service-icon">⌁</div><b>Visitas</b><span>Control fotográfico</span></button>`;
    top.insertAdjacentElement('afterend',hero);hero.insertAdjacentElement('afterend',services);
    [hero,services].forEach(el=>el.addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(t){e.preventDefault();go(t.dataset.go)}}));
  }

  let scheduled=false;
  function decorate(){scheduled=false;addHero()}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(decorate)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  new MutationObserver(schedule).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();