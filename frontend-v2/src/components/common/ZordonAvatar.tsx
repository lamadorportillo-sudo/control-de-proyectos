import React, { useState } from 'react';

interface ZordonAvatarProps {
  size?: number;
  showStatusDot?: boolean;
  className?: string;
}

/**
 * Avatar compacto (para header y drawer):
 * Muestra el rostro del ingeniero original con casco blanco, barba recortada y chaleco azul marino.
 */
export const EngineerFigure: React.FC<ZordonAvatarProps> = ({
  size = 36,
  showStatusDot = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative inline-block select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500/70 shadow-md bg-[#0e1726]">
        {!imgError ? (
          <img
            src="/control-de-proyectos/engineer-assistant-avatar.png"
            alt="ZORDON - Ingeniero Supervisor"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[50%_6%] scale-[2.2]"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src="/control-de-proyectos/engineer-assistant-avatar.png"
            alt="ZORDON - Ingeniero Supervisor"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[50%_6%] scale-[2.2]"
            onError={() => {}}
          />
        )}
      </div>

      {showStatusDot && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-[#0b1220]"></span>
        </span>
      )}
    </div>
  );
};

interface FullBodyProps {
  showStatusDot?: boolean;
  className?: string;
}

/**
 * Pequeño Ingeniero Original de Cuerpo Entero (Launcher Principal ZORDON):
 * Exacto al original solicitado por el usuario:
 * - Ingeniero con casco blanco de pie sobre el fondo oscuro
 * - Uniforme y chaleco técnico azul marino con franjas reflectantes plateadas
 * - Mano derecha en el bolsillo y planos enrollados en la mano izquierda
 * - Botas de obra y el indicador verde circular (disponibilidad activa) cerca de los pies
 */
export const EngineerFullBodyFigure: React.FC<FullBodyProps> = ({
  showStatusDot = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`zordon-idle relative flex flex-col items-center select-none group cursor-pointer ${className}`}>
      <div className="relative h-36 w-24 sm:h-44 sm:w-28 md:h-52 md:w-32 overflow-visible rounded-xl border border-blue-500/20 bg-gradient-to-b from-transparent via-[#0b1220]/20 to-[#0b1220]/80 shadow-2xl transition-all duration-300 group-hover:border-emerald-400/80 group-hover:scale-105">
        {!imgError ? (
          <img
            src="/control-de-proyectos/zordon-human-fullbody-v1.webp"
            alt="ZORDON - Ingeniero Supervisor de cuerpo entero"
            referrerPolicy="no-referrer"
            className="h-full w-full object-contain object-bottom"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src="/control-de-proyectos/engineer-assistant-avatar.png"
            alt="ZORDON - Ingeniero Supervisor"
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-xl object-cover object-top"
          />
        )}

        {showStatusDot && (
          <div className="absolute bottom-1 right-1 z-20 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0b1220] shadow"></span>
          </div>
        )}
      </div>

      <div className="mt-0.5 px-1.5 py-0.5 rounded bg-[#0e1726]/90 border border-[#1f2e45] group-hover:border-emerald-400/50 shadow transition-colors">
        <span className="text-[9px] font-bold text-slate-300 group-hover:text-emerald-300 tracking-wider">
          ZORDON
        </span>
      </div>
    </div>
  );
};

interface ZordonLauncherProps {
  onOpen: () => void;
  isAvailable?: boolean;
}

/**
 * Launcher oficial de ZORDON con el Pequeño Ingeniero Original:
 * - Permanece discretamente en el costado inferior derecho
 * - Muestra el cuerpo entero del ingeniero original tal como en la captura proporcionada
 * - No tapa información sensible
 * - En Celular y Telegram Mini App flota adecuadamente sin obstaculizar la barra inferior
 * - En PC muestra tooltip explicativo al pasar el cursor
 * - Incluye aria-label="Abrir ZORDON"
 */
export const ZordonLauncher: React.FC<ZordonLauncherProps> = ({
  onOpen,
  isAvailable = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id="zordon-engineer-launcher-container"
      className="fixed right-2 sm:right-3 md:right-4 bottom-16 md:bottom-3 z-40 select-none"
    >
      <button
        id="btn-zordon-engineer-avatar"
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:ring-offset-2 focus:ring-offset-[#0b1220] rounded-xl transition-all"
        aria-label="Abrir ZORDON"
        title="ZORDON - Asistente Técnico y Supervisión de Obras"
      >
        {/* Tooltip flotante en PC al pasar el cursor */}
        <div
          className={`hidden md:flex flex-col items-start absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0f172a] border border-emerald-500/40 text-white shadow-2xl transition-all pointer-events-none whitespace-nowrap z-50 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-wide">ZORDON</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-emerald-300 font-medium">Asistente Oficial</span>
          </div>
          <span className="text-[10px] text-slate-400">Clic para consultar expedientes y cálculos de ley</span>
        </div>

        {/* Ingeniero Original de Cuerpo Entero */}
        <EngineerFullBodyFigure showStatusDot={isAvailable} />
      </button>
    </div>
  );
};
