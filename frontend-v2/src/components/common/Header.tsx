import React, { useEffect, useState } from 'react';
import {
  Search,
  AlertTriangle,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Monitor,
  Send,
  Menu,
  UserRound,
  Settings,
  LogOut,
} from 'lucide-react';
import type { AppModule } from '../../types.ts';
import { getV2AuthState } from '../../services/supabaseClient.ts';
import { EngineerFigure } from './ZordonAvatar.tsx';

interface HeaderProps {
  currentModule: AppModule;
  onNavigate: (module: AppModule, extraData?: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  viewportMode: 'desktop' | 'tablet' | 'mobile' | 'telegram';
  onViewportModeChange: (mode: 'desktop' | 'tablet' | 'mobile' | 'telegram') => void;
  onToggleSidebar?: () => void;
  onOpenZordon?: () => void;
  blockingDeficiencyCount?: number;
  onLogout?: () => Promise<void> | void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  viewportMode,
  onViewportModeChange,
  onToggleSidebar,
  onOpenZordon,
  blockingDeficiencyCount = 0,
  onLogout,
}) => {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [authEmail, setAuthEmail] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateNetwork = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    void getV2AuthState().then((state) => {
      setAuthenticated(state.authenticated);
      setAuthEmail(state.user?.email || '');
    }).catch(() => {});
    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  const getModuleTitle = (module: AppModule): string => {
    const titles: Partial<Record<AppModule, string>> = {
      inicio: 'Inicio',
      proyectos: 'Expedientes de Proyectos',
      contratos: 'Contratos',
      contratistas: 'Contratistas',
      convenios: 'Convenios',
      presupuestos: 'Presupuesto y Ampliaciones',
      estimaciones: 'Estimaciones y Pagos',
      garantias: 'Garantías y Pólizas',
      visitas: 'Visitas de obra',
      compras: 'Compras y Cotizaciones',
      deficiencias: 'Deficiencias y Seguimiento',
      documentos: 'Biblioteca Documental',
      reportes: 'Reportes',
      transparencia: 'Transparencia',
      auditoria: 'Registro de Auditoría y Trazabilidad',
      configuracion: 'Configuración',
      modo_campo: 'Modo Campo',
      busqueda: 'Búsqueda Global',
    };
    return titles[module] || 'Control Contractual';
  };

  return (
    <header id="main-app-header" className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[#2b3a4a] bg-[#101720] px-3 md:gap-4 md:px-5">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="rounded p-1.5 text-slate-400 hover:bg-[#172235] hover:text-white lg:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-[8rem] truncate text-xs font-semibold uppercase tracking-wider text-slate-500 sm:max-w-none">Control Contractual</span>
          <span className="hidden text-slate-600 sm:inline">/</span>
          <h1 className="truncate text-sm font-semibold text-white md:text-base">{getModuleTitle(currentModule)}</h1>
        </div>
      </div>

      {currentModule !== 'busqueda' && currentModule !== 'inicio' && (
        <div className="mx-2 hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit(); }}
              placeholder="Buscar proyecto, contrato, código o ubicación…"
              className="w-full rounded-md border border-[#2b3a4a] bg-[#151e29] py-1.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        {blockingDeficiencyCount > 0 && (
          <button onClick={() => onNavigate('deficiencias')} className="flex items-center gap-1.5 rounded border border-red-800/80 bg-red-950/60 px-2.5 py-1 text-xs font-medium text-red-300" title={`${blockingDeficiencyCount} alertas críticas`}>
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span>{blockingDeficiencyCount}</span>
          </button>
        )}

        <div className={`hidden items-center gap-1.5 rounded border px-2 py-1 text-[10px] sm:flex ${online ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? 'En línea' : 'Sin conexión'}
        </div>

        <div className="hidden items-center rounded-md border border-[#2b3a4a] bg-[#151e29] p-0.5 xl:flex">
          <EnvButton active={viewportMode === 'desktop'} onClick={() => onViewportModeChange('desktop')} title="PC"><Monitor className="h-3.5 w-3.5" /></EnvButton>
          <EnvButton active={viewportMode === 'tablet'} onClick={() => onViewportModeChange('tablet')} title="Tablet"><Tablet className="h-3.5 w-3.5" /></EnvButton>
          <EnvButton active={viewportMode === 'mobile'} onClick={() => onViewportModeChange('mobile')} title="Celular"><Smartphone className="h-3.5 w-3.5" /></EnvButton>
          <EnvButton active={viewportMode === 'telegram'} onClick={() => onViewportModeChange('telegram')} title="Telegram"><Send className="h-3.5 w-3.5" /></EnvButton>
        </div>

        <button onClick={() => onNavigate('modo_campo')} className="flex items-center gap-1 rounded border border-[#2b3a4a] bg-[#1b2735] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-blue-600 hover:text-white" title="Modo Campo">
          <Smartphone className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden md:inline">Campo</span>
        </button>

        {onOpenZordon && (
          <button onClick={onOpenZordon} className="flex items-center gap-1.5 rounded border border-[#2b3a4a] bg-[#1b2735] px-2 py-1 text-xs font-medium text-[#f1e4c5] hover:bg-[#c5a367] hover:text-[#0b1118]" aria-label="Abrir ZORDON">
            <EngineerFigure size={18} showStatusDot={false} />
            <span className="hidden sm:inline">ZORDON</span>
          </button>
        )}

        <div className="relative">
          <button onClick={() => setShowUserMenu((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2b3a4a] bg-[#1b2735] text-slate-300 hover:text-white" aria-label="Sesión de usuario">
            <UserRound className="h-4 w-4" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[#243247] bg-[#111827] p-3 text-xs shadow-2xl">
              <div className="font-semibold text-white">{authenticated ? 'Sesión productiva activa' : 'Sesión requerida'}</div>
              <div className="mt-1 truncate text-[11px] text-slate-400">{authEmail || 'Inicia sesión desde Control Contractual'}</div>
              <div className="mt-3 border-t border-[#243247] pt-2">
                <button onClick={() => { onNavigate('configuracion'); setShowUserMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-slate-300 hover:bg-[#172235] hover:text-white">
                  <Settings className="h-3.5 w-3.5" /> Configuración
                </button>
                {onLogout && authenticated && (
                  <button
                    onClick={() => { setShowUserMenu(false); void onLogout(); }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-red-300 hover:bg-red-950/40 hover:text-red-200"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
                  </button>
                )}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">La V2 no permite cambiar roles manualmente. El rol proviene de Supabase y las políticas RLS.</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const EnvButton: React.FC<{ active: boolean; onClick: () => void; title: string; children: React.ReactNode }> = ({ active, onClick, title, children }) => (
  <button onClick={onClick} title={title} className={`flex items-center gap-1 rounded p-1.5 text-[10px] ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
    {children}<span>{title}</span>
  </button>
);
