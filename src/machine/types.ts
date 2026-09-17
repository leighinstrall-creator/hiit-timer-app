/**
 * Workout domain types.
 *
 * This module is framework-agnostic: nothing here imports React or React
 * Native, so the machine can be unit-tested without rendering.
 */

/**
 * The phases a workout moves through.
 *
 * Sequence (see `nextPosition` in `machine.ts`):
 *
 *   idle
 *     -> getReady
 *     -> for each cycle:
 *          warmup
 *          for each set: exercise -> rest
 *          recovery        (between cycles only, not after the last)
 *     -> cooldown
 *     -> complete
 */
export type Phase =
  | 'idle'
  | 'getReady'
  | 'warmup'
  | 'exercise'
  | 'rest'
  | 'recovery'
  | 'cooldown'
  | 'complete';

/** Phases that count down and can be paused, skipped or ticked through. */
export type TimedPhase = Exclude<Phase, 'idle' | 'complete'>;

/**
 * A workout's configuration.
 *
 * Durations are milliseconds. `warmup` and `recovery` default to zero, which
 * reduces the sequence to getReady -> (exercise/rest) x sets -> cooldown.
 */
export interface WorkoutConfig {
  readonly initialCountdownMs: number;
  readonly warmupMs: number;
  readonly exerciseMs: number;
  readonly restMs: number;
  readonly sets: number;
  readonly recoveryMs: number;
  readonly cycles: number;
  readonly cooldownMs: number;
}

/** Where in the workout we are, independent of the clock. */
export interface Position {
  readonly phase: Phase;
  /** Zero-based index of the current cycle. */
  readonly cycleIndex: number;
  /** Zero-based index of the current set within the cycle. */
  readonly setIndex: number;
}

/**
 * The machine's complete state.
 *
 * Remaining time is never stored — it is always derived from
 * `phaseStartedAt + phaseDurationMs - now`, so the machine cannot drift.
 * While paused, `pausedRemainingMs` freezes what was left; resuming rebases
 * `phaseStartedAt` so the phase continues rather than restarting.
 */
export interface WorkoutState extends Position {
  /** Wall-clock timestamp (ms) at which the current phase began. */
  readonly phaseStartedAt: number;
  /** Duration of the current phase in ms. */
  readonly phaseDurationMs: number;
  /** Frozen remaining ms while paused; `null` when running. */
  readonly pausedRemainingMs: number | null;
  /** Number of workouts finished this session. */
  readonly completedWorkouts: number;
}

/** Events the machine accepts. */
export type WorkoutEvent =
  | { readonly type: 'START' }
  | { readonly type: 'TICK' }
  | { readonly type: 'PAUSE' }
  | { readonly type: 'RESUME' }
  | { readonly type: 'SKIP' }
  | { readonly type: 'RESTART' }
  | { readonly type: 'EXIT' };
