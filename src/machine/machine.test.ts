import {
  clampConfig,
  DEFAULT_CONFIG,
  durationFor,
  initialState,
  LIMITS,
  reduce,
} from './machine';
import {
  formatMmSs,
  isRunning,
  remainingMs,
  remainingSeconds,
  totalRemainingMs,
  totalWorkoutMs,
} from './selectors';
import type { Phase, WorkoutConfig, WorkoutEvent, WorkoutState } from './types';

const S = 1000;

/** A small, fast configuration so sequences stay readable in assertions. */
function config(overrides: Partial<WorkoutConfig> = {}): WorkoutConfig {
  return {
    initialCountdownMs: 5 * S,
    warmupMs: 0,
    exerciseMs: 10 * S,
    restMs: 5 * S,
    sets: 2,
    recoveryMs: 0,
    cycles: 1,
    cooldownMs: 8 * S,
    ...overrides,
  };
}

/**
 * Drives the machine with an explicit clock, exactly as the app does. Nothing
 * here reads the real time, so every test is deterministic.
 */
function driver(cfg: WorkoutConfig, startAt = 1_000_000) {
  let state = initialState();
  let now = startAt;

  return {
    get state(): WorkoutState {
      return state;
    },
    get now(): number {
      return now;
    },
    send(event: WorkoutEvent): WorkoutState {
      state = reduce(state, event, cfg, now);
      return state;
    },
    /** Advance the clock, then tick — the app's 100ms display tick. */
    advance(ms: number): WorkoutState {
      now += ms;
      state = reduce(state, { type: 'TICK' }, cfg, now);
      return state;
    },
    /** Advance the clock WITHOUT ticking, simulating a backgrounded app. */
    sleep(ms: number): void {
      now += ms;
    },
    /** The single tick the app performs when it returns to the foreground. */
    tick(): WorkoutState {
      state = reduce(state, { type: 'TICK' }, cfg, now);
      return state;
    },
    remaining(): number {
      return remainingMs(state, now);
    },
  };
}

/** Collect the phases a workout passes through, in order. */
function phaseSequence(cfg: WorkoutConfig, stepMs = 100): Phase[] {
  const d = driver(cfg);
  d.send({ type: 'START' });
  const seen: Phase[] = [d.state.phase];
  let guard = 0;

  while (d.state.phase !== 'complete' && guard < 100_000) {
    d.advance(stepMs);
    if (d.state.phase !== seen[seen.length - 1]) seen.push(d.state.phase);
    guard += 1;
  }

  return seen;
}

describe('phase sequencing', () => {
  it('walks the full happy path', () => {
    expect(phaseSequence(config())).toEqual([
      'getReady',
      'exercise',
      'rest',
      'exercise',
      'rest',
      'cooldown',
      'complete',
    ]);
  });

  it('handles a single-set, single-cycle workout', () => {
    expect(phaseSequence(config({ sets: 1, cycles: 1 }))).toEqual([
      'getReady',
      'exercise',
      'rest',
      'cooldown',
      'complete',
    ]);
  });

  it('runs warmup once per cycle and recovery only between cycles', () => {
    const cfg = config({ sets: 1, cycles: 3, warmupMs: 3 * S, recoveryMs: 4 * S });
    expect(phaseSequence(cfg)).toEqual([
      'getReady',
      'warmup',
      'exercise',
      'rest',
      'recovery',
      'warmup',
      'exercise',
      'rest',
      'recovery',
      'warmup',
      'exercise',
      'rest',
      'cooldown',
      'complete',
    ]);
  });

  it('reduces to the five-phase workout at the Figma defaults', () => {
    // Warmup and recovery default to zero, so neither should ever appear.
    const seen = phaseSequence(DEFAULT_CONFIG, 5 * S);
    expect(seen).not.toContain('warmup');
    expect(seen).not.toContain('recovery');
    expect(seen).toEqual([
      'getReady',
      ...Array.from({ length: DEFAULT_CONFIG.sets }, () => ['exercise', 'rest']).flat(),
      'cooldown',
      'complete',
    ]);
  });

  it('tracks set and cycle indices across the workout', () => {
    const cfg = config({ sets: 2, cycles: 2, recoveryMs: 2 * S });
    const d = driver(cfg);
    d.send({ type: 'START' });

    const positions: string[] = [];
    let guard = 0;
    let last = '';
    while (d.state.phase !== 'complete' && guard < 10_000) {
      const key = `${d.state.phase} c${d.state.cycleIndex} s${d.state.setIndex}`;
      if (key !== last) {
        positions.push(key);
        last = key;
      }
      d.advance(S);
      guard += 1;
    }

    expect(positions).toEqual([
      'getReady c0 s0',
      'exercise c0 s0',
      'rest c0 s0',
      'exercise c0 s1',
      'rest c0 s1',
      'recovery c0 s1',
      'exercise c1 s0',
      'rest c1 s0',
      'exercise c1 s1',
      'rest c1 s1',
      'cooldown c1 s1',
    ]);
  });

  it('counts a completed workout exactly once', () => {
    const cfg = config({ sets: 1 });
    const d = driver(cfg);
    d.send({ type: 'START' });
    d.advance(10 * 60 * S);
    expect(d.state.phase).toBe('complete');
    expect(d.state.completedWorkouts).toBe(1);

    // Ticking past completion must not inflate the counter.
    d.advance(10 * 60 * S);
    expect(d.state.completedWorkouts).toBe(1);
  });
});

describe('zero-duration phases', () => {
  it('never surfaces a zero-length phase as the current phase', () => {
    const cfg = config({ warmupMs: 0, recoveryMs: 0, cycles: 2, sets: 1 });
    expect(phaseSequence(cfg)).not.toContain('warmup');
    expect(phaseSequence(cfg)).not.toContain('recovery');
  });

  it('skips a zero-length get-ready and starts on exercise', () => {
    const d = driver(config({ initialCountdownMs: 0 }));
    d.send({ type: 'START' });
    expect(d.state.phase).toBe('exercise');
  });

  it('skips a zero-length cooldown and finishes on the last rest', () => {
    const cfg = config({ sets: 1, cooldownMs: 0 });
    const seen = phaseSequence(cfg);
    expect(seen).not.toContain('cooldown');
    expect(seen[seen.length - 1]).toBe('complete');
  });

  it('terminates when every optional duration is zero', () => {
    const cfg = config({
      initialCountdownMs: 0,
      warmupMs: 0,
      restMs: 0,
      recoveryMs: 0,
      cooldownMs: 0,
      exerciseMs: S,
      sets: 3,
      cycles: 2,
    });

    // Every phase but exercise is zero-length, so the workout is nothing but
    // back-to-back exercises. Track positions, since consecutive phases share
    // a name and would otherwise be indistinguishable.
    const d = driver(cfg);
    d.send({ type: 'START' });
    const positions: string[] = [];
    let last = '';
    let guard = 0;
    while (d.state.phase !== 'complete' && guard < 1000) {
      const key = `${d.state.phase} c${d.state.cycleIndex} s${d.state.setIndex}`;
      if (key !== last) {
        positions.push(key);
        last = key;
      }
      d.advance(S);
      guard += 1;
    }

    expect(positions).toEqual([
      'exercise c0 s0',
      'exercise c0 s1',
      'exercise c0 s2',
      'exercise c1 s0',
      'exercise c1 s1',
      'exercise c1 s2',
    ]);
    expect(d.state.phase).toBe('complete');
  });
});

describe('timing accuracy', () => {
  it('derives remaining time from timestamps, not tick count', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    expect(d.remaining()).toBe(5 * S);

    // Ragged, irregular ticks — the sort of thing a dropped frame produces.
    d.advance(37);
    d.advance(113);
    d.advance(9);
    expect(d.remaining()).toBe(5 * S - 159);
  });

  it('does not drift over thousands of irregular ticks', () => {
    const cfg = config({ initialCountdownMs: 600 * S });
    const d = driver(cfg);
    d.send({ type: 'START' });

    for (let i = 0; i < 5000; i += 1) d.advance(97);

    expect(d.remaining()).toBe(600 * S - 5000 * 97);
  });

  it('starts each phase exactly at the previous phase boundary', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    const startedAt = d.state.phaseStartedAt;

    // Tick well past the boundary; the new phase must still be anchored to the
    // boundary itself, not to the late tick.
    d.advance(5 * S + 250);
    expect(d.state.phase).toBe('exercise');
    expect(d.state.phaseStartedAt).toBe(startedAt + 5 * S);
    expect(d.remaining()).toBe(10 * S - 250);
  });

  it('counts display seconds down from the full duration to zero', () => {
    const d = driver(config({ initialCountdownMs: 3 * S }));
    d.send({ type: 'START' });
    expect(remainingSeconds(d.state, d.now)).toBe(3);
    d.advance(999);
    expect(remainingSeconds(d.state, d.now)).toBe(3);
    d.advance(1);
    expect(remainingSeconds(d.state, d.now)).toBe(2);
    d.advance(2 * S - 1);
    expect(remainingSeconds(d.state, d.now)).toBe(1);
  });
});

describe('pause and resume', () => {
  it('freezes remaining time while paused', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.advance(2 * S);
    d.send({ type: 'PAUSE' });
    expect(d.remaining()).toBe(3 * S);

    d.sleep(60 * S);
    d.tick();

    expect(d.state.phase).toBe('getReady');
    expect(d.remaining()).toBe(3 * S);
    expect(isRunning(d.state)).toBe(false);
  });

  it('resumes the phase rather than restarting it', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.advance(2 * S);
    d.send({ type: 'PAUSE' });
    d.sleep(60 * S);
    d.send({ type: 'RESUME' });

    expect(d.remaining()).toBe(3 * S);
    expect(isRunning(d.state)).toBe(true);

    d.advance(3 * S);
    expect(d.state.phase).toBe('exercise');
    expect(d.remaining()).toBe(10 * S);
  });

  it('ignores a pause while already paused, and a resume while running', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.advance(2 * S);
    const paused = d.send({ type: 'PAUSE' });
    d.sleep(5 * S);
    expect(d.send({ type: 'PAUSE' })).toBe(paused);

    d.send({ type: 'RESUME' });
    const running = d.state;
    expect(d.send({ type: 'RESUME' })).toBe(running);
  });

  it('cannot pause when idle or complete', () => {
    const d = driver(config());
    expect(d.send({ type: 'PAUSE' }).phase).toBe('idle');

    d.send({ type: 'START' });
    d.advance(10 * 60 * S);
    expect(d.state.phase).toBe('complete');
    expect(d.send({ type: 'PAUSE' }).pausedRemainingMs).toBeNull();
  });
});

describe('skip', () => {
  it('advances to the next phase at full duration', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.advance(S);
    d.send({ type: 'SKIP' });

    expect(d.state.phase).toBe('exercise');
    expect(d.remaining()).toBe(10 * S);
  });

  it('skips past zero-length phases in one press', () => {
    const cfg = config({ sets: 1, restMs: 0, cooldownMs: 4 * S });
    const d = driver(cfg);
    d.send({ type: 'START' });
    d.send({ type: 'SKIP' }); // getReady -> exercise
    expect(d.state.phase).toBe('exercise');
    d.send({ type: 'SKIP' }); // exercise -> (rest is 0) -> cooldown
    expect(d.state.phase).toBe('cooldown');
  });

  it('stays paused when skipping while paused', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.send({ type: 'PAUSE' });
    d.send({ type: 'SKIP' });

    expect(d.state.phase).toBe('exercise');
    expect(isRunning(d.state)).toBe(false);
    expect(d.remaining()).toBe(10 * S);
  });

  it('completes the workout when skipping the final phase', () => {
    const cfg = config({ sets: 1 });
    const d = driver(cfg);
    d.send({ type: 'START' });
    for (let i = 0; i < 6; i += 1) d.send({ type: 'SKIP' });
    expect(d.state.phase).toBe('complete');
    expect(d.state.completedWorkouts).toBe(1);
  });

  it('is inert when idle or complete', () => {
    const d = driver(config());
    expect(d.send({ type: 'SKIP' }).phase).toBe('idle');
  });
});

describe('backgrounding', () => {
  it('fast-forwards across a single phase boundary', () => {
    const d = driver(config());
    d.send({ type: 'START' });

    // Backgrounded for 7s: get-ready (5s) ends, 2s into exercise.
    d.sleep(7 * S);
    d.tick();

    expect(d.state.phase).toBe('exercise');
    expect(d.remaining()).toBe(8 * S);
  });

  it('fast-forwards across several phase boundaries', () => {
    const d = driver(config());
    d.send({ type: 'START' });

    // 5 + 10 + 5 + 10 = 30s reaches the second rest; 3s further in.
    d.sleep(33 * S);
    d.tick();

    expect(d.state.phase).toBe('rest');
    expect(d.state.setIndex).toBe(1);
    expect(d.remaining()).toBe(2 * S);
  });

  it('lands on the correct phase after backgrounding across whole cycles', () => {
    const cfg = config({ sets: 2, cycles: 3, recoveryMs: 6 * S, warmupMs: 4 * S });
    const d = driver(cfg);
    d.send({ type: 'START' });

    // getReady 5 | cycle0: warmup 4 + (10+5)*2 = 34 | recovery 6  => 45s
    // cycle1: warmup 4 => 49s, then exercise 10 => 59s
    d.sleep(52 * S);
    d.tick();

    expect(d.state.phase).toBe('exercise');
    expect(d.state.cycleIndex).toBe(1);
    expect(d.state.setIndex).toBe(0);
    expect(d.remaining()).toBe(7 * S);
  });

  it('lands on complete when backgrounded past the end', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.sleep(24 * 60 * 60 * S);
    d.tick();

    expect(d.state.phase).toBe('complete');
    expect(d.state.completedWorkouts).toBe(1);
  });

  it('reaches the same state whether ticked continuously or backgrounded', () => {
    const cfg = config({ sets: 3, cycles: 2, recoveryMs: 3 * S, warmupMs: 2 * S });

    const ticked = driver(cfg);
    ticked.send({ type: 'START' });
    for (let i = 0; i < 470; i += 1) ticked.advance(100);

    const backgrounded = driver(cfg);
    backgrounded.send({ type: 'START' });
    backgrounded.sleep(47 * S);
    backgrounded.tick();

    expect(backgrounded.state).toEqual(ticked.state);
  });
});

describe('restart and exit', () => {
  it('restarts from the beginning, keeping the session counter', () => {
    const cfg = config({ sets: 1 });
    const d = driver(cfg);
    d.send({ type: 'START' });
    d.advance(10 * 60 * S);
    expect(d.state.completedWorkouts).toBe(1);

    d.send({ type: 'RESTART' });
    expect(d.state.phase).toBe('getReady');
    expect(d.state.cycleIndex).toBe(0);
    expect(d.state.setIndex).toBe(0);
    expect(d.remaining()).toBe(5 * S);
    expect(d.state.completedWorkouts).toBe(1);
  });

  it('clears a pause on restart', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.send({ type: 'PAUSE' });
    d.send({ type: 'RESTART' });
    expect(isRunning(d.state)).toBe(true);
  });

  it('returns to idle on exit, keeping the session counter', () => {
    const cfg = config({ sets: 1 });
    const d = driver(cfg);
    d.send({ type: 'START' });
    d.advance(10 * 60 * S);
    d.send({ type: 'EXIT' });

    expect(d.state.phase).toBe('idle');
    expect(d.state.completedWorkouts).toBe(1);
  });

  it('ignores START unless idle', () => {
    const d = driver(config());
    d.send({ type: 'START' });
    d.advance(2 * S);
    const running = d.state;
    expect(d.send({ type: 'START' })).toBe(running);
  });
});

describe('configuration bounds', () => {
  it('clamps counts into range', () => {
    expect(clampConfig(config({ sets: 0, cycles: 0 })).sets).toBe(LIMITS.minCount);
    expect(clampConfig(config({ sets: 0, cycles: 0 })).cycles).toBe(LIMITS.minCount);
    expect(clampConfig(config({ sets: 5000, cycles: 5000 })).sets).toBe(LIMITS.maxCount);
    expect(clampConfig(config({ sets: 5000, cycles: 5000 })).cycles).toBe(LIMITS.maxCount);
  });

  it('never allows a zero-length exercise', () => {
    expect(clampConfig(config({ exerciseMs: 0 })).exerciseMs).toBe(LIMITS.minExerciseMs);
    expect(clampConfig(config({ exerciseMs: -1 })).exerciseMs).toBe(LIMITS.minExerciseMs);
  });

  it('allows every other interval to be zero', () => {
    const c = clampConfig(
      config({
        initialCountdownMs: 0,
        warmupMs: 0,
        restMs: 0,
        recoveryMs: 0,
        cooldownMs: 0,
      }),
    );
    expect([c.initialCountdownMs, c.warmupMs, c.restMs, c.recoveryMs, c.cooldownMs]).toEqual([
      0, 0, 0, 0, 0,
    ]);
  });

  it('caps durations at the picker maximum', () => {
    const c = clampConfig(config({ exerciseMs: 99 * 60 * S }));
    expect(c.exerciseMs).toBe(LIMITS.maxDurationMs);
    expect(formatMmSs(LIMITS.maxDurationMs)).toBe('59:59');
  });

  it('runs correctly at the maximum counts', () => {
    const cfg = clampConfig(
      config({ sets: LIMITS.maxCount, cycles: LIMITS.maxCount, exerciseMs: S, restMs: 0 }),
    );
    const d = driver(cfg);
    d.send({ type: 'START' });
    d.sleep(365 * 24 * 60 * 60 * S);
    d.tick();
    expect(d.state.phase).toBe('complete');
  });
});

describe('derived values', () => {
  it('computes the total workout length', () => {
    // 5 getReady + 2 x (10 + 5) + 8 cooldown
    expect(totalWorkoutMs(config())).toBe(43 * S);
  });

  it('includes warmup per cycle and recovery between cycles', () => {
    const cfg = config({ sets: 1, cycles: 3, warmupMs: 2 * S, recoveryMs: 4 * S });
    // 5 + 3 x (2 + 15) + 2 x 4 + 8 = 72
    expect(totalWorkoutMs(cfg)).toBe(72 * S);
  });

  it('counts total remaining time down to zero', () => {
    const cfg = config();
    const d = driver(cfg);
    expect(totalRemainingMs(d.state, cfg, d.now)).toBe(totalWorkoutMs(cfg));

    d.send({ type: 'START' });
    expect(totalRemainingMs(d.state, cfg, d.now)).toBe(totalWorkoutMs(cfg));

    d.advance(20 * S);
    expect(totalRemainingMs(d.state, cfg, d.now)).toBe(totalWorkoutMs(cfg) - 20 * S);

    d.advance(10 * 60 * S);
    expect(totalRemainingMs(d.state, cfg, d.now)).toBe(0);
  });

  it('formats durations as mm:ss', () => {
    expect(formatMmSs(0)).toBe('00:00');
    expect(formatMmSs(9 * S)).toBe('00:09');
    expect(formatMmSs(30 * S)).toBe('00:30');
    expect(formatMmSs(627 * S)).toBe('10:27');
    expect(formatMmSs(-5 * S)).toBe('00:00');
  });

  it('reports phase durations from configuration', () => {
    const cfg = config();
    expect(durationFor('getReady', cfg)).toBe(cfg.initialCountdownMs);
    expect(durationFor('exercise', cfg)).toBe(cfg.exerciseMs);
    expect(durationFor('idle', cfg)).toBe(0);
    expect(durationFor('complete', cfg)).toBe(0);
  });
});
