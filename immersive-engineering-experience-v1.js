/* ===== CONTROL CONTRACTUAL · EXPERIENCIA DE INGENIERIA 3D V1 ===== */
(()=>{
'use strict';
if(window.__CC_IMMERSIVE_ENGINEERING_V1__)return;
window.__CC_IMMERSIVE_ENGINEERING_V1__=true;

const STYLE_ID='cc-immersive-engineering-v1-style';
const HERO_ID='cc-engineering-hero-object';
const LAYER_ID='cc-engineering-ambient-layer';
const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia?.('(hover:hover) and (pointer:fine)').matches;

function injectStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    :root{
      --cc3d-blue:#4e8cff;
      --cc3d-blue-soft:#7eb7ff;
      --cc3d-cyan:#4bdcff;
      --cc3d-violet:#7666ff;
      --cc3d-ink:#050814;
      --cc3d-panel:rgba(8,18,35,.74);
      --cc3d-line:rgba(126,177,255,.18);
      --cc3d-line-strong:rgba(126,177,255,.34);
      --cc3d-glass:blur(20px) saturate(145%);
      --cc3d-shadow:0 28px 80px rgba(0,0,0,.38);
    }

    body:not(.print-report){position:relative;background-attachment:fixed!important}
    body:not(.print-report) #${LAYER_ID}{position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden}
    body:not(.print-report) #${LAYER_ID} .cc3d-grid{
      position:absolute;left:-18vw;right:-18vw;bottom:-23vh;height:58vh;
      background-image:linear-gradient(rgba(83,146,255,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(83,146,255,.10) 1px,transparent 1px);
      background-size:54px 54px;transform:perspective(760px) rotateX(66deg);transform-origin:center bottom;
      mask-image:linear-gradient(to top,rgba(0,0,0,.92),transparent 86%);opacity:.38;
    }
    body:not(.print-report) #${LAYER_ID} .cc3d-orb{position:absolute;border-radius:50%;filter:blur(14px);opacity:.34}
    body:not(.print-report) #${LAYER_ID} .cc3d-orb.a{width:360px;height:360px;right:-110px;top:8%;background:radial-gradient(circle,rgba(61,128,255,.55),rgba(61,128,255,.06) 56%,transparent 72%)}
    body:not(.print-report) #${LAYER_ID} .cc3d-orb.b{width:300px;height:300px;left:-120px;top:42%;background:radial-gradient(circle,rgba(43,213,255,.28),rgba(43,213,255,.04) 58%,transparent 74%)}

    body:not(.print-report) .topbar,
    body:not(.print-report) .panel,
    body:not(.print-report) .card,
    body:not(.print-report) .project-v3,
    body:not(.print-report) .rail-card,
    body:not(.print-report) .sv4-card,
    body:not(.print-report) .modal,
    body:not(.print-report) .auth-card{
      backdrop-filter:var(--cc3d-glass);
      -webkit-backdrop-filter:var(--cc3d-glass);
    }

    body:not(.print-report) .topbar{box-shadow:0 18px 54px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.055)!important}
    body:not(.print-report) .brand{isolation:isolate}
    body:not(.print-report) .brand .logo{position:relative;transform:translateZ(0)}
    body:not(.print-report) .brand .logo::after{content:"";position:absolute;inset:-8px;border-radius:18px;border:1px solid rgba(97,157,255,.18);box-shadow:0 0 28px rgba(61,124,255,.20);z-index:-1}

    body:not(.print-report) .exec-overview{position:relative;min-height:300px;overflow:visible!important}
    body:not(.print-report) .exec-overview>.exec-intro{z-index:2}
    body:not(.print-report) .exec-visual{min-height:280px!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}

    #${HERO_ID}{
      position:relative;width:min(420px,92%);height:270px;perspective:1000px;transform-style:preserve-3d;
      filter:drop-shadow(0 34px 38px rgba(0,0,0,.30));isolation:isolate;margin:auto;
    }
    #${HERO_ID} .cc3d-stage{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(59deg) rotateZ(-33deg) translate3d(0,18px,0)}
    #${HERO_ID} .cc3d-base{position:absolute;left:50%;top:50%;width:290px;height:176px;transform:translate(-50%,-50%);border:1px solid rgba(105,170,255,.26);border-radius:28px;background:linear-gradient(145deg,rgba(22,48,82,.42),rgba(8,21,40,.16));box-shadow:inset 0 0 36px rgba(72,139,255,.08),0 0 50px rgba(49,116,255,.09)}
    #${HERO_ID} .cc3d-base::before,#${HERO_ID} .cc3d-base::after{content:"";position:absolute;inset:18px;border:1px dashed rgba(105,170,255,.20);border-radius:20px}
    #${HERO_ID} .cc3d-base::after{inset:48px 38px;border-style:solid;border-color:rgba(68,214,255,.20)}

    #${HERO_ID} .cc3d-frame{position:absolute;left:50%;top:50%;width:210px;height:116px;transform:translate(-50%,-50%);transform-style:preserve-3d}
    #${HERO_ID} .cc3d-beam{position:absolute;height:8px;border-radius:999px;background:linear-gradient(90deg,rgba(88,159,255,.70),rgba(72,216,255,.95),rgba(88,159,255,.68));box-shadow:0 0 18px rgba(73,179,255,.35),inset 0 1px 0 rgba(255,255,255,.55)}
    #${HERO_ID} .cc3d-beam.h1{width:210px;left:0;top:8px}.cc3d-beam.h2{width:210px;left:0;bottom:8px}.cc3d-beam.h3{width:210px;left:0;top:54px}
    #${HERO_ID} .cc3d-column{position:absolute;width:9px;height:116px;border-radius:999px;background:linear-gradient(180deg,#7fc9ff,#3d7eff 46%,#224ca8);box-shadow:0 0 17px rgba(64,145,255,.34),inset 1px 0 0 rgba(255,255,255,.46)}
    #${HERO_ID} .cc3d-column.c1{left:4px}.cc3d-column.c2{left:68px}.cc3d-column.c3{right:68px}.cc3d-column.c4{right:4px}
    #${HERO_ID} .cc3d-node{position:absolute;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 33% 30%,#fff,#83d4ff 18%,#3978ee 52%,#15346e 74%);box-shadow:0 0 22px rgba(77,180,255,.60)}
    #${HERO_ID} .cc3d-node.n1{left:-3px;top:0}.cc3d-node.n2{left:62px;top:46px}.cc3d-node.n3{right:62px;top:0}.cc3d-node.n4{right:-3px;top:46px}

    #${HERO_ID} .cc3d-tower{position:absolute;left:50%;top:50%;width:72px;height:120px;transform:translate(-50%,-56%) translateZ(48px) rotateX(-59deg) rotateZ(33deg);transform-origin:center bottom;border:1px solid rgba(120,183,255,.28);border-radius:16px 16px 8px 8px;background:linear-gradient(155deg,rgba(65,134,255,.28),rgba(11,32,64,.22));box-shadow:inset 0 0 22px rgba(74,168,255,.13),0 18px 34px rgba(0,0,0,.22)}
    #${HERO_ID} .cc3d-tower::before{content:"";position:absolute;inset:12px;background:repeating-linear-gradient(to bottom,rgba(105,181,255,.34) 0 1px,transparent 1px 17px),repeating-linear-gradient(to right,rgba(105,181,255,.24) 0 1px,transparent 1px 17px);border-radius:8px}
    #${HERO_ID} .cc3d-tower::after{content:"";position:absolute;left:50%;top:-24px;width:1px;height:22px;background:#70c9ff;box-shadow:0 0 13px #4ea6ff}

    #${HERO_ID} .cc3d-ring{position:absolute;left:50%;top:50%;width:246px;height:246px;border-radius:50%;border:1px solid rgba(93,166,255,.18);transform:translate(-50%,-50%) rotateX(68deg);box-shadow:inset 0 0 24px rgba(70,151,255,.08)}
    #${HERO_ID} .cc3d-ring::before{content:"";position:absolute;inset:22px;border-radius:50%;border:1px dashed rgba(73,207,255,.22)}
    #${HERO_ID} .cc3d-scan{position:absolute;left:18%;right:18%;height:2px;top:48%;background:linear-gradient(90deg,transparent,#5bdcff,transparent);box-shadow:0 0 22px rgba(69,218,255,.55);animation:cc3dScan 4.8s ease-in-out infinite}

    #${HERO_ID} .cc3d-chip{position:absolute;padding:7px 10px;border-radius:999px;background:rgba(8,22,43,.78);border:1px solid rgba(115,177,255,.23);box-shadow:0 10px 26px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.06);font-size:9px;font-weight:850;letter-spacing:.04em;color:#d9edff;backdrop-filter:blur(12px)}
    #${HERO_ID} .cc3d-chip::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#58d7ff;margin-right:6px;box-shadow:0 0 10px rgba(88,215,255,.9)}
    #${HERO_ID} .cc3d-chip.a{left:0;top:42px}.cc3d-chip.b{right:2px;top:20px}.cc3d-chip.c{right:5px;bottom:30px}.cc3d-chip.d{left:14px;bottom:12px}
    #${HERO_ID} .cc3d-caption{position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);white-space:nowrap;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#6f91ba;font-weight:800}

    body:not(.print-report) .exec-kpi,
    body:not(.print-report) .kpi,
    body:not(.print-report) .project-v3,
    body:not(.print-report) .rail-card,
    body:not(.print-report) .sv4-card{
      transform-style:preserve-3d;will-change:transform;transition:transform .20s ease,box-shadow .20s ease,border-color .20s ease!important;
    }
    body:not(.print-report) .exec-kpi:hover,
    body:not(.print-report) .kpi:hover,
    body:not(.print-report) .project-v3:hover,
    body:not(.print-report) .rail-card:hover,
    body:not(.print-report) .sv4-card:hover{border-color:rgba(111,167,255,.34)!important;box-shadow:0 24px 58px rgba(0,0,0,.32),0 0 42px rgba(43,108,232,.09)!important}

    body:not(.print-report) .panel,
    body:not(.print-report) .projects-board,
    body:not(.print-report) .modal,
    body:not(.print-report) .auth-card{position:relative;overflow:hidden;border-color:rgba(114,157,220,.17)!important;background:linear-gradient(150deg,rgba(11,24,44,.88),rgba(6,14,28,.94))!important;box-shadow:var(--cc3d-shadow),inset 0 1px 0 rgba(255,255,255,.035)!important}
    body:not(.print-report) .panel::after,
    body:not(.print-report) .projects-board::after,
    body:not(.print-report) .auth-card::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(120deg,transparent 0 38%,rgba(255,255,255,.022) 46%,transparent 54%)}

    body:not(.print-report) .table-wrap{border-color:rgba(110,155,220,.16)!important;background:rgba(5,13,26,.40)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
    body:not(.print-report) .table th{background:rgba(13,28,50,.96)!important;color:#9db5d1!important;border-bottom-color:rgba(111,155,217,.18)!important}
    body:not(.print-report) .table td{border-bottom-color:rgba(99,139,198,.11)!important}
    body:not(.print-report) .table tbody tr{transition:background .15s ease}
    body:not(.print-report) .table tbody tr:hover{background:rgba(58,112,204,.07)!important}

    body:not(.print-report) .tabs{padding:5px!important;border-radius:14px;background:rgba(7,17,32,.42)!important;border:1px solid rgba(111,155,217,.12)!important}
    body:not(.print-report) .tabs button{border-color:rgba(110,157,225,.16)!important;background:rgba(11,25,45,.62)!important;color:#a9bdd4!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}
    body:not(.print-report) .tabs button.active{background:linear-gradient(135deg,rgba(52,114,239,.72),rgba(25,72,171,.78))!important;border-color:rgba(103,164,255,.46)!important;color:#fff!important;box-shadow:0 8px 24px rgba(28,86,205,.25),inset 0 1px 0 rgba(255,255,255,.10)!important}

    body:not(.print-report) .status,
    body:not(.print-report) .pill{box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
    body:not(.print-report) .status.good,body:not(.print-report) .pill.good{box-shadow:0 0 18px rgba(34,197,94,.08),inset 0 1px 0 rgba(255,255,255,.04)}
    body:not(.print-report) .status.warn,body:not(.print-report) .pill.warn{box-shadow:0 0 18px rgba(234,179,8,.07),inset 0 1px 0 rgba(255,255,255,.04)}
    body:not(.print-report) .status.danger,body:not(.print-report) .pill.danger{box-shadow:0 0 18px rgba(239,68,68,.08),inset 0 1px 0 rgba(255,255,255,.04)}

    body:not(.print-report) .auth{position:relative;overflow:hidden}
    body:not(.print-report) .auth::before{content:"";position:absolute;width:520px;height:520px;border:1px solid rgba(79,140,255,.14);border-radius:50%;right:-170px;top:-150px;box-shadow:inset 0 0 45px rgba(79,140,255,.05);animation:cc3dAuthRing 16s linear infinite}
    body:not(.print-report) .auth::after{content:"";position:absolute;left:-12vw;right:-12vw;bottom:-25vh;height:55vh;background-image:linear-gradient(rgba(83,146,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(83,146,255,.08) 1px,transparent 1px);background-size:44px 44px;transform:perspective(700px) rotateX(68deg);transform-origin:center bottom;mask-image:linear-gradient(to top,rgba(0,0,0,.8),transparent);pointer-events:none}
    body:not(.print-report) .auth-card{z-index:2;border-color:rgba(113,165,244,.24)!important}

    body:not(.print-report) .modal-bg{background:rgba(1,5,13,.74)!important;backdrop-filter:blur(12px)!important}
    body:not(.print-report) .modal-head{background:rgba(8,18,34,.93)!important;border-bottom-color:rgba(111,155,217,.14)!important;backdrop-filter:blur(18px)}

    @keyframes cc3dScan{0%,100%{transform:translateY(-68px);opacity:.15}50%{transform:translateY(76px);opacity:1}}
    @keyframes cc3dAuthRing{to{transform:rotate(360deg)}}
    @keyframes cc3dHeroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    #${HERO_ID}{animation:cc3dHeroFloat 7s ease-in-out infinite}

    @media(max-width:1100px){
      #${HERO_ID}{width:min(360px,94%);height:245px;transform:scale(.92)}
      body:not(.print-report) .exec-visual{min-height:245px!important}
    }
    @media(max-width:760px){
      body:not(.print-report) #${LAYER_ID} .cc3d-grid{height:48vh;bottom:-18vh;background-size:42px 42px;opacity:.28}
      body:not(.print-report) .exec-overview{min-height:0}
      body:not(.print-report) .exec-visual{min-height:210px!important}
      #${HERO_ID}{height:205px;transform:scale(.78);margin:-12px auto}
      #${HERO_ID} .cc3d-chip{font-size:8px;padding:6px 8px}
      body:not(.print-report) .panel,body:not(.print-report) .projects-board,body:not(.print-report) .auth-card{border-radius:16px!important}
    }
    @media(max-width:480px){
      #${HERO_ID}{transform:scale(.67);margin:-25px auto -24px}
      body:not(.print-report) .exec-visual{min-height:172px!important}
      #${HERO_ID} .cc3d-caption{font-size:8px}
    }
    @media(prefers-reduced-motion:reduce){
      #${HERO_ID},#${HERO_ID} .cc3d-scan,body:not(.print-report) .auth::before{animation:none!important}
      body:not(.print-report) .exec-kpi,body:not(.print-report) .kpi,body:not(.print-report) .project-v3,body:not(.print-report) .rail-card,body:not(.print-report) .sv4-card{transition:none!important}
    }
  `;
  document.head.appendChild(s);
}

function installAmbient(){
  if(document.getElementById(LAYER_ID))return;
  const el=document.createElement('div');
  el.id=LAYER_ID;
  el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="cc3d-orb a"></div><div class="cc3d-orb b"></div><div class="cc3d-grid"></div>';
  document.body.prepend(el);
}

function heroMarkup(){
  return `
    <div id="${HERO_ID}" aria-hidden="true">
      <div class="cc3d-ring"></div>
      <div class="cc3d-stage">
        <div class="cc3d-base"></div>
        <div class="cc3d-frame">
          <i class="cc3d-beam h1"></i><i class="cc3d-beam h2"></i><i class="cc3d-beam h3"></i>
          <i class="cc3d-column c1"></i><i class="cc3d-column c2"></i><i class="cc3d-column c3"></i><i class="cc3d-column c4"></i>
          <i class="cc3d-node n1"></i><i class="cc3d-node n2"></i><i class="cc3d-node n3"></i><i class="cc3d-node n4"></i>
        </div>
      </div>
      <div class="cc3d-tower"></div>
      <div class="cc3d-scan"></div>
      <span class="cc3d-chip a">Estructura</span>
      <span class="cc3d-chip b">Costo</span>
      <span class="cc3d-chip c">Plazo</span>
      <span class="cc3d-chip d">Campo</span>
      <small class="cc3d-caption">Control técnico · contractual · financiero</small>
    </div>`;
}

function mountHero(){
  if(document.getElementById(HERO_ID))return;
  const visual=document.querySelector('.exec-visual');
  if(!visual)return;
  const previous=visual.querySelector('.portfolio-ring, .exec-visual-inner, .exec-visual-content');
  if(previous)previous.style.opacity='.20';
  visual.insertAdjacentHTML('beforeend',heroMarkup());
}

function installTilt(){
  if(!finePointer||reduceMotion)return;
  const selector='.exec-kpi,.kpi,.project-v3,.rail-card,.sv4-card';
  document.querySelectorAll(selector).forEach(card=>{
    if(card.dataset.cc3dTilt)return;
    card.dataset.cc3dTilt='1';
    let raf=0;
    const move=e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/Math.max(1,r.width)-.5;
      const y=(e.clientY-r.top)/Math.max(1,r.height)-.5;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{card.style.transform=`perspective(900px) rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*3.0).toFixed(2)}deg) translateY(-2px)`});
    };
    const leave=()=>{cancelAnimationFrame(raf);card.style.transform=''};
    card.addEventListener('pointermove',move,{passive:true});
    card.addEventListener('pointerleave',leave,{passive:true});
  });
}

function polish(){
  injectStyles();
  installAmbient();
  mountHero();
  installTilt();
}

polish();
let queued=false;
const observer=new MutationObserver(()=>{
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;polish()});
});
observer.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(polish,350);
setTimeout(polish,1200);
window.ccRefreshImmersiveEngineeringUI=polish;
})();
