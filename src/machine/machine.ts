import type { Phase, Position, WorkoutConfig, WorkoutEvent, WorkoutState } from './types';

/**
 * The workout state machine.
 *
 * Pure and deterministic: `reduce` takes the clock as an argument and never
 * calls `Date.now()` itself, so tests drive it with a fake clock.
 *
 * Correctness comes from timestamp arithmetic, never from counting ticks. A
 * phase knows when it started and how long it lasts; everything else is
 * derived. That is what makes fast-forwarding after the app was backgrounded
 * the same code path as an ordinary tick.
 */

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;

/** Bounds enforced on every configuration change. */
export const LIMITS = {
  /** A duration picker spans 00:00 to 59:59. */
  maxDurationMs: 59 * MINUTE_MS + 59 * SECOND_MS,
  /**
   * Exercise is the only interval that may not be zero: a workout of
   * zero-length exercises has nothing to count down.
   */
  minExerciseMs: SECOND_MS,
  minCount: 1,
  maxCount: 99,
} as const;

/** The defaults shown in the Figma Settings screen (node 0:70). */
export const DEFAULT_CONFIG: WorkoutConfig = {
  initialCountdownMs: 30 * SECOND_MS,
  warmupMs: 0,
  exerciseMs: 30 * SECOND_MS,
  restMs: 30 * SECOND_MS,
  sets: 10,
  recoveryMs: 0,
  cycles: 1,
  cooldownMs: 1 * MINUTE_MS,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value)));

/** Force a configuration into its permitted bounds. */
export function clampConfig(config: WorkoutConfig): WorkoutConfig {
  return {
    initialCountdownMs: clamp(config.initialCountdownMs, 0, LIMITS.maxDurationMs),
    warmupMs: clamp(config.warmupMs, 0, LIMITS.maxDurationMs),
    exerciseMs: clamp(config.exerciseMs, LIMITS.minExerciseMs, LIMITS.maxDurationMs),
    restMs: clamp(config.restMs, 0, LIMITS.maxDurationMs),
    sets: clamp(config.sets, LIMITS.minCount, LIMITS.maxCount),
    recoveryMs: clamp(config.recoveryMs, 0, LIMITS.maxDurationMs),
    cycles: clamp(config.cycles, LIMITS.minCount, LIMITS.maxCount),
    cooldownMs: clamp(config.cooldownMs, 0, LIMITS.maxDurationMs),
  };
}

/** How long a phase lasts under a given configuration. */
export function durationFor(phase: Phase, config: WorkoutConfig): number {
  switch (phase) {
    case 'getReady':
      return config.initialCountdownMs;
    case 'warmup':
      return config.warmupMs;
    case 'exercise':
      return config.exerciseMs;
    case 'rest':
      return config.restMs;
    case 'recovery':
      return config.recoveryMs;
    case 'cooldown':
      return config.cooldownMs;
    case 'idle':
    case 'complete':
      return 0;
  }
}

/**
 * The next position in the sequence.
 *
 * Rest runs after every exercise, including a cycle's final set. Recovery runs
 * between cycles only — never after the last one, which goes straight to
 * cooldown.
 */
export function nextPosition(current: Position, config: WorkoutConfig): Position {
  const { phase, cycleIndex, setIndex } = current;

  switch (phase) {
    case 'idle':
      return { phase: 'getReady', cycleIndex: 0, setIndex: 0 };
    case 'getReady':
      return { phase: 'warmup', cycleIndex: 0, setIndex: 0 };
    case 'warmup':
      return { phase: 'exercise', cycleIndex, setIndex: 0 };
    case 'exercise':
      return { phase: 'rest', cycleIndex, setIndex };
    case 'rest':
      if (setIndex + 1 < config.sets) {
        return { phase: 'exercise', cycleIndex, setIndex: setIndex + 1 };
      }
      if (cycleIndex + 1 < config.cycles) {
        return { phase: 'recovery', cycleIndex, setIndex };
      }
      return { phase: 'cooldown', cycleIndex, setIndex };
    case 'recovery':
      return { phase: 'warmup', cycleIndex: cycleIndex + 1, setIndex: 0 };
    case 'cooldown':
      return { phase: 'complete', cycleIndex, setIndex };
    case 'complete':
      return current;
  }
}

/** The state at the very start, before a workout has been started. */
export function initialState(): WorkoutState {
  return {
    phase: 'idle',
    cycleIndex: 0,
    setIndex: 0,
    phaseStartedAt: 0,
    phaseDurationMs: 0,
    pausedRemainingMs: null,
    completedWorkouts: 0,
  };
}

/** Enter a position at a given instant, preserving session counters. */
function enter(
  position: Position,
  startedAt: number,
  config: WorkoutConfig,
  previous: WorkoutState,
): WorkoutState {
  const justCompleted = position.phase === 'complete' && previous.phase !== 'complete';
  return {
    ...position,
    phaseStartedAt: startedAt,
    phaseDurationMs: durationFor(position.phase, config),
    pausedRemainingMs: null,
    completedWorkouts: previous.completedWorkouts + (justCompleted ? 1 : 0),
  };
}

/**
 * Consume every phase that has already elapsed at `now`.
 *
 * Each phase begins exactly at the previous phase's boundary, never at `now`,
 * so no time is lost however long the app was backgrounded. Zero-duration
 * phases end at the instant they begin and are therefore consumed here without
 * ever becoming the visible phase. The sequence is finite, so this terminates.
 */
function fastForward(state: WorkoutState, config: WorkoutConfig, now: number): WorkoutState {
  let current = state;

  while (current.phase !== 'complete' && current.phase !== 'idle') {
    const endsAt = current.phaseStartedAt + current.phaseDurationMs;
    if (now < endsAt) break;
    current = enter(nextPosition(current, config), endsAt, config, current);
  }

  return current;
}

/**
 * Apply an event.
 *
 * @param state  current state
 * @param event  what happened
 * @param config the workout's configuration
 * @param now    the caller's clock reading, in ms
 */
export function reduce(
  state: WorkoutState,
  event: WorkoutEvent,
  config: WorkoutConfig,
  now: number,
): WorkoutState {
  switch (event.type) {
    case 'START': {
      if (state.phase !== 'idle') return state;
      const started = enter({ phase: 'getReady', cycleIndex: 0, setIndex: 0 }, now, config, state);
      return fastForward(started, config, now);
    }

    case 'TICK': {
      if (state.pausedRemainingMs !== null) return state;
      return fastForward(state, config, now);
    }

    case 'PAUSE': {
      if (state.pausedRemainingMs !== null) return state;
      if (state.phase === 'idle' || state.phase === 'complete') return state;
      const remaining = Math.max(0, state.phaseStartedAt + state.phaseDurationMs - now);
      return { ...state, pausedRemainingMs: remaining };
    }

    case 'RESUME': {
      if (state.pausedRemainingMs === null) return state;
      const rebased: WorkoutState = {
        ...state,
        phaseStartedAt: now - (state.phaseDurationMs - state.pausedRemainingMs),
        pausedRemainingMs: null,
      };
      return fastForward(rebased, config, now);
    }

    case 'SKIP': {
      if (state.phase === 'idle' || state.phase === 'complete') return state;
      const advanced = enter(nextPosition(state, config), now, config, state);
      const settled = fastForward(advanced, config, now);
      // Skipping while paused lands on the next phase and stays paused.
      if (state.pausedRemainingMs !== null && settled.phase !== 'complete') {
        return { ...settled, pausedRemainingMs: settled.phaseDurationMs };
      }
      return settled;
    }

    case 'RESTART': {
      const restarted = enter(
        { phase: 'getReady', cycleIndex: 0, setIndex: 0 },
        now,
        config,
        state,
      );
      return fastForward(restarted, config, now);
    }

    case 'EXIT':
      return { ...initialState(), completedWorkouts: state.completedWorkouts };
  }
}
