import type { IconName } from '@/components/iconSources';
import type { WorkoutConfig } from '@/machine/types';

/** Configuration fields that hold a duration in milliseconds. */
export type DurationKey =
  | 'initialCountdownMs'
  | 'warmupMs'
  | 'exerciseMs'
  | 'restMs'
  | 'recoveryMs'
  | 'cooldownMs';

/** Configuration fields that hold a whole count. */
export type CountKey = 'sets' | 'cycles';

export type SettingKey = DurationKey | CountKey;

export interface SettingRowDefinition {
  readonly key: SettingKey;
  readonly label: string;
  readonly kind: 'duration' | 'count';
  readonly icon: IconName;
  /** Singular/plural noun for count settings, e.g. "Set" / "Sets". */
  readonly unit?: readonly [singular: string, plural: string];
}

/**
 * The settings list — node 0:84, in the order the design lists them.
 *
 * Duration rows route to the countdown picker, count rows to the number
 * picker, exactly as the frame's interaction annotations specify.
 */
export const SETTING_ROWS: readonly SettingRowDefinition[] = [
  { key: 'initialCountdownMs', label: 'Initial countdown', kind: 'duration', icon: 'timer' },
  { key: 'warmupMs', label: 'Warmup interval', kind: 'duration', icon: 'timer' },
  { key: 'exerciseMs', label: 'Exercise interval', kind: 'duration', icon: 'timer' },
  { key: 'restMs', label: 'Rest interval', kind: 'duration', icon: 'timer' },
  { key: 'sets', label: 'Number of sets', kind: 'count', icon: 'number', unit: ['Set', 'Sets'] },
  { key: 'recoveryMs', label: 'Recovery interval', kind: 'duration', icon: 'timer' },
  {
    key: 'cycles',
    label: 'Number of cycles',
    kind: 'count',
    icon: 'number',
    unit: ['Cycle', 'Cycles'],
  },
  { key: 'cooldownMs', label: 'Cooldown interval', kind: 'duration', icon: 'timer' },
];

export function isDurationKey(key: SettingKey): key is DurationKey {
  return key !== 'sets' && key !== 'cycles';
}

/** Look a setting's current value out of the configuration. */
export function valueOf(config: WorkoutConfig, key: SettingKey): number {
  return config[key];
}

/**
 * The summary shown beneath a settings row — nodes 0:94, 0:143.
 *
 * The design shows "30 Seconds", "1 Minute" and "10 Sets", so whole minutes
 * read as minutes and everything else as seconds. Mixed durations, which the
 * design has no example of, use the same "0 min 30 sec" form as the picker's
 * own readout rather than inventing a third style.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0 && seconds === 0) return `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'}`;
  if (minutes === 0) return `${seconds} ${seconds === 1 ? 'Second' : 'Seconds'}`;
  return `${minutes} min ${seconds} sec`;
}

export function formatCount(value: number, unit: readonly [string, string]): string {
  return `${value} ${value === 1 ? unit[0] : unit[1]}`;
}

/** The summary for any row, whichever kind it is. */
export function formatSettingValue(
  config: WorkoutConfig,
  definition: SettingRowDefinition,
): string {
  const value = valueOf(config, definition.key);
  if (definition.kind === 'count') {
    return formatCount(value, definition.unit ?? ['', '']);
  }
  return formatDuration(value);
}
