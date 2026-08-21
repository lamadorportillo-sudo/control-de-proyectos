(()=>{
  const css=`
  body{background:#f4f6f3!important;color:#172019!important}
  .shell{max-width:1440px!important;padding:18px 28px 36px!important}
  .topbar{background:rgba(255,255,255,.96);border:1px solid #dfe6dc;border-radius:18px;padding:13px 18px;box-shadow:0 10px 35px rgba(31,50,35,.08);position:sticky;top:10px;z-index:20}
  .logo{background:linear-gradient(145deg,#466a39,#7b9b5d)!important;box-shadow:none!important;border-radius:10px!important}
  h1{color:#172019}.eyebrow{color:#6c8758!important}.muted{color:#68746b!important}
  .btn{background:#fff!important;color:#26322a!important;border-color:#d6dfd4!important;box-shadow:0 2px 8px rgba(0,0,0,.03)}
  .btn.primary{background:#587747!important;color:#fff!important;border-color:#587747!important}
  .panel,.card,.kpi{background:#fff!important;color:#172019!important;border-color:#dfe6dc!important;box-shadow:0 10px 28px rgba(31,50,35,.07)!important}
  .panel{border-radius:18px!important}.card{border-radius:16px!important;overflow:hidden;transition:.2s ease}.card:hover{transform:translateY(-2px);box-shadow:0 15px 34px rgba(31,50,35,.12)!important}
  .project-grid{gap:16px!important}.card h3{color:#172019!important}.money{color:#263c28}.words,.notice,.footer-note{color:#718076!important}
  .tabs button{background:#fff!important;color:#536158!important;border-color:#dfe6dc!important}.tabs button.active{background:#587747!important;color:#fff!important;border-color:#587747!important}
  .info,.advance>div,.project-context{background:#f7f9f5!important;color:#172019!important;border-color:#dfe6dc!important}.project-context{background:linear-gradient(135deg,#f7faf5,#eef4eb)!important}
  input,select,textarea,.input{background:#fff!important;color:#172019!important;border-color:#cfd9cc!important}
  .table-wrap{border-color:#dfe6dc!important}.table th{background:#eef3eb!important;color:#536158!important}.table td{color:#26322a!important;border-color:#e5ebe3!important}
  .modal{background:#fff!important;color:#172019!important;border-color:#dfe6dc!important}.modal-head{background:#fff!important;border-color:#dfe6dc!important}
  .hero-control-contractual{margin:18px 0;border-radius:22px;min-height:300px;position:relative;overflow:hidden;background:linear-gradient(110deg,rgba(18,34,21,.86),rgba(44,67,39,.62)),linear-gradient(135deg,#36513b,#9caf88);box-shadow:0 18px 50px rgba(31,50,35,.18);display:flex;align-items:center;padding:38px}
  .hero-control-contractual:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(115deg,transparent 0 60px,rgba(255,255,255,.035) 60px 62px)}
  .hero-copy{position:relative;z-index:1;max-width:760px;color:#fff}.hero-copy small{letter-spacing:.15em;text-transform:uppercase;font-weight:800;opacity:.78}.hero-copy h2{font-size:clamp(30px,5vw,56px);line-height:1.02;margin:10px 0 12px;color:#fff}.hero-copy p{font-size:16px;max-width:650px;color:#edf3e9;margin-bottom:20px}.hero-links{display:flex;gap:9px;flex-wrap:wrap}.hero-links button{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.94);color:#30442f;border-radius:10px;padding:11px 15px;font-weight:800}.hero-links button.secondary{background:rgba(20,35,22,.34);color:#fff}
  .service-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px}.service-tile{background:#fff;border:1px solid #dfe6dc;border-radius:16px;padding:18px;text-align:center;box-shadow:0 8px 24px rgba(31,50,35,.05)}.service-icon{font-size:26px}.service-tile b{display:block;margin:8px 0 3px;color:#263c28}.service-tile span{font-size:12px;color:#718076}
  @media(max-width:900px){.service-strip{grid-template-columns:repeat(2,1fr)}.hero-control-contractual{min-height:260px;padding:28px}}
  @media(max-width:620px){.shell{padding:10px 12px 28px!important}.topbar{position:static;border-radius:14px}.hero-control-contractual{min-height:330px;padding:24px 20px;border-radius:16px}.hero-copy p{font-size:14px}.service-strip{grid-template-columns:1fr 1fr;gap:8px}.service-tile{padding:13px 8px}.project-grid{grid-template-columns:1fr!important}}
  `;
  const style=document.createElement('style');style.id='portfolio-redesign-v1';style.textContent=css;document.head.appendChild(style);
  function addHero(){
    const shell=document.querySelector('.shell'); const top=document.querySelector('.topbar');
    if(!shell||!top||document.querySelector('.hero-control-contractual')) return;
    const hero=document.createElement('section');hero.className='hero-control-contractual';hero.innerHTML=`<div class="hero-copy"><small>CONTROL CONTRACTUAL · INGENIERÍA MUNICIPAL</small><h2>Proyectos bajo control, de principio a fin.</h2><p>Seguimiento técnico, contractual y financiero en una vista clara para supervisar obras, pagos, garantías, cambios e informes.</p><div class="hero-links"><button data-jump="projects">Ver proyectos</button><button class="secondary" data-jump="alerts">Asuntos por revisar</button></div></div>`;
    const services=document.createElement('section');services.className='service-strip';services.innerHTML=`<div class="service-tile"><div class="service-icon">▦</div><b>Proyectos</b><span>Ficha y avance de obra</span></div><div class="service-tile"><div class="service-icon">₤</div><b>Pagos</b><span>Estimaciones y saldos</span></div><div class="service-tile"><div class="service-icon">✓</div><b>Garantías</b><span>Vigencias y alertas</span></div><div class="service-tile"><div class="service-icon">⌁</div><b>Visitas</b><span>Control fotográfico</span></div>`;
    top.insertAdjacentElement('afterend',hero);hero.insertAdjacentElement('afterend',services);
    hero.addEventListener('click',e=>{const b=e.target.closest('[data-jump]');if(!b)return; const panels=[...document.querySelectorAll('.panel')]; const target=b.dataset.jump==='alerts'?panels.find(x=>/revisar|alert/i.test(x.textContent)):panels.find(x=>/proyecto/i.test(x.textContent)); target?.scrollIntoView({behavior:'smooth',block:'start'});});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addHero);else addHero();
  new MutationObserver(addHero).observe(document.documentElement,{childList:true,subtree:true});
})();