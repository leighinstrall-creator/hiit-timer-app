import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PickerDrum } from '@/components/PickerDrum';
import { PickerScreenShell } from '@/components/PickerScreenShell';
import { LIMITS } from '@/machine/machine';
import { formatCount, isDurationKey, SETTING_ROWS } from '@/workout/settings';
import { useWorkout } from '@/workout/WorkoutProvider';

const COUNTS = Array.from(
  { length: LIMITS.maxCount - LIMITS.minCount + 1 },
  (_, index) => LIMITS.minCount + index,
);

/**
 * The whole-number picker — node 0:402.
 *
 * Shares the drum and the screen chrome with the duration picker; only the
 * column count and the value range differ.
 */
export default function CountPickerScreen() {
  const { config, setConfig } = useWorkout();
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string }>();

  const definition = SETTING_ROWS.find((row) => row.key === params.key);
  const isCount = definition !== undefined && !isDurationKey(definition.key);
  const unit = definition?.unit ?? (['Set', 'Sets'] as const);

  const currentValue = isCount && definition !== undefined ? config[definition.key] : LIMITS.minCount;
  const [index, setIndex] = useState(
    Math.max(0, COUNTS.indexOf(currentValue as (typeof COUNTS)[number])),
  );
  const value = COUNTS[index] ?? LIMITS.minCount;

  if (!isCount || definition === undefined) {
    return (
      <PickerScreenShell
        title="Count"
        onBack={() => router.back()}
        onConfirm={() => router.back()}
        selectionSummary="This setting is unavailable."
      >
        <View />
      </PickerScreenShell>
    );
  }

  const confirm = () => {
    setConfig({ ...config, [definition.key]: value });
    router.back();
  };

  return (
    <PickerScreenShell
      title={definition.label}
      onBack={() => router.back()}
      onConfirm={confirm}
      selectionSummary={`Selected: ${formatCount(value, unit)}`}
    >
      <PickerDrum
        label={unit[1]}
        accessibilityLabel={definition.label}
        values={COUNTS}
        selectedIndex={index}
        onSelectIndex={setIndex}
        format={String}
      />
    </PickerScreenShell>
  );
}
