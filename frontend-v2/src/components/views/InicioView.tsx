import React from 'react';
import {
  Search,
  FolderPlus,
  FilePlus2,
  Receipt,
  CreditCard,
  UploadCloud,
  AlertOctagon,
  Smartphone,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AppModule, Project, Deficiency, Guarantee, Estimate } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';

interface InicioViewProps {
  onNavigate: (module: AppModule, extraData?: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  projects: Project[];
  deficiencies: Deficiency[];
  guarantees: Guarantee[];
  estimates: Estimate[];
  recentActivity: any[];
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  projects,
  deficiencies,
  guarantees,
  estimates,
  recentActivity,
}) => {
  const blockingDefs = deficiencies.filter(
    (d) => d.severity === 'BLOQUEANTE' && d.status !== 'CERRADA'
  );
  const expiredGuarantees = guarantees.filter(
    (g) => g.status === 'VENCIDA' || g.status === 'POR_VENCER'
  );
  const pendingEstimates = estimates.filter(
    (e) => e.paymentStatus === 'ORDEN_PAGO' || e.paymentStatus === 'APROBADA'
  );

  const quickActions = [
    {
      id: 'qa-new-project',
      label: 'Proyectos',
      desc: 'Buscar y abrir expedientes',
      icon: FolderPlus,
      action: () => onNavigate('proyectos', { action: 'NEW_PROJECT' }),
      color: 'hover:border-blue-500 hover:bg-blue-950/20 text-blue-400',
    },
    {
      id: 'qa-new-contract',
      label: 'Contratos',
      desc: 'Buscar y revisar contratos',
      icon: FilePlus2,
      action: () => onNavigate('contratos', { action: 'NEW_CONTRACT' }),
      color: 'hover:border-blue-500 hover:bg-blue-950/20 text-blue-400',
    },
    {
      id: 'qa-new-estimate',
      label: 'Estimaciones y pagos',
      desc: 'Revisar estimaciones y deducciones',
      icon: Receipt,
      action: () => onNavigate('estimaciones', { action: 'NEW_ESTIMATE' }),
      color: 'hover:border-emerald-500 hover:bg-emerald-950/20 text-emerald-400',
    },
    {
      id: 'qa-pay-record',
      label: 'Pagos pendientes',
      desc: 'Revisar órdenes y liquidaciones',
      icon: CreditCard,
      action: () => onNavigate('estimaciones', { filterStatus: 'ORDEN_PAGO' }),
      color: 'hover:border-emerald-500 hover:bg-emerald-950/20 text-emerald-400',
    },
    {
      id: 'qa-upload-doc',
      label: 'Biblioteca documental',
      desc: 'Buscar evidencias, actas y reportes',
      icon: UploadCloud,
      action: () => onNavigate('documentos', { action: 'UPLOAD_DOC' }),
      color: 'hover:border-indigo-500 hover:bg-indigo-950/20 text-indigo-400',
    },
    {
      id: 'qa-deficiency',
      label: 'Deficiencias',
      desc: 'Seguimiento de hallazgos técnicos',
      icon: AlertOctagon,
      action: () => onNavigate('deficiencias', { action: 'NEW_DEFICIENCY' }),
      color: 'hover:border-red-500 hover:bg-red-950/20 text-red-400',
    },
    {
      id: 'qa-field-mode',
      label: 'Modo campo',
      desc: 'Inspección técnica offline',
      icon: Smartphone,
      action: () => onNavigate('modo_campo'),
      color: 'hover:border-amber-500 hover:bg-amber-950/20 text-amber-400',
    },
    {
      id: 'qa-transparency',
      label: 'Generar portal de transparencia',
      desc: 'Expediente mensual oficial',
      icon: FileSpreadsheet,
      action: () => onNavigate('transparencia'),
      color: 'hover:border-amber-500 hover:bg-amber-950/20 text-amber-400',
    },
  ];

  return (
    <div id="inicio-view-container" className="max-w-5xl mx-auto space-y-7 pb-12">
      <div className="pt-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Control Contractual
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
          Supervisión técnica, contratos de obra pública, deducciones de ley y portal oficial de transparencia municipal.
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-3 md:p-4 shadow-xl">
        <label htmlFor="inicio-search-input" className="block text-xs font-medium text-slate-300 mb-2">
          Búsqueda directa de expediente
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="inicio-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar proyecto, contrato, contratista o código (ej. tanque, El Centro, COT121706-2026)..."
              className="w-full bg-[#0b1220] text-white text-sm rounded-lg pl-11 pr-4 py-2.5 border border-[#243247] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            id="btn-inicio-search"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Buscar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Acciones Operativas
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                id={qa.id}
                onClick={qa.action}
                className={`p-3.5 rounded-lg bg-[#111827] border border-[#172235] text-left transition-all flex flex-col justify-between group ${qa.color}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded bg-[#0b1220] border border-[#1f2e45] text-slate-300 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-200 transition-colors">
                    {qa.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {qa.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(blockingDefs.length > 0 || expiredGuarantees.length > 0 || pendingEstimates.length > 0) && (
        <div id="section-pendientes-atencion" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pendientes Reales de Atención</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {blockingDefs.length + expiredGuarantees.length + pendingEstimates.length} ítems
            </span>
          </div>

          <div className="space-y-2">
            {blockingDefs.map((def) => {
              const prj = projects.find((p) => p.id === def.projectId);
              return (
                <div
                  key={def.id}
                  className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 text-[10px] font-bold uppercase">
                          Riesgo Bloqueante
                        </span>
                        <span className="text-xs font-semibold text-white">{def.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {prj?.shortName || prj?.code} • {def.specificLocation}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('deficiencias', { deficiencyId: def.id })}
                    className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-medium rounded border border-red-700/80 shrink-0 self-end sm:self-center transition-colors"
                  >
                    Resolver deficiencia
                  </button>
                </div>
              );
            })}

            {expiredGuarantees.map((gar) => {
              const prj = projects.find((p) => p.id === gar.projectId);
              const isExpired = gar.status === 'VENCIDA';
              return (
                <div
                  key={gar.id}
                  className={`p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
                    isExpired
                      ? 'bg-amber-950/30 border-amber-800/60'
                      : 'bg-[#111827] border-amber-900/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${isExpired ? 'text-amber-400' : 'text-amber-300'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${isExpired ? 'bg-amber-900/60 text-amber-200' : 'bg-slate-800 text-slate-300'}`}>
                          {gar.statusLabel}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {gar.typeLabel} ({gar.policyNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {prj?.shortName} • Vencimiento: {formatDateSpanish(gar.expiryDate)} • {formatLempiras(gar.amount)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('garantias', { guaranteeId: gar.id })}
                    className="px-3 py-1 bg-[#172235] hover:bg-amber-950/60 text-amber-200 text-xs font-medium rounded border border-[#243247] hover:border-amber-700/80 shrink-0 self-end sm:self-center transition-colors"
                  >
                    Tramitar prórroga
                  </button>
                </div>
              );
            })}

            {pendingEstimates.map((est) => {
              const prj = projects.find((p) => p.id === est.projectId);
              return (
                <div
                  key={est.id}
                  className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <Receipt className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 text-[10px] font-semibold uppercase">
                          {est.paymentStatusLabel}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          Estimación N° {est.estimateNumber} - {prj?.shortName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Neto a pagar: <strong className="text-white tabular-nums">{formatLempiras(est.netPayable)}</strong> (Bruto: {formatLempiras(est.grossAmount)})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('estimaciones', { estimateId: est.id })}
                    className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-medium rounded border border-emerald-700/80 shrink-0 self-end sm:self-center transition-colors"
                  >
                    Ver orden y liquidar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div id="section-actividad-reciente" className="bg-[#111827] border border-[#172235] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Actividad Reciente del Expediente</span>
          </div>
          <button
            onClick={() => onNavigate('auditoria')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver historial completo
          </button>
        </div>

        <div className="divide-y divide-[#172235]">
          {recentActivity.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="text-slate-200 font-medium">{log.details}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{log.user} ({log.role})</span><span>•</span><span>{log.timestamp}</span>
                </div>
              </div>
              {log.entityCode && (
                <span className="px-2 py-0.5 rounded bg-[#172235] text-slate-300 text-[10px] font-mono shrink-0">{log.entityCode}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
