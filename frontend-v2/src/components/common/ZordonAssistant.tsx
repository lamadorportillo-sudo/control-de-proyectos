import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, hasSupabaseConfig, ensureSupabaseSession } from '../../services/supabaseClient.ts';
import { EngineerFigure } from './ZordonAvatar.tsx';
import { ZORDON_POSITION_EVENT } from '../../services/zordonPreferences.ts';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

interface ZordonAssistantProps {
  open: boolean;
  onClose: () => void;
  context?: string;
  onSessionExpired?: () => void;
}

type PanelPosition = { left: number; top: number };

const PANEL_GAP = 12;
const PANEL_EDGE = 12;

function viewportRect() {
  const visual = window.visualViewport;
  return visual
    ? {
      left: visual.offsetLeft || 0,
      top: visual.offsetTop || 0,
      width: visual.width || window.innerWidth,
      height: visual.height || window.innerHeight,
    }
    : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

export const ZordonAssistant: React.FC<ZordonAssistantProps> = ({ open, onClose, context = '', onSessionExpired }) => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({ left: PANEL_EDGE, top: PANEL_EDGE });
  const panelRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  const reposition = useCallback(() => {
    const panel = panelRef.current;
    const launcher = document.getElementById('zordon-engineer-launcher-container');
    if (!panel || !launcher) return;

    const viewport = viewportRect();
    const launcherRect = launcher.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const width = Math.min(panelRect.width || 390, viewport.width - PANEL_EDGE * 2);
    const height = Math.min(panelRect.height || 610, viewport.height - PANEL_EDGE * 2);

    const spaces = {
      left: launcherRect.left - viewport.left - PANEL_GAP,
      right: viewport.left + viewport.width - launcherRect.right - PANEL_GAP,
      top: launcherRect.top - viewport.top - PANEL_GAP,
      bottom: viewport.top + viewport.height - launcherRect.bottom - PANEL_GAP,
    };

    const horizontalFirst = launcherRect.left + launcherRect.width / 2 > viewport.left + viewport.width / 2
      ? ['left', 'top', 'bottom', 'right'] as const
      : ['right', 'top', 'bottom', 'left'] as const;

    const candidates = {
      left: {
        fits: spaces.left >= width,
        left: launcherRect.left - width - PANEL_GAP,
        top: launcherRect.top + (launcherRect.height - height) / 2,
      },
      right: {
        fits: spaces.right >= width,
        left: launcherRect.right + PANEL_GAP,
        top: launcherRect.top + (launcherRect.height - height) / 2,
      },
      top: {
        fits: spaces.top >= height,
        left: launcherRect.left + (launcherRect.width - width) / 2,
        top: launcherRect.top - height - PANEL_GAP,
      },
      bottom: {
        fits: spaces.bottom >= height,
        left: launcherRect.left + (launcherRect.width - width) / 2,
        top: launcherRect.bottom + PANEL_GAP,
      },
    };

    let key = horizontalFirst.find((side) => candidates[side].fits);
    if (!key) {
      key = (Object.keys(spaces) as Array<keyof typeof spaces>)
        .sort((a, b) => spaces[b] - spaces[a])[0];
    }
    const candidate = candidates[key];

    setPanelPosition({
      left: Math.max(viewport.left + PANEL_EDGE, Math.min(candidate.left, viewport.left + viewport.width - width - PANEL_EDGE)),
      top: Math.max(viewport.top + PANEL_EDGE, Math.min(candidate.top, viewport.top + viewport.height - height - PANEL_EDGE)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const frame = window.requestAnimationFrame(reposition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const handleViewport = () => reposition();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
      window.setTimeout(() => document.querySelector<HTMLElement>('#zordon-engineer-launcher-container button[data-zordon-control="open"]')?.focus(), 0);
    };
    window.addEventListener('resize', handleViewport, { passive: true });
    window.addEventListener(ZORDON_POSITION_EVENT, handleViewport as EventListener);
    window.visualViewport?.addEventListener('resize', handleViewport, { passive: true });
    window.visualViewport?.addEventListener('scroll', handleViewport, { passive: true });
    document.addEventListener('keydown', handleEscape, true);
    return () => {
      window.removeEventListener('resize', handleViewport);
      window.removeEventListener(ZORDON_POSITION_EVENT, handleViewport as EventListener);
      window.visualViewport?.removeEventListener('resize', handleViewport);
      window.visualViewport?.removeEventListener('scroll', handleViewport);
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [onClose, open, reposition]);

  if (!open) return null;

  const send = async () => {
    const q = message.trim();
    if (!q || loading) return;

    setMessage('');
    setError('');
    setHistory((prev) => [...prev, { role: 'user', text: q }]);

    const safeFallback = (input: string) => {
      const normalized = input.trim().toLowerCase();
      if (/^(hola|holi|buenas|buenos días|buen día|buenas tardes|buenas noches|qué tal|que tal)[.! ]*$/.test(normalized)) {
        return 'Aquí estoy. Dime qué necesitas revisar.';
      }
      return 'Se me cortó el motor principal un momento. No voy a inventar datos. Reenvíame eso en unos segundos; tu expediente sigue intacto.';
    };

    if (!hasSupabaseConfig || !supabase) {
      setHistory((prev) => [...prev, { role: 'assistant', text: safeFallback(q) }]);
      return;
    }

    setLoading(true);
    try {
      let session = await ensureSupabaseSession();

      if (!session?.access_token) {
        const refreshed = await supabase.auth.refreshSession();
        session = refreshed.data.session;
      }

      if (!session?.access_token) {
        const missingSession = new Error('SESSION_EXPIRED');
        (missingSession as any).code = 'SESSION_EXPIRED';
        throw missingSession;
      }

      const payloadHistory = history.slice(-24).map((turn) => ({
        role: turn.role,
        text: turn.text.slice(0, 1000),
      }));

      const operationalContext = [
        context,
        'Regla operativa de ZORDON: adapta la respuesta al módulo visible.',
        'No inventes cantidades de obra, precios unitarios, rendimientos, fechas, pagos, garantías ni datos contractuales.',
        'Si falta un parámetro indispensable, pide exactamente el dato faltante antes de calcular o afirmar.',
      ].filter(Boolean).join('\n');

      const body = { message: q, context: operationalContext, history: payloadHistory };

      const invoke = async (token: string) => supabase.functions.invoke('halu-chat', {
        body,
        headers: { Authorization: `Bearer ${token}` },
      });

      let result = await invoke(session.access_token);

      const firstStatus = Number((result.error as any)?.context?.status || (result.error as any)?.status || 0);
      if (result.error && firstStatus === 401) {
        const refreshed = await supabase.auth.refreshSession();
        const token = refreshed.data.session?.access_token;
        if (token) result = await invoke(token);
      } else if (result.error && [429, 500, 502, 503, 504].includes(firstStatus)) {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        result = await invoke(session.access_token);
      }

      if (result.error) {
        const status = Number((result.error as any)?.context?.status || (result.error as any)?.status || 0);
        if (status === 401) {
          const expired = new Error('SESSION_EXPIRED');
          (expired as any).code = 'SESSION_EXPIRED';
          throw expired;
        }
        console.error('ZORDON backend error', result.error);
        setHistory((prev) => [...prev, { role: 'assistant', text: safeFallback(q) }]);
        return;
      }

      const reply = String(result.data?.reply || '').trim();
      if (!reply) {
        setHistory((prev) => [...prev, { role: 'assistant', text: safeFallback(q) }]);
        return;
      }

      setHistory((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      console.error('ZORDON invoke error', err);
      const status = Number(err?.context?.status || err?.status || 0);
      const isSessionError = err?.code === 'SESSION_EXPIRED' || status === 401;

      if (isSessionError) {
        setError('La sesión de Control Contractual venció. Vuelve a ingresar para continuar con ZORDON.');
        onSessionExpired?.();
      } else {
        setHistory((prev) => [...prev, { role: 'assistant', text: safeFallback(q) }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-[95] flex h-[min(610px,calc(100vh-24px))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[#243247] bg-[#0b1220] shadow-2xl"
      style={{ left: panelPosition.left, top: panelPosition.top }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="zordon-dialog-title"
      data-zordon-critical
      data-zordon-chat-panel
    >
      <div className="flex items-center justify-between border-b border-[#1f2e45] bg-[#111827] px-4 py-3">
        <div className="flex items-center gap-3">
          <EngineerFigure size={34} showStatusDot />
          <div>
            <div id="zordon-dialog-title" className="text-sm font-bold text-white">ZORDON</div>
            <div className="text-[10px] text-emerald-400">Asistente de ingeniería · contexto del módulo actual</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar ZORDON">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 [touch-action:pan-y]">
        {history.length === 0 && (
          <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-xs leading-relaxed text-slate-400">
            Estoy conectado al contexto del módulo que estás usando. Si falta un dato para calcular o revisar algo, te pediré ese dato en vez de inventarlo.
          </div>
        )}

        {history.map((turn, index) => (
          <div key={`${turn.role}-${index}`} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${turn.role === 'user' ? 'bg-blue-600 text-white' : 'border border-[#1f2e45] bg-[#111827] text-slate-200'}`}>
              {turn.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            ZORDON está revisando el contexto…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-[#1f2e45] bg-[#111827] p-3">
        <div className="flex items-end gap-2">
          <textarea
            autoFocus
            aria-label="Mensaje para ZORDON"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={2}
            placeholder="Escribe a ZORDON…"
            className="min-h-[48px] flex-1 resize-none rounded-xl border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensaje a ZORDON"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
