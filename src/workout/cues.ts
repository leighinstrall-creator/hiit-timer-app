import type { Phase } from '@/machine/types';

/** The distinct cues a workout can play. */
export type CueName = 'tick' | 'getReady' | 'exercise' | 'rest' | 'cooldown' | 'complete';

/**
 * Cue audio.
 *
 * The design specifies no sound beyond "short beep" for the final three
 * seconds (annotation on nodes 0:4 and 0:195), so these are synthesised tones.
 * See `tools/generate-cues.py`, which produces them and documents the shapes.
 */
export const CUE_SOURCES: Record<CueName, number> = {
  tick: require('../../assets/audio/tick.wav') as number,
  getReady: require('../../assets/audio/get-ready.wav') as number,
  exercise: require('../../assets/audio/exercise.wav') as number,
  rest: require('../../assets/audio/rest.wav') as number,
  cooldown: require('../../assets/audio/cooldown.wav') as number,
  complete: require('../../assets/audio/complete.wav') as number,
};

/**
 * Which cue announces entering a phase.
 *
 * Warmup and recovery have no design of their own, so they borrow the cue of
 * the phase they function as: warmup is work, recovery is rest.
 */
export function cueForPhase(phase: Phase): CueName | null {
  switch (phase) {
    case 'getReady':
      return 'getReady';
    case 'warmup':
    case 'exercise':
      return 'exercise';
    case 'rest':
    case 'recovery':
      return 'rest';
    case 'cooldown':
      return 'cooldown';
    case 'complete':
      return 'complete';
    case 'idle':
      return null;
  }
}
