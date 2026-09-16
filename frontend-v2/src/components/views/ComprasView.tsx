import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Calendar,
  Building,
  Package,
} from 'lucide-react';
import { Project, AppModule } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';

interface ComprasViewProps {
  projects: Project[];
  onNavigate: (module: AppModule, extra?: any) => void;
}

export const ComprasView: React.FC<ComprasViewProps> = ({ projects, onNavigate }) => {
  const [search, setSearch] = useState('');

  const [purchases, setPurchases] = useState([
    {
      id: 'po-101',
      code: 'OC-2026-042',
      projectId: 'prj-001',
      projectName: 'Pavimentación Calle Principal El Centro',
      supplier: 'Cementos del Norte S.A.',
      supplierRTN: '05019001234567',
      description: 'Suministro de 1,200 bolsas de cemento Portland Tipo I para colado de losas',
      amount: 288000,
      status: 'ENTREGADO',
      statusLabel: 'Entregado en obra',
      date: '2026-08-12',
    },
    {
      id: 'po-102',
      code: 'OC-2026-049',
      projectId: 'prj-002',
      projectName: 'Tanque de Distribución La Cumbre',
      supplier: 'Tuberías y Válvulas de Honduras',
      supplierRTN: '08019008765432',
      description: 'Válvulas de compuerta 6" y accesorios de hierro fundido para línea de impulsión',
      amount: 145000,
      status: 'EN_TRANSITO',
      statusLabel: 'En tránsito',
      date: '2026-08-28',
    },
    {
      id: 'po-103',
      code: 'OC-2026-055',
      projectId: 'prj-003',
      projectName: 'Vado Sumergible Quebrada Honda',
      supplier: 'Aceros Industriales S. de R.L.',
      supplierRTN: '08019992345678',
      description: 'Varilla corrugada de acero grado 60 de 1/2" y 3/8"',
      amount: 210000,
      status: 'ORDENADA',
      statusLabel: 'Orden emitida',
      date: '2026-09-02',
    },
  ]);

  const filtered = purchases.filter((p) =>
    `${p.code} ${p.supplier} ${p.description} ${p.projectName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="compras-view-container" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Compras, Suministros y Licitaciones Menores</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Adquisiciones de materiales, equipos y suministros directos vinculados a expedientes de obra
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-3 md:p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar orden de compra, proveedor o insumo..."
            className="w-full bg-[#0b1220] text-xs text-white rounded-lg pl-9 pr-3 py-2 border border-[#243247] focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Purchases List */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((po) => (
          <div
            key={po.id}
            className="p-4 rounded-xl bg-[#111827] border border-[#1f2e45] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60">
                  {po.code}
                </span>
                <h3 className="text-xs font-bold text-white">{po.supplier}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  RTN: {po.supplierRTN}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    po.status === 'ENTREGADO'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {po.statusLabel}
                </span>
              </div>

              <div className="text-xs text-slate-300">{po.description}</div>

              <div className="text-[11px] text-slate-400">
                Proyecto: <strong className="text-white">{po.projectName}</strong> • Fecha: {formatDateSpanish(po.date)}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-medium">Monto Total</div>
                <div className="text-sm font-bold text-white tabular-nums">{formatLempiras(po.amount)}</div>
              </div>

              <button
                onClick={() => onNavigate('proyectos', { projectId: po.projectId })}
                className="px-3 py-1.5 rounded-lg bg-[#172235] text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-medium transition-colors"
              >
                Ver proyecto
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
