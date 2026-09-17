import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { drumSelectedRowTop, PickerDrum } from '@/components/PickerDrum';
import { PickerScreenShell } from '@/components/PickerScreenShell';
import { color, size } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { isDurationKey, SETTING_ROWS, type SettingKey } from '@/workout/settings';
import { useWorkout } from '@/workout/WorkoutProvider';

const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const SECONDS = Array.from({ length: 60 }, (_, index) => index);
const pad = (value: number) => String(value).padStart(2, '0');

/**
 * The minutes-and-seconds picker — node 0:351.
 *
 * Driven entirely by the `key` parameter, so this one screen serves all six
 * duration settings.
 */
export default function DurationPickerScreen() {
  const { config, setConfig } = useWorkout();
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string }>();

  const definition = SETTING_ROWS.find((row) => row.key === params.key);
  const key: SettingKey | undefined = definition?.key;

  const currentMs = key !== undefined && isDurationKey(key) ? config[key] : 0;
  const totalSeconds = Math.round(currentMs / 1000);

  const [minutes, setMinutes] = useState(Math.floor(totalSeconds / 60));
  const [seconds, setSeconds] = useState(totalSeconds % 60);

  if (definition === undefined || key === undefined || !isDurationKey(key)) {
    return (
      <PickerScreenShell
        title="Duration"
        onBack={() => router.back()}
        onConfirm={() => router.back()}
        selectionSummary="This setting is unavailable."
      >
        <View />
      </PickerScreenShell>
    );
  }

  const confirm = () => {
    setConfig({ ...config, [key]: (minutes * 60 + seconds) * 1000 });
    router.back();
  };

  return (
    <PickerScreenShell
      title={definition.label}
      onBack={() => router.back()}
      onConfirm={confirm}
      selectionSummary={`Selected: ${pad(minutes)} min ${pad(seconds)} sec`}
    >
      <PickerDrum
        label="Minutes"
        accessibilityLabel="Minutes"
        values={MINUTES}
        selectedIndex={minutes}
        onSelectIndex={setMinutes}
        format={pad}
      />
      <View style={styles.separatorColumn}>
        <Text style={styles.separator} allowFontScaling={false}>
          :
        </Text>
      </View>
      <PickerDrum
        label="Seconds"
        accessibilityLabel="Seconds"
        values={SECONDS}
        selectedIndex={seconds}
        onSelectIndex={setSeconds}
        format={pad}
      />
    </PickerScreenShell>
  );
}

const styles = StyleSheet.create({
  // Sits on the selected row, matching the drums beside it — node 0:381.
  separatorColumn: {
    height: size.pickerActiveRowHeight,
    marginTop: drumSelectedRowTop(),
    justifyContent: 'center',
  },
  separator: {
    ...typography.separator,
    color: color.text.tertiary,
  },
});
