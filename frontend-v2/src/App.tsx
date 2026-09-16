import React, { useEffect, useMemo, useState } from 'react';
import type { AppModule, Project, Contract, Estimate, Guarantee, Deficiency, DocumentEvidence, AuditLog } from './types.ts';
import { dataRepository } from './services/backendAdapter.ts';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { ZordonLauncher } from './components/common/ZordonAvatar.tsx';
import { ZordonAssistant } from './components/common/ZordonAssistant.tsx';
import { InicioView } from './components/views/InicioView.tsx';
import { PresupuestosView } from './components/views/PresupuestosView.tsx';
import { ComprasView } from './components/views/ComprasView.tsx';
import { AuditoriaView } from './components/views/AuditoriaView.tsx';
import { ConfiguracionView } from './components/views/ConfiguracionView.tsx';
import { ModulePlaceholder } from './components/views/ModulePlaceholder.tsx';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('inicio');
  const [searchQuery, setSearchQuery] = useState('');
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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [projectData, contractData, estimateData, guaranteeData, deficiencyData, documentData, auditData] = await Promise.all([
        dataRepository.getProjects(),
        dataRepository.getContracts(),
        dataRepository.getEstimates(),
        dataRepository.getGuarantees(),
        dataRepository.getDeficiencies(),
        dataRepository.getDocuments(),
        dataRepository.getAuditLogs(),
      ]);
      setProjects(projectData);
      setContracts(contractData);
      setEstimates(estimateData);
      setGuarantees(guaranteeData);
      setDeficiencies(deficiencyData);
      setDocuments(documentData);
      setAuditLogs(auditData);
    } catch (err: any) {
      console.error('V2 data load error', err);
      setLoadError(String(err?.message || 'No se pudo cargar la información productiva.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const blockingDefs = useMemo(
    () => deficiencies.filter((d) => d.severity === 'BLOQUEANTE' && d.status !== 'CERRADA'),
    [deficiencies]
  );

  const handleNavigate = (module: AppModule) => {
    setCurrentModule(module);
    setIsMobileSidebarOpen(false);
  };

  const submitSearch = () => {
    if (searchQuery.trim()) setCurrentModule('busqueda');
  };

  const placeholderDescriptions: Partial<Record<AppModule, string>> = {
    proyectos: 'Expedientes, fichas técnicas, avance físico-financiero y búsqueda precisa por código, nombre o ubicación.',
    contratos: 'Contratos y contratistas vinculados a cada proyecto, con soporte documental y control de adendas.',
    estimaciones: 'Estimaciones, deducciones, amortización de anticipo, órdenes de pago y liquidación.',
    garantias: 'Garantías y pólizas con vencimientos, prórrogas y vínculo directo al contrato correspondiente.',
    deficiencias: 'Deficiencias, no conformidades, evidencia de campo, seguimiento y cierre verificable.',
    documentos: 'Biblioteca documental y evidencias técnicas asociadas al expediente correcto.',
    transparencia: 'Generador mensual del portal de transparencia, publicando únicamente las categorías seleccionadas.',
    modo_campo: 'Captura de visitas, fotografías, observaciones y trabajo offline con sincronización posterior.',
    busqueda: `Resultados para “${searchQuery}”. La vista detallada se está migrando sin sustituir el índice real de Supabase.`,
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

    if (currentModule === 'inicio') {
      return (
        <InicioView
          onNavigate={(module) => handleNavigate(module)}
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
    }

    if (currentModule === 'presupuestos') {
      return <PresupuestosView projects={projects} amendments={[]} onNavigate={(module) => handleNavigate(module)} />;
    }

    if (currentModule === 'compras') {
      return <ComprasView projects={projects} onNavigate={(module) => handleNavigate(module)} />;
    }

    if (currentModule === 'auditoria') {
      return <AuditoriaView auditLogs={auditLogs} onNavigate={(module) => handleNavigate(module)} />;
    }

    if (currentModule === 'configuracion') {
      return <ConfiguracionView />;
    }

    return (
      <ModulePlaceholder
        title={currentModule.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase())}
        description={placeholderDescriptions[currentModule] || 'Módulo en proceso de integración con el backend productivo existente.'}
        onBack={() => handleNavigate('inicio')}
      />
    );
  };

  const context = useMemo(
    () => `Módulo activo: ${currentModule}. Proyectos cargados: ${projects.length}. Contratos: ${contracts.length}. Estimaciones: ${estimates.length}. Garantías: ${guarantees.length}. Documentos/evidencias: ${documents.length}.`,
    [currentModule, projects.length, contracts.length, estimates.length, guarantees.length, documents.length]
  );

  const viewportClass = viewportMode === 'desktop'
    ? 'w-full min-h-screen'
    : viewportMode === 'tablet'
      ? 'max-w-[820px] mx-auto min-h-[820px] my-4 border border-[#243247] rounded-xl overflow-hidden shadow-2xl'
      : 'max-w-[420px] mx-auto min-h-[740px] my-4 border border-[#243247] rounded-xl overflow-hidden shadow-2xl';

  return (
    <div className={`bg-[#0b1220] text-slate-100 ${viewportClass}`}>
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
      />

      {loadError && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-800/60 bg-amber-950/30 px-4 py-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button onClick={() => void loadData()} className="rounded bg-amber-900/50 px-2 py-1 font-semibold hover:bg-amber-800/60">Reintentar</button>
        </div>
      )}

      {blockingDefs.length > 0 && currentModule !== 'deficiencias' && (
        <button
          type="button"
          onClick={() => handleNavigate('deficiencias')}
          className="flex w-full items-center justify-between gap-3 border-b border-red-800/70 bg-red-950/55 px-4 py-2 text-left text-xs text-red-200"
        >
          <span><strong>{blockingDefs.length}</strong> deficiencia(s) bloqueante(s) requieren seguimiento.</span>
          <span className="font-semibold">Abrir seguimiento →</span>
        </button>
      )}

      <div className="flex min-h-[calc(100vh-56px)]">
        <div className={`${viewportMode === 'mobile' || viewportMode === 'telegram' ? 'hidden' : 'hidden md:block'} shrink-0`}>
          <Sidebar
            currentModule={currentModule}
            onNavigate={handleNavigate}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
            blockingDeficiencyCount={blockingDefs.length}
          />
        </div>

        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <button className="absolute inset-0 bg-black/70" aria-label="Cerrar menú" onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="relative h-full">
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

        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-5">
          {renderModule()}
        </main>
      </div>

      <ZordonLauncher onOpen={() => setIsZordonOpen(true)} isAvailable />
      <ZordonAssistant open={isZordonOpen} onClose={() => setIsZordonOpen(false)} context={context} />
    </div>
  );
}
