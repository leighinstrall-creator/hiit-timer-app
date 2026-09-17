import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

import { remainingSeconds } from '@/machine/selectors';
import type { Phase, WorkoutState } from '@/machine/types';

import { CUE_SOURCES, cueForPhase, type CueName } from './cues';

/** The last N seconds of a phase are counted in with a tick — nodes 0:4, 0:195. */
const COUNTDOWN_FROM_SECONDS = 3;

/**
 * Plays a cue on every phase transition, and a tick through the final three
 * seconds of each phase.
 *
 * Audio and haptics are independent: muting silences the sound but leaves the
 * haptics, which is the point of the mute for anyone training somewhere quiet.
 * Every call is wrapped: audio is a nicety, and a device in silent mode, with
 * no audio focus, or with no haptic motor must never take the workout down
 * with it.
 */
export function useCues(
  state: WorkoutState,
  now: number,
  options: { readonly muted: boolean; readonly hapticsEnabled: boolean },
): void {
  const players = useRef<Partial<Record<CueName, AudioPlayer>>>({});
  const previousPhase = useRef<Phase>(state.phase);
  const lastTickSecond = useRef<number | null>(null);

  const { muted, hapticsEnabled } = options;

  // Keep the current values readable from effects that must not re-run when
  // they change: re-subscribing on a mute toggle would replay the cue.
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const hapticsRef = useRef(hapticsEnabled);
  hapticsRef.current = hapticsEnabled;

  // Configure the session once, then create a player per cue and keep it, so a
  // transition plays immediately rather than loading first.
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      // Short cues over whatever the user is listening to: duck, do not stop.
      interruptionMode: 'duckOthers',
      shouldPlayInBackground: true,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => {
      // An unavailable audio session must not break the workout.
    });

    const created: Partial<Record<CueName, AudioPlayer>> = {};
    for (const name of Object.keys(CUE_SOURCES) as CueName[]) {
      try {
        created[name] = createAudioPlayer(CUE_SOURCES[name]);
      } catch {
        // Leave this cue silent rather than failing the rest.
      }
    }
    players.current = created;

    return () => {
      for (const player of Object.values(created)) {
        try {
          player.remove();
        } catch {
          // Already released.
        }
      }
      players.current = {};
    };
  }, []);

  const play = (name: CueName) => {
    if (mutedRef.current) return;
    const player = players.current[name];
    if (player === undefined) return;
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // Silent mode, lost focus, or an unavailable device: skip the sound.
    }
  };

  const vibrate = (style: Haptics.ImpactFeedbackStyle) => {
    if (!hapticsRef.current) return;
    void Haptics.impactAsync(style).catch(() => {
      // No haptic motor, or the OS declined.
    });
  };

  // Phase transitions: the heavier cue.
  useEffect(() => {
    if (state.phase === previousPhase.current) return;
    previousPhase.current = state.phase;
    lastTickSecond.current = null;

    const cue = cueForPhase(state.phase);
    if (cue === null) return;

    play(cue);
    vibrate(
      state.phase === 'complete'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium,
    );
    // `play` and `vibrate` read their inputs through refs, so the cue fires on
    // a phase change and nothing else.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // Count-in over the last three seconds: the lighter cue, once per second.
  const secondsLeft = remainingSeconds(state, now);
  const counting =
    state.pausedRemainingMs === null &&
    state.phase !== 'idle' &&
    state.phase !== 'complete' &&
    secondsLeft > 0 &&
    secondsLeft <= COUNTDOWN_FROM_SECONDS;

  useEffect(() => {
    if (!counting) {
      lastTickSecond.current = null;
      return;
    }
    if (lastTickSecond.current === secondsLeft) return;
    lastTickSecond.current = secondsLeft;

    play('tick');
    vibrate(Haptics.ImpactFeedbackStyle.Light);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting, secondsLeft]);
}
