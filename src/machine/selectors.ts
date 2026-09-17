import { durationFor, nextPosition } from './machine';
import type { Phase, Position, TimedPhase, WorkoutConfig, WorkoutState } from './types';

/** Milliseconds left in the current phase. Always derived, never accumulated. */
export function remainingMs(state: WorkoutState, now: number): number {
  if (state.phase === 'idle' || state.phase === 'complete') return 0;
  if (state.pausedRemainingMs !== null) return state.pausedRemainingMs;
  const remaining = state.phaseStartedAt + state.phaseDurationMs - now;
  return Math.min(state.phaseDurationMs, Math.max(0, remaining));
}

/**
 * Whole seconds left, rounded up.
 *
 * A 30s phase therefore reads "30" the instant it starts and "1" through its
 * final second, reaching "0" exactly at the boundary.
 */
export function remainingSeconds(state: WorkoutState, now: number): number {
  return Math.ceil(remainingMs(state, now) / 1000);
}

/** Fraction of the current phase already elapsed, 0..1. */
export function phaseProgress(state: WorkoutState, now: number): number {
  if (state.phaseDurationMs <= 0) return 1;
  return 1 - remainingMs(state, now) / state.phaseDurationMs;
}

/** `mm:ss`, zero-padded. Durations of an hour or more keep counting in minutes. */
export function formatMmSs(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Total length of a whole workout, used for the "Total time" info row. */
export function totalWorkoutMs(config: WorkoutConfig): number {
  const setPair = config.exerciseMs + config.restMs;
  const perCycle = config.warmupMs + config.sets * setPair;
  const betweenCycles = Math.max(0, config.cycles - 1) * config.recoveryMs;
  return config.initialCountdownMs + config.cycles * perCycle + betweenCycles + config.cooldownMs;
}

/**
 * Milliseconds left in the entire workout.
 *
 * Walks the remaining phases rather than deriving a closed form: the sequence
 * is short (two phases per set) and walking it cannot drift out of step with
 * `nextPosition` the way a parallel formula could. Callers that tick at display
 * rate should memoise on the position rather than recomputing every frame.
 */
export function totalRemainingMs(
  state: WorkoutState,
  config: WorkoutConfig,
  now: number,
): number {
  if (state.phase === 'idle') return totalWorkoutMs(config);
  if (state.phase === 'complete') return 0;

  let total = remainingMs(state, now);
  let position: Position = state;

  while (position.phase !== 'complete') {
    position = nextPosition(position, config);
    total += durationFor(position.phase, config);
  }

  return total;
}

/** Phases that show a countdown and accept the transport controls. */
export function isTimedPhase(phase: Phase): phase is TimedPhase {
  return phase !== 'idle' && phase !== 'complete';
}

/** True when the workout is running rather than idle, paused or finished. */
export function isRunning(state: WorkoutState): boolean {
  return isTimedPhase(state.phase) && state.pausedRemainingMs === null;
}

/** One-based set position, for "Sets 3/10" style readouts. */
export function setNumber(state: WorkoutState): number {
  return state.setIndex + 1;
}

/** One-based cycle position. */
export function cycleNumber(state: WorkoutState): number {
  return state.cycleIndex + 1;
}

/** Human-readable phase name, matching the Figma subtitles. */
export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'idle':
      return 'Ready';
    case 'getReady':
      return 'Get ready';
    case 'warmup':
      return 'Warmup';
    case 'exercise':
      return 'Exercise';
    case 'rest':
      return 'Rest';
    case 'recovery':
      return 'Recovery';
    case 'cooldown':
      return 'Cooldown';
    case 'complete':
      return 'Complete';
  }
}

/**
 * A duration spoken the way a person would say it.
 *
 * Screen readers announce "01:30" as "one thirty" or "one colon three zero",
 * neither of which is a duration. This produces "1 minute 30 seconds".
 */
export function spokenDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  if (seconds > 0 || minutes === 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  return parts.join(' ');
}

/** A phase boundary in the future: which phase begins, and when. */
export interface UpcomingBoundary {
  readonly phase: Phase;
  /** Wall-clock timestamp (ms) at which the phase begins. */
  readonly at: number;
}

/**
 * Every phase change still ahead of the workout, with its wall-clock time.
 *
 * Used to schedule local notifications before the app is backgrounded, so the
 * OS announces transitions even when the process is suspended. Kept pure and
 * clock-injected like the rest of the machine, so it is testable.
 *
 * A paused workout has no scheduled future, so this returns nothing.
 */
export function upcomingBoundaries(
  state: WorkoutState,
  config: WorkoutConfig,
  now: number,
  limit: number,
): UpcomingBoundary[] {
  if (!isTimedPhase(state.phase) || state.pausedRemainingMs !== null) return [];

  const boundaries: UpcomingBoundary[] = [];
  let at = state.phaseStartedAt + state.phaseDurationMs;
  let position: Position = state;

  while (boundaries.length < limit) {
    position = nextPosition(position, config);

    if (position.phase === 'complete') {
      if (at > now) boundaries.push({ phase: position.phase, at });
      break;
    }

    // A zero-length phase ends the instant it begins and never becomes the
    // current phase, so there is no transition to announce; the clock does not
    // advance either.
    const duration = durationFor(position.phase, config);
    if (duration === 0) continue;

    if (at > now) boundaries.push({ phase: position.phase, at });
    at += duration;
  }

  return boundaries;
}
