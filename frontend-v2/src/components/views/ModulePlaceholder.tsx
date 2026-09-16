import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, description, onBack }) => (
  <div className="max-w-4xl mx-auto py-10">
    <div className="rounded-2xl border border-[#1f2e45] bg-[#111827] p-6 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="rounded-xl border border-amber-800/50 bg-amber-950/30 p-3">
          <Construction className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
          <p className="mt-4 text-xs text-slate-500">
            La interfaz visual ya está siendo integrada. Los datos productivos permanecen protegidos en Supabase y no se reemplazan por datos de demostración.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1f2e45]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  </div>
);
