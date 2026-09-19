import React from 'react';
import {
  Home,
  FolderGit2,
  FileSignature,
  Building2,
  Handshake,
  BookOpen,
  BarChart3,
  DollarSign,
  Receipt,
  ShieldCheck,
  ClipboardCheck,
  ShoppingBag,
  AlertOctagon,
  FileText,
  FileSpreadsheet,
  History,
  Settings,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { AppModule } from '../../types.ts';

interface SidebarProps {
  currentModule: AppModule;
  onNavigate: (module: AppModule) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  blockingDeficiencyCount?: number;
}

interface NavItem {
  id: AppModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeType?: 'danger' | 'warning' | 'info';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  blockingDeficiencyCount = 0,
}) => {
  // Official 12 modules from DESIGN.md in strict order
  const navItems: NavItem[] = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'proyectos', label: 'Proyectos', icon: FolderGit2 },
    { id: 'contratos', label: 'Contratos', icon: FileSignature },
    { id: 'contratistas', label: 'Contratistas', icon: Building2 },
    { id: 'convenios', label: 'Convenios', icon: Handshake },
    { id: 'presupuestos', label: 'Presupuestos', icon: DollarSign },
    { id: 'estimaciones', label: 'Estimaciones y pagos', icon: Receipt },
    { id: 'garantias', label: 'Garantías', icon: ShieldCheck },
    { id: 'visitas', label: 'Visitas de obra', icon: ClipboardCheck },
    { id: 'compras', label: 'Compras y cotizaciones', icon: ShoppingBag },
    {
      id: 'deficiencias',
      label: 'Deficiencias y seguimiento',
      icon: AlertOctagon,
      badge: blockingDeficiencyCount > 0 ? blockingDeficiencyCount : undefined,
      badgeType: 'danger',
    },
    { id: 'documentos', label: 'Biblioteca Documental', icon: BookOpen },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'transparencia', label: 'Transparencia', icon: FileSpreadsheet },
    { id: 'auditoria', label: 'Auditoría', icon: History },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  // Helper to determine if a module is considered active
  const isModuleActive = (itemModule: AppModule): boolean => {
    if (currentModule === itemModule) return true;
    // Detail routes that map back to parent modules
    if (itemModule === 'proyectos' && currentModule === 'busqueda') return false;
    return false;
  };

  return (
    <aside
      id="main-app-sidebar"
      className={`bg-[#101720] border-r border-[#2b3a4a] flex flex-col justify-between transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-[72px]' : 'w-[232px]'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 border-b border-[#2b3a4a] flex items-center px-4 justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded bg-[#c5a367] text-[#0b1118] flex items-center justify-center font-bold text-sm shrink-0">
                CC
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white tracking-wide uppercase leading-tight">
                  Control Contractual
                </div>
                <div className="text-[10px] text-slate-400 leading-tight truncate">
                  Gestión y Supervisión
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded bg-[#c5a367] text-[#0b1118] flex items-center justify-center font-bold text-sm shadow-md">
              CC
            </div>
          )}

          <button
            id="btn-sidebar-collapse-toggle"
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#172235] focus:outline-none hidden md:block"
            title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            aria-label="Alternar barra lateral"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100dvh-170px)]" aria-label="Navegación principal">
          {navItems.map((item) => {
            const active = isModuleActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group relative ${
                  active
                    ? 'bg-[#1b2735] text-white border-l-2 border-[#c5a367] font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#151e29] border-l-2 border-transparent'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-[#c5a367]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="truncate text-left flex-1">{item.label}</span>}

                {item.badge !== undefined && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                      item.badgeType === 'danger'
                        ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Field Mode & Institutional Footer */}
      <div className="p-2 border-t border-[#2b3a4a] bg-[#101720] space-y-1.5">
        <button
          id="btn-sidebar-modo-campo"
          onClick={() => onNavigate('modo_campo')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
            (currentModule === 'modo_campo' || currentModule === 'registrar_visita')
              ? 'bg-amber-500 text-slate-950'
              : 'bg-[#172235] text-amber-300 hover:bg-amber-950/60 border border-amber-800/40'
          }`}
          title="Modo Campo: Inspección técnica en obra con soporte offline"
        >
          <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
          {!isCollapsed && <span className="truncate">Modo Campo</span>}
        </button>

        {!isCollapsed && (
          <div className="px-2 pt-1 pb-0.5 text-[10px] text-slate-500 flex justify-between items-center">
            <span>República de Honduras</span>
            <span className="text-[9px] text-slate-600 font-mono">v2.6.4</span>
          </div>
        )}
      </div>
    </aside>
  );
};
