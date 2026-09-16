import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Percent,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { appStore } from '../../services/storageService.ts';

export const ConfiguracionView: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Municipal Config State
  const [municipalityName, setMunicipalityName] = useState('Alcaldía Municipal de Distrito Central');
  const [department, setDepartment] = useState('Francisco Morazán, Honduras');
  const [municipalRtn, setMunicipalRtn] = useState('08019995123456');
  const [mayorName, setMayorName] = useState('Jorge Aldana');

  // Statutory Deduction Rates
  const [isrRate, setIsrRate] = useState('12.5');
  const [complianceRate, setComplianceRate] = useState('15.0');
  const [qualityRate, setQualityRate] = useState('5.0');
  const [standardAdvanceRate, setStandardAdvanceRate] = useState('20.0');
  const [amortizationThreshold, setAmortizationThreshold] = useState('80.0');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    appStore.logAudit(
      'ACTUALIZAR_CONFIGURACION',
      'CONFIGURACION',
      'cfg-01',
      'SISTEMA',
      `Parámetros municipales y retenciones de ley actualizados por el administrador.`
    );
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      projects: appStore.getProjects(),
      contracts: appStore.getContracts(),
      estimates: appStore.getEstimates(),
      guarantees: appStore.getGuarantees(),
      deficiencies: appStore.getDeficiencies(),
      documents: appStore.getDocuments(),
      visits: appStore.getFieldVisits(),
      auditLogs: appStore.getAuditLogs(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_contractual_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetData = () => {
    if (window.confirm('¿Está seguro de restablecer los datos de prueba a los valores de fábrica?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="configuracion-view-container" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="pt-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Configuración y Parámetros del Sistema</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Parámetros de la institución, porcentajes de retención contractual y gestión de respaldo de datos
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Parámetros del sistema guardados exitosamente.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Municipal Profile */}
        <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f2e45] pb-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Identificación Municipal Oficial</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Nombre de la Municipalidad *</label>
              <input
                type="text"
                required
                value={municipalityName}
                onChange={(e) => setMunicipalityName(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Departamento / Ubicación *</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">RTN Institucional *</label>
              <input
                type="text"
                required
                value={municipalRtn}
                onChange={(e) => setMunicipalRtn(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Titular / Alcalde</label>
              <input
                type="text"
                value={mayorName}
                onChange={(e) => setMayorName(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Contractual Calculation Parameters */}
        <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f2e45] pb-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>Porcentajes de Retención y Reglas Contractuales</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Retención ISR Obra (%)</label>
              <input
                type="number"
                step="0.1"
                value={isrRate}
                onChange={(e) => setIsrRate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Estándar nacional: 12.5%</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Retención Cumplimiento (%)</label>
              <input
                type="number"
                step="0.1"
                value={complianceRate}
                onChange={(e) => setComplianceRate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Estándar: 15.0%</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Retención Calidad / Vicios (%)</label>
              <input
                type="number"
                step="0.1"
                value={qualityRate}
                onChange={(e) => setQualityRate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white font-bold"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Estándar: 5.0%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Anticipo Contractual Estándar (%)</label>
              <input
                type="number"
                step="1"
                value={standardAdvanceRate}
                onChange={(e) => setStandardAdvanceRate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Umbral Amortización Total Anticipo (%)</label>
              <input
                type="number"
                step="1"
                value={amortizationThreshold}
                onChange={(e) => setAmortizationThreshold(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#243247] rounded px-3 py-2 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Amortización al 100% al llegar al 80% de avance
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Guardar configuración</span>
            </button>
          </div>
        </div>
      </form>

      {/* Database Management & Backups */}
      <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f2e45] pb-2">
          <Database className="w-4 h-4 text-amber-400" />
          <span>Respaldo y Persistencia de Datos</span>
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          Los datos del sistema se almacenan de manera local con sincronización inmediata. Puede exportar un respaldo completo en formato JSON para auditoría o archivo histórico institucional.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-lg bg-[#172235] hover:bg-[#1f2e45] text-slate-200 border border-[#243247] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar Respaldo JSON Completo</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-red-400" />
            <span>Restablecer Datos de Demostración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
