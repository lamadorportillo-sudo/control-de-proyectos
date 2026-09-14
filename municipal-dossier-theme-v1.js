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

      /* BITACORA DE OBRA NOCTURNA
         Lenguaje visual inspirado en planos, vigas, recorridos de obra y expedientes antiguos. */
      body.cc-portal-v2:not(.print-report){
        --cc-ink:#05080d;
        --cc-coal:#090e15;
        --cc-slate:#101923;
        --cc-bronze:#b98945;
        --cc-bronze-light:#e3bd78;
        --cc-parchment:#d8c39a;
        background:
          linear-gradient(90deg,rgba(185,137,69,.035) 1px,transparent 1px),
          linear-gradient(rgba(185,137,69,.025) 1px,transparent 1px),
          radial-gradient(circle at 78% -8%,rgba(87,47,33,.35),transparent 35%),
          radial-gradient(circle at 6% 55%,rgba(31,55,70,.30),transparent 32%),
          linear-gradient(145deg,#05070b 0%,#0a1119 48%,#070b10 100%)!important;
        background-size:72px 72px,72px 72px,auto,auto,auto!important;
      }
      body.cc-portal-v2:not(.print-report)::before{
        opacity:.7!important;
        background-image:
          linear-gradient(135deg,transparent 49.7%,rgba(185,137,69,.12) 50%,transparent 50.3%),
          radial-gradient(circle,rgba(227,189,120,.38) 1px,transparent 1.4px)!important;
        background-size:144px 144px,72px 72px!important;
        mask-image:linear-gradient(to bottom,#000,transparent 86%)!important;
      }
      body.cc-portal-v2:not(.print-report) .shell.cc-shell{grid-template-columns:268px minmax(0,1fr)!important}
      body.cc-portal-v2:not(.print-report) .cc-app-column{padding:20px 26px 32px!important}

      body.cc-portal-v2:not(.print-report) .cc-sidebar{
        padding:20px 15px!important;
        background:
          linear-gradient(90deg,transparent 0 11px,rgba(185,137,69,.12) 11px 12px,transparent 12px),
          linear-gradient(180deg,#080b10 0%,#0d151d 52%,#070a0e 100%)!important;
        border-right:1px solid rgba(227,189,120,.36)!important;
        box-shadow:18px 0 55px rgba(0,0,0,.42),inset -5px 0 18px rgba(0,0,0,.30)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-sidebar::after{
        content:"";position:absolute;right:5px;top:0;bottom:0;width:1px;
        background:linear-gradient(transparent,rgba(227,189,120,.40) 12%,rgba(227,189,120,.10) 80%,transparent);
        pointer-events:none;
      }
      body.cc-portal-v2:not(.print-report) .cc-sidebar-brand{
        padding:2px 6px 18px!important;border-bottom:1px solid rgba(227,189,120,.25)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-sidebar-mark{
        width:46px;height:46px;border-radius:2px!important;
        color:#181008!important;font-family:Georgia,"Times New Roman",serif!important;font-size:16px!important;
        background:
          linear-gradient(135deg,transparent 7px,#d6ad69 7px calc(100% - 7px),transparent calc(100% - 7px)),
          #8c6535!important;
        border:1px solid #efcb88!important;
        box-shadow:0 0 0 4px rgba(185,137,69,.09),0 12px 28px rgba(0,0,0,.42)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-sidebar-brand strong{
        font-family:Georgia,"Times New Roman",serif!important;font-size:15px!important;letter-spacing:.025em!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-sidebar-brand small{color:#9a9388!important;font-size:10px!important}
      body.cc-portal-v2:not(.print-report) .cc-sidebar-motto{
        position:relative;margin:14px 5px 12px!important;padding:11px 12px 11px 16px!important;
        color:#d3b77f!important;background:linear-gradient(90deg,rgba(185,137,69,.13),rgba(185,137,69,.025))!important;
        border:0!important;border-left:2px solid #b98945!important;border-radius:0!important;
        font-family:Georgia,"Times New Roman",serif!important;font-size:10px!important;font-style:italic;
      }
      body.cc-portal-v2:not(.print-report) .cc-nav-label{
        color:#8d7b61!important;font-size:9px!important;letter-spacing:.24em!important;padding-top:13px!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-side-nav{gap:3px!important}
      body.cc-portal-v2:not(.print-report) .cc-side-btn{
        min-height:43px;border-radius:2px!important;color:#c5c3be!important;font-size:12px!important;
        border:1px solid transparent!important;padding:9px 10px!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-side-btn:hover{
        transform:translateX(3px)!important;color:#fff8e9!important;
        background:linear-gradient(90deg,rgba(185,137,69,.15),transparent)!important;
        border-color:rgba(185,137,69,.16)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-side-btn.active{
        color:#fff8e9!important;
        background:
          linear-gradient(90deg,rgba(185,137,69,.32),rgba(76,48,29,.18) 72%,transparent)!important;
        border-color:rgba(227,189,120,.32)!important;
        box-shadow:inset 3px 0 #e3bd78,0 8px 24px rgba(0,0,0,.19)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-side-icon{
        border-radius:50%!important;background:rgba(185,137,69,.07)!important;color:#cba96f!important;
        border:1px solid rgba(227,189,120,.18)!important;font-family:Georgia,"Times New Roman",serif!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-side-btn.active .cc-side-icon{
        background:#b98945!important;color:#130d08!important;border-color:#e3bd78!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-sync-box,
      body.cc-portal-v2:not(.print-report) .cc-profile-box{
        border-radius:3px!important;background:#090f16!important;border-color:rgba(185,137,69,.19)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-sidebar-logout{border-radius:3px!important;background:#090d12!important}

      body.cc-portal-v2:not(.print-report) .topbar{
        min-height:68px!important;margin:0 0 14px!important;padding:7px 2px 14px!important;
        border:0!important;border-bottom:1px solid rgba(227,189,120,.34)!important;border-radius:0!important;
        background:transparent!important;box-shadow:none!important;
      }
      body.cc-portal-v2:not(.print-report) .topbar::after{
        content:"EXPEDIENTE DIGITAL  /  CONTROL DE OBRA";align-self:flex-end;margin-left:auto;
        color:#776b5a;font-size:8px;font-weight:900;letter-spacing:.2em;white-space:nowrap;
      }
      body.cc-portal-v2:not(.print-report) .topbar .brand h1{
        color:#f0eadf!important;font-family:Georgia,"Times New Roman",serif!important;font-size:24px!important;letter-spacing:.02em!important;
      }
      body.cc-portal-v2:not(.print-report) .topbar .brand .eyebrow{color:#c69d5d!important;letter-spacing:.2em!important}
      body.cc-portal-v2:not(.print-report) .cc-commandbar{
        padding:10px!important;margin-bottom:16px!important;border:1px solid rgba(185,137,69,.17)!important;
        border-left:3px solid #8f6335!important;background:rgba(7,11,16,.72)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-global-search input{
        border-radius:2px!important;background:#070b10!important;border-color:rgba(185,137,69,.22)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-command-btn,
      body.cc-portal-v2:not(.print-report) .btn{
        border-radius:2px!important;letter-spacing:.015em!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-command-btn.primary,
      body.cc-portal-v2:not(.print-report) .btn.primary{
        color:#151008!important;background:linear-gradient(135deg,#d4aa68,#9b6b37)!important;
        border-color:#e4bf7b!important;box-shadow:0 8px 24px rgba(79,46,23,.28)!important;
      }
      body.cc-portal-v2:not(.print-report) .cc-command-btn.gold{
        color:#e6c98e!important;background:rgba(185,137,69,.10)!important;border-color:rgba(227,189,120,.34)!important;
      }

      body.cc-portal-v2:not(.print-report) .exec-overview,
      body.cc-portal-v2:not(.print-report) .dashboard-hero,
      body.cc-portal-v2:not(.print-report) .hero-control-contractual{
        position:relative!important;overflow:hidden!important;border-radius:3px!important;
        border:1px solid rgba(227,189,120,.38)!important;
        background:
          linear-gradient(90deg,rgba(5,8,12,.96),rgba(10,16,23,.84) 55%,rgba(33,22,16,.73)),
          repeating-linear-gradient(90deg,transparent 0 78px,rgba(227,189,120,.08) 78px 80px),
          linear-gradient(135deg,#121b24,#17100c)!important;
        box-shadow:0 26px 70px rgba(0,0,0,.42),inset 0 0 0 5px rgba(5,8,12,.72),inset 0 0 0 6px rgba(185,137,69,.16)!important;
      }
      body.cc-portal-v2:not(.print-report) .exec-overview::before,
      body.cc-portal-v2:not(.print-report) .dashboard-hero::before,
      body.cc-portal-v2:not(.print-report) .hero-control-contractual::before{
        content:""!important;display:block!important;position:absolute!important;inset:18px!important;
        border:1px solid rgba(227,189,120,.13)!important;pointer-events:none!important;
        background:
          linear-gradient(135deg,rgba(227,189,120,.34) 0 1px,transparent 1px) left top/28px 28px no-repeat,
          linear-gradient(225deg,rgba(227,189,120,.34) 0 1px,transparent 1px) right top/28px 28px no-repeat,
          linear-gradient(45deg,rgba(227,189,120,.34) 0 1px,transparent 1px) left bottom/28px 28px no-repeat,
          linear-gradient(315deg,rgba(227,189,120,.34) 0 1px,transparent 1px) right bottom/28px 28px no-repeat!important;
        opacity:1!important;transform:none!important;
      }
      body.cc-portal-v2:not(.print-report) .exec-intro,
      body.cc-portal-v2:not(.print-report) .exec-visual{background:transparent!important;border:0!important;box-shadow:none!important}
      body.cc-portal-v2:not(.print-report) .exec-intro h2,
      body.cc-portal-v2:not(.print-report) .dashboard-hero h2,
      body.cc-portal-v2:not(.print-report) .hero-copy h2{
        color:#f2eadc!important;font-family:Georgia,"Times New Roman",serif!important;letter-spacing:.01em!important;
        text-wrap:balance;
      }
      body.cc-portal-v2:not(.print-report) .exec-intro p,
      body.cc-portal-v2:not(.print-report) .dashboard-hero p,
      body.cc-portal-v2:not(.print-report) .hero-copy p{color:#b7afa2!important;font-size:14px!important;line-height:1.7!important}
      body.cc-portal-v2:not(.print-report) .exec-chip{border-radius:2px!important;background:#0a0f15!important;color:#cbbda8!important}

      body.cc-portal-v2:not(.print-report) .panel,
      body.cc-portal-v2:not(.print-report) .card,
      body.cc-portal-v2:not(.print-report) .kpi,
      body.cc-portal-v2:not(.print-report) .info,
      body.cc-portal-v2:not(.print-report) .exec-kpi,
      body.cc-portal-v2:not(.print-report) .projects-board,
      body.cc-portal-v2:not(.print-report) .rail-card,
      body.cc-portal-v2:not(.print-report) .aside-card,
      body.cc-portal-v2:not(.print-report) .sv4-card,
      body.cc-portal-v2:not(.print-report) .project-v3,
      body.cc-portal-v2:not(.print-report) .project-card-premium{
        border-radius:3px!important;border-color:rgba(185,137,69,.20)!important;
        background:
          linear-gradient(135deg,rgba(255,255,255,.025),transparent 30%),
          linear-gradient(155deg,#111923,#090e14)!important;
        box-shadow:0 15px 42px rgba(0,0,0,.27),inset 0 1px rgba(255,255,255,.025)!important;
      }
      body.cc-portal-v2:not(.print-report) .kpi,
      body.cc-portal-v2:not(.print-report) .exec-kpi{
        border-top:2px solid rgba(185,137,69,.70)!important;min-height:118px!important;
      }
      body.cc-portal-v2:not(.print-report) .kpi small,
      body.cc-portal-v2:not(.print-report) .exec-kpi small,
      body.cc-portal-v2:not(.print-report) .info small{
        color:#968b7b!important;text-transform:uppercase!important;letter-spacing:.08em!important;font-size:10px!important;
      }
      body.cc-portal-v2:not(.print-report) .kpi strong,
      body.cc-portal-v2:not(.print-report) .kpi .money,
      body.cc-portal-v2:not(.print-report) .exec-kpi strong{
        color:#f2eadf!important;font-family:Georgia,"Times New Roman",serif!important;letter-spacing:0!important;
      }
      body.cc-portal-v2:not(.print-report) .kpi-icon{
        border-radius:50%!important;color:#d7b374!important;background:rgba(185,137,69,.09)!important;border-color:rgba(227,189,120,.25)!important;
      }
      body.cc-portal-v2:not(.print-report) .panel-head{border-bottom-color:rgba(185,137,69,.18)!important}
      body.cc-portal-v2:not(.print-report) .eyebrow,
      body.cc-portal-v2:not(.print-report) .sv4-eyebrow{color:#c9a366!important;letter-spacing:.19em!important}

      body.cc-portal-v2:not(.print-report) .service-strip{gap:8px!important}
      body.cc-portal-v2:not(.print-report) .service-tile,
      body.cc-portal-v2:not(.print-report) .quick-action,
      body.cc-portal-v2:not(.print-report) .followup-item{
        color:#d8d2c8!important;background:#0b1118!important;border:1px solid rgba(185,137,69,.20)!important;
        border-radius:2px!important;box-shadow:0 12px 28px rgba(0,0,0,.22)!important;
      }
      body.cc-portal-v2:not(.print-report) .service-tile:hover,
      body.cc-portal-v2:not(.print-report) .quick-action:hover,
      body.cc-portal-v2:not(.print-report) .followup-item:hover{border-color:rgba(227,189,120,.55)!important;background:#121920!important}
      body.cc-portal-v2:not(.print-report) .service-icon,
      body.cc-portal-v2:not(.print-report) .qicon{
        border-radius:50%!important;color:#d4ae70!important;background:rgba(185,137,69,.10)!important;border:1px solid rgba(227,189,120,.24)!important;
      }
      body.cc-portal-v2:not(.print-report) .service-tile b,
      body.cc-portal-v2:not(.print-report) .quick-action b{color:#f0e9dd!important}
      body.cc-portal-v2:not(.print-report) .service-tile span{color:#978e81!important}

      body.cc-portal-v2:not(.print-report) .tabs{
        gap:1px!important;padding:5px!important;border:1px solid rgba(185,137,69,.18)!important;
        border-radius:2px!important;background:#070b10!important;
      }
      body.cc-portal-v2:not(.print-report) .tabs button{
        min-height:39px!important;border-radius:1px!important;color:#978f83!important;padding:9px 13px!important;
      }
      body.cc-portal-v2:not(.print-report) .tabs button.active{
        color:#171008!important;background:linear-gradient(180deg,#d2aa6b,#9b6b38)!important;
        box-shadow:inset 0 -2px #f1d193!important;font-weight:900!important;
      }
      body.cc-portal-v2:not(.print-report) .table-wrap{border-radius:2px!important;background:#080d13!important;border-color:rgba(185,137,69,.20)!important}
      body.cc-portal-v2:not(.print-report) .table th{
        color:#d4b577!important;background:#121820!important;border-bottom-color:rgba(227,189,120,.34)!important;
        letter-spacing:.11em!important;
      }
      body.cc-portal-v2:not(.print-report) .table tbody tr:nth-child(even){background:rgba(185,137,69,.025)!important}
      body.cc-portal-v2:not(.print-report) .table tbody tr:hover{background:rgba(185,137,69,.08)!important}
      body.cc-portal-v2:not(.print-report) input,
      body.cc-portal-v2:not(.print-report) select,
      body.cc-portal-v2:not(.print-report) textarea{
        border-radius:2px!important;background:#060a0f!important;border-color:rgba(185,137,69,.24)!important;
      }
      body.cc-portal-v2:not(.print-report) input:focus,
      body.cc-portal-v2:not(.print-report) select:focus,
      body.cc-portal-v2:not(.print-report) textarea:focus{border-color:#d0a868!important;box-shadow:0 0 0 3px rgba(185,137,69,.11)!important}
      body.cc-portal-v2:not(.print-report) .progress-track,
      body.cc-portal-v2:not(.print-report) .sv4-track{
        border-radius:1px!important;background:repeating-linear-gradient(90deg,#070b10 0 22px,#131b24 22px 24px)!important;
        border:1px solid rgba(185,137,69,.15)!important;
      }
      body.cc-portal-v2:not(.print-report) .progress-fill,
      body.cc-portal-v2:not(.print-report) .sv4-fill{
        border-radius:0!important;background:linear-gradient(90deg,#77502d,#d5ad6d)!important;
      }
      body.cc-portal-v2:not(.print-report) .modal{
        border-radius:3px!important;background:#0b1017!important;border:1px solid rgba(227,189,120,.38)!important;
        box-shadow:0 35px 100px rgba(0,0,0,.72),inset 0 0 0 5px #080c11,inset 0 0 0 6px rgba(185,137,69,.15)!important;
      }
      body.cc-portal-v2:not(.print-report) .modal-head{background:#0b1017!important;border-bottom-color:rgba(185,137,69,.22)!important}
      body.cc-portal-v2:not(.print-report) .footer-note{color:#665d51!important;letter-spacing:.08em!important}

      @media(max-width:720px){
        body:not(.print-report) .topbar{border-radius:0 0 12px 12px!important}
        body:not(.print-report) .tabs{border-radius:10px!important}
        body:not(.print-report) .modal,
        body:not(.print-report) .modal.small{border-radius:16px 16px 0 0!important}
        body:not(.print-report) .panel::before,
        body:not(.print-report) .card::before,
        body:not(.print-report) .panel::after,
        body:not(.print-report) .card::after{width:11px;height:11px}
        body.cc-portal-v2:not(.print-report) .cc-app-column{padding:10px!important}
        body.cc-portal-v2:not(.print-report) .topbar::after{display:none!important}
        body.cc-portal-v2:not(.print-report) .topbar .brand h1{font-size:21px!important}
        body.cc-portal-v2:not(.print-report) .cc-commandbar{padding:8px!important}
        body.cc-portal-v2:not(.print-report) .exec-overview,
        body.cc-portal-v2:not(.print-report) .dashboard-hero{border-radius:2px!important}
      }
      @media(min-width:721px) and (max-width:1180px){
        body.cc-portal-v2:not(.print-report) .shell.cc-shell{grid-template-columns:224px minmax(0,1fr)!important}
        body.cc-portal-v2:not(.print-report) .cc-app-column{padding:16px!important}
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
