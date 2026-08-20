/* ===== NAVEGACION COMPLETA DEL EXPEDIENTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_TABS_COMPLETE_V1__)return;
window.__CC_PROJECT_TABS_COMPLETE_V1__=true;

function inject(){
  if(document.getElementById('cc-project-tabs-complete-style'))return;
  const s=document.createElement('style');
  s.id='cc-project-tabs-complete-style';
  s.textContent=`
    nav.tabs{
      display:flex!important;
      flex-wrap:wrap!important;
      align-items:stretch!important;
      gap:6px!important;
      overflow:visible!important;
      padding:5px!important;
      margin-bottom:12px!important;
      scrollbar-width:none!important;
    }
    nav.tabs::-webkit-scrollbar{display:none!important}
    nav.tabs button{
      flex:0 0 auto!important;
      max-width:100%!important;
      min-height:40px!important;
      white-space:normal!important;
      line-height:1.15!important;
      text-align:center!important;
      padding:9px 11px!important;
      font-size:12px!important;
      overflow:visible!important;
      text-overflow:clip!important;
    }
    nav.tabs button.active{
      position:relative!important;
      z-index:1!important;
    }
    @media (min-width:1150px){
      nav.tabs{justify-content:flex-start!important}
      nav.tabs button{font-size:11px!important;padding:9px 10px!important}
    }
    @media (max-width:900px){
      nav.tabs{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
      }
      nav.tabs button{width:100%!important;min-height:44px!important}
    }
    @media (max-width:620px){
      nav.tabs{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      nav.tabs button{font-size:11px!important;padding:9px 7px!important}
    }
    @media (max-width:380px){
      nav.tabs{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(s);
}

function keepActiveVisible(){
  const nav=document.querySelector('nav.tabs');
  if(!nav)return;
  const active=nav.querySelector('button.active');
  if(active&&typeof active.scrollIntoView==='function'){
    try{active.scrollIntoView({block:'nearest',inline:'nearest'})}catch{}
  }
}

inject();
document.addEventListener('click',e=>{
  if(e.target.closest?.('nav.tabs button'))setTimeout(keepActiveVisible,0);
},true);
setTimeout(keepActiveVisible,150);
})();