import React from 'react';
import { Settings, Building2, Percent, Database, ShieldCheck, AlertTriangle } from 'lucide-react';
import { hasSupabaseConfig } from '../../services/supabaseClient.ts';

export const ConfiguracionView: React.FC = () => (
  <div id="configuracion-view-container" className="mx-auto max-w-4xl space-y-5 pb-12">
    <div className="pt-1">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
        <Settings className="h-5 w-5 text-blue-400" />
        Configuración del sistema
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Configuración de la interfaz V2. Las credenciales privadas, MFA y políticas RLS continúan gestionándose en el backend productivo existente.
      </p>
    </div>

    <div className="rounded-xl border border-amber-800/50 bg-amber-950/25 p-3 text-xs text-amber-200">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Durante la integración esta pantalla no modifica parámetros contractuales ni borra datos. Los controles de escritura se habilitarán solamente después de validar autenticación, permisos y RPC/RLS.</span>
      </div>
    </div>

    <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
      <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
        <Building2 className="h-4 w-4 text-blue-400" /> Identificación institucional
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReadOnlyField label="Institución" value="Municipalidad de Santa María" />
        <ReadOnlyField label="Ubicación" value="Santa María, La Paz, Honduras" />
        <ReadOnlyField label="Sistema" value="Control Contractual" />
        <ReadOnlyField label="Ambiente" value="Integración V2 / rama segura" />
      </div>
    </section>

    <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
      <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
        <Percent className="h-4 w-4 text-emerald-400" /> Reglas de cálculo configuradas en la interfaz
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReadOnlyField label="ISR" value="12.5%" />
        <ReadOnlyField label="Cumplimiento" value="15%" />
        <ReadOnlyField label="Calidad" value="5%" />
        <ReadOnlyField label="Amortización anticipo" value="100% al 80% según contrato" />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Estos valores sirven al motor de cálculo de la V2. El porcentaje real de anticipo y cualquier condición especial deben tomarse del contrato correspondiente, no de una plantilla general.
      </p>
    </section>

    <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-5">
      <h3 className="flex items-center gap-2 border-b border-[#1f2e45] pb-3 text-xs font-bold uppercase tracking-wider text-white">
        <Database className="h-4 w-4 text-amber-400" /> Backend productivo
      </h3>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-[#243247] bg-[#0b1220] p-4">
        <div>
          <div className="text-xs font-semibold text-white">Supabase · control de proyectos</div>
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

const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-xs font-semibold text-slate-200">{value}</div>
  </div>
);
