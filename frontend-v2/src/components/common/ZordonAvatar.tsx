import React, { useEffect, useRef, useState } from 'react';

const zordonAvatarSrc = `${import.meta.env.BASE_URL}engineer-assistant-avatar.png`;
const zordonFullBodySrc = `${import.meta.env.BASE_URL}zordon-human-fullbody-v1.webp`;

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

interface FullBodyProps {
  showStatusDot?: boolean;
  className?: string;
}

export const EngineerFullBodyFigure: React.FC<FullBodyProps> = ({ showStatusDot = true, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`zordon-idle relative flex flex-col items-center select-none group ${className}`}>
      <div className="relative h-36 w-24 sm:h-44 sm:w-28 md:h-52 md:w-32 overflow-visible rounded-xl border border-blue-500/20 bg-gradient-to-b from-transparent via-[#0b1220]/20 to-[#0b1220]/80 shadow-2xl transition-all duration-300 group-hover:border-emerald-400/80">
        <img
          src={imgError ? zordonAvatarSrc : zordonFullBodySrc}
          alt="ZORDON - Ingeniero Supervisor de cuerpo entero"
          referrerPolicy="no-referrer"
          className={imgError ? 'h-full w-full rounded-xl object-cover object-top' : 'h-full w-full object-contain object-bottom animate-pulse'}
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
        <span className="text-[9px] font-bold text-slate-300 group-hover:text-emerald-300 tracking-wider">ZORDON</span>
      </div>
    </div>
  );
};

interface ZordonLauncherProps {
  onOpen: () => void;
  isAvailable?: boolean;
}

type Position = { left: number; top: number };
const POSITION_KEY = 'control-contractual:zordon-position:v2';
const LEGACY_VISIBILITY_KEY = 'control-contractual:zordon-visibility:v1';
const EDGE = 8;

/** Launcher permanente, arrastrable y con posición persistente. */
export const ZordonLauncher: React.FC<ZordonLauncherProps> = ({ onOpen, isAvailable = true }) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const launcherRef = useRef<HTMLDivElement>(null);

  const clampPosition = (next: Position): Position => {
    const rect = launcherRef.current?.getBoundingClientRect();
    const width = rect?.width || 128;
    const height = rect?.height || 220;
    return {
      left: Math.max(EDGE, Math.min(next.left, Math.max(EDGE, window.innerWidth - width - EDGE))),
      top: Math.max(EDGE, Math.min(next.top, Math.max(EDGE, window.innerHeight - height - EDGE))),
    };
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(POSITION_KEY) || 'null');
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) setPosition(saved);
      // ZORDON debe permanecer visible. Limpia estados antiguos que lo dejaban
      // reducido a una letra o completamente oculto.
      localStorage.removeItem(LEGACY_VISIBILITY_KEY);
    } catch { /* storage can be unavailable in private browsing */ }
  }, []);

  useEffect(() => {
    const place = () => {
      setPosition((current) => clampPosition(current || {
        left: Math.max(EDGE, window.innerWidth - (window.innerWidth < 640 ? 112 : 164)),
        top: 76,
      }));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  useEffect(() => {
    if (!position) return;
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(position)); } catch { /* ignore */ }
  }, [position]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
      drag.moved = true;
      setPosition(clampPosition({ left: event.clientX - drag.offsetX, top: event.clientY - drag.offsetY }));
      event.preventDefault();
    };
    const end = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      suppressClick.current = Boolean(dragRef.current.moved);
      dragRef.current = null;
      document.body.style.removeProperty('user-select');
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = launcherRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    document.body.style.setProperty('user-select', 'none');
  };

  const open = () => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    onOpen();
  };

  return (
    <div ref={launcherRef} id="zordon-engineer-launcher-container" onPointerDown={startDrag}
      className="fixed z-[90] select-none pointer-events-auto"
      style={{ left: position?.left ?? 'auto', top: position?.top ?? 76, right: position ? 'auto' : 16, bottom: 'auto', touchAction: 'none' }}>
      <button type="button" data-zordon-control="open" onClick={open} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/80" aria-label="Abrir ZORDON" title="ZORDON - Asistente Técnico y Supervisión de Obras">
        <div className={`hidden md:flex flex-col items-start absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0f172a] border border-emerald-500/40 text-white shadow-2xl whitespace-nowrap z-50 pointer-events-none transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs font-bold tracking-wide">ZORDON · Asistente Oficial</span>
          <span className="text-[10px] text-slate-400">Arrastra para mover · clic para consultar</span>
        </div>
        <EngineerFullBodyFigure showStatusDot={isAvailable} />
      </button>
    </div>
  );
};
