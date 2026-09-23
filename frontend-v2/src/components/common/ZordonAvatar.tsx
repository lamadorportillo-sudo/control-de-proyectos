import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  normalizeZordonPreferences,
  readZordonPreferences,
  type ZordonFigureSize,
  type ZordonPreferences,
  ZORDON_PREFERENCES_EVENT,
  ZORDON_PREFERENCES_KEY,
  ZORDON_POSITION_KEY,
  ZORDON_REPOSITION_EVENT,
} from '../../services/zordonPreferences.ts';

const zordonAvatarSrc = `${import.meta.env.BASE_URL}engineer-assistant-avatar.png`;
const zordonFullBodySrc = `${import.meta.env.BASE_URL}zordon-human-fullbody-v1.webp`;
const zordonDeskWorkSrc = `${import.meta.env.BASE_URL}assets/zordon-desk-work-v1.webp`;

interface ZordonAvatarProps {
  size?: number;
  showStatusDot?: boolean;
  className?: string;
}

export const EngineerFigure: React.FC<ZordonAvatarProps> = ({
  size = 36,
  showStatusDot = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500/70 shadow-md bg-[#0e1726]">
        <img
          src={zordonAvatarSrc}
          alt="ZORDON - Ingeniero Supervisor"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[50%_6%] scale-[2.2]"
          onError={() => setImgError(true)}
        />
        {imgError && <span className="sr-only">Avatar de ZORDON no disponible</span>}
      </div>
      {showStatusDot && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-[#0b1220]" />
        </span>
      )}
    </div>
  );
};

type ZordonPose = 'standing' | 'working';
type ZordonMotion = 'idle' | 'walking' | 'working';

interface FullBodyProps {
  showStatusDot?: boolean;
  className?: string;
  pose?: ZordonPose;
  motion?: ZordonMotion;
  facing?: 'left' | 'right';
  figureSize?: ZordonFigureSize;
}

const figureClasses: Record<ZordonFigureSize, Record<ZordonPose, string>> = {
  compacto: {
    standing: 'h-32 w-20 sm:h-36 sm:w-24 md:h-44 md:w-28',
    working: 'h-32 w-24 sm:h-36 sm:w-28 md:h-40 md:w-32',
  },
  normal: {
    standing: 'h-36 w-24 sm:h-44 sm:w-28 md:h-52 md:w-32',
    working: 'h-36 w-28 sm:h-44 sm:w-32 md:h-48 md:w-36',
  },
  amplio: {
    standing: 'h-40 w-28 sm:h-48 sm:w-32 md:h-56 md:w-36',
    working: 'h-40 w-32 sm:h-48 sm:w-36 md:h-52 md:w-40',
  },
};

export const EngineerFullBodyFigure: React.FC<FullBodyProps> = ({
  showStatusDot = true,
  className = '',
  pose = 'standing',
  motion = 'idle',
  facing = 'left',
  figureSize = 'normal',
}) => {
  const [imgError, setImgError] = useState(false);
  const isWorking = pose === 'working' && !imgError;

  return (
    <div
      data-zordon-body
      data-zordon-pose={pose}
      data-zordon-motion={motion}
      data-zordon-facing={facing}
      className={`zordon-idle relative flex flex-col items-center select-none group ${className}`}
    >
      <div className={`relative overflow-visible rounded-xl border border-blue-500/20 bg-gradient-to-b from-transparent via-[#0b1220]/20 to-[#0b1220]/80 shadow-2xl transition-all duration-300 group-hover:border-emerald-400/80 ${figureClasses[figureSize][isWorking ? 'working' : 'standing']}`}>
        <img
          src={isWorking ? zordonDeskWorkSrc : (imgError ? zordonAvatarSrc : zordonFullBodySrc)}
          alt={isWorking ? 'ZORDON revisando planos en su mesa de trabajo' : 'ZORDON - Ingeniero Supervisor de cuerpo entero'}
          referrerPolicy="no-referrer"
          className={imgError ? 'h-full w-full rounded-xl object-cover object-top' : 'h-full w-full object-contain object-bottom'}
          onError={() => setImgError(true)}
        />
        {showStatusDot && (
          <div className="absolute bottom-1 right-1 z-20 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0b1220] shadow" />
          </div>
        )}
      </div>
      <div className="mt-0.5 px-1.5 py-0.5 rounded bg-[#0e1726]/90 border border-[#1f2e45] group-hover:border-emerald-400/50 shadow transition-colors">
        <span className="text-[9px] font-bold text-slate-300 group-hover:text-emerald-300 tracking-wider">{isWorking ? 'ZORDON · PLANOS' : 'ZORDON'}</span>
      </div>
    </div>
  );
};

interface ZordonLauncherProps {
  onOpen: () => void;
  isAvailable?: boolean;
  isPanelOpen?: boolean;
}

type Position = { left: number; top: number };

const PREVIOUS_POSITION_KEY = 'control-contractual:zordon-position:v2';
const LEGACY_VISIBILITY_KEY = 'control-contractual:zordon-visibility:v1';
const EDGE = 12;
const INTERACTION_DISTANCE = 150;

const launcherSizes: Record<ZordonFigureSize, Record<ZordonPose, { width: number; height: number }>> = {
  compacto: {
    standing: { width: 116, height: 202 },
    working: { width: 136, height: 194 },
  },
  normal: {
    standing: { width: 142, height: 236 },
    working: { width: 160, height: 222 },
  },
  amplio: {
    standing: { width: 164, height: 252 },
    working: { width: 182, height: 240 },
  },
};

const walkingDuration = (speed: ZordonPreferences['walkingSpeed']): number => ({
  suave: 1480,
  normal: 980,
  rapido: 620,
}[speed]);

const zordonMotionCss = (duration: number) => `
  #zordon-engineer-launcher-container {
    transition: left ${duration}ms cubic-bezier(.22,.82,.28,1), top ${duration}ms cubic-bezier(.22,.82,.28,1);
    will-change: left, top;
  }
  #zordon-engineer-launcher-container[data-zordon-dragging="true"] { transition: none; }
  #zordon-engineer-launcher-container [data-zordon-body] { transform-origin: center bottom; }
  #zordon-engineer-launcher-container[data-zordon-motion="walking"] [data-zordon-body] { animation: zordon-walk-step .42s ease-in-out infinite alternate; }
  #zordon-engineer-launcher-container[data-zordon-motion="walking"] [data-zordon-body] img { animation: zordon-walk-breath .42s ease-in-out infinite alternate; }
  #zordon-engineer-launcher-container[data-zordon-motion="working"] [data-zordon-body] { animation: zordon-work-breath 2.8s ease-in-out infinite; }
  #zordon-engineer-launcher-container[data-zordon-facing="right"] [data-zordon-body] > div:first-child > img { transform: scaleX(-1); }
  @keyframes zordon-walk-step { from { transform: translateY(0) rotate(-.7deg); } to { transform: translateY(-4px) rotate(.7deg); } }
  @keyframes zordon-walk-breath { from { transform: translateX(-2px); } to { transform: translateX(2px); } }
  @keyframes zordon-work-breath { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-2px) rotate(-.35deg); } }
  @media (prefers-reduced-motion: reduce) {
    #zordon-engineer-launcher-container,
    #zordon-engineer-launcher-container [data-zordon-body],
    #zordon-engineer-launcher-container [data-zordon-body] img { animation: none !important; transition: none !important; }
  }
`;

function launcherSize(pose: ZordonPose, figureSize: ZordonFigureSize) {
  return launcherSizes[figureSize][pose];
}

function clampToViewport(next: Position, pose: ZordonPose, figureSize: ZordonFigureSize, rect?: DOMRect | null): Position {
  const fallback = launcherSize(pose, figureSize);
  const width = rect?.width || fallback.width;
  const height = rect?.height || fallback.height;
  return {
    left: Math.max(EDGE, Math.min(next.left, Math.max(EDGE, window.innerWidth - width - EDGE))),
    top: Math.max(EDGE, Math.min(next.top, Math.max(EDGE, window.innerHeight - height - EDGE))),
  };
}

function viewportAnchor(pose: ZordonPose, preferences: ZordonPreferences): Position {
  const size = launcherSize(pose, preferences.figureSize);
  const mobile = window.innerWidth < 640;
  const left = preferences.preferredDock === 'izquierda'
    ? (mobile ? 8 : EDGE)
    : window.innerWidth - size.width - (mobile ? 8 : 20);

  return clampToViewport({
    left,
    top: mobile ? Math.max(70, window.innerHeight - size.height - 82) : Math.max(78, window.innerHeight - size.height - 22),
  }, pose, preferences.figureSize);
}

function interactiveAt(x: number, y: number): boolean {
  const targets = document.elementsFromPoint(x, y);
  return targets.some((element) => {
    if (element.closest?.('#zordon-engineer-launcher-container')) return false;
    return Boolean(element.closest?.('button,input,textarea,select,a,[role="button"],[contenteditable="true"]'));
  });
}

function quietPosition(from: Position, pose: ZordonPose, preferences: ZordonPreferences): Position {
  const size = launcherSize(pose, preferences.figureSize);
  const header = document.querySelector('header')?.getBoundingClientRect();
  const sidebar = Array.from(document.querySelectorAll('aside,[role="navigation"]'))
    .map((element) => element.getBoundingClientRect())
    .find((rect) => rect.width > 80 && rect.height > 180);
  const top = Math.max(74, (header?.bottom || 58) + EDGE);
  const leftLane = Math.max(EDGE, (sidebar?.right || 0) + EDGE);
  const bottom = window.innerHeight - size.height - (window.innerWidth < 640 ? 76 : EDGE);
  const candidates = [
    { left: window.innerWidth - size.width - EDGE, top },
    { left: window.innerWidth - size.width - EDGE, top: bottom },
    { left: leftLane, top: bottom },
    { left: leftLane, top },
  ].map((candidate) => clampToViewport(candidate, pose, preferences.figureSize));

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
    .sort((a, b) => a.score - b.score)[0]?.candidate || viewportAnchor(pose, preferences);
}

/** Lanzador permanente: se arrastra, camina al reubicarse y descansa revisando planos. */
export const ZordonLauncher: React.FC<ZordonLauncherProps> = ({ onOpen, isAvailable = true, isPanelOpen = false }) => {
  const [preferences, setPreferences] = useState<ZordonPreferences>(() => readZordonPreferences());
  const [position, setPosition] = useState<Position | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [pose, setPose] = useState<ZordonPose>('standing');
  const [motion, setMotion] = useState<ZordonMotion>('idle');
  const [facing, setFacing] = useState<'left' | 'right'>('left');
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const walkTimer = useRef<number | undefined>(undefined);
  const workTimer = useRef<number | undefined>(undefined);
  const idleTimer = useRef<number | undefined>(undefined);
  const avoidTimer = useRef<number | undefined>(undefined);
  const lastActivity = useRef(Date.now());
  const preferencesRef = useRef(preferences);
  const moveDuration = walkingDuration(preferences.walkingSpeed);

  const clearTimers = useCallback(() => {
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    if (workTimer.current) window.clearTimeout(workTimer.current);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    if (avoidTimer.current) window.clearTimeout(avoidTimer.current);
    walkTimer.current = undefined;
    workTimer.current = undefined;
    idleTimer.current = undefined;
    avoidTimer.current = undefined;
  }, []);

  const clampPosition = useCallback((next: Position, nextPose: ZordonPose = pose) => (
    clampToViewport(next, nextPose, preferences.figureSize, launcherRef.current?.getBoundingClientRect())
  ), [pose, preferences.figureSize]);

  const rememberActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  const finishWalk = useCallback((nextMotion: ZordonMotion = 'idle') => {
    if (walkTimer.current) window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => setMotion(nextMotion), moveDuration);
  }, [moveDuration]);

  const walkTo = useCallback((target: Position, nextPose: ZordonPose = 'standing') => {
    const current = position || viewportAnchor(nextPose, preferences);
    const next = clampPosition(target, nextPose);
    if (next.left > current.left) setFacing('right');
    if (next.left < current.left) setFacing('left');
    setPose('standing');
    setMotion('walking');
    setPosition(next);
    if (nextPose !== 'working') finishWalk();
  }, [clampPosition, finishWalk, position, preferences]);

  const startWorking = useCallback(() => {
    if (!preferences.autonomousMovement || !preferences.deskMode || !position || dragRef.current || isPanelOpen) return;
    clearTimers();
    const target = quietPosition(position, 'working', preferences);
    walkTo(target, 'working');
    walkTimer.current = window.setTimeout(() => {
      if (!preferencesRef.current.autonomousMovement || !preferencesRef.current.deskMode) {
        setMotion('idle');
        return;
      }
      setPose('working');
      setMotion('working');
      workTimer.current = window.setTimeout(() => {
        setPose('standing');
        walkTo(quietPosition(target, 'standing', preferences));
      }, preferences.workDurationSeconds * 1000);
    }, moveDuration);
  }, [clearTimers, isPanelOpen, moveDuration, position, preferences, walkTo]);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    const syncPreferences = (event: Event) => {
      const detail = (event as CustomEvent<ZordonPreferences>).detail;
      setPreferences(detail ? normalizeZordonPreferences(detail) : readZordonPreferences());
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === ZORDON_PREFERENCES_KEY) setPreferences(readZordonPreferences());
    };
    window.addEventListener(ZORDON_PREFERENCES_EVENT, syncPreferences);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener(ZORDON_PREFERENCES_EVENT, syncPreferences);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ZORDON_POSITION_KEY) || 'null');
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        const savedPreferences = readZordonPreferences();
        setPosition(clampToViewport(saved, 'standing', savedPreferences.figureSize));
      }
      // La configuración anterior podía dejar la figura centrada u oculta.
      // V3 inicia en una zona lateral y conserva solo las ubicaciones nuevas.
      localStorage.removeItem(PREVIOUS_POSITION_KEY);
      localStorage.removeItem(LEGACY_VISIBILITY_KEY);
    } catch { /* storage can be unavailable in private browsing */ }
  }, []);

  useEffect(() => {
    const place = () => {
      setPosition((current) => clampPosition(current || viewportAnchor(pose, preferences)));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [clampPosition, pose, preferences]);

  useEffect(() => {
    const returnToPreferredDock = () => {
      clearTimers();
      setPose('standing');
      setFacing(preferences.preferredDock === 'izquierda' ? 'right' : 'left');
      setPosition(viewportAnchor('standing', preferences));
      if (preferences.autonomousMovement) {
        setMotion('walking');
        finishWalk();
      } else {
        setMotion('idle');
      }
    };
    window.addEventListener(ZORDON_REPOSITION_EVENT, returnToPreferredDock);
    return () => window.removeEventListener(ZORDON_REPOSITION_EVENT, returnToPreferredDock);
  }, [clearTimers, finishWalk, preferences]);

  useEffect(() => {
    if (preferences.autonomousMovement && preferences.deskMode) return;
    if (pose === 'working') {
      clearTimers();
      setPose('standing');
      setMotion('idle');
    }
  }, [clearTimers, pose, preferences.autonomousMovement, preferences.deskMode]);

  useEffect(() => {
    if (!position) return;
    try { localStorage.setItem(ZORDON_POSITION_KEY, JSON.stringify(position)); } catch { /* ignore */ }
  }, [position]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        setIsDragging(true);
        launcherRef.current?.setPointerCapture?.(event.pointerId);
        document.body.style.setProperty('user-select', 'none');
      }
      rememberActivity();
      setPose('standing');
      setMotion('walking');
      if (event.clientX < drag.startX) setFacing('left');
      if (event.clientX > drag.startX) setFacing('right');
      setPosition(clampPosition({ left: event.clientX - drag.offsetX, top: event.clientY - drag.offsetY }, 'standing'));
      event.preventDefault();
    };
    const end = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      suppressClick.current = Boolean(dragRef.current.moved);
      dragRef.current = null;
      setIsDragging(false);
      document.body.style.removeProperty('user-select');
      if (suppressClick.current) finishWalk();
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [clampPosition, finishWalk, rememberActivity]);

  useEffect(() => {
    const avoidActiveControl = (event: PointerEvent) => {
      if (!preferences.autonomousMovement || !preferences.avoidControls || dragRef.current || isPanelOpen || !position) return;
      const target = event.target as Element | null;
      if (!target || target.closest('#zordon-engineer-launcher-container')) return;
      if (!target.closest('button,input,textarea,select,a,[role="button"],[contenteditable="true"]')) return;
      const rect = launcherRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nearLauncher = event.clientX >= rect.left - INTERACTION_DISTANCE
        && event.clientX <= rect.right + INTERACTION_DISTANCE
        && event.clientY >= rect.top - INTERACTION_DISTANCE
        && event.clientY <= rect.bottom + INTERACTION_DISTANCE;
      if (!nearLauncher) return;
      if (avoidTimer.current) window.clearTimeout(avoidTimer.current);
      avoidTimer.current = window.setTimeout(() => {
        if (!dragRef.current) walkTo(quietPosition(position, 'standing', preferences));
      }, 180);
    };
    const keepInFrame = () => {
      if (avoidTimer.current) window.clearTimeout(avoidTimer.current);
      avoidTimer.current = window.setTimeout(() => {
        setPosition((current) => current ? clampPosition(current) : viewportAnchor(pose, preferences));
      }, 220);
    };
    document.addEventListener('pointermove', avoidActiveControl, { passive: true });
    window.addEventListener('scroll', keepInFrame, true);
    return () => {
      document.removeEventListener('pointermove', avoidActiveControl);
      window.removeEventListener('scroll', keepInFrame, true);
      if (avoidTimer.current) window.clearTimeout(avoidTimer.current);
    };
  }, [clampPosition, isPanelOpen, pose, position, preferences, walkTo]);

  useEffect(() => {
    if (!preferences.autonomousMovement || !preferences.deskMode || !position || isPanelOpen || pose === 'working' || motion === 'walking') return;
    const delay = preferences.workDelaySeconds * 1000;
    const scheduleBreak = (wait: number = delay) => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        const remaining = delay - (Date.now() - lastActivity.current);
        if (dragRef.current || isPanelOpen || remaining > 0) {
          scheduleBreak(Math.max(1000, remaining));
          return;
        }
        startWorking();
      }, wait);
    };
    scheduleBreak();
    return () => { if (idleTimer.current) window.clearTimeout(idleTimer.current); };
  }, [isPanelOpen, motion, position, pose, preferences.autonomousMovement, preferences.deskMode, preferences.workDelaySeconds, startWorking]);

  useEffect(() => {
    if (!isPanelOpen) return;
    clearTimers();
    setPose('standing');
    setMotion('idle');
  }, [clearTimers, isPanelOpen]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = launcherRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.stopPropagation();
    clearTimers();
    rememberActivity();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const open = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    clearTimers();
    rememberActivity();
    setPose('standing');
    setMotion('idle');
    onOpen();
  };

  const status = pose === 'working'
    ? 'Revisando planos'
    : motion === 'walking'
      ? 'Caminando a una zona libre'
      : preferences.autonomousMovement
        ? 'Arrastra para mover · clic para consultar'
        : 'Ubicación manual · clic para consultar';

  return (
    <div
      ref={launcherRef}
      id="zordon-engineer-launcher-container"
      data-zordon-permanent="true"
      data-zordon-pose={pose}
      data-zordon-motion={motion}
      data-zordon-dragging={isDragging ? 'true' : 'false'}
      data-zordon-autonomous={preferences.autonomousMovement ? 'true' : 'false'}
      onPointerDown={startDrag}
      className="fixed z-[90] select-none pointer-events-auto"
      style={{ left: position?.left ?? 'auto', top: position?.top ?? 76, right: position ? 'auto' : 16, bottom: 'auto', touchAction: 'none' }}
    >
      <style>{zordonMotionCss(moveDuration)}</style>
      <button
        type="button"
        data-zordon-control="open"
        onClick={open}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
        aria-label="Abrir ZORDON"
        title={`ZORDON - ${status}`}
      >
        <div className={`hidden md:flex flex-col items-start absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0f172a] border border-emerald-500/40 text-white shadow-2xl whitespace-nowrap z-50 pointer-events-none transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs font-bold tracking-wide">ZORDON · Asistente Oficial</span>
          <span className="text-[10px] text-slate-400">{status}</span>
        </div>
        <EngineerFullBodyFigure
          showStatusDot={isAvailable}
          pose={pose}
          motion={motion}
          facing={facing}
          figureSize={preferences.figureSize}
        />
      </button>
    </div>
  );
};
