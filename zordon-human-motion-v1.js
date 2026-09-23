/* ZORDON · presencia permanente, móvil y no invasiva para el artefacto publicado. */
(() => {
  'use strict';
  if (window.__CC_ZORDON_PRESENCE_V3__) return;
  window.__CC_ZORDON_PRESENCE_V3__ = true;

  const POSITION_KEY = 'control-contractual:zordon-position:v3';
  const PREVIOUS_POSITION_KEY = 'control-contractual:zordon-position:v2';
  const LEGACY_VISIBILITY_KEY = 'control-contractual:zordon-visibility:v1';
  const STYLE_ID = 'cc-zordon-presence-v3-style';
  const HUMAN_ASSET = './zordon-human-fullbody-v1.webp';
  const DESK_ASSET = './assets/zordon-desk-work-v1.webp';
  const EDGE = 12;
  const WALK_DURATION = 980;
  const state = {
    launcher: null,
    position: null,
    pose: 'standing',
    motion: 'idle',
    drag: null,
    suppressClick: false,
    lastActivity: Date.now(),
    walkTimer: 0,
    workTimer: 0,
    idleTimer: 0,
    avoidTimer: 0,
    facing: 'left',
  };

  function clearTimer(name) {
    if (state[name]) clearTimeout(state[name]);
    state[name] = 0;
  }

  function clearTimers() {
    clearTimer('walkTimer');
    clearTimer('workTimer');
    clearTimer('idleTimer');
  }

  function sizeFor(pose) {
    return pose === 'working' ? { width: 164, height: 232 } : { width: 142, height: 242 };
  }

  function clamp(next, pose = state.pose) {
    const fallback = sizeFor(pose);
    const rect = state.launcher?.getBoundingClientRect?.();
    const width = rect?.width || fallback.width;
    const height = rect?.height || fallback.height;
    return {
      left: Math.max(EDGE, Math.min(next.left, Math.max(EDGE, innerWidth - width - EDGE))),
      top: Math.max(EDGE, Math.min(next.top, Math.max(EDGE, innerHeight - height - EDGE))),
    };
  }

  function defaultPosition(pose = 'standing') {
    const size = sizeFor(pose);
    const narrow = innerWidth < 640;
    return clamp({
      left: innerWidth - size.width - (narrow ? 8 : 20),
      top: narrow ? Math.max(70, innerHeight - size.height - 82) : Math.max(78, innerHeight - size.height - 22),
    }, pose);
  }

  function savePosition() {
    try {
      if (state.position) localStorage.setItem(POSITION_KEY, JSON.stringify(state.position));
    } catch { /* almacenamiento local no disponible */ }
  }

  function setStatus() {
    const launcher = state.launcher;
    if (!launcher) return;
    const text = state.pose === 'working'
      ? 'ZORDON · revisando planos'
      : state.motion === 'walking'
        ? 'ZORDON · caminando a una zona libre'
        : 'ZORDON · arrastra para mover · clic para consultar';
    launcher.dataset.zordonPose = state.pose;
    launcher.dataset.zordonMotion = state.motion;
    launcher.dataset.zordonFacing = state.facing;
    const button = launcher.querySelector('button');
    if (button) {
      button.title = text;
      button.setAttribute('aria-label', 'Abrir ZORDON');
    }
    const note = launcher.querySelector('.cc-zordon-presence-note');
    if (note) note.textContent = state.pose === 'working' ? 'PLANOS' : 'ZORDON';
  }

  function settle(nextMotion = 'idle') {
    clearTimer('walkTimer');
    state.walkTimer = setTimeout(() => {
      state.motion = nextMotion;
      setStatus();
    }, WALK_DURATION);
  }

  function setPosition(next, walking = false, pose = state.pose) {
    const previous = state.position || defaultPosition(pose);
    state.position = clamp(next, pose);
    if (state.position.left > previous.left) state.facing = 'right';
    if (state.position.left < previous.left) state.facing = 'left';
    const launcher = state.launcher;
    if (launcher) {
      launcher.style.setProperty('left', state.position.left + 'px', 'important');
      launcher.style.setProperty('top', state.position.top + 'px', 'important');
      launcher.style.setProperty('right', 'auto', 'important');
      launcher.style.setProperty('bottom', 'auto', 'important');
    }
    if (walking) {
      state.pose = 'standing';
      state.motion = 'walking';
      settle(pose === 'working' ? 'working' : 'idle');
    }
    setStatus();
    savePosition();
  }

  function interactiveAt(x, y) {
    return document.elementsFromPoint(x, y).some((element) => {
      if (element.closest?.('#zordon-engineer-launcher-container')) return false;
      return Boolean(element.closest?.('button,input,textarea,select,a,[role="button"],[contenteditable="true"]'));
    });
  }

  function quietPosition(from, pose = 'standing') {
    const size = sizeFor(pose);
    const header = document.querySelector('header')?.getBoundingClientRect?.();
    const sidebar = [...document.querySelectorAll('aside,[role="navigation"]')]
      .map((element) => element.getBoundingClientRect())
      .find((rect) => rect.width > 80 && rect.height > 180);
    const top = Math.max(74, (header?.bottom || 58) + EDGE);
    const leftLane = Math.max(EDGE, (sidebar?.right || 0) + EDGE);
    const bottom = innerHeight - size.height - (innerWidth < 640 ? 76 : EDGE);
    const candidates = [
      { left: innerWidth - size.width - EDGE, top },
      { left: innerWidth - size.width - EDGE, top: bottom },
      { left: leftLane, top: bottom },
      { left: leftLane, top },
    ].map((candidate) => clamp(candidate, pose));

    return candidates
      .map((candidate) => {
        const samples = [
          [candidate.left + size.width / 2, candidate.top + 24],
          [candidate.left + size.width / 2, candidate.top + size.height / 2],
          [candidate.left + 16, candidate.top + size.height - 18],
          [candidate.left + size.width - 16, candidate.top + size.height - 18],
        ];
        const blocked = samples.filter(([x, y]) => interactiveAt(x, y)).length;
        const distance = Math.hypot(candidate.left - from.left, candidate.top - from.top);
        return { candidate, score: blocked * 1000 - Math.min(distance, 320) / 16 };
      })
      .sort((a, b) => a.score - b.score)[0]?.candidate || defaultPosition(pose);
  }

  function scheduleBreak() {
    clearTimer('idleTimer');
    if (!state.launcher || state.pose === 'working' || state.motion === 'walking') return;
    state.idleTimer = setTimeout(() => {
      if (state.drag || Date.now() - state.lastActivity < 16000) {
        scheduleBreak();
        return;
      }
      startWorking();
    }, 10000 + Math.round(Math.random() * 5000));
  }

  function startWorking() {
    if (!state.launcher || state.drag) return;
    clearTimers();
    const target = quietPosition(state.position || defaultPosition(), 'working');
    setPosition(target, true, 'working');
    clearTimer('walkTimer');
    state.walkTimer = setTimeout(() => {
      state.pose = 'working';
      state.motion = 'working';
      setStatus();
      state.workTimer = setTimeout(() => {
        state.pose = 'standing';
        state.motion = 'walking';
        const current = state.position || target;
        setPosition(quietPosition(current, 'standing'), true, 'standing');
        scheduleBreak();
      }, 9000 + Math.round(Math.random() * 5000));
    }, WALK_DURATION);
  }

  function noteActivity() {
    state.lastActivity = Date.now();
    if (state.pose === 'working') {
      clearTimers();
      state.pose = 'standing';
      state.motion = 'idle';
      setStatus();
    }
    scheduleBreak();
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 {
        position: fixed !important;
        z-index: 90 !important;
        width: auto !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
        overflow: visible !important;
        pointer-events: auto !important;
        transition: left ${WALK_DURATION}ms cubic-bezier(.22,.82,.28,1), top ${WALK_DURATION}ms cubic-bezier(.22,.82,.28,1) !important;
        will-change: left, top;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-dragging="true"] {
        transition: none !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 [data-zordon-control="minimize"],
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 [data-zordon-control="close"] {
        display: none !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 > button {
        display: block !important;
        width: auto !important;
        height: auto !important;
        min-width: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        overflow: visible !important;
        cursor: grab !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-dragging="true"] > button { cursor: grabbing !important; }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle {
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        width: 132px !important;
        height: 228px !important;
        overflow: visible !important;
        transform-origin: center bottom !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle > div:first-child {
        position: relative !important;
        width: 116px !important;
        height: 206px !important;
        overflow: visible !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle > div:first-child > img:not(.cc-zordon-work-figure) {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        object-fit: contain !important;
        object-position: center bottom !important;
        border: 0 !important;
        border-radius: 0 !important;
        filter: drop-shadow(0 10px 8px rgba(0, 0, 0, .34)) !important;
        transform-origin: center bottom !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle > div:last-child {
        position: relative !important;
        z-index: 5 !important;
        margin-top: 1px !important;
        padding: 2px 6px !important;
        border: 1px solid rgba(16,185,129,.55) !important;
        border-radius: 5px !important;
        background: rgba(14,23,38,.92) !important;
        box-shadow: 0 3px 10px rgba(0,0,0,.24) !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3 .cc-zordon-work-figure {
        display: none !important;
        position: absolute !important;
        z-index: 3 !important;
        left: 50% !important;
        bottom: -8px !important;
        width: 164px !important;
        height: 224px !important;
        max-width: none !important;
        object-fit: contain !important;
        object-position: center bottom !important;
        transform: translateX(-50%) !important;
        filter: drop-shadow(0 10px 8px rgba(0,0,0,.34)) !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-pose="working"] .zordon-idle > div:first-child > img:not(.cc-zordon-work-figure) {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-pose="working"] .cc-zordon-work-figure {
        display: block !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-motion="walking"] .zordon-idle {
        animation: ccZordonPresenceWalk .42s ease-in-out infinite alternate !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-motion="walking"] .zordon-idle > div:first-child > img:not(.cc-zordon-work-figure) {
        animation: ccZordonPresenceStride .42s ease-in-out infinite alternate !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-motion="working"] .zordon-idle {
        animation: ccZordonPresenceWork 2.8s ease-in-out infinite !important;
      }
      #zordon-engineer-launcher-container.cc-zordon-presence-v3[data-zordon-facing="right"] .zordon-idle > div:first-child > img:not(.cc-zordon-work-figure) {
        transform: scaleX(-1) !important;
      }
      @keyframes ccZordonPresenceWalk {
        from { transform: translateY(0) rotate(-.7deg); }
        to { transform: translateY(-4px) rotate(.7deg); }
      }
      @keyframes ccZordonPresenceStride {
        from { translate: -2px 0; }
        to { translate: 2px 0; }
      }
      @keyframes ccZordonPresenceWork {
        0%,100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-2px) rotate(-.35deg); }
      }
      @media (max-width: 640px) {
        #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle {
          width: 104px !important;
          height: 184px !important;
        }
        #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle > div:first-child {
          width: 94px !important;
          height: 166px !important;
        }
        #zordon-engineer-launcher-container.cc-zordon-presence-v3 .cc-zordon-work-figure {
          width: 126px !important;
          height: 172px !important;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        #zordon-engineer-launcher-container.cc-zordon-presence-v3,
        #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle,
        #zordon-engineer-launcher-container.cc-zordon-presence-v3 .zordon-idle img {
          transition: none !important;
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureWorkFigure(launcher) {
    const figure = launcher.querySelector('.zordon-idle');
    const image = figure?.querySelector('img:not(.cc-zordon-work-figure)');
    if (!figure || !image) return;
    const frame = image.parentElement;
    if (!frame) return;
    if (!image.dataset.zordonHumanAsset) {
      image.dataset.zordonHumanAsset = '1';
      image.src = HUMAN_ASSET;
      image.removeAttribute('srcset');
      image.alt = 'ZORDON, ingeniero civil supervisor de obra';
      image.decoding = 'async';
    }
    if (!frame.querySelector('.cc-zordon-work-figure')) {
      const work = document.createElement('img');
      work.className = 'cc-zordon-work-figure';
      work.src = DESK_ASSET;
      work.alt = 'ZORDON revisando planos en una mesa de trabajo';
      work.decoding = 'async';
      work.setAttribute('aria-hidden', 'true');
      frame.appendChild(work);
    }
    const label = figure.querySelector('div:last-child span');
    if (label) label.classList.add('cc-zordon-presence-note');
  }

  function bind(launcher) {
    if (launcher.dataset.zordonPresenceBound === 'true') return;
    launcher.dataset.zordonPresenceBound = 'true';

    launcher.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const rect = launcher.getBoundingClientRect();
      state.drag = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      launcher.dataset.zordonDragging = 'true';
      noteActivity();
      try { launcher.setPointerCapture(event.pointerId); } catch { /* no disponible */ }
      document.body.style.setProperty('user-select', 'none');
    }, true);

    launcher.addEventListener('click', (event) => {
      if (!state.suppressClick) {
        noteActivity();
        return;
      }
      state.suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);
  }

  function apply() {
    installStyle();
    try {
      localStorage.removeItem(PREVIOUS_POSITION_KEY);
      localStorage.removeItem(LEGACY_VISIBILITY_KEY);
    } catch { /* almacenamiento local no disponible */ }
    const launcher = document.getElementById('zordon-engineer-launcher-container');
    if (!launcher) return false;
    state.launcher = launcher;
    launcher.classList.add('cc-zordon-presence-v3');
    launcher.setAttribute('data-zordon-permanent', 'true');
    ensureWorkFigure(launcher);
    bind(launcher);
    if (!state.position) {
      try {
        const saved = JSON.parse(localStorage.getItem(POSITION_KEY) || 'null');
        if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) state.position = clamp(saved);
      } catch { /* almacenamiento local no disponible */ }
      if (!state.position) state.position = defaultPosition();
    }
    setPosition(state.position, false);
    scheduleBreak();
    return true;
  }

  function movePointer(event) {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.moved = true;
    noteActivity();
    state.pose = 'standing';
    state.motion = 'walking';
    state.launcher.dataset.zordonDragging = 'true';
    setPosition({ left: event.clientX - drag.offsetX, top: event.clientY - drag.offsetY }, false, 'standing');
    setStatus();
    event.preventDefault();
  }

  function releasePointer(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) return;
    state.suppressClick = Boolean(state.drag.moved);
    state.drag = null;
    if (state.launcher) state.launcher.dataset.zordonDragging = 'false';
    document.body.style.removeProperty('user-select');
    if (state.motion === 'walking') settle('idle');
    scheduleBreak();
  }

  function avoidControl(event) {
    const launcher = state.launcher;
    if (!launcher || state.drag) return;
    const target = event.target;
    if (!target?.closest || target.closest('#zordon-engineer-launcher-container')) return;
    if (!target.closest('button,input,textarea,select,a,[role="button"],[contenteditable="true"]')) return;
    const rect = launcher.getBoundingClientRect();
    const near = event.clientX >= rect.left - 150 && event.clientX <= rect.right + 150
      && event.clientY >= rect.top - 150 && event.clientY <= rect.bottom + 150;
    if (!near) return;
    clearTimer('avoidTimer');
    state.avoidTimer = setTimeout(() => {
      if (!state.drag) setPosition(quietPosition(state.position || defaultPosition()), true);
    }, 180);
  }

  window.addEventListener('pointermove', movePointer, { passive: false });
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  document.addEventListener('pointermove', avoidControl, { passive: true });
  window.addEventListener('resize', () => {
    if (state.position) setPosition(state.position, false);
  });
  window.addEventListener('scroll', () => {
    clearTimer('avoidTimer');
    state.avoidTimer = setTimeout(() => {
      if (state.position) setPosition(state.position, false);
    }, 220);
  }, true);

  const observer = new MutationObserver(() => {
    requestAnimationFrame(apply);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', apply, { once: true });
  apply();
  setTimeout(apply, 400);
  setTimeout(apply, 1200);

  window.__ccZordonPresence = {
    moveTo(left, top) {
      state.pose = 'standing';
      setPosition({ left: Number(left) || 0, top: Number(top) || 0 }, true);
    },
    work: startWorking,
    stand() {
      clearTimers();
      state.pose = 'standing';
      state.motion = 'idle';
      setStatus();
      scheduleBreak();
    },
    status() {
      return { permanent: true, pose: state.pose, motion: state.motion, position: state.position };
    },
  };
})();
