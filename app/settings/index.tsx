import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingRow } from '@/components/SettingRow';
import { color, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { formatSettingValue, isDurationKey, SETTING_ROWS } from '@/workout/settings';
import { useWorkout } from '@/workout/WorkoutProvider';

/**
 * The settings list — node 0:70.
 *
 * Every row routes into one of the two pickers, carrying the setting's key so
 * a single picker screen serves all six durations and both counts.
 */
export default function SettingsScreen() {
  const { config } = useWorkout();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* The design keeps the header title's space but hides the text. */}
      <ScreenHeader
        title="TABATA TIMER"
        titleHidden
        foreground={color.icon.inverse}
        action={{ icon: 'filter', label: 'Close settings', onPress: () => router.back() }}
      />

      <Text style={styles.title} accessibilityRole="header">
        Settings
      </Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {SETTING_ROWS.map((definition) => (
          <SettingRow
            key={definition.key}
            label={definition.label}
            value={formatSettingValue(config, definition)}
            icon={definition.icon}
            onPress={() =>
              router.push({
                pathname: isDurationKey(definition.key)
                  ? '/settings/duration'
                  : '/settings/count',
                params: { key: definition.key },
              })
            }
          />
        ))}
      </ScrollView>

      <View style={styles.action}>
        <ActionButton
          label="SET"
          variant="accent"
          onPress={() => router.back()}
          accessibilityLabel="Done, return to workout"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.background.inverse,
    paddingBottom: spacing[32],
  },
  title: {
    ...typography.label.stat,
    color: color.text.inverse,
    paddingHorizontal: spacing[16],
    paddingTop: spacing[8],
  },
  list: {
    flex: 1,
    marginTop: spacing[24],
  },
  listContent: {
    paddingHorizontal: spacing[16],
    gap: spacing[20],
    paddingBottom: spacing[24],
  },
  action: {
    paddingHorizontal: spacing[16],
  },
});
