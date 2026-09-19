import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, KeyRound, LogIn, Mail, ShieldCheck, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { EngineerFullBodyFigure } from '../common/ZordonAvatar.tsx';
import {
  completeAccessRegistration,
  recoveryModeRequested,
  requestAccess,
  requestPasswordReset,
  secureLogin,
  updateRecoveredPassword,
  verifyMfaLogin,
  type LoginSeed,
} from '../../services/authService.ts';

interface Props {
  onAuthenticated: () => Promise<void> | void;
}

type Mode = 'login' | 'request' | 'recovery';

const inputClass = 'w-full rounded-lg border border-[#2b3a50] bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

export const LoginView: React.FC<Props> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>(recoveryModeRequested() ? 'recovery' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [mfaSeed, setMfaSeed] = useState<LoginSeed | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const [requestForm, setRequestForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    requestedRole: 'consulta' as 'consulta' | 'editor',
    inviteCode: '',
    password: '',
  });
  const [requestSent, setRequestSent] = useState(false);

  const title = useMemo(() => {
    if (mode === 'request') return requestSent ? 'Completar acceso' : 'Solicitar acceso';
    if (mode === 'recovery') return 'Recuperar acceso';
    if (mfaSeed) return 'Verificación en dos pasos';
    return 'Ingresar';
  }, [mode, requestSent, mfaSeed]);

  const doLogin = async () => {
    if (!email.trim() || !password) {
      setMessage('Escribe tu correo y contraseña.');
      return;
    }
    setBusy(true);
    setMessage('Validando acceso de forma segura…');
    try {
      const result = await secureLogin(email, password);
      if (result.status === 'mfa_required') {
        setMfaSeed(result.seed);
        setMessage('La contraseña fue validada. Ingresa el código de tu aplicación autenticadora.');
      } else {
        setMessage('Acceso autorizado. Cargando Control Contractual…');
        await onAuthenticated();
      }
    } catch (error: any) {
      setMessage(String(error?.message || 'No se pudo iniciar sesión.'));
    } finally {
      setBusy(false);
    }
  };

  const doMfa = async () => {
    if (!mfaSeed || mfaCode.replace(/\D/g, '').length < 6) {
      setMessage('Escribe el código de autenticación.');
      return;
    }
    setBusy(true);
    setMessage('Comprobando segundo factor…');
    try {
      await verifyMfaLogin(mfaSeed, mfaCode);
      setMessage('Verificación correcta. Cargando…');
      await onAuthenticated();
    } catch (error: any) {
      setMessage(String(error?.message || 'Código incorrecto o vencido.'));
      setMfaCode('');
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
    if (!email.trim()) {
      setMessage('Escribe primero el correo de tu cuenta.');
      return;
    }
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setMessage('Si el correo pertenece a una cuenta, recibirás un enlace de recuperación. Revisa también spam.');
    } catch (error: any) {
      setMessage(String(error?.message || 'No se pudo solicitar la recuperación.'));
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async () => {
    if (password.length < 8) return setMessage('La nueva contraseña debe tener al menos 8 caracteres.');
    if (password !== confirmPassword) return setMessage('Las contraseñas no coinciden.');
    setBusy(true);
    try {
      await updateRecoveredPassword(password);
      setMessage('Contraseña actualizada. Ya puedes ingresar.');
      setPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (error: any) {
      setMessage(String(error?.message || 'No se pudo actualizar la contraseña.'));
    } finally {
      setBusy(false);
    }
  };

  const sendAccessRequest = async () => {
    if (requestForm.fullName.trim().length < 3 || !requestForm.email.trim()) {
      setMessage('Completa tu nombre y correo.');
      return;
    }
    setBusy(true);
    try {
      const result = await requestAccess({
        fullName: requestForm.fullName,
        email: requestForm.email,
        phone: requestForm.phone,
        position: requestForm.position,
        requestedRole: requestForm.requestedRole,
      });
      setRequestSent(true);
      setMessage(result.emailSent
        ? 'Solicitud enviada. El administrador fue notificado. Cuando recibas tu código personal, escríbelo aquí.'
        : 'Solicitud registrada. El administrador podrá revisarla y entregarte tu código personal.');
    } catch (error: any) {
      setMessage(String(error?.message || 'No se pudo enviar la solicitud.'));
    } finally {
      setBusy(false);
    }
  };

  const registerAccess = async () => {
    setBusy(true);
    try {
      await completeAccessRegistration({
        fullName: requestForm.fullName,
        email: requestForm.email,
        password: requestForm.password,
        inviteCode: requestForm.inviteCode,
      });
      setMessage('Cuenta autorizada. Si recibiste un correo de confirmación, confírmalo y luego ingresa.');
      setRequestSent(false);
      setEmail(requestForm.email);
      setMode('login');
    } catch (error: any) {
      setMessage(String(error?.message || 'No se pudo crear el acceso.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07101d] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden overflow-hidden border-r border-[#1d2b40] bg-[#0b1220] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-blue-400">CONTROL</div>
            <div className="text-3xl font-black tracking-tight text-white">Contractual · Proyectos</div>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
              Control técnico, contractual y documental en un solo expediente. Acceso privado, trazable y protegido por permisos del espacio de trabajo.
            </p>
          </div>

          <div className="flex items-end justify-between gap-8">
            <div className="max-w-md">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Acceso protegido</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="h-4 w-4 text-emerald-400"/> Supabase Auth + RLS + bitácora</div>
              <div className="mt-2 text-xs leading-relaxed text-slate-500">
                ZORDON estará disponible después de autenticarte y conservará el mismo contexto del sistema productivo.
              </div>
            </div>
            <EngineerFullBodyFigure className="scale-125 origin-bottom" />
          </div>

          <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-blue-700/10 blur-3xl" />
        </aside>

        <main className="flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md rounded-2xl border border-[#243247] bg-[#111827] p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Control Contractual</div>
                <h1 className="mt-1 text-xl font-bold text-white">{title}</h1>
              </div>
              <div className="lg:hidden"><EngineerFullBodyFigure /></div>
            </div>

            {mode === 'login' && !mfaSeed && (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-300">Correo electrónico</span>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/><input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" autoComplete="username" className={inputClass + ' pl-9'} placeholder="correo@institucion.hn"/></div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-300">Contraseña</span>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                    <input value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')void doLogin();}} type={showPass?'text':'password'} autoComplete="current-password" className={inputClass + ' pl-9 pr-10'} />
                    <button type="button" onClick={()=>setShowPass((v)=>!v)} aria-label={showPass?'Ocultar contraseña':'Mostrar contraseña'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-white">{showPass?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                  </div>
                </label>
                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={()=>void sendReset()} className="text-xs font-semibold text-blue-400 hover:text-blue-300">¿Olvidaste tu contraseña?</button>
                  <button type="button" onClick={()=>{setMode('request');setMessage('');}} className="text-xs font-semibold text-slate-400 hover:text-white">Solicitar acceso</button>
                </div>
                <button onClick={()=>void doLogin()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"><LogIn className="h-4 w-4"/>{busy?'Validando…':'Ingresar'}</button>
              </div>
            )}

            {mode === 'login' && mfaSeed && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-400">Abre tu aplicación autenticadora e ingresa el código temporal.</p>
                <input value={mfaCode} onChange={(e)=>setMfaCode(e.target.value.replace(/\D/g,'').slice(0,10))} onKeyDown={(e)=>{if(e.key==='Enter')void doMfa();}} inputMode="numeric" autoComplete="one-time-code" className={inputClass + ' text-center text-xl tracking-[0.2em]'} placeholder="000000"/>
                <div className="flex gap-2">
                  <button onClick={()=>{setMfaSeed(null);setMfaCode('');setMessage('');}} className="flex-1 rounded-lg border border-[#334155] px-3 py-2.5 text-xs font-semibold text-slate-300">Cancelar</button>
                  <button onClick={()=>void doMfa()} disabled={busy} className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">Verificar y entrar</button>
                </div>
              </div>
            )}

            {mode === 'request' && (
              <div className="space-y-3">
                <button onClick={()=>{setMode('login');setMessage('');}} className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5"/>Volver</button>
                {!requestSent ? (
                  <>
                    <Field label="Nombre completo"><input value={requestForm.fullName} onChange={(e)=>setRequestForm({...requestForm,fullName:e.target.value})} className={inputClass}/></Field>
                    <Field label="Correo"><input type="email" value={requestForm.email} onChange={(e)=>setRequestForm({...requestForm,email:e.target.value})} className={inputClass}/></Field>
                    <Field label="Teléfono"><input value={requestForm.phone} onChange={(e)=>setRequestForm({...requestForm,phone:e.target.value})} className={inputClass}/></Field>
                    <Field label="Cargo o institución"><input value={requestForm.position} onChange={(e)=>setRequestForm({...requestForm,position:e.target.value})} className={inputClass}/></Field>
                    <Field label="Tipo de acceso"><select value={requestForm.requestedRole} onChange={(e)=>setRequestForm({...requestForm,requestedRole:e.target.value as 'consulta'|'editor'})} className={inputClass}><option value="consulta">Consulta · solo lectura</option><option value="editor">Editor · registrar y actualizar</option></select></Field>
                    <button onClick={()=>void sendAccessRequest()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><UserPlus className="h-4 w-4"/>{busy?'Enviando…':'Enviar solicitud'}</button>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-3 text-xs text-emerald-200"><CheckCircle2 className="mr-1 inline h-4 w-4"/>Solicitud registrada para <strong>{requestForm.email}</strong>.</div>
                    <Field label="Código personal"><input value={requestForm.inviteCode} onChange={(e)=>setRequestForm({...requestForm,inviteCode:e.target.value.toUpperCase().slice(0,12)})} className={inputClass + ' font-mono tracking-widest'} maxLength={12}/></Field>
                    <Field label="Crear contraseña"><input type="password" autoComplete="new-password" value={requestForm.password} onChange={(e)=>setRequestForm({...requestForm,password:e.target.value})} className={inputClass}/></Field>
                    <p className="text-[11px] leading-relaxed text-slate-500">Mínimo 12 caracteres y al menos tres grupos entre mayúsculas, minúsculas, números y símbolos.</p>
                    <button onClick={()=>void registerAccess()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><KeyRound className="h-4 w-4"/>{busy?'Creando…':'Confirmar código y crear acceso'}</button>
                  </>
                )}
              </div>
            )}

            {mode === 'recovery' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Crea una contraseña nueva para la sesión de recuperación abierta desde tu correo.</p>
                <Field label="Nueva contraseña"><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password" className={inputClass}/></Field>
                <Field label="Confirmar contraseña"><input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} autoComplete="new-password" className={inputClass}/></Field>
                <button onClick={()=>void updatePassword()} disabled={busy} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy?'Actualizando…':'Actualizar contraseña'}</button>
              </div>
            )}

            {message && <div aria-live="polite" className="mt-4 rounded-lg border border-[#2a3a50] bg-[#0b1220] p-3 text-xs leading-relaxed text-slate-300">{message}</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

const Field: React.FC<{label:string;children:React.ReactNode}> = ({label,children}) => (
  <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-300">{label}</span>{children}</label>
);
