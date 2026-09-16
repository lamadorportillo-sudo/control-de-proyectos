import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  Smartphone,
  Tablet,
  Monitor,
  Send,
  Sliders,
  Menu,
} from 'lucide-react';
import { AppModule, User, SyncStatus } from '../../types.ts';
import { appStore } from '../../services/storageService.ts';
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
}) => {
  const [networkStatus, setNetworkStatus] = useState(appStore.getNetworkStatus());
  const [currentUser, setCurrentUser] = useState<User>(appStore.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(appStore.getUsers());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [blockingCount, setBlockingCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setNetworkStatus(appStore.getNetworkStatus());
      setCurrentUser(appStore.getCurrentUser());
      setAllUsers(appStore.getUsers());
      const defs = appStore.getAllDeficiencies();
      const blocking = defs.filter((d) => d.severity === 'BLOQUEANTE' && d.status !== 'CERRADA').length;
      setBlockingCount(blocking);
    };

    update();
    const unsub = appStore.subscribe(update);
    return unsub;
  }, []);

  const getModuleTitle = (module: AppModule): string => {
    switch (module) {
      case 'inicio':
        return 'Inicio';
      case 'proyectos':
        return 'Expedientes de Proyectos';
      case 'contratos':
        return 'Contratos y Contratistas';
      case 'presupuestos':
        return 'Presupuesto y Ampliaciones';
      case 'estimaciones':
        return 'Estimaciones y Pagos';
      case 'garantias':
        return 'Garantías y Pólizas';
      case 'compras':
        return 'Compras y Cotizaciones';
      case 'deficiencias':
        return 'Deficiencias y Seguimiento';
      case 'documentos':
        return 'Documentos Fuente y Evidencias';
      case 'transparencia':
        return 'Generador del Portal de Transparencia';
      case 'auditoria':
        return 'Registro de Auditoría y Trazabilidad';
      case 'configuracion':
        return 'Configuración y Supabase';
      case 'modo_campo':
        return 'Modo Campo / Inspección en Obra';
      case 'busqueda':
        return 'Búsqueda Global';
      default:
        return 'Control Contractual';
    }
  };

  const getSyncStatusBadge = (status: SyncStatus) => {
    switch (status) {
      case 'EN_LINEA':
      case 'SINCRONIZADO':
        return {
          label: 'En línea / Sincronizado',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />,
          bg: 'bg-emerald-950/40 text-emeral-300 border-emerald-800/50',
        };
      case 'PENDIENTE_SYNC':
        return {
          label: `Pendiente de sincronizar (${networkStatus.pendingCount})`,
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
          bg: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
        };
      case 'GUARDADO_LOCAL':
      default:
        return {
          label: 'Guardado localmente (Offline)',
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-400" />,
          bg: 'bg-slate-900 text-slate-300 border-slate-700',
        };
    }
  };

  const syncBadge = getSyncStatusBadge(networkStatus.syncStatusLabel);

  return (
    <header
      id="main-app-header"
      className="h-14 bg-[#0b1220] border-b border-[#172235] px-3 md:px-5 flex items-center justify-between gap-2 md:gap-4 shrink-0 z-h30 sticky top-0"
    >
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#172235] focus:outline-none focus:ring-1 focus:ring-blue-500 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 truncate">
          <span className="hidden sm:inline text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Control Contractual
          </span>
          <span className="hidden sm:inline text-slate-600">/</span>
          <h1 className="text-sm md:text-base font-semibold text-white truncate">
            {getModuleTitle(currentModule)}
          </h1>
        </div>
      </div>

      {/* Center: Search Field */}
      {currentModule !== 'busqueda' && currentModule !== 'inicio' && (
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="header-global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearchSubmit();
                }
              }}
              placeholder="Buscar proyecto, contrato, código o ubicación..."
              className="w-full bg-[#111827] text-xs text-white placeholder-slate-500 rounded-md pl-9 pr-3 py-1.5 border border-[#172235] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Blocking Deficiency Alert */}
        {blockingCount > 0 && (
          <button
            id="btn-blocking-deficiency-alert"
            onClick={() => onNavigate('deficiencias', { filterSeverity: 'BLOQUEANTE' })}
            title={`${blockingCount} deficiencia bloqueante detectada`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium hover:bg-red-900/60 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-pulse" />
            <span className="hidden sm:inline">{blockingCount} Riesgo bloqueante</span>
            <span className="sm:hidden">{blockingCount}</span>
          </button>
        )}

        {/* Offline / Sync Badge */}
        <div
          id="network-sync-status-indicator"
          onClick={() => appStore.syncPendingQueue()}
          title="Estado de sincronización y conectividad. Clic para forzar sincronización con Supabase."
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${syncBadge.bg}`}
        >
          {syncBadge.icon}
          <span className="truncate max-w-[130px] md:max-w-none">{syncBadge.label}</span>
        </div>

        {/* 4 Official Environments switcher */}
        <div className="hidden xl:flex items-center bg-[#111827] border border-[#172235] rounded-md p-0.5">
          <button
            id="btn-env-desktop"
            onClick={() => onViewportModeChange('desktop')}
            title="Entorno PC / Escritorio (100% ancho)"
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewportMode === 'desktop' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">PC</span>
          </button>
          <button
            id="btn-env-tablet"
            onClick={() => onViewportModeChange('tablet')}
            title="Entorno Tablet (768px - 1024px)"
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewportMode === 'tablet' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tablet</span>
          </button>
          <button
            id="btn-env-mobile"
            onClick={() => onViewportModeChange('mobile')}
            title="Entorno Celular / Móvil (360px - 480px)"
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewportMode === 'mobile' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px]">Celular</span>
          </button>
          <button
            id="btn-env-telegram"
            onClick={() => onViewportModeChange('telegram')}
            title="Entorno Telegram Mini App"
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewportMode === 'telegram' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-[11px]">Telegram</span>
          </button>
        </div>

        {/* Modo Campo Direct Action */}
        <button
          id="btn-quick-modo-campo"
          onClick={() => onNavigate('modo_campo')}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#172235] hover:bg-blue-600 text-slate-200 hover:text-white border border-[#243247] rounded text-xs font-medium transition-colors"
          title="Iniciar inspección técnica en obra"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Modo Campo</span>
        </button>

        {/* ZORDON Assistant Button */}
        {onOpenZordon && (
          <button
            id="btn-header-open-zordon"
            onClick={onOpenZordon}
            className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-600 hover:to-indigo-600 text-blue-200 hover:text-white border border-blue-700/60 rounded text-xs font-medium transition-all"
            title="Consultar al Asistente Zordon"
            aria-label="Abrir ZORDON"
          >
            <EngineerFigure size={18} showStatusDot={false} />
            <span className="hidden sm:inline">ZORDON</span>
          </button>
        )}

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded hover:bg-[#172235] text-left transition-colors border border-transparent hover:border-[#243247]"
            aria-expanded={showUserMenu}
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold uppercase">
              {currentUser.name.substring(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-white truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {currentUser.roleLabel}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-64 bg-[#111827] border border-[#243247] rounded-lg shadow-2xl py-2 z-50 text-xs"
            >
              <div className="px-3 py-2 border-b border-[#172235]">
                <div className="font-semibold text-white">{currentUser.name}</div>
                <div className="text-slate-400 text-[11px]">{currentUser.email}</div>
                <div className="text-amber-400 text-[10px] mt-0.5">{currentUser.municipalEntity}</div>
              </div>

              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Cambiar Rol de Usuario
              </div>

              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    appStore.setCurrentUser(user);
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#172235] transition-colors ${
                    currentUser.id === user.id ? 'bg-blue-900/30 text-blue-300 font-medium' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-[10px] text-slate-400">{user.roleLabel}</div>
                  </div>
                  {currentUser.id === user.id && <UserCheck className="w-4 h-4 text-blue-400" />}
                </button>
              ))}

              <div className="border-t border-[#172235] mt-1 pt-1 px-3">
                <button
                  onClick={() => {
                    onNavigate('configuracion');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left py-1 text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Configuración de Supabase
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
