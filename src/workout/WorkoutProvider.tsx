import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { clampConfig, DEFAULT_CONFIG, initialState, reduce } from '@/machine/machine';
import { isRunning, isTimedPhase } from '@/machine/selectors';
import type { WorkoutConfig, WorkoutEvent, WorkoutState } from '@/machine/types';

import {
  requestBoundaryNotificationPermission,
  useBoundaryNotifications,
} from './useBoundaryNotifications';
import { useCues } from './useCues';

/**
 * Rendering cadence.
 *
 * This drives repainting only. Correctness comes from the timestamp arithmetic
 * inside the machine, so a late or dropped tick changes what is on screen for a
 * moment but never what the workout state is.
 */
const DISPLAY_TICK_MS = 100;

interface WorkoutContextValue {
  readonly state: WorkoutState;
  readonly config: WorkoutConfig;
  /** The clock reading the current render is derived from. */
  readonly now: number;
  readonly setConfig: (next: WorkoutConfig) => void;
  /** Audio cues silenced. Independent of haptics. */
  readonly muted: boolean;
  readonly setMuted: (next: boolean) => void;
  readonly hapticsEnabled: boolean;
  readonly setHapticsEnabled: (next: boolean) => void;
  readonly start: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly skip: () => void;
  readonly restart: () => void;
  readonly exit: () => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<WorkoutConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<WorkoutState>(initialState);
  const [now, setNow] = useState<number>(() => Date.now());
  const [muted, setMuted] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // The machine is pure, so the reducer needs the configuration passed in. A
  // ref keeps `send` stable without going stale.
  const configRef = useRef(config);
  configRef.current = config;

  const send = useCallback((event: WorkoutEvent) => {
    const at = Date.now();
    setNow(at);
    setState((current) => reduce(current, event, configRef.current, at));
  }, []);

  const running = isRunning(state);

  // Display tick. Only runs while the workout is actually running, so a paused
  // or finished workout costs nothing.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => send({ type: 'TICK' }), DISPLAY_TICK_MS);
    return () => clearInterval(id);
  }, [running, send]);

  // Returning to the foreground recomputes from timestamps. The machine
  // fast-forwards through every phase that elapsed while we were away, so this
  // lands on the correct current phase rather than merely the next one.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') send({ type: 'TICK' });
    });
    return () => subscription.remove();
  }, [send]);

  // Keep the screen awake for the duration of an active workout, including
  // while paused — a paused workout is still in progress.
  const workoutInProgress = isTimedPhase(state.phase);
  useEffect(() => {
    if (!workoutInProgress) return;
    void activateKeepAwakeAsync().catch(() => {
      // Keeping the screen awake is a convenience, never a requirement.
    });
    return () => {
      try {
        deactivateKeepAwake();
      } catch {
        // The lock may already have been released; nothing to recover from.
      }
    };
  }, [workoutInProgress]);

  useCues(state, now, { muted, hapticsEnabled });
  useBoundaryNotifications(state, config, true);

  const setConfig = useCallback((next: WorkoutConfig) => {
    setConfigState(clampConfig(next));
  }, []);

  // Asked for when a workout starts, so the prompt has a visible reason.
  const start = useCallback(() => {
    void requestBoundaryNotificationPermission();
    send({ type: 'START' });
  }, [send]);

  const value = useMemo<WorkoutContextValue>(
    () => ({
      state,
      config,
      now,
      setConfig,
      muted,
      setMuted,
      hapticsEnabled,
      setHapticsEnabled,
      start,
      pause: () => send({ type: 'PAUSE' }),
      resume: () => send({ type: 'RESUME' }),
      skip: () => send({ type: 'SKIP' }),
      restart: () => send({ type: 'RESTART' }),
      exit: () => send({ type: 'EXIT' }),
    }),
    [state, config, now, setConfig, send, start, muted, hapticsEnabled],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout(): WorkoutContextValue {
  const value = useContext(WorkoutContext);
  if (value === null) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return value;
}
