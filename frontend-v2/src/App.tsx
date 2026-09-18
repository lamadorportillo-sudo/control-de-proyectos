import React, { useEffect, useMemo, useState } from 'react';
import type { AppModule, Project, Contract, Estimate, Guarantee, Deficiency, DocumentEvidence, AuditLog, FieldVisit } from './types.ts';
import { dataRepository, telegramAdapter } from './services/backendAdapter.ts';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { ZordonLauncher } from './components/common/ZordonAvatar.tsx';
import { ZordonAssistant } from './components/common/ZordonAssistant.tsx';
import { InicioView } from './components/views/InicioView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { ProjectExpedienteView } from './components/views/ProjectExpedienteView.tsx';
import { ContratosView } from './components/views/ContratosView.tsx';
import { ContratistasView } from './components/views/ContratistasView.tsx';
import { EstimacionesView } from './components/views/EstimacionesView.tsx';
import { GarantiasView } from './components/views/GarantiasView.tsx';
import { DeficienciasView } from './components/views/DeficienciasView.tsx';
import { DocumentosView } from './components/views/DocumentosView.tsx';
import { TransparenciaView } from './components/views/TransparenciaView.tsx';
import { ModoCampoView } from './components/views/ModoCampoView.tsx';
import { PresupuestosView } from './components/views/PresupuestosView.tsx';
import { ComprasView } from './components/views/ComprasView.tsx';
import { AuditoriaView } from './components/views/AuditoriaView.tsx';
import { ConfiguracionView } from './components/views/ConfiguracionView.tsx';
import { ModulePlaceholder } from './components/views/ModulePlaceholder.tsx';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isZordonOpen, setIsZordonOpen] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile' | 'telegram'>('desktop');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>([]);
  const [documents, setDocuments] = useState<DocumentEvidence[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      // Arranque liviano: solo lo necesario para abrir Inicio sin bloquear la interfaz.
      const [projectData, deficiencyData, auditData] = await Promise.all([
        dataRepository.getProjects(),
        dataRepository.getDeficiencies(),
        dataRepository.getAuditLogs(),
      ]);
      setProjects(projectData);
      setDeficiencies(deficiencyData);
      setAuditLogs(auditData);

      // Pendientes financieros se completan en segundo plano y no bloquean el primer render.
      void Promise.all([
        dataRepository.getEstimates(),
        dataRepository.getGuarantees(),
      ]).then(([estimateData, guaranteeData]) => {
        setEstimates(estimateData);
        setGuarantees(guaranteeData);
      }).catch((err) => console.warn('Carga secundaria V2:', err));
    } catch (err: any) {
      console.error('V2 data load error', err);
      setLoadError(String(err?.message || 'No se pudo cargar la información productiva.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (telegramAdapter.isAvailable()) {
      setViewportMode('telegram');
      telegramAdapter.expandMiniApp();
    }
    void loadData();
  }, []);

  useEffect(() => {
    // Los módulos pesados se consultan solamente cuando se necesitan.
    const loadModuleData = async () => {
      try {
        if ((currentModule === 'contratos' || currentModule === 'contratistas') && contracts.length === 0) {
          setContracts(await dataRepository.getContracts());
        } else if (currentModule === 'estimaciones' && estimates.length === 0) {
          setEstimates(await dataRepository.getEstimates());
        } else if (currentModule === 'garantias' && guarantees.length === 0) {
          setGuarantees(await dataRepository.getGuarantees());
        } else if (currentModule === 'documentos' && documents.length === 0) {
          setDocuments(await dataRepository.getDocuments());
        } else if (currentModule === 'modo_campo' && visits.length === 0) {
          setVisits(await dataRepository.getFieldVisits());
        } else if (currentModule === 'transparencia') {
          const tasks: Promise<any>[] = [];
          if (contracts.length === 0) tasks.push(dataRepository.getContracts().then(setContracts));
          if (estimates.length === 0) tasks.push(dataRepository.getEstimates().then(setEstimates));
          if (guarantees.length === 0) tasks.push(dataRepository.getGuarantees().then(setGuarantees));
          if (documents.length === 0) tasks.push(dataRepository.getDocuments().then(setDocuments));
          if (tasks.length) await Promise.all(tasks);
        }
      } catch (err) {
        console.warn('Carga bajo demanda V2:', err);
      }
    };

    void loadModuleData();
  }, [currentModule, contracts.length, estimates.length, guarantees.length, documents.length, visits.length]);

  useEffect(() => {
    if (!selectedProjectId) return;
    // El expediente carga sus pestañas bajo demanda al abrir un proyecto.
    void Promise.all([
      contracts.length ? Promise.resolve(contracts) : dataRepository.getContracts(),
      estimates.length ? Promise.resolve(estimates) : dataRepository.getEstimates(),
      guarantees.length ? Promise.resolve(guarantees) : dataRepository.getGuarantees(),
      documents.length ? Promise.resolve(documents) : dataRepository.getDocuments(),
      visits.length ? Promise.resolve(visits) : dataRepository.getFieldVisits(),
    ]).then(([contractData, estimateData, guaranteeData, documentData, visitData]) => {
      if (contracts.length === 0) setContracts(contractData);
      if (estimates.length === 0) setEstimates(estimateData);
      if (guarantees.length === 0) setGuarantees(guaranteeData);
      if (documents.length === 0) setDocuments(documentData);
      if (visits.length === 0) setVisits(visitData);
    }).catch((err) => console.warn('Carga de expediente V2:', err));
  }, [selectedProjectId]);

  const blockingDefs = useMemo(
    () => deficiencies.filter((d) => d.severity === 'BLOQUEANTE' && d.status !== 'CERRADA'),
    [deficiencies]
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const handleNavigate = (module: AppModule, extra?: any) => {
    setCurrentModule(module);
    setIsMobileSidebarOpen(false);

    if (module === 'proyectos' && extra?.projectId) {
      setSelectedProjectId(String(extra.projectId));
      return;
    }

    if (module !== 'proyectos') setSelectedProjectId(null);
  };

  const submitSearch = () => {
    if (searchQuery.trim()) {
      setSelectedProjectId(null);
      setCurrentModule('busqueda');
    }
  };

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentModule('proyectos');
  };

  const renderModule = () => {
    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
            Cargando información productiva…
          </div>
        </div>
      );
    }

    switch (currentModule) {
      case 'inicio':
        return (
          <InicioView
            onNavigate={(module, extra) => handleNavigate(module, extra)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={submitSearch}
            projects={projects}
            deficiencies={deficiencies}
            guarantees={guarantees}
            estimates={estimates}
            recentActivity={auditLogs}
          />
        );
      case 'proyectos':
        return selectedProject ? (
          <ProjectExpedienteView
            project={selectedProject}
            contracts={contracts}
            estimates={estimates}
            guarantees={guarantees}
            deficiencies={deficiencies}
            documents={documents}
            visits={visits}
            onBack={() => setSelectedProjectId(null)}
          />
        ) : (
          <ProjectsView projects={projects} onOpenProject={openProject} />
        );
      case 'busqueda':
        return <ProjectsView projects={projects} onOpenProject={openProject} initialQuery={searchQuery} />;
      case 'contratos':
        return <ContratosView contracts={contracts} projects={projects} onOpenProject={openProject} />;
      case 'contratistas':
        return <ContratistasView contracts={contracts} projects={projects} onOpenProject={openProject} />;
      case 'estimaciones':
        return <EstimacionesView estimates={estimates} projects={projects} onOpenProject={openProject} />;
      case 'garantias':
        return <GarantiasView guarantees={guarantees} projects={projects} onOpenProject={openProject} />;
      case 'deficiencias':
        return <DeficienciasView deficiencies={deficiencies} projects={projects} onOpenProject={openProject} />;
      case 'documentos':
        return <DocumentosView documents={documents} projects={projects} />;
      case 'transparencia':
        return <TransparenciaView projects={projects} contracts={contracts} estimates={estimates} guarantees={guarantees} deficiencies={deficiencies} documents={documents} />;
      case 'modo_campo':
        return <ModoCampoView visits={visits} projects={projects} onOpenProject={openProject} />;
      case 'presupuestos':
        return <PresupuestosView projects={projects} onNavigate={(module, extra) => handleNavigate(module, extra)} />;
      case 'compras':
        return <ComprasView projects={projects} onNavigate={(module, extra) => handleNavigate(module, extra)} />;
      case 'auditoria':
        return <AuditoriaView auditLogs={auditLogs} onNavigate={(module) => handleNavigate(module)} />;
      case 'configuracion':
        return <ConfiguracionView />;
      default:
        return <ModulePlaceholder title="Módulo en integración" description="Esta sección continúa en migración controlada contra el backend productivo existente." onBack={() => handleNavigate('inicio')} />;
    }
  };

  const context = useMemo(
    () => `Módulo activo: ${currentModule}. Proyectos cargados: ${projects.length}. Contratos: ${contracts.length}. Estimaciones: ${estimates.length}. Garantías: ${guarantees.length}. Visitas: ${visits.length}. Documentos/evidencias: ${documents.length}.`,
    [currentModule, projects.length, contracts.length, estimates.length, guarantees.length, visits.length, documents.length]
  );

  const viewportClass = viewportMode === 'desktop'
    ? 'w-full min-h-screen'
    : viewportMode === 'tablet'
      ? 'max-w-[820px] mx-auto min-h-[820px] my-4 border border-[#243247] rounded-xl overflow-hidden shadow-2xl'
      : 'max-w-[420px] mx-auto min-h-[740px] my-4 border border-[#243247] rounded-xl overflow-hidden shadow-2xl';

  return (
    <div
      className={`bg-[#0b1220] text-slate-100 ${viewportClass}`}
      data-viewport-mode={viewportMode}
      data-telegram-mini-app={viewportMode === 'telegram' ? 'true' : 'false'}
    >
      <Header
        currentModule={currentModule}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={submitSearch}
        viewportMode={viewportMode}
        onViewportModeChange={setViewportMode}
        onToggleSidebar={() => setIsMobileSidebarOpen((value) => !value)}
        onOpenZordon={() => setIsZordonOpen(true)}
        blockingDeficiencyCount={blockingDefs.length}
      />

      {loadError && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-800/60 bg-amber-950/30 px-4 py-2 text-xs text-amber-200">
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{loadError}</span></div>
          <button onClick={() => void loadData()} className="rounded bg-amber-900/50 px-2 py-1 font-semibold hover:bg-amber-800/60">Reintentar</button>
        </div>
      )}

      {blockingDefs.length > 0 && currentModule !== 'deficiencias' && (
        <button type="button" onClick={() => handleNavigate('deficiencias')} className="flex w-full items-center justify-between gap-3 border-b border-red-800/70 bg-red-950/55 px-4 py-2 text-left text-xs text-red-200">
          <span><strong>{blockingDefs.length}</strong> deficiencia(s) bloqueante(s) requieren seguimiento.</span><span className="font-semibold">Abrir seguimiento →</span>
        </button>
      )}

      <div className="flex min-h-[calc(100vh-56px)]">
        <div className={`${viewportMode === 'mobile' || viewportMode === 'telegram' ? 'hidden' : 'hidden md:block'} shrink-0`}>
          <Sidebar currentModule={currentModule} onNavigate={handleNavigate} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)} blockingDeficiencyCount={blockingDefs.length} />
        </div>

        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <button className="absolute inset-0 bg-black/70" aria-label="Cerrar menú" onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="relative h-full"><Sidebar currentModule={currentModule} onNavigate={handleNavigate} isCollapsed={false} onToggleCollapse={() => setIsMobileSidebarOpen(false)} blockingDeficiencyCount={blockingDefs.length} /></div>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">{renderModule()}</main>
      </div>

      <ZordonLauncher onOpen={() => setIsZordonOpen(true)} isAvailable />
      <ZordonAssistant open={isZordonOpen} onClose={() => setIsZordonOpen(false)} context={context} />
    </div>
  );
}
