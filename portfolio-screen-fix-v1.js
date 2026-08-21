/* ===== CONTROL DE PANTALLA · PORTAFOLIO V1 ===== */
(()=>{
'use strict';
if(window.__CC_PORTFOLIO_SCREEN_FIX_V1__)return;
window.__CC_PORTFOLIO_SCREEN_FIX_V1__=true;

function injectStyle(){
  if(document.getElementById('cc-portfolio-screen-fix-style'))return;
  const s=document.createElement('style');
  s.id='cc-portfolio-screen-fix-style';
  s.textContent=`
    body.cc-project-screen .hero-control-contractual,
    body.cc-project-screen .service-strip{display:none!important}
    body.cc-project-screen .shell{padding-top:14px!important}
    body.cc-project-screen .topbar{margin-bottom:13px!important}
    @media(max-width:720px){
      body.cc-project-screen .shell{padding-top:9px!important}
      body.cc-project-screen .topbar{margin-bottom:9px!important}
    }
  `;
  document.head.appendChild(s);
}

function syncScreen(){
  injectStyle();
  let isProject=false;
  try{isProject=(view?.screen==='project'&&!!view?.projectId)}catch{}
  document.body.classList.toggle('cc-project-screen',isProject);
}

let queued=false;
function schedule(){
  if(queued)return;
  queued=true;
  queueMicrotask(()=>{queued=false;syncScreen()});
}

new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-open],[data-tab],#backBtn,[data-follow-project]'))setTimeout(syncScreen,0);
},true);
window.addEventListener('popstate',syncScreen);
syncScreen();
})();