import { color } from '@/theme/tokens';
import type { Phase } from '@/machine/types';

/**
 * How each phase presents itself.
 *
 * The Figma file draws Get Ready, Exercise, Rest and Cooldown as four separate
 * frames that differ only in background colour and subtitle. Rather than four
 * near-identical screens, the timer route renders one layout and looks its
 * appearance up here, so a phase's presentation stays declarative and the
 * screen stays a thin renderer of machine state.
 */
export interface PhasePresentation {
  /** Screen background — `color/background/*` or `color/state/*`. */
  readonly background: string;
  /** Foreground used for text and icons on that background. */
  readonly foreground: string;
  /** The subtitle shown above the countdown. */
  readonly title: string;
}

const PRESENTATION: Record<Phase, PhasePresentation> = {
  // node 0:42 — background/primary
  idle: {
    background: color.background.primary,
    foreground: color.text.primary,
    title: 'Ready',
  },
  // node 0:3 — background/primary
  getReady: {
    background: color.background.primary,
    foreground: color.text.primary,
    title: 'Get ready',
  },
  // No frame exists for warmup. Rather than borrow another phase's colour and
  // invent visual behaviour, it renders the neutral treatment until one is
  // designed. Same for recovery below.
  warmup: {
    background: color.background.primary,
    foreground: color.text.primary,
    title: 'Warmup',
  },
  // node 0:194 — state/exercise
  exercise: {
    background: color.state.exercise,
    foreground: color.text.primary,
    title: 'Exercise',
  },
  // node 0:233 — state/rest
  rest: {
    background: color.state.rest,
    foreground: color.text.primary,
    title: 'Rest',
  },
  // No frame exists for recovery; see the note on warmup.
  recovery: {
    background: color.background.primary,
    foreground: color.text.primary,
    title: 'Recovery',
  },
  // node 0:272 — state/cooldown
  cooldown: {
    background: color.state.cooldown,
    foreground: color.text.primary,
    title: 'Cooldown',
  },
  // node 0:311 — state/done
  complete: {
    background: color.state.done,
    foreground: color.text.primary,
    title: 'Workout complete',
  },
};

export function presentationFor(phase: Phase): PhasePresentation {
  return PRESENTATION[phase];
}
