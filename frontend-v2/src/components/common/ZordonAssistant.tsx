import React, { useMemo, useState } from 'react';
import { X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, hasSupabaseConfig, ensureSupabaseSession } from '../../services/supabaseClient.ts';
import { EngineerFigure } from './ZordonAvatar.tsx';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

interface ZordonAssistantProps {
  open: boolean;
  onClose: () => void;
  context?: string;
}

export const ZordonAssistant: React.FC<ZordonAssistantProps> = ({ open, onClose, context = '' }) => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  if (!open) return null;

  const send = async () => {
    const q = message.trim();
    if (!q || loading) return;
    setMessage('');
    setError('');
    setHistory((prev) => [...prev, { role: 'user', text: q }]);

    if (!hasSupabaseConfig || !supabase) {
      setHistory((prev) => [...prev, { role: 'assistant', text: 'La interfaz nueva no tiene conexión pública de Supabase disponible. El ZORDON productivo sigue intacto; no usaré respuestas simuladas.' }]);
      return;
    }

    setLoading(true);
    try {
      await ensureSupabaseSession();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No existe una sesión autenticada reutilizable.');
      }

      const payloadHistory = history.slice(-24).map((turn) => ({ role: turn.role, text: turn.text.slice(0, 1000) }));
      const { data, error: invokeError } = await supabase.functions.invoke('halu-chat', {
        body: {
          message: q,
          context,
          history: payloadHistory,
        },
      });
      if (invokeError) throw invokeError;
      const reply = String(data?.reply || '').trim();
      if (!reply) throw new Error('ZORDON no devolvió respuesta.');
      setHistory((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      console.error('ZORDON invoke error', err);
      setError('Necesito una sesión válida de Control Contractual para consultar ZORDON. No se modificó ninguna conversación ni expediente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-end overflow-hidden bg-black/45 p-2 sm:p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="zordon-dialog-title">
      <div className="flex h-[min(720px,88vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#243247] bg-[#0b1220] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1f2e45] bg-[#111827] px-4 py-3">
          <div className="flex items-center gap-3">
            <EngineerFigure size={34} showStatusDot />
            <div>
              <div id="zordon-dialog-title" className="text-sm font-bold text-white">ZORDON</div>
              <div className="text-[10px] text-emerald-400">Mismo asistente de la web y Telegram</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar ZORDON">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 [touch-action:pan-y]">
          {history.length === 0 && (
            <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-xs leading-relaxed text-slate-400">
              Esta interfaz reutiliza el ZORDON productivo y su memoria compartida. No crea otro bot ni otra base paralela.
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
    </div>
  );
};
