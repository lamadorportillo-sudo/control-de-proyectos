import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { AuditLog, AppModule } from '../../types.ts';
import { appStore } from '../../services/storageService.ts';

interface AuditoriaViewProps {
  auditLogs: AuditLog[];
  onNavigate: (module: AppModule, extra?: any) => void;
}

export const AuditoriaView: React.FC<AuditoriaViewProps> = ({ auditLogs, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = auditLogs.filter((l) => {
    const text = `${l.action} ${l.user} ${l.role} ${l.details} ${l.entityCode || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || l.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportCsv = () => {
    const header = 'Fecha,Usuario,Rol,Accion,Entidad,Codigo,Detalles\n';
    const rows = filtered
      .map(
        (l) =>
          `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.entityType}","${l.entityCode || ''}","${l.details.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bitacora_auditoria_contractual_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="auditoria-view-container" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Trazabilidad y Bitácora de Auditoría del Sistema</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro cronológico inmutable de transacciones, liquidaciones y modificaciones de expedientes
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 rounded-lg bg-[#172235] hover:bg-[#1f2e45] text-slate-200 border border-[#243247] text-xs font-medium flex items-center gap-1.5 self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar bitácora (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-3 md:p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, acción o expediente..."
            className="w-full bg-[#0b1220] text-xs text-white rounded-lg pl-9 pr-3 py-2 border border-[#243247] focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0b1220] text-xs text-slate-300 rounded-lg px-3 py-2 border border-[#243247] focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="SUPERVISOR">Supervisor / Ingeniero</option>
            <option value="AUDITOR">Auditor</option>
            <option value="CONTRATISTA">Contratista</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2e45] rounded-xl overflow-x-auto shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0b1220] text-slate-400 border-b border-[#1f2e45]">
            <tr>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">Usuario y Rol</th>
              <th className="p-3">Acción Operativa</th>
              <th className="p-3">Expediente</th>
              <th className="p-3">Detalle del Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172235] text-slate-300">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-[#152238] transition-colors">
                <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="font-semibold text-white">{log.user}</div>
                  <div className="text-[10px] text-slate-500">{log.role}</div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-medium">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {log.entityCode ? (
                    <span className="font-mono text-amber-400 font-medium">{log.entityCode}</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="p-3 text-slate-200 min-w-[280px]">
                  {log.details}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No hay registros de auditoría que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
