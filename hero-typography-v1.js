/* ===== PORTADA PRINCIPAL · TIPOGRAFÍA AMPLIADA V1 ===== */
(()=>{
  'use strict';
  if(typeof document==='undefined') return;
  if(document.getElementById('cc-hero-typography-v1')) return;
  const style=document.createElement('style');
  style.id='cc-hero-typography-v1';
  style.textContent=`
    .hero-control-contractual{
      min-height:400px!important;
      padding:48px!important;
    }
    .hero-control-contractual .hero-copy{
      max-width:1120px!important;
    }
    .hero-control-contractual .hero-copy small{
      display:block!important;
      font-size:clamp(13px,1.15vw,17px)!important;
      line-height:1.3!important;
      letter-spacing:.16em!important;
      font-weight:900!important;
    }
    .hero-control-contractual .hero-copy h2{
      max-width:1120px!important;
      font-size:clamp(44px,5.7vw,74px)!important;
      line-height:.99!important;
      margin:14px 0 18px!important;
      letter-spacing:-.025em!important;
    }
    .hero-control-contractual .hero-copy p{
      max-width:1100px!important;
      font-size:clamp(19px,1.75vw,27px)!important;
      line-height:1.45!important;
      margin:0 0 24px!important;
    }
    @media(max-width:900px){
      .hero-control-contractual{
        min-height:350px!important;
        padding:36px 30px!important;
      }
      .hero-control-contractual .hero-copy h2{
        font-size:clamp(40px,7vw,60px)!important;
      }
      .hero-control-contractual .hero-copy p{
        font-size:clamp(18px,2.4vw,23px)!important;
      }
    }
    @media(max-width:620px){
      .hero-control-contractual{
        min-height:380px!important;
        padding:28px 20px!important;
      }
      .hero-control-contractual .hero-copy small{
        font-size:11px!important;
        letter-spacing:.12em!important;
      }
      .hero-control-contractual .hero-copy h2{
        font-size:clamp(34px,10vw,46px)!important;
        line-height:1.02!important;
        margin:12px 0 15px!important;
      }
      .hero-control-contractual .hero-copy p{
        font-size:17px!important;
        line-height:1.45!important;
        margin-bottom:20px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
