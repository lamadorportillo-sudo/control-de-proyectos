import React, { useState, useEffect } from 'react';
import { AppModule, Project } from './types.ts';
import { appStore } from './services/storageService.ts';

// Common Components
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { ZordonAssistant } from './components/common/ZordonAssistant.tsx';
import { ZordonLauncher } from './components/common/ZordonAvatar.tsx';

// View Components
import { InicioView } from './components/views/InicioView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { ProjectExpedienteView } from './components/views/ProjectExpedienteView.tsx';
import { SearchView } from './components/views/SearchView.tsx';
import { ContratosView } from './components/views/ContratosView.tsx';
import { EstimacionesView } from './components/views/EstimacionesView.tsx';
import { GarantiasView } from './components/views/GarantiasView.tsx';
import { DeficienciasView } from './components/views/DeficienciasView.tsx';
import { DocumentosView } from './components/views/DocumentosView.tsx';
import { TransparenciaView } from './components/views/TransparenciaView.tsx';
import { PresupuestosView } from './components/views/PresupuestosView.tsx';
import { ComprasView } from './components/views/ComprasView.tsx';
import { AuditoriaView } from './components/views/AuditoriaView.tsx';
import { ConfiguracionView } from './components/views/ConfiguracionView.tsx';
import { ModoCampoView } from './components/views/ModoCampoView.tsx';

import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Home,
  FolderGit2,
  Receipt,
  Smartphone,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('inicio');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTab, setSelectedProjectTab] = useState<string>('resumen');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Viewport Mode ('desktop' | 'tablet' | 'mobile' | 'telegram')
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile' | 'telegram'>('desktop');

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Zordon AI Assistant State
  const [isZordonOpen, setIsZordonOpen] = useState(false);

  // Navigation action state (e.g. NEW_PROJECT, NEW_CONTRACT)
  const [navAction, setNavAction] = useState<string | undefined>(undefined);
  const [navExtra, setNavExtra] = useState<any>(undefined);

  // Reactive Store Data
  const [projects, setProjects] = useState(appStore.getProjects());
  const [contracts, setContracts] = useState(appStore.getContracts());
  const [estimates, setEstimates] = useState(appStore.getEstimates());
  const [guarantees, setGuarantees] = useState(appStore.getGuarantees());
  const [deficiencies, setDeficiencies] = useState(appStore.getDeficiencies());
  const [documents, setDocuments] = useState(appStore.getDocuments());
  const [amendments, setAmendments] = useState(appStore.getAmendments());
  const [auditLogs, setAuditLogs] = useState(appStore.getAuditLogs());
  const [isOnline, setIsOnline] = useState(appStore.getIsOnline());

  useEffect(() => {
    const update = () => {
      setProjects([...appStore.getProjects()]);
      setContracts([...appStore.getContracts()]);
      setEstimates([...appStore.getEstimates()]);
      setGuarantees([...appStore.getGuarantees()]);
      setDeficiencies([...appStore.getDeficiencies()]);
      setDocuments([...appStore.getDocuments()]);
      setAmendments([...appStore.getAmendments()]);
      setAuditLogs([...appStore.getAuditLogs()]);
      setIsOnline(appStore.getIsOnline());
    };

    const unsub = appStore.subscribe(update);
    return unsub;
  }, []);

  // Blocking deficiencies check
  const blockingDefs = deficiencies.filter(
    (d) => d.severity === 'BLOQUEANTE' && d.status !== 'CERRADA'
  );

  // Universal Navigation Handler
  const handleNavigate = (module: AppModule, extra?: any) => {
    setIsSearchActive(false);
    setIsMobileSidebarOpen(false);
    setCurrentModule(module);
    setNavAction(extra?.action);
    setNavExtra(extra);

    if (module === 'proyectos') {
      if (extra?.projectId) {
        setSelectedProjectId(extra.projectId);
        setSelectedProjectTab(extra.tab || 'resumen');
      } else if (!extra?.keepSelected) {
        setSelectedProjectId(null);
      }
    } else {
      setSelectedProjectId(null);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      setIsSearchActive(true);
    }
  };

  const handleOpenProjectExpediente = (projectId: string, tab: string = 'resumen') => {
    setSelectedProjectId(projectId);
    setSelectedProjectTab(tab);
    setCurrentModule('proyectos');
    setIsSearchActive(false);
  };

  // Resolve current active project object
  const activeProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  // Viewport Container Styles
  const getViewportWrapperClass = () => {
    switch (viewportMode) {
      case 'telegram':
        return 'max-w-[420px] mx-auto my-4 border-2 border-sky-600/70 rounded-2xl shadow-2xl overflow-hidden bg-[#0b1220] min-h-[780px]';
      case 'mobile':
        return 'max-w-[390px] mx-auto my-4 border border-[#243247] rounded-xl shadow-2xl overflow-hidden bg-[#0b1220] min-h-[720px]';
      case 'tablet':
        return 'max-w-[820px] mx-auto my-4 border border-[#243247] rounded-xl shadow-2xl overflow-hidden bg-[#0b1220] min-h-[820px]';
      default:
        return 'w-full min-h-screen bg-[#0b1220]';
    }
  };

  return (
    <div className={`text-slate-100 flex flex-col font-sans transition-all duration-300 ${getViewportWrapperClass()}`}>
      {/* Telegram Mini App Simulator Header */}
      {viewportMode === 'telegram' && (
        <div className="bg-[#1c2738] border-b border-sky-900/80 px-3 py-1.5 flex items-center justify-between text-xs text-sky-200">
          <div className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold">Telegram Mini App</span>
            <span className="text-[10px] text-sky-400/80">• @ControlContractualBot</span>
          </div>
          <button
            onClick={() => setViewportMode('desktop')}
            className="text-[10px] px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800"
          >
            Cerrar simulación
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentModule={currentModule}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        viewportMode={viewportMode}
        onViewportModeChange={setViewportMode}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenZordon={() => setIsZordonOpen(true)}
      />

      {/* Blocking Deficiency Banner ("Sin calles sin salida": leads directly to resolution) */}
      {blockingDefs.length > 0 && currentModule !== 'deficiencias' && (
        <div
          id="banner-blocking-alert"
          className="bg-red-950/80 border-b border-red-800/70 px-3 md:px-5 py-2 flex items-start md:items-center justify-between gap-3 shadow-lg z-h20"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-300 shrink-0 mt-0.5 md:mt-0 animate-pulse" />
            <div>
              <div className="text-[11px] font-bold text-red-200 uppercase tracking-wide">
                Control de Riesgo — Deficiencia Bloqueante
              </div>
              <div className="text-xs text-red-100 mt-0.5">
                 Hay {blockingDefs.length} riesgo bloqueante sin resolver. Debe atenderse antes de continuar con pagos o recepciones.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleNavigate('deficiencias', { deficiencyId: blockingDefs[0].id })}
            className="px-3 py-1.5 rounded bg-red-900 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 self-end md:self-center transition-colors"
          >
            <span>Resolver aahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        {/* Fixed/sticky layout: sidebar always dominant, without flicker */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            currentModule={currentModule }
            onNavigate={handleNavigate}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            blockingDeficiencyCount={blockingDefs.length}
          />
        </div>
        {/* Mobile Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 zit-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative h-full shadow-2xl w-64">
              <Sidebar
                currentModule={currentModule}
                onNavigate={handleNavigate}
                isCollapsed={false}
                onToggleCollapse={() => setIsMobileSidebarOpen(false)}
                blockingDeficiencyCount={blockingDefs.length}
              />
            </div>
          </div>
        )}

        {/* Content Stage */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-[#0b1220]">
          {/* If Search is Active */}
          {isSearchActive ? (
            <SearchView
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavigate={handleNavigate}
              projects={projects}
              contracts={contracts}
              estimates={estimates}
              guarantees={guarantees}
              deficiencies={deficiencies}
              documents={documents}
            />
          ) : (
            /* Standard Module Routing */
            <>
              {currentModule === 'inicio' && (
                <InicioView
                  onNavigate={handleNavigate}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearchSubmit={handleSearchSubmit}
                  projects={projects}
                  deficiencies={deficiencies}
                  guarantees={guarantees}
                  estimates={estimates}
                  recentActivity={auditLogs}
                />
              )}

              {currentModule === 'proyectos' && (
                <>
                  {activeProject ? (
                    <ProjectExpedienteView
                      project={activeProject}
                      onBack={() => setSelectedProjectId(null)}
                      onNavigate={handleNavigate}
                      initialTab={selectedProjectTab}
                    />
                  ) : (
                    <ProjectsView
                      projects={projects}
                      onSelectProject={(id) => handleOpenProjectExpediente(id)}
                      onNavigate={handleNavigate}
                      initialAction={navAction}
                    />
                  )}
                </>
              )}

              {currentModule === 'contratos' && (
                <ContratosView
                  contracts={contracts}
                  projects={projects}
                  onNavigate={handleNavigate}
                  initialAction={navAction}
                />
              )}

              {currentModule === 'presupuestos' && (
                <PresupuestosView
                  projects={projects}
                  amendments={amendments}
                  onNavigate={handleNavigate}
                />
              )}

              {currentModule === 'estimaciones' && (
                <EstimacionesView
                  estimates={estimates}
                  projects={projects}
                  onNavigate={handleNavigate}
                  filterStatus={navExtra?.filterStatus}
                  initialAction={navAction}
                />
              )}

              {currentModule === 'garantias' && (
                <GarantiasView
                  guarantees={guarantees}
                  projects={projects}
                  onNavigate={handleNavigate}
                  initialAction={navAction}
                  targetGuaranteeId={navExtra?.guaranteeId}
                />
              )}

              {currentModule === 'compras' && (
                <ComprasView
                  projects={projects}
                  onNavigate={handleNavigate}
                />
              )}

              {currentModule === 'deficiencias' && (
                <DeficienciasView
                  deficiencies={deficiencies}
                  projects={projects}
                  onNavigate={handleNavigate}
                  initialAction={navAction}
                  targetDeficiencyId={navExtra?.deficiencyId}
                />
              )}

              {currentModule === 'documentos' && (
                <DocumentosView
                  documents={documents}
                  projects={projects}
                  onNavigate={handleNavigate}
                  initialAction={navAction}
                />
              )}

              {currentModule === 'transparencia' && (
                <TransparenciaView
                  projects={projects}
                  contracts={contracts}
                  estimates={estimates}
                  guarantees={guarantees}
                  deficiencies={deficiencies}
                  documents={documents}
                />
              )}

              {currentModule === 'auditoria' && (
                <AuditoriaView
                  auditLogs={auditLogs}
                  onNavigate={handleNavigate}
                />
              )}

              {currentModule === 'configuracion' && (
                <ConfiguracionView />
              )}

              {currentModule === 'modo_campo' && (
                <ModoCampoView
                  projects={projects}
                  preselectedProjectId={navExtra?.projectId}
                  onNavigate={handleNavigate}
                  isOnline={isOnline}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Launcher Oficial: Pequeño Ingeniero / Avatar de ZORDON */}
      <ZordonLauncher
        onOpen={() => setIsZordonOpen(true)}
        isAvailable={true}
      />

      {/* Zordon Assistant Drawer */}
      <ZordonAssistant
        isOpen={isZordonOpen}
        onClose={() => setIsZordonOpen(false)}
        onNavigate={handleNavigate}
        currentModule={currentModule}
        currentProjectId={selectedProjectId || undefined}
      />

      {/* Mobile Bottom Navigation Bar (Visible when on mobile / telegram views) */}
      <div className={`md:hidden bg-[#111827] border-t border-[#1f2e45] p-2 flex items-center justify-around text-[10px] text-slate-400 shrink-0 ${viewportMode === 'desktop' ? 'hidden' : ''}`}
        <button
          onClick={() => handleNavigate('inicio')}
          className={`flex flex-col items-center gap-0.5 ${currentModule === 'inicio' ? 'text-blue-400 font-bold' : ''}`}
        >
          <Home className="w-4 h-4" />
          <span>Inicio</span>
        </button>
        <button
          onClick={() => handleNavigate('proyectos')}
          className={`flex flex-col items-center gap-0.5 ${currentModule === 'proyectos' ? 'text-blue-400 font-bold' : ''}`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Proyectos</span>
        </button>
        <button
          onClick={() => handleNavigate('estimaciones')}
          className={`flex flex-col items-center gap-0.5 ${currentModule === 'estimaciones' ? 'text-emerald-400 font-bold' : ''}`}
        >
          <Receipt className="w-4 h-4" />
          <span>Pagos</span>
        </button>
        <button
          onClick={() => handleNavigate('modo_campo')}
          className={`flex flex-col items-center gap-0.5 ${currentModule === 'modo_campo' ? 'text-amber-400 font-bold' : ''}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Campo</span>
        </button>
        <button
          onClick={() => handleNavigate('transparencia')}
          className={`flex flex-col items-center gap-0.5 ${currentModule === 'transparencia' ? 'text-amber-400 font-bold' : ''}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Portal</span>
        </button>
      </div>
    </div>
  );
}
