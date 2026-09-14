/* CONTROL CONTRACTUAL · EXPEDIENTE MUNICIPAL CONTEMPORANEO */
(()=>{
'use strict';
if(window.__CC_MUNICIPAL_DOSSIER_V1__)return;
window.__CC_MUNICIPAL_DOSSIER_V1__=true;

const STYLE_ID='cc-municipal-dossier-v1-style';
function mount(){
  let style=document.getElementById(STYLE_ID);
  if(!style){
    style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      :root{
        --cc-bg:#07101c!important;
        --cc-bg2:#0a1726!important;
        --cc-panel:rgba(12,27,45,.91)!important;
        --cc-panel-strong:#0b192a!important;
        --cc-glass:rgba(18,39,63,.78)!important;
        --cc-line:rgba(158,185,222,.20)!important;
        --cc-line-strong:rgba(210,175,96,.48)!important;
        --cc-text:#f7f9fc!important;
        --cc-muted:#a7b5c7!important;
        --cc-blue:#5d91e8!important;
        --cc-blue2:#285caa!important;
        --cc-cyan:#65b6cf!important;
        --cc-gold:#d2af60;
        --cc-gold-soft:rgba(210,175,96,.13);
        --cc-paper:#e8edf4;
        --cc-good:#52bc81!important;
        --cc-warn:#dfb653!important;
        --cc-danger:#e66d72!important;
      }

      body:not(.print-report){
        background:
          linear-gradient(rgba(151,183,224,.025) 1px,transparent 1px),
          linear-gradient(90deg,rgba(151,183,224,.025) 1px,transparent 1px),
          radial-gradient(circle at 86% 5%,rgba(42,94,170,.21),transparent 30%),
          linear-gradient(152deg,#07101c 0%,#091827 52%,#060d17 100%)!important;
        background-size:48px 48px,48px 48px,auto,auto!important;
      }
      body:not(.print-report)::before{
        opacity:.24!important;background-size:96px 96px!important;
        background-image:radial-gradient(circle,rgba(210,175,96,.30) 1px,transparent 1.5px)!important;
        mask-image:linear-gradient(to bottom,rgba(0,0,0,.62),transparent 82%)!important;
      }
      body:not(.print-report)::after{display:none!important}

      body:not(.print-report) h1,
      body:not(.print-report) h2,
      body:not(.print-report) h3{
        font-family:Georgia,"Times New Roman",serif!important;
        letter-spacing:.01em;text-shadow:none!important;
      }
      body:not(.print-report) h1{letter-spacing:.025em}
      body:not(.print-report) .eyebrow{
        color:#d9bd7a!important;letter-spacing:.18em!important;
      }

      body:not(.print-report) .topbar{
        border:1px solid rgba(210,175,96,.22)!important;
        border-bottom-color:rgba(210,175,96,.42)!important;
        border-radius:12px!important;
        background:linear-gradient(135deg,rgba(13,31,51,.96),rgba(8,20,35,.94))!important;
        box-shadow:0 18px 46px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.04)!important;
      }
      body:not(.print-report) .brand .logo,
      body:not(.print-report) .logo{
        border-radius:50%!important;
        background:radial-gradient(circle at 34% 30%,#527fbf,#173c70 64%,#0b2445)!important;
        border:1px solid #d2af60!important;
        box-shadow:0 0 0 4px rgba(210,175,96,.08),0 10px 26px rgba(0,0,0,.28)!important;
      }

      body:not(.print-report) .panel,
      body:not(.print-report) .card,
      body:not(.print-report) .kpi,
      body:not(.print-report) .info,
      body:not(.print-report) .advance>div,
      body:not(.print-report) .exec-intro,
      body:not(.print-report) .exec-visual,
      body:not(.print-report) .exec-kpi,
      body:not(.print-report) .projects-board,
      body:not(.print-report) .rail-card,
      body:not(.print-report) .sv4-card{
        background:
          linear-gradient(135deg,rgba(255,255,255,.025),transparent 34%),
          linear-gradient(155deg,rgba(17,38,61,.96),rgba(8,20,34,.98))!important;
        border:1px solid rgba(158,185,222,.20)!important;
        border-radius:10px!important;
        box-shadow:0 18px 44px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.035)!important;
      }
      body:not(.print-report) .panel,
      body:not(.print-report) .card,
      body:not(.print-report) .exec-intro,
      body:not(.print-report) .exec-visual,
      body:not(.print-report) .projects-board,
      body:not(.print-report) .rail-card,
      body:not(.print-report) .sv4-card{position:relative}
      body:not(.print-report) .panel::before,
      body:not(.print-report) .card::before,
      body:not(.print-report) .exec-intro::before,
      body:not(.print-report) .exec-visual::before,
      body:not(.print-report) .projects-board::before,
      body:not(.print-report) .rail-card::before,
      body:not(.print-report) .sv4-card::before{
        content:"";position:absolute;left:9px;top:9px;width:15px;height:15px;pointer-events:none;z-index:1;
        border-left:1px solid rgba(210,175,96,.54);border-top:1px solid rgba(210,175,96,.54);
      }
      body:not(.print-report) .panel::after,
      body:not(.print-report) .card::after,
      body:not(.print-report) .projects-board::after,
      body:not(.print-report) .rail-card::after,
      body:not(.print-report) .sv4-card::after{
        content:"";position:absolute;right:9px;bottom:9px;width:15px;height:15px;pointer-events:none;
        border-right:1px solid rgba(210,175,96,.34);border-bottom:1px solid rgba(210,175,96,.34);
      }
      body:not(.print-report) .card:hover,
      body:not(.print-report) .exec-kpi:hover,
      body:not(.print-report) .kpi:hover{
        transform:translateY(-2px)!important;
        border-color:rgba(210,175,96,.38)!important;
        box-shadow:0 22px 48px rgba(0,0,0,.30),0 0 0 1px rgba(210,175,96,.055)!important;
      }

      body:not(.print-report) .panel-head{
        padding-bottom:10px;border-bottom:1px solid rgba(210,175,96,.16);
      }
      body:not(.print-report) .panel-head h2::after,
      body:not(.print-report) .panel-head h3::after{
        content:"";display:inline-block;width:28px;height:1px;margin-left:9px;vertical-align:middle;background:#d2af60;opacity:.55;
      }
      body:not(.print-report) .pill,
      body:not(.print-report) .status,
      body:not(.print-report) .chip,
      body:not(.print-report) .exec-chip{
        border-radius:4px!important;letter-spacing:.035em;text-transform:none;
        background:rgba(17,39,64,.9)!important;border-color:rgba(210,175,96,.22)!important;
      }
      body:not(.print-report) .status.good,
      body:not(.print-report) .pill.good{border-color:rgba(82,188,129,.46)!important;background:rgba(30,95,60,.26)!important}
      body:not(.print-report) .status.warn,
      body:not(.print-report) .pill.warn{border-color:rgba(223,182,83,.48)!important;background:rgba(105,77,20,.24)!important}
      body:not(.print-report) .status.danger,
      body:not(.print-report) .pill.danger{border-color:rgba(230,109,114,.48)!important;background:rgba(105,35,42,.27)!important}

      body:not(.print-report) .btn,
      body:not(.print-report) .icon-btn,
      body:not(.print-report) .tabs button,
      body:not(.print-report) .seg button{
        border-radius:6px!important;box-shadow:none!important;
      }
      body:not(.print-report) .btn.primary{
        background:linear-gradient(135deg,#315f9f,#244b82)!important;
        border-color:rgba(210,175,96,.46)!important;
      }
      body:not(.print-report) .btn.primary:hover{filter:brightness(1.12)}
      body:not(.print-report) input,
      body:not(.print-report) select,
      body:not(.print-report) textarea,
      body:not(.print-report) .input,
      body:not(.print-report) .search{
        border-radius:6px!important;background:rgba(5,16,29,.90)!important;
        border-color:rgba(158,185,222,.25)!important;
      }
      body:not(.print-report) input:focus,
      body:not(.print-report) select:focus,
      body:not(.print-report) textarea:focus,
      body:not(.print-report) .input:focus{
        border-color:#d2af60!important;box-shadow:0 0 0 3px rgba(210,175,96,.10)!important;
      }
      body:not(.print-report) .tabs{
        border-radius:8px!important;border-color:rgba(210,175,96,.17)!important;
        background:rgba(7,20,34,.90)!important;
      }
      body:not(.print-report) .tabs button.active{
        background:linear-gradient(180deg,rgba(50,91,145,.88),rgba(31,64,108,.90))!important;
        box-shadow:inset 0 -2px #d2af60!important;
      }
      body:not(.print-report) .table-wrap{border-radius:8px!important;border-color:rgba(158,185,222,.20)!important}
      body:not(.print-report) .table th{
        background:#0f2239!important;color:#d7c18a!important;border-bottom-color:rgba(210,175,96,.32)!important;
      }
      body:not(.print-report) .table td{border-bottom-color:rgba(158,185,222,.13)!important}
      body:not(.print-report) .modal{
        border-radius:12px!important;border-color:rgba(210,175,96,.32)!important;background:#0b192a!important;
      }
      body:not(.print-report) .modal-head{background:#0b192a!important;border-bottom-color:rgba(210,175,96,.20)!important}

      /* El circulo de avance funciona como el elemento central del expediente. */
      body:not(.print-report) .portfolio-ring{
        box-shadow:0 0 0 7px rgba(210,175,96,.055),0 18px 42px rgba(0,0,0,.30)!important;
      }
      body:not(.print-report) .exec-overview::before{
        border-color:rgba(210,175,96,.08)!important;box-shadow:inset 0 0 0 1px rgba(210,175,96,.22)!important;
      }
      body:not(.print-report) .exec-overview::after{display:none!important}

      @media(max-width:720px){
        body:not(.print-report) .topbar{border-radius:0 0 12px 12px!important}
        body:not(.print-report) .tabs{border-radius:10px!important}
        body:not(.print-report) .modal,
        body:not(.print-report) .modal.small{border-radius:16px 16px 0 0!important}
        body:not(.print-report) .panel::before,
        body:not(.print-report) .card::before,
        body:not(.print-report) .panel::after,
        body:not(.print-report) .card::after{width:11px;height:11px}
      }
      @media(prefers-reduced-motion:reduce){
        body:not(.print-report) .card,
        body:not(.print-report) .kpi{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }else if(style.parentNode!==document.head){
    document.head.appendChild(style);
  }
  const theme=document.querySelector('meta[name="theme-color"]');
  if(theme)theme.setAttribute('content','#07101c');
  document.body?.classList.add('cc-municipal-dossier');
}

mount();
new MutationObserver(()=>requestAnimationFrame(mount)).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(mount,350);setTimeout(mount,1200);
})();
