import React, { useEffect, useState } from 'react';
import { Settings, Building2, Percent, Database, ShieldCheck, AlertTriangle, UserRound, RefreshCw } from 'lucide-react';
import { hasSupabaseConfig } from '../../services/supabaseClient.ts';
import { getWorkspaceContext, type WorkspaceContext } from '../../services/workspaceService.ts';

export const ConfiguracionView: React.FC = () => {
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void getWorkspaceContext()
      .then(setContext)
      .catch((err: any) => setError(String(err?.message || 'No se pudo cargar la configuración.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div id="configuracion-view-container" className="mx-auto max-w-4xl space-y-5 pb-12">
      <div className="pt-1">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <Settings className="h-5 w-5 text-blue-400" />
          Configuración del sistema
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Contexto de la cuenta, espacio de trabajo y reglas visibles de la interfaz V2. Las credenciales privadas, MFA y políticas RLS permanecen en el backend productivo.
        </p>
      </div>

      <div className="rounded-xl border border-amber-800/50 bg-amber-950/25 p-3 text-xs text-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Esta pantalla no muestra claves privadas ni permite cambiar permisos manualmente. Los roles provienen de Supabase y RLS.</span>
        </div>
      </div>

      <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
        <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
          <Building2 className="h-4 w-4 text-blue-400" /> Espacio de trabajo
        </h3>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" /> Cargando contexto...
          </div>
        ) : error ? (
          <div className="mt-4 rounded-lg border border-amber-800/50 bg-amber-950/20 p-3 text-xs text-amber-200">{error}</div>
        ) : context ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReadOnlyField label="Espacio de trabajo" value={context.workspaceName} />
            <ReadOnlyField label="ID del espacio" value={context.workspaceId} mono />
            <ReadOnlyField label="Sistema" value="Control Contractual" />
            <ReadOnlyField label="Ambiente" value="Integración V2 / rama segura" />
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
        <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
          <UserRound className="h-4 w-4 text-indigo-400" /> Cuenta activa
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadOnlyField label="Usuario" value={context?.fullName || 'Sesión autenticada'} />
          <ReadOnlyField label="Correo" value={context?.email || 'No disponible'} />
          <ReadOnlyField label="Rol de workspace" value={context?.role || 'Por resolver'} />
          <ReadOnlyField label="Estado" value={context?.active === false ? 'Inactivo' : 'Activo'} />
        </div>
      </section>

      <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
        <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
          <Percent className="h-4 w-4 text-emerald-400" /> Reglas de cálculo visibles
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyField label="ISR" value="12.5% si aplica" />
          <ReadOnlyField label="Cumplimiento" value="15% si aplica" />
          <ReadOnlyField label="Calidad" value="5% si aplica" />
          <ReadOnlyField label="Amortización anticipo" value="Según contrato vigente" />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Los porcentajes contractuales no se fuerzan desde Configuración. Cada expediente conserva las condiciones de su contrato y la V2 debe respetarlas.
        </p>
      </section>

      <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
        <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
          <Database className="h-4 w-4 text-amber-400" /> Backend productivo
        </h3>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-[#243247] bg-[#0b1220] p-4">
          <div>
            <div className="text-xs font-semibold text-white">Supabase · Control Contractual</div>
            <div className="mt-1 text-[11px] text-slate-500">Proyecto: flethujkrharehjikwgj</div>
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${hasSupabaseConfig ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {hasSupabaseConfig ? 'Configurado' : 'Falta clave pública'}
          </div>
        </div>
      </section>
    </div>
  );
};

const ReadOnlyField: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className={`mt-1 break-words text-xs font-semibold text-slate-200 ${mono ? 'font-mono' : ''}`}>{value}</div>
  </div>
);
