/* ===== CONTROL CONTRACTUAL · IMMERSIVE 3D UI V2 ===== */
(()=>{
'use strict';
if(window.__CC_THEME_UNIFIER_V2__)return;
window.__CC_THEME_UNIFIER_V2__=true;

const STYLE_ID='cc-theme-unifier-v1-style';

function inject(){
  let s=document.getElementById(STYLE_ID);
  if(!s){
    s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{
        color-scheme:dark!important;
        --cc-bg:#050814;
        --cc-bg2:#08111f;
        --cc-panel:rgba(9,18,34,.82);
        --cc-panel-strong:rgba(8,16,30,.96);
        --cc-glass:rgba(15,31,55,.62);
        --cc-line:rgba(120,161,230,.18);
        --cc-line-strong:rgba(107,155,255,.34);
        --cc-text:#f7fbff;
        --cc-muted:#8ea5c3;
        --cc-blue:#4f8cff;
        --cc-blue2:#2563eb;
        --cc-cyan:#42d4ff;
        --cc-violet:#7c63ff;
        --cc-good:#45d483;
        --cc-warn:#f2bc4d;
        --cc-danger:#ff6476;
        --cc-shadow:0 24px 70px rgba(0,0,0,.42);
        --cc-glow:0 0 0 1px rgba(110,157,255,.12),0 22px 65px rgba(8,65,170,.20);
      }

      html{background:var(--cc-bg)!important}
      body:not(.print-report){
        background:
          radial-gradient(circle at 82% 4%,rgba(62,112,255,.20) 0,rgba(62,112,255,0) 28%),
          radial-gradient(circle at 12% 18%,rgba(38,184,255,.11) 0,rgba(38,184,255,0) 26%),
          radial-gradient(circle at 50% 105%,rgba(70,55,175,.12) 0,rgba(70,55,175,0) 34%),
          linear-gradient(160deg,#050814 0%,#06101e 44%,#040711 100%)!important;
        color:var(--cc-text)!important;
        min-height:100vh;
        overflow-x:hidden;
        isolation:isolate;
      }
      body:not(.print-report)::before{
        content:"";position:fixed;inset:0;pointer-events:none;z-index:-2;opacity:.26;
        background-image:
          linear-gradient(rgba(116,160,230,.055) 1px,transparent 1px),
          linear-gradient(90deg,rgba(116,160,230,.045) 1px,transparent 1px);
        background-size:42px 42px;
        mask-image:linear-gradient(to bottom,rgba(0,0,0,.78),transparent 88%);
      }
      body:not(.print-report)::after{
        content:"";position:fixed;width:520px;height:520px;right:-210px;top:18vh;z-index:-1;pointer-events:none;
        border-radius:50%;filter:blur(20px);opacity:.30;
        background:radial-gradient(circle,rgba(49,116,255,.34),rgba(35,94,215,.08) 44%,transparent 70%);
        animation:ccAmbientDrift 13s ease-in-out infinite alternate;
      }

      body:not(.print-report) .shell{position:relative;z-index:1}
      body:not(.print-report) .topbar{
        position:relative;padding:10px 12px;border-radius:18px;
        background:linear-gradient(135deg,rgba(10,21,38,.74),rgba(7,14,27,.46))!important;
        border:1px solid rgba(119,158,226,.14)!important;
        box-shadow:0 14px 40px rgba(0,0,0,.18);
        backdrop-filter:blur(18px) saturate(135%);
      }
      body:not(.print-report) .brand .logo,
      body:not(.print-report) .logo{
        background:linear-gradient(145deg,#5b92ff 0%,#2563eb 48%,#143a9d 100%)!important;
        border:1px solid rgba(190,216,255,.30)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 12px 32px rgba(32,99,242,.38)!important;
      }
      body:not(.print-report) h1,
      body:not(.print-report) h2,
      body:not(.print-report) h3{color:var(--cc-text)!important;text-shadow:0 2px 16px rgba(0,0,0,.18)}
      body:not(.print-report) .muted,
      body:not(.print-report) .notice,
      body:not(.print-report) .footer-note{color:var(--cc-muted)!important}
      body:not(.print-report) .eyebrow{color:#76a6ff!important}

      body:not(.print-report) .btn,
      body:not(.print-report) .icon-btn{
        position:relative;overflow:hidden;
        background:linear-gradient(180deg,rgba(20,36,61,.92),rgba(10,21,39,.94))!important;
        border-color:rgba(115,158,225,.24)!important;
        color:#eaf3ff!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 8px 20px rgba(0,0,0,.16)!important;
        transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,filter .18s ease!important;
      }
      body:not(.print-report) .btn:hover,
      body:not(.print-report) .icon-btn:hover{
        transform:translateY(-1px);border-color:rgba(104,158,255,.52)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 12px 28px rgba(7,63,158,.24)!important;
      }
      body:not(.print-report) .btn.primary{
        background:linear-gradient(135deg,#3e7cff 0%,#2464e9 48%,#1749bd 100%)!important;
        border-color:#5b93ff!important;color:#fff!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 12px 30px rgba(36,100,233,.34)!important;
      }
      body:not(.print-report) .btn.good{background:linear-gradient(135deg,#153e2a,#10291f)!important;border-color:rgba(69,212,131,.35)!important;color:#b9f7d5!important}
      body:not(.print-report) .btn.danger{background:linear-gradient(135deg,#441824,#2b1018)!important;border-color:rgba(255,100,118,.38)!important;color:#ffd0d6!important}

      body:not(.print-report) input,
      body:not(.print-report) select,
      body:not(.print-report) textarea,
      body:not(.print-report) .input,
      body:not(.print-report) .search{
        background:linear-gradient(180deg,rgba(5,13,25,.94),rgba(7,16,30,.96))!important;
        border-color:rgba(111,153,217,.22)!important;color:#eef6ff!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
      }
      body:not(.print-report) input::placeholder,
      body:not(.print-report) textarea::placeholder{color:#67809f!important}
      body:not(.print-report) input:focus,
      body:not(.print-report) select:focus,
      body:not(.print-report) textarea:focus,
      body:not(.print-report) .input:focus{
        border-color:#4f8cff!important;box-shadow:0 0 0 3px rgba(79,140,255,.12),0 0 25px rgba(49,109,239,.12)!important;
      }

      /* HERO / PORTAFOLIO PRINCIPAL */
      body:not(.print-report) .exec-overview{position:relative;isolation:isolate;perspective:1100px}
      body:not(.print-report) .exec-overview::before{
        content:"";position:absolute;width:260px;height:260px;right:8%;top:-58px;z-index:-1;pointer-events:none;
        border-radius:50%;border:34px solid rgba(71,127,255,.10);
        box-shadow:inset 0 0 38px rgba(110,178,255,.20),0 0 62px rgba(56,115,255,.18);
        transform:rotateX(67deg) rotateZ(-17deg);filter:drop-shadow(0 25px 28px rgba(0,0,0,.28));
        animation:ccRingFloat 8s ease-in-out infinite;
      }
      body:not(.print-report) .exec-overview::after{
        content:"";position:absolute;width:82px;height:82px;right:29%;top:26px;z-index:-1;pointer-events:none;border-radius:50%;
        background:radial-gradient(circle at 31% 28%,rgba(255,255,255,.92) 0 2%,rgba(128,196,255,.52) 8%,rgba(45,99,196,.22) 42%,rgba(13,29,54,.06) 66%,transparent 72%);
        box-shadow:0 22px 40px rgba(0,0,0,.24),inset -12px -16px 26px rgba(9,24,51,.40);
        backdrop-filter:blur(4px);animation:ccOrbFloat 6.5s ease-in-out infinite alternate;
      }
      body:not(.print-report) .exec-intro,
      body:not(.print-report) .exec-visual{
        position:relative;overflow:hidden;
        background:
          radial-gradient(circle at 82% 16%,rgba(68,127,255,.15),transparent 31%),
          linear-gradient(145deg,rgba(14,31,57,.94),rgba(6,15,29,.96))!important;
        color:var(--cc-text)!important;
        border:1px solid rgba(115,160,235,.22)!important;
        box-shadow:var(--cc-shadow),inset 0 1px 0 rgba(255,255,255,.055),0 0 58px rgba(37,99,235,.09)!important;
        backdrop-filter:blur(20px) saturate(140%);
        transform-style:preserve-3d;
      }
      body:not(.print-report) .exec-intro::after,
      body:not(.print-report) .exec-visual::after{
        content:"";position:absolute;inset:0;pointer-events:none;
        background:linear-gradient(115deg,transparent 18%,rgba(255,255,255,.035) 42%,transparent 60%);
        transform:translateX(-115%);animation:ccSheen 9s ease-in-out infinite;
      }
      body:not(.print-report) .exec-title-row h2,
      body:not(.print-report) .exec-money strong,
      body:not(.print-report) .portfolio-ring-content b{color:#f8fbff!important}
      body:not(.print-report) .exec-title-row p,
      body:not(.print-report) .exec-money small,
      body:not(.print-report) .exec-money span,
      body:not(.print-report) .portfolio-ring-content small,
      body:not(.print-report) .exec-bar-label{color:#90a6c5!important}
      body:not(.print-report) .exec-sync{
        background:rgba(29,185,112,.09)!important;border-color:rgba(73,218,143,.26)!important;color:#9bf1c2!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;
      }
      body:not(.print-report) .exec-chip{
        background:rgba(16,32,54,.72)!important;border-color:rgba(113,158,225,.18)!important;color:#b9c9dc!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;
      }
      body:not(.print-report) .exec-chip b{color:#eef6ff!important}
      body:not(.print-report) .portfolio-ring{
        background:conic-gradient(from -35deg,#3c7dff calc(var(--p)*.70%),#53cdf9 calc(var(--p)*1%),rgba(31,53,82,.72) 0)!important;
        box-shadow:inset 0 0 0 1px rgba(154,193,255,.16),0 18px 46px rgba(0,0,0,.32),0 0 38px rgba(56,120,255,.20)!important;
        filter:drop-shadow(0 15px 25px rgba(0,0,0,.18));
      }
      body:not(.print-report) .portfolio-ring:after{
        background:radial-gradient(circle at 35% 28%,#122643,#07111f 72%)!important;border-color:rgba(125,172,245,.18)!important;
        box-shadow:inset 0 12px 22px rgba(255,255,255,.025),inset 0 -18px 35px rgba(0,0,0,.34)!important;
      }
      body:not(.print-report) .exec-bar,
      body:not(.print-report) .mini-progress-track,
      body:not(.print-report) .rail-state-bar,
      body:not(.print-report) .sv4-track,
      body:not(.print-report) .sv4-timeline-line{background:rgba(87,119,160,.16)!important;border-color:rgba(117,153,204,.13)!important}
      body:not(.print-report) .exec-bar>i,
      body:not(.print-report) .mini-progress-fill,
      body:not(.print-report) .rail-state-bar i,
      body:not(.print-report) .sv4-fill{background:linear-gradient(90deg,#3375ff,#55c8ff)!important;box-shadow:0 0 14px rgba(66,153,255,.25)}
      body:not(.print-report) .exec-bar>i.green,
      body:not(.print-report) .mini-progress-fill.green,
      body:not(.print-report) .rail-state-bar i.green{background:linear-gradient(90deg,#26b96f,#57e3a0)!important}
      body:not(.print-report) .rail-state-bar i.amber{background:linear-gradient(90deg,#e4a72e,#ffd16a)!important}
      body:not(.print-report) .mini-progress-fill.time,
      body:not(.print-report) .sv4-fill.time,
      body:not(.print-report) .sv4-timeline-line i{background:linear-gradient(90deg,#6f7f9a,#a4b5d1)!important}

      /* KPI 3D */
      body:not(.print-report) .exec-kpis{perspective:1200px}
      body:not(.print-report) .exec-kpi,
      body:not(.print-report) .kpi{
        position:relative;overflow:hidden;
        background:linear-gradient(155deg,rgba(15,31,54,.91),rgba(7,16,30,.96))!important;
        color:var(--cc-text)!important;border-color:rgba(112,157,226,.18)!important;
        box-shadow:0 18px 44px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.05)!important;
        transform:translateZ(0);transform-style:preserve-3d;
        transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease!important;
      }
      body:not(.print-report) .exec-kpi::before,
      body:not(.print-report) .kpi::before{
        content:"";position:absolute;width:90px;height:90px;right:-38px;top:-45px;border-radius:50%;pointer-events:none;
        background:radial-gradient(circle,rgba(80,145,255,.28),transparent 70%);filter:blur(2px);
      }
      body:not(.print-report) .exec-kpi:hover,
      body:not(.print-report) .kpi:hover{transform:translateY(-4px) rotateX(1.4deg);border-color:rgba(91,147,255,.38)!important;box-shadow:0 25px 58px rgba(0,0,0,.34),0 0 35px rgba(46,105,235,.10)!important}
      body:not(.print-report) .exec-kpi strong,
      body:not(.print-report) .exec-kpi .money-dual strong,
      body:not(.print-report) .kpi strong{color:#f8fbff!important}
      body:not(.print-report) .exec-kpi-top small,
      body:not(.print-report) .exec-kpi-foot,
      body:not(.print-report) .kpi small,
      body:not(.print-report) .money-dual small{color:#8ea5c3!important}
      body:not(.print-report) .exec-kpi-icon{background:rgba(64,123,242,.13)!important;color:#77a9ff!important;border-color:rgba(107,158,255,.20)!important}

      /* TABLERO Y TARJETAS DE PROYECTO */
      body:not(.print-report) .projects-board,
      body:not(.print-report) .rail-card,
      body:not(.print-report) .panel,
      body:not(.print-report) .card{
        background:linear-gradient(155deg,rgba(11,24,43,.92),rgba(6,14,27,.96))!important;
        color:var(--cc-text)!important;border-color:rgba(111,155,222,.16)!important;
        box-shadow:0 20px 55px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.035)!important;
        backdrop-filter:blur(18px) saturate(125%);
      }
      body:not(.print-report) .projects-board{border-radius:22px!important;overflow:hidden}
      body:not(.print-report) .board-head h2,
      body:not(.print-report) .rail-card h3{color:#f5f9ff!important}
      body:not(.print-report) .board-head p,
      body:not(.print-report) .rail-card>p,
      body:not(.print-report) .rail-state-row span{color:#879db9!important}
      body:not(.print-report) .view-switch{background:rgba(3,10,20,.52)!important;border-color:rgba(106,150,218,.18)!important}
      body:not(.print-report) .view-switch button{color:#7890af!important}
      body:not(.print-report) .view-switch button.active{background:linear-gradient(180deg,rgba(45,92,170,.50),rgba(25,55,108,.45))!important;color:#eef6ff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important}
      body:not(.print-report) .status-filter{background:rgba(8,19,35,.72)!important;color:#8fa6c2!important;border-color:rgba(104,147,210,.18)!important}
      body:not(.print-report) .status-filter.active{background:rgba(42,96,191,.26)!important;color:#dceaff!important;border-color:rgba(92,148,255,.44)!important;box-shadow:0 0 20px rgba(51,112,228,.10)!important}

      body:not(.print-report) .project-grid-v3{perspective:1250px}
      body:not(.print-report) .project-v3{
        position:relative;overflow:hidden;
        background:
          radial-gradient(circle at 92% 2%,rgba(68,128,255,.13),transparent 26%),
          linear-gradient(155deg,rgba(16,32,56,.92),rgba(7,16,29,.98))!important;
        color:var(--cc-text)!important;border-color:rgba(107,156,234,.18)!important;
        box-shadow:0 16px 38px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.045)!important;
        transform-style:preserve-3d;transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease!important;
      }
      body:not(.print-report) .project-v3::after{
        content:"";position:absolute;width:110px;height:110px;right:-58px;bottom:-60px;border-radius:50%;pointer-events:none;
        background:radial-gradient(circle,rgba(58,126,255,.16),transparent 72%);
      }
      body:not(.print-report) .project-v3:hover{transform:translateY(-5px) rotateX(1deg);border-color:rgba(87,145,255,.40)!important;box-shadow:0 27px 62px rgba(0,0,0,.35),0 0 36px rgba(42,101,224,.09)!important}
      body:not(.print-report) .project-v3 h3,
      body:not(.print-report) .v3-metric b,
      body:not(.print-report) .project-v3-health{color:#eef6ff!important}
      body:not(.print-report) .project-v3-code{color:#76a8ff!important;text-shadow:0 0 18px rgba(74,138,255,.18)}
      body:not(.print-report) .project-v3-sub,
      body:not(.print-report) .project-v3-contractor,
      body:not(.print-report) .v3-metric small{color:#849bb8!important}
      body:not(.print-report) .project-v3-contractor,
      body:not(.print-report) .v3-metric,
      body:not(.print-report) .project-v3-actions{
        background:rgba(5,14,27,.53)!important;border-color:rgba(102,145,208,.14)!important;color:#c5d3e5!important;
      }
      body:not(.print-report) .health-tag{background:rgba(38,185,111,.10)!important;color:#9ff0c4!important;border-color:rgba(69,212,131,.25)!important}
      body:not(.print-report) .health-tag.warn{background:rgba(230,166,44,.10)!important;color:#ffd784!important;border-color:rgba(242,188,77,.28)!important}
      body:not(.print-report) .health-tag.danger{background:rgba(225,71,90,.11)!important;color:#ffb4be!important;border-color:rgba(255,100,118,.27)!important}

      /* RAIL LATERAL */
      body:not(.print-report) .rail-card{position:relative;overflow:hidden}
      body:not(.print-report) .rail-card::before{content:"";position:absolute;right:-45px;top:-60px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,rgba(63,125,255,.11),transparent 70%);pointer-events:none}
      body:not(.print-report) .rail-alert,
      body:not(.print-report) .rail-quick button,
      body:not(.print-report) .rail-state-row{
        background:rgba(10,23,41,.74)!important;color:#c9d7e8!important;border-color:rgba(102,147,216,.16)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
      }
      body:not(.print-report) .rail-alert:hover,
      body:not(.print-report) .rail-quick button:hover{background:rgba(22,48,84,.82)!important;border-color:rgba(91,148,255,.34)!important;transform:translateY(-1px)}
      body:not(.print-report) .rail-alert b,
      body:not(.print-report) .rail-state-row b{color:#edf5ff!important}
      body:not(.print-report) .rail-alert small,
      body:not(.print-report) .rail-quick span{color:#7f96b4!important}
      body:not(.print-report) .rail-alert-icon{background:rgba(55,116,231,.15)!important;color:#7eaeff!important;border-color:rgba(98,152,255,.22)!important}
      body:not(.print-report) .rail-empty{background:rgba(36,171,103,.09)!important;color:#9bebbf!important;border-color:rgba(67,202,128,.22)!important}
      body:not(.print-report) .rail-quick button.primary{background:linear-gradient(145deg,rgba(48,111,229,.30),rgba(25,63,133,.25))!important;color:#e5f0ff!important;border-color:rgba(92,149,255,.36)!important}
      body:not(.print-report) .rail-attention-count{background:linear-gradient(145deg,#3f7fff,#235ed7)!important;color:#fff!important;box-shadow:0 8px 22px rgba(39,101,224,.28)!important}

      /* RESUMEN DE PROYECTO */
      body:not(.print-report) .sv4-card,
      body:not(.print-report) .sv4-kpi{
        background:
          radial-gradient(circle at 92% 5%,rgba(61,123,246,.11),transparent 28%),
          linear-gradient(155deg,rgba(14,29,51,.94),rgba(6,15,28,.98))!important;
        color:var(--cc-text)!important;border-color:rgba(108,154,224,.17)!important;
        box-shadow:0 18px 45px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.035)!important;
        backdrop-filter:blur(18px);
      }
      body:not(.print-report) .sv4-eyebrow{color:#76a8ff!important}
      body:not(.print-report) .sv4-title,
      body:not(.print-report) .sv4-big-progress strong,
      body:not(.print-report) .sv4-section-title h3,
      body:not(.print-report) .sv4-date b,
      body:not(.print-report) .sv4-activity-item b,
      body:not(.print-report) .sv4-info b,
      body:not(.print-report) .sv4-guarantee b,
      body:not(.print-report) .sv4-chip b,
      body:not(.print-report) .sv4-bar-label b,
      body:not(.print-report) .sv4-time-meta b,
      body:not(.print-report) .sv4-kpi-foot b,
      body:not(.print-report) .sv4-advance-head b,
      body:not(.print-report) .sv4-advance-meta b{color:#edf5ff!important}
      body:not(.print-report) .sv4-muted,
      body:not(.print-report) .sv4-big-progress span,
      body:not(.print-report) .sv4-bar-label,
      body:not(.print-report) .sv4-kpi small,
      body:not(.print-report) .sv4-kpi-foot,
      body:not(.print-report) .sv4-section-title p,
      body:not(.print-report) .sv4-date small,
      body:not(.print-report) .sv4-time-meta,
      body:not(.print-report) .sv4-activity-item small,
      body:not(.print-report) .sv4-info small,
      body:not(.print-report) .sv4-guarantee small,
      body:not(.print-report) .sv4-advance-head small,
      body:not(.print-report) .sv4-advance-meta,
      body:not(.print-report) .sv4-words{color:#8299b7!important;opacity:1!important}
      body:not(.print-report) .sv4-chip,
      body:not(.print-report) .sv4-activity-item,
      body:not(.print-report) .sv4-info,
      body:not(.print-report) .sv4-guarantee{
        background:rgba(7,18,33,.72)!important;border-color:rgba(103,148,215,.15)!important;color:#c4d2e4!important;
      }
      body:not(.print-report) .sv4-link,
      body:not(.print-report) .sv4-activity-item button{color:#79aaff!important}
      body:not(.print-report) .sv4-today{background:rgba(54,115,224,.16)!important;border-color:rgba(95,151,255,.27)!important;color:#bbd5ff!important}
      body:not(.print-report) .sv4-act-icon{background:rgba(53,113,224,.14)!important;border-color:rgba(94,150,255,.20)!important;color:#7dabff!important}
      body:not(.print-report) .sv4-advance{background:linear-gradient(145deg,rgba(28,69,143,.20),rgba(8,23,46,.42))!important;border-color:rgba(89,143,243,.23)!important}

      body:not(.print-report) .sv4-status,
      body:not(.print-report) .sv4-g-state{background:rgba(35,176,104,.10)!important;color:#9be9bd!important;border-color:rgba(63,205,127,.23)!important}
      body:not(.print-report) .sv4-status.warn,
      body:not(.print-report) .sv4-g-state.warning,
      body:not(.print-report) .sv4-g-state.attention{background:rgba(226,165,46,.11)!important;color:#ffd584!important;border-color:rgba(242,188,77,.27)!important}
      body:not(.print-report) .sv4-status.danger,
      body:not(.print-report) .sv4-g-state.critical,
      body:not(.print-report) .sv4-g-state.urgent,
      body:not(.print-report) .sv4-g-state.expired{background:rgba(224,66,86,.11)!important;color:#ffb3bd!important;border-color:rgba(255,100,118,.28)!important}
      body:not(.print-report) .sv4-status.info{background:rgba(53,116,225,.13)!important;color:#b9d5ff!important;border-color:rgba(91,148,255,.27)!important}

      /* MODALES / LOGIN */
      body:not(.print-report) .modal-bg{background:rgba(1,5,12,.78)!important;backdrop-filter:blur(10px) saturate(120%)!important}
      body:not(.print-report) .modal,
      body:not(.print-report) .modal-head,
      body:not(.print-report) .auth-card{
        background:
          radial-gradient(circle at 92% 0%,rgba(59,121,242,.13),transparent 28%),
          linear-gradient(150deg,rgba(13,28,50,.98),rgba(5,13,25,.99))!important;
        color:var(--cc-text)!important;border-color:rgba(110,156,226,.23)!important;
        box-shadow:0 32px 100px rgba(0,0,0,.55),0 0 60px rgba(37,99,235,.08),inset 0 1px 0 rgba(255,255,255,.04)!important;
      }
      body:not(.print-report) .auth{position:relative;overflow:hidden}
      body:not(.print-report) .auth::before{content:"";position:absolute;width:380px;height:380px;left:-170px;top:-150px;border-radius:50%;background:radial-gradient(circle,rgba(64,128,255,.23),transparent 68%);filter:blur(7px);pointer-events:none}
      body:not(.print-report) .seg{background:rgba(3,10,20,.72)!important;border-color:rgba(102,147,214,.18)!important}
      body:not(.print-report) .seg button{color:#7f96b3!important}
      body:not(.print-report) .seg button.active{background:rgba(46,102,207,.26)!important;color:#f1f6ff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important}
      body:not(.print-report) .toast{background:rgba(10,24,43,.96)!important;border-color:rgba(93,148,244,.26)!important;color:#edf5ff!important;box-shadow:0 18px 48px rgba(0,0,0,.38),0 0 24px rgba(44,105,225,.10)!important;backdrop-filter:blur(16px)}

      /* TABLAS */
      body:not(.print-report) .table-wrap{border-color:rgba(103,148,215,.16)!important;background:rgba(5,14,26,.46)!important}
      body:not(.print-report) .table th{background:rgba(14,29,50,.98)!important;color:#91a9c7!important;border-bottom-color:rgba(102,145,208,.16)!important}
      body:not(.print-report) .table td{border-bottom-color:rgba(90,130,187,.12)!important;color:#dbe7f5!important}
      body:not(.print-report) .table tr:hover td{background:rgba(34,75,139,.09)!important}

      /* PILLS / ALERTAS */
      body:not(.print-report) .pill,
      body:not(.print-report) .status{background:rgba(18,37,63,.72)!important;border-color:rgba(106,150,216,.20)!important;color:#c7d6e9!important}
      body:not(.print-report) .pill.good,
      body:not(.print-report) .status.good{background:rgba(34,170,99,.10)!important;border-color:rgba(66,205,129,.25)!important;color:#a2efc6!important}
      body:not(.print-report) .pill.warn,
      body:not(.print-report) .status.warn{background:rgba(216,156,38,.10)!important;border-color:rgba(239,184,70,.26)!important;color:#ffd786!important}
      body:not(.print-report) .pill.danger,
      body:not(.print-report) .status.danger{background:rgba(221,62,83,.11)!important;border-color:rgba(255,99,116,.27)!important;color:#ffb6bf!important}
      body:not(.print-report) .pill.blue,
      body:not(.print-report) .status.blue{background:rgba(50,109,217,.13)!important;border-color:rgba(91,148,255,.27)!important;color:#bed8ff!important}
      body:not(.print-report) .alert{background:rgba(186,136,33,.10)!important;border-color:rgba(226,177,65,.24)!important;color:#f9d989!important}
      body:not(.print-report) .alert.info{background:rgba(45,104,213,.12)!important;border-color:rgba(83,142,247,.25)!important;color:#bfd9ff!important}
      body:not(.print-report) .alert.good{background:rgba(34,166,97,.10)!important;border-color:rgba(62,200,124,.24)!important;color:#a5eec7!important}
      body:not(.print-report) .alert.danger{background:rgba(216,60,79,.10)!important;border-color:rgba(255,99,116,.25)!important;color:#ffb9c2!important}

      /* MICRO DETALLES DE PROFUNDIDAD */
      body:not(.print-report) .exec-intro,
      body:not(.print-report) .exec-visual,
      body:not(.print-report) .exec-kpi,
      body:not(.print-report) .project-v3,
      body:not(.print-report) .rail-card,
      body:not(.print-report) .sv4-card,
      body:not(.print-report) .sv4-kpi,
      body:not(.print-report) .modal,
      body:not(.print-report) .auth-card{backface-visibility:hidden}

      @keyframes ccSheen{0%,62%{transform:translateX(-120%)}76%{transform:translateX(120%)}100%{transform:translateX(120%)}}
      @keyframes ccAmbientDrift{from{transform:translate3d(0,-18px,0) scale(.96)}to{transform:translate3d(-40px,35px,0) scale(1.08)}}
      @keyframes ccRingFloat{0%,100%{transform:rotateX(67deg) rotateZ(-17deg) translateY(0)}50%{transform:rotateX(64deg) rotateZ(-10deg) translateY(-12px)}}
      @keyframes ccOrbFloat{from{transform:translate3d(0,0,0) scale(.96)}to{transform:translate3d(22px,-16px,0) scale(1.06)}}

      @media(max-width:1100px){
        body:not(.print-report) .exec-overview::before{width:210px;height:210px;right:2%;opacity:.7}
        body:not(.print-report) .exec-overview::after{right:24%;opacity:.75}
      }
      @media(max-width:760px){
        body:not(.print-report)::after{width:330px;height:330px;right:-180px;top:9vh}
        body:not(.print-report) .topbar{padding:8px;border-radius:15px}
        body:not(.print-report) .exec-overview,
        body:not(.print-report) .dashboard-workspace-v3,
        body:not(.print-report) .sv4-hero,
        body:not(.print-report) .sv4-grid{grid-template-columns:1fr!important}
        body:not(.print-report) .exec-overview::before{width:165px;height:165px;right:-45px;top:14px;border-width:23px;opacity:.42}
        body:not(.print-report) .exec-overview::after{width:56px;height:56px;right:21%;top:48px;opacity:.55}
        body:not(.print-report) .exec-intro,
        body:not(.print-report) .exec-visual,
        body:not(.print-report) .projects-board,
        body:not(.print-report) .rail-card,
        body:not(.print-report) .sv4-card{border-radius:18px!important}
        body:not(.print-report) .project-v3:hover,
        body:not(.print-report) .exec-kpi:hover{transform:translateY(-2px)}
      }
      @media(max-width:460px){
        body:not(.print-report) .exec-overview::before,
        body:not(.print-report) .exec-overview::after{display:none}
        body:not(.print-report) .shell{padding:11px!important}
      }
      @media(prefers-reduced-motion:reduce){
        body:not(.print-report)::after,
        body:not(.print-report) .exec-overview::before,
        body:not(.print-report) .exec-overview::after,
        body:not(.print-report) .exec-intro::after,
        body:not(.print-report) .exec-visual::after{animation:none!important}
        body:not(.print-report) *{scroll-behavior:auto!important}
      }
    `;
  }
  /* Reanexa el estilo al final para que prevalezca sobre módulos que cargan después. */
  document.head.appendChild(s);

  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta)themeMeta.setAttribute('content','#050814');
  document.documentElement.style.colorScheme='dark';
  document.body?.classList.add('cc-immersive-3d');
}

function correctLegacyLanguage(){
  const replacements=[
    [/avance físico-financiero/gi,'avance físico y avance financiero'],
    [/avance físico\s*=\s*financiero/gi,'avance financiero certificado / estimado acumulado']
  ];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    if(node.parentElement?.closest('.report-paper'))return;
    let text=node.nodeValue||'',next=text;
    replacements.forEach(([rx,val])=>{next=next.replace(rx,val)});
    if(next!==text)node.nodeValue=next;
  });
}

function run(){inject();correctLegacyLanguage()}
run();
let queued=false;
new MutationObserver(()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(run,300);setTimeout(run,1000);setTimeout(run,2200);
window.ccRunThemeUnifier=run;
})();
