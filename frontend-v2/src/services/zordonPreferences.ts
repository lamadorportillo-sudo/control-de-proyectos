export type ZordonWalkingSpeed = 'suave' | 'normal' | 'rapido';
export type ZordonFigureSize = 'compacto' | 'normal' | 'amplio';
export type ZordonDock = 'izquierda' | 'derecha';
export type ZordonPosition = { left: number; top: number };

export interface ZordonPreferences {
  /** ZORDON sigue visible; este ajuste solo controla reubicaciones automáticas necesarias. */
  autonomousMovement: boolean;
  /** Permite que adopte temporalmente la postura de revisión de planos. */
  deskMode: boolean;
  /** Se aparta si cubre botones, campos, menús o acciones importantes. */
  avoidControls: boolean;
  walkingSpeed: ZordonWalkingSpeed;
  /** Segundos de inactividad general antes de entrar en modo trabajo. */
  workDelaySeconds: number;
  /** Duración orientativa del modo trabajo antes de volver a atención. */
  workDurationSeconds: number;
  figureSize: ZordonFigureSize;
  /** Lado al que vuelve al usar “Reubicar ahora”. */
  preferredDock: ZordonDock;
}

interface ZordonStoreV3 {
  version: 3;
  preferences: ZordonPreferences;
  position: ZordonPosition | null;
}

export const ZORDON_STORAGE_KEY = 'halu.zordon.v2';
/** Conservado para listeners existentes: ahora apunta al almacén versionado único. */
export const ZORDON_PREFERENCES_KEY = ZORDON_STORAGE_KEY;
/** Clave anterior, solo para migración; no escribir datos nuevos aquí. */
export const ZORDON_POSITION_KEY = 'control-contractual:zordon-position:v3';
export const ZORDON_PREFERENCES_EVENT = 'cc:zordon-preferences-changed';
export const ZORDON_POSITION_EVENT = 'cc:zordon-position-changed';
export const ZORDON_REPOSITION_EVENT = 'cc:zordon-reposition-requested';

const LEGACY_PREFERENCES_KEY = 'control-contractual:zordon-preferences:v1';

export const defaultZordonPreferences: ZordonPreferences = {
  autonomousMovement: false,
  deskMode: false,
  avoidControls: false,
  walkingSpeed: 'normal',
  workDelaySeconds: 120,
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

const validPosition = (value: unknown): value is ZordonPosition => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ZordonPosition>;
  return Number.isFinite(candidate.left) && Number.isFinite(candidate.top);
};

export function normalizeZordonPreferences(value: unknown): ZordonPreferences {
  const saved = value && typeof value === 'object' ? value as Partial<ZordonPreferences> : {};
  return {
    // MODO ESTABLE: ZORDON no puede reubicarse solo. Se conserva únicamente
    // el arrastre manual y la reubicación explícita solicitada por el usuario.
    autonomousMovement: false,
    deskMode: false,
    avoidControls: false,
    walkingSpeed: isOneOf(saved.walkingSpeed, walkingSpeeds) ? saved.walkingSpeed : defaultZordonPreferences.walkingSpeed,
    workDelaySeconds: inRange(saved.workDelaySeconds, defaultZordonPreferences.workDelaySeconds, 30, 600, 30),
    workDurationSeconds: inRange(saved.workDurationSeconds, defaultZordonPreferences.workDurationSeconds, 6, 30, 1),
    figureSize: isOneOf(saved.figureSize, figureSizes) ? saved.figureSize : defaultZordonPreferences.figureSize,
    preferredDock: isOneOf(saved.preferredDock, docks) ? saved.preferredDock : defaultZordonPreferences.preferredDock,
  };
}

function defaultStore(): ZordonStoreV3 {
  return { version: 3, preferences: { ...defaultZordonPreferences }, position: null };
}

function readStore(): ZordonStoreV3 {
  if (typeof window === 'undefined') return defaultStore();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ZORDON_STORAGE_KEY) || 'null');
    if (parsed && typeof parsed === 'object' && Number((parsed as any).version) === 3) {
      return {
        version: 3,
        preferences: normalizeZordonPreferences((parsed as any).preferences),
        position: validPosition((parsed as any).position) ? { ...(parsed as any).position } : null,
      };
    }

    // Migración V2 -> V3: conserva tamaño, lado, pausas y posición,
    // pero desactiva el desplazamiento autónomo que podía hacer que
    // ZORDON cruzara la pantalla al detectar controles cercanos.
    if (parsed && typeof parsed === 'object' && Number((parsed as any).version) === 2) {
      const previous = normalizeZordonPreferences((parsed as any).preferences);
      const migrated: ZordonStoreV3 = {
        version: 3,
        preferences: {
          ...previous,
          autonomousMovement: false,
          avoidControls: false,
        },
        position: validPosition((parsed as any).position) ? { ...(parsed as any).position } : null,
      };
      try {
        window.localStorage.setItem(ZORDON_STORAGE_KEY, JSON.stringify(migrated));
      } catch {
        // La interfaz funciona aunque localStorage esté bloqueado.
      }
      return migrated;
    }
  } catch {
    // Se recupera con valores seguros.
  }

  let preferences = { ...defaultZordonPreferences };
  let position: ZordonPosition | null = null;
  try {
    preferences = normalizeZordonPreferences(JSON.parse(window.localStorage.getItem(LEGACY_PREFERENCES_KEY) || 'null'));
  } catch {
    preferences = { ...defaultZordonPreferences };
  }
  try {
    const legacyPosition = JSON.parse(window.localStorage.getItem(ZORDON_POSITION_KEY) || 'null');
    if (validPosition(legacyPosition)) position = { ...legacyPosition };
  } catch {
    position = null;
  }

  const migrated: ZordonStoreV3 = { version: 3, preferences: { ...preferences, autonomousMovement: false, avoidControls: false }, position };
  try {
    window.localStorage.setItem(ZORDON_STORAGE_KEY, JSON.stringify(migrated));
  } catch {
    // La interfaz funciona aunque el navegador bloquee localStorage.
  }
  return migrated;
}

function writeStore(store: ZordonStoreV3): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ZORDON_STORAGE_KEY, JSON.stringify(store));
    // Compatibilidad temporal con la V1/V3 mientras toda la plataforma migra al almacén unificado.
    window.localStorage.setItem(LEGACY_PREFERENCES_KEY, JSON.stringify(store.preferences));
    if (store.position) {
      window.localStorage.setItem(ZORDON_POSITION_KEY, JSON.stringify(store.position));
    } else {
      window.localStorage.removeItem(ZORDON_POSITION_KEY);
    }
  } catch {
    // La interfaz se mantiene funcional aun sin almacenamiento local.
  }
}

export function readZordonPreferences(): ZordonPreferences {
  return readStore().preferences;
}

export function saveZordonPreferences(next: ZordonPreferences): ZordonPreferences {
  const preferences = normalizeZordonPreferences(next);
  if (typeof window === 'undefined') return preferences;
  const current = readStore();
  writeStore({ ...current, version: 3, preferences });
  window.dispatchEvent(new CustomEvent<ZordonPreferences>(ZORDON_PREFERENCES_EVENT, { detail: preferences }));
  return preferences;
}

export function readZordonPosition(): ZordonPosition | null {
  const position = readStore().position;
  return position ? { ...position } : null;
}

export function saveZordonPosition(position: ZordonPosition | null): ZordonPosition | null {
  if (typeof window === 'undefined') return position;
  const current = readStore();
  const safePosition = validPosition(position) ? { left: Number(position.left), top: Number(position.top) } : null;
  writeStore({ ...current, version: 3, position: safePosition });
  window.dispatchEvent(new CustomEvent<ZordonPosition | null>(ZORDON_POSITION_EVENT, { detail: safePosition }));
  return safePosition;
}

export function resetZordonPreferences(): ZordonPreferences {
  return saveZordonPreferences(defaultZordonPreferences);
}

export function requestZordonReposition(): void {
  if (typeof window === 'undefined') return;
  saveZordonPosition(null);
  window.dispatchEvent(new Event(ZORDON_REPOSITION_EVENT));
}
