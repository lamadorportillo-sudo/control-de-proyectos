export type ZordonWalkingSpeed = 'suave' | 'normal' | 'rapido';
export type ZordonFigureSize = 'compacto' | 'normal' | 'amplio';
export type ZordonDock = 'izquierda' | 'derecha';

export interface ZordonPreferences {
  /** ZORDON sigue visible; este ajuste solo controla sus desplazamientos automáticos. */
  autonomousMovement: boolean;
  /** Permite que se siente temporalmente a revisar planos. */
  deskMode: boolean;
  /** Antes de caminar, busca alejarse de botones, campos y enlaces cercanos. */
  avoidControls: boolean;
  walkingSpeed: ZordonWalkingSpeed;
  /** Segundos sin interacción con ZORDON antes de iniciar una pausa de planos. */
  workDelaySeconds: number;
  /** Tiempo que permanece en la mesa de trabajo. */
  workDurationSeconds: number;
  figureSize: ZordonFigureSize;
  /** Lado al que vuelve al usar “Reubicar ahora”. */
  preferredDock: ZordonDock;
}

export const ZORDON_PREFERENCES_KEY = 'control-contractual:zordon-preferences:v1';
export const ZORDON_POSITION_KEY = 'control-contractual:zordon-position:v3';
export const ZORDON_PREFERENCES_EVENT = 'cc:zordon-preferences-changed';
export const ZORDON_REPOSITION_EVENT = 'cc:zordon-reposition-requested';

export const defaultZordonPreferences: ZordonPreferences = {
  autonomousMovement: true,
  deskMode: true,
  avoidControls: true,
  walkingSpeed: 'normal',
  workDelaySeconds: 26,
  workDurationSeconds: 12,
  figureSize: 'normal',
  preferredDock: 'derecha',
};

const walkingSpeeds: ZordonWalkingSpeed[] = ['suave', 'normal', 'rapido'];
const figureSizes: ZordonFigureSize[] = ['compacto', 'normal', 'amplio'];
const docks: ZordonDock[] = ['izquierda', 'derecha'];

const isOneOf = <T extends string>(value: unknown, options: T[]): value is T => (
  typeof value === 'string' && options.includes(value as T)
);

const inRange = (value: unknown, fallback: number, min: number, max: number, step: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value / step) * step;
  return Math.max(min, Math.min(max, rounded));
};

export function normalizeZordonPreferences(value: unknown): ZordonPreferences {
  const saved = value && typeof value === 'object' ? value as Partial<ZordonPreferences> : {};

  return {
    autonomousMovement: typeof saved.autonomousMovement === 'boolean' ? saved.autonomousMovement : defaultZordonPreferences.autonomousMovement,
    deskMode: typeof saved.deskMode === 'boolean' ? saved.deskMode : defaultZordonPreferences.deskMode,
    avoidControls: typeof saved.avoidControls === 'boolean' ? saved.avoidControls : defaultZordonPreferences.avoidControls,
    walkingSpeed: isOneOf(saved.walkingSpeed, walkingSpeeds) ? saved.walkingSpeed : defaultZordonPreferences.walkingSpeed,
    workDelaySeconds: inRange(saved.workDelaySeconds, defaultZordonPreferences.workDelaySeconds, 15, 90, 5),
    workDurationSeconds: inRange(saved.workDurationSeconds, defaultZordonPreferences.workDurationSeconds, 6, 30, 1),
    figureSize: isOneOf(saved.figureSize, figureSizes) ? saved.figureSize : defaultZordonPreferences.figureSize,
    preferredDock: isOneOf(saved.preferredDock, docks) ? saved.preferredDock : defaultZordonPreferences.preferredDock,
  };
}

export function readZordonPreferences(): ZordonPreferences {
  if (typeof window === 'undefined') return defaultZordonPreferences;
  try {
    return normalizeZordonPreferences(JSON.parse(window.localStorage.getItem(ZORDON_PREFERENCES_KEY) || 'null'));
  } catch {
    return defaultZordonPreferences;
  }
}

export function saveZordonPreferences(next: ZordonPreferences): ZordonPreferences {
  const preferences = normalizeZordonPreferences(next);
  if (typeof window === 'undefined') return preferences;

  try {
    window.localStorage.setItem(ZORDON_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // La interfaz se mantiene funcional aun si el navegador bloquea el almacenamiento local.
  }
  window.dispatchEvent(new CustomEvent<ZordonPreferences>(ZORDON_PREFERENCES_EVENT, { detail: preferences }));
  return preferences;
}

export function resetZordonPreferences(): ZordonPreferences {
  return saveZordonPreferences(defaultZordonPreferences);
}

export function requestZordonReposition(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ZORDON_POSITION_KEY);
  } catch {
    // La señal sigue permitiendo reubicarlo durante la sesión actual.
  }
  window.dispatchEvent(new Event(ZORDON_REPOSITION_EVENT));
}
