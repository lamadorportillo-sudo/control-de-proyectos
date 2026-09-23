import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Armchair,
  Bot,
  Building2,
  Database,
  Eye,
  Gauge,
  MapPin,
  Move,
  Percent,
  RefreshCw,
  RotateCcw,
  Route,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { hasSupabaseConfig } from '../../services/supabaseClient.ts';
import { getWorkspaceContext, type WorkspaceContext } from '../../services/workspaceService.ts';
import {
  readZordonPreferences,
  requestZordonReposition,
  resetZordonPreferences,
  saveZordonPreferences,
  type ZordonPreferences,
  ZORDON_PREFERENCES_EVENT,
  ZORDON_PREFERENCES_KEY,
} from '../../services/zordonPreferences.ts';

export const ConfiguracionView: React.FC = () => {
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zordonPreferences, setZordonPreferences] = useState<ZordonPreferences>(() => readZordonPreferences());
  const [zordonMessage, setZordonMessage] = useState('Los cambios se guardan en este equipo y se aplican al instante.');

  useEffect(() => {
    void getWorkspaceContext()
      .then(setContext)
      .catch((err: any) => setError(String(err?.message || 'No se pudo cargar la configuración.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const syncPreferences = (event: Event) => {
      const detail = (event as CustomEvent<ZordonPreferences>).detail;
      setZordonPreferences(detail || readZordonPreferences());
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === ZORDON_PREFERENCES_KEY) setZordonPreferences(readZordonPreferences());
    };
    window.addEventListener(ZORDON_PREFERENCES_EVENT, syncPreferences);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener(ZORDON_PREFERENCES_EVENT, syncPreferences);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  const updateZordon = (changes: Partial<ZordonPreferences>) => {
    const next = saveZordonPreferences({ ...zordonPreferences, ...changes });
    setZordonPreferences(next);
    setZordonMessage('Configuración de ZORDON actualizada y aplicada al instante.');
  };

  const rehomeZordon = () => {
    requestZordonReposition();
    setZordonMessage(`ZORDON volvió al lado ${zordonPreferences.preferredDock} sin ocultarse.`);
  };

  const restoreZordon = () => {
    const next = resetZordonPreferences();
    setZordonPreferences(next);
    requestZordonReposition();
    setZordonMessage('Se restauró la configuración inicial de ZORDON y su posición lateral.');
  };

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

      <section aria-labelledby="zordon-settings-title" className="overflow-hidden rounded-xl border border-emerald-700/45 bg-[#111827] shadow-[0_0_0_1px_rgba(16,185,129,.04)]">
        <div className="border-b border-emerald-900/60 bg-gradient-to-r from-emerald-950/35 via-[#111827] to-[#111827] p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 id="zordon-settings-title" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <Bot className="h-4 w-4 text-emerald-400" /> ZORDON · presencia y movimiento
              </h3>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400">
                Ajusta cómo se comporta el asistente dentro de la interfaz. ZORDON es permanente: puedes moverlo, reducir su presencia o cambiar sus pausas de trabajo, pero no se oculta.
              </p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-emerald-700/60 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <Eye className="h-3.5 w-3.5" /> Siempre visible
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ZordonStatus
              label="Permanencia"
              value="Visible en todo momento"
              detail="No existe una opción para minimizarlo u ocultarlo."
              icon={<Eye className="h-4 w-4 text-emerald-400" />}
            />
            <ZordonStatus
              label="Movimiento"
              value={zordonPreferences.autonomousMovement ? 'Inteligente y manual' : 'Solo manual'}
              detail={zordonPreferences.autonomousMovement ? 'Solo se aparta cuando cubre un control importante.' : 'Solo se mueve cuando lo arrastras.'}
              icon={<Move className="h-4 w-4 text-blue-400" />}
            />
            <ZordonStatus
              label="Pausa de planos"
              value={zordonPreferences.deskMode ? 'Activa' : 'Desactivada'}
              detail={zordonPreferences.deskMode ? 'Puede revisar planos después de inactividad real de la página.' : 'Se mantiene de pie hasta que cambies el ajuste.'}
              icon={<Armchair className="h-4 w-4 text-amber-400" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ZordonToggle
              title="Movimiento inteligente"
              description="Además de arrastrarlo manualmente, ZORDON solo se reubica si está cubriendo una acción importante."
              icon={<Move className="h-4 w-4" />}
              checked={zordonPreferences.autonomousMovement}
              onChange={(checked) => updateZordon({ autonomousMovement: checked })}
            />
            <ZordonToggle
              title="Evitar controles cercanos"
              description="Si ZORDON cubre un botón, campo, menú o acción importante, se aparta sin interrumpir la escritura."
              icon={<Route className="h-4 w-4" />}
              checked={zordonPreferences.avoidControls}
              disabled={!zordonPreferences.autonomousMovement}
              onChange={(checked) => updateZordon({ avoidControls: checked })}
            />
            <ZordonToggle
              title="Modo de trabajo con planos"
              description="Después de un tiempo sin actividad en la página, puede revisar planos sin desplazarse innecesariamente."
              icon={<Armchair className="h-4 w-4" />}
              checked={zordonPreferences.deskMode}
              onChange={(checked) => updateZordon({ deskMode: checked })}
            />
            <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md border border-slate-700 bg-[#111827] p-2 text-slate-300"><SlidersHorizontal className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs font-semibold text-white">Cómo se conserva</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">La posición y las preferencias se guardan en este navegador. En otro equipo puedes configurarlo de forma independiente.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#243247] bg-[#0b1220] p-4 sm:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><Gauge className="h-3.5 w-3.5 text-blue-400" /> Velocidad al apartarse</span>
              <select
                aria-label="Ritmo al caminar de ZORDON"
                value={zordonPreferences.walkingSpeed}
                disabled={!zordonPreferences.autonomousMovement}
                onChange={(event) => updateZordon({ walkingSpeed: event.target.value as ZordonPreferences['walkingSpeed'] })}
                className="mt-2 w-full rounded-lg border border-[#334155] bg-[#111827] px-3 py-2 text-xs font-semibold text-slate-200 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <option value="suave">Suave · transición lenta</option>
                <option value="normal">Normal · equilibrio recomendado</option>
                <option value="rapido">Rápido · se aparta antes</option>
              </select>
            </label>

            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> Lado preferido</span>
              <select
                aria-label="Lado preferido de ZORDON"
                value={zordonPreferences.preferredDock}
                onChange={(event) => updateZordon({ preferredDock: event.target.value as ZordonPreferences['preferredDock'] })}
                className="mt-2 w-full rounded-lg border border-[#334155] bg-[#111827] px-3 py-2 text-xs font-semibold text-slate-200 outline-none transition focus:border-emerald-500"
              >
                <option value="derecha">Derecha · predeterminado</option>
                <option value="izquierda">Izquierda</option>
              </select>
              <span className="mt-1.5 block text-[10px] text-slate-500">Se aplica al usar “Reubicar ahora” o al restablecer.</span>
            </label>

            <ZordonRange
              label="Tiempo antes de trabajar con planos"
              description="Sin interacción con ZORDON"
              value={zordonPreferences.workDelaySeconds}
              min={30}
              max={600}
              step={30}
              unit="s"
              disabled={!zordonPreferences.deskMode}
              onChange={(value) => updateZordon({ workDelaySeconds: value })}
            />
            <ZordonRange
              label="Duración de la pausa de planos"
              description="Tiempo máximo junto a su mesa"
              value={zordonPreferences.workDurationSeconds}
              min={6}
              max={30}
              step={1}
              unit="s"
              disabled={!zordonPreferences.autonomousMovement || !zordonPreferences.deskMode}
              onChange={(value) => updateZordon({ workDurationSeconds: value })}
            />
          </div>

          <div className="rounded-xl border border-[#243247] bg-[#0b1220] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tamaño dentro de la interfaz</div>
                <p className="mt-1 text-[11px] text-slate-500">Elige una presencia más discreta o una figura más visible, sin perder la opción de arrastrarlo.</p>
              </div>
              <div className="inline-flex rounded-lg border border-[#334155] bg-[#111827] p-1" role="group" aria-label="Tamaño de ZORDON">
                {([
                  ['compacto', 'Compacto'],
                  ['normal', 'Normal'],
                  ['amplio', 'Amplio'],
                ] as Array<[ZordonPreferences['figureSize'], string]>).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={zordonPreferences.figureSize === value}
                    onClick={() => updateZordon({ figureSize: value })}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${zordonPreferences.figureSize === value ? 'bg-emerald-500 text-[#06261d] shadow' : 'text-slate-400 hover:bg-[#1b2735] hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#243247] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="status" className="text-[11px] text-emerald-300">{zordonMessage}</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={rehomeZordon} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/70 bg-emerald-950/45 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-900/65">
                <MapPin className="h-3.5 w-3.5" /> Reubicar ahora
              </button>
              <button type="button" onClick={restoreZordon} className="inline-flex items-center gap-1.5 rounded-lg border border-[#334155] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-[#172235] hover:text-white">
                <RotateCcw className="h-3.5 w-3.5" /> Restaurar inicial
              </button>
            </div>
          </div>
        </div>
      </section>

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

const ZordonStatus: React.FC<{ label: string; value: string; detail: string; icon: React.ReactNode }> = ({ label, value, detail, icon }) => (
  <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3">
    <div className="flex items-center justify-between gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      {icon}
    </div>
    <div className="mt-1 text-xs font-semibold text-slate-100">{value}</div>
    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{detail}</p>
  </div>
);

const ZordonToggle: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}> = ({ title, description, icon, checked, disabled = false, onChange }) => (
  <label className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-[#243247] bg-[#0b1220] p-4 transition ${disabled ? 'cursor-not-allowed opacity-45' : 'hover:border-emerald-800/80'}`}>
    <span className="flex gap-3">
      <span className="mt-0.5 rounded-md border border-slate-700 bg-[#111827] p-2 text-emerald-300">{icon}</span>
      <span>
        <span className="block text-xs font-semibold text-white">{title}</span>
        <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">{description}</span>
      </span>
    </span>
    <span className="relative mt-1 inline-flex shrink-0">
      <input
        type="checkbox"
        className="peer absolute inset-0 z-10 h-5 w-9 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        checked={checked}
        disabled={disabled}
        aria-label={title}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden="true" className="pointer-events-none h-5 w-9 rounded-full bg-slate-700 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-300 peer-disabled:opacity-60" />
      <span aria-hidden="true" className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </span>
  </label>
);

const ZordonRange: React.FC<{
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  disabled: boolean;
  onChange: (value: number) => void;
}> = ({ label, description, value, min, max, step, unit, disabled, onChange }) => (
  <label className={`block ${disabled ? 'opacity-45' : ''}`}>
    <span className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      <span>{label}</span>
      <span className="rounded bg-[#111827] px-2 py-1 text-xs normal-case text-emerald-300">{value} {unit}</span>
    </span>
    <span className="mt-1.5 block text-[10px] text-slate-500">{description}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-3 w-full accent-emerald-400 disabled:cursor-not-allowed"
    />
    <span className="flex justify-between text-[10px] text-slate-600"><span>{min} {unit}</span><span>{max} {unit}</span></span>
  </label>
);

const ReadOnlyField: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className={`mt-1 break-words text-xs font-semibold text-slate-200 ${mono ? 'font-mono' : ''}`}>{value}</div>
  </div>
);
