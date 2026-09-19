/* ZORDON · figura humana completa y movimiento visible en la interfaz V2. */
(() => {
  'use strict';
  if (window.__CC_ZORDON_HUMAN_MOTION_V1__) return;
  window.__CC_ZORDON_HUMAN_MOTION_V1__ = true;

  const STYLE_ID = 'cc-zordon-human-motion-v1-style';
  const HUMAN_ASSET = './zordon-human-fullbody-v1.webp';

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #zordon-engineer-launcher-container.cc-zordon-human-launcher {
        width: 120px !important;
        height: 250px !important;
        right: 10px !important;
        bottom: 12px !important;
        z-index: 70 !important;
        pointer-events: none !important;
        animation: ccZordonHumanRoam 10s ease-in-out infinite;
      }

      #zordon-engineer-launcher-container.cc-zordon-human-launcher > button {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        overflow: visible !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        pointer-events: auto !important;
      }

      #zordon-engineer-launcher-container .cc-zordon-human-figure {
        position: absolute !important;
        inset: 0 !important;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        transform: none !important;
      }

      #zordon-engineer-launcher-container .cc-zordon-human-frame {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: visible !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        animation: ccZordonHumanStep 2.8s ease-in-out infinite;
      }

      #zordon-engineer-launcher-container .cc-zordon-human-frame > img {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        object-fit: contain !important;
        object-position: center bottom !important;
        border-radius: 0 !important;
        transform-origin: center bottom !important;
        filter: drop-shadow(0 10px 8px rgba(0, 0, 0, .32));
        animation: ccZordonHumanBreath 3.2s ease-in-out infinite;
      }

      #zordon-engineer-launcher-container .cc-zordon-human-figure > div:last-child {
        position: absolute !important;
        left: 50% !important;
        bottom: -14px !important;
        z-index: 4 !important;
        margin: 0 !important;
        transform: translateX(-50%) !important;
        white-space: nowrap !important;
      }

      #zordon-engineer-launcher-container .cc-zordon-human-figure > div:last-child span {
        font-size: 9px !important;
      }

      #zordon-engineer-launcher-container.cc-zordon-human-greeting .cc-zordon-human-frame {
        animation: ccZordonHumanGreeting .55s ease-in-out 3 alternate;
      }

      @keyframes ccZordonHumanBreath {
        0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
        50% { transform: translateY(-3px) rotate(-.7deg) scale(1.012); }
      }

      @keyframes ccZordonHumanStep {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        35% { transform: translateX(-2px) rotate(-.5deg); }
        70% { transform: translateX(2px) rotate(.5deg); }
      }

      @keyframes ccZordonHumanGreeting {
        from { transform: translateX(-4px) rotate(-2deg); }
        to { transform: translateX(4px) rotate(2deg); }
      }

      @keyframes ccZordonHumanRoam {
        0%, 68%, 100% { transform: translate3d(0, 0, 0); }
        76% { transform: translate3d(-9px, -4px, 0); }
        84% { transform: translate3d(3px, -2px, 0); }
        92% { transform: translate3d(-5px, 0, 0); }
      }

      @media (max-width: 700px) {
        #zordon-engineer-launcher-container.cc-zordon-human-launcher {
          width: 94px !important;
          height: 196px !important;
          right: 7px !important;
          bottom: 62px !important;
        }
        #zordon-engineer-launcher-container .cc-zordon-human-figure > div:last-child {
          bottom: -12px !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #zordon-engineer-launcher-container.cc-zordon-human-launcher,
        #zordon-engineer-launcher-container .cc-zordon-human-frame,
        #zordon-engineer-launcher-container .cc-zordon-human-frame > img {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    const launcher = document.getElementById('zordon-engineer-launcher-container');
    const image = launcher?.querySelector('img');
    if (!launcher || !image) return false;

    const frame = image.parentElement;
    const figure = frame?.parentElement;
    if (!frame || !figure) return false;

    installStyle();
    launcher.classList.add('cc-zordon-human-launcher');
    figure.classList.add('cc-zordon-human-figure');
    frame.classList.add('cc-zordon-human-frame');
    image.src = HUMAN_ASSET;
    image.removeAttribute('srcset');
    image.alt = 'ZORDON, ingeniero civil supervisor de obra';
    image.decoding = 'async';

    const button = launcher.querySelector('button');
    if (button && !button.dataset.zordonHumanMotionBound) {
      button.dataset.zordonHumanMotionBound = '1';
      button.addEventListener('pointerenter', () => launcher.classList.add('cc-zordon-human-greeting'));
      button.addEventListener('pointerleave', () => launcher.classList.remove('cc-zordon-human-greeting'));
    }
    return true;
  }

  function schedule() {
    requestAnimationFrame(apply);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  installStyle();
  apply();
  setTimeout(apply, 250);
  setTimeout(apply, 1000);
})();
