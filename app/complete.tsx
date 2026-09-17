import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/Icon';
import { InfoBlock, type InfoItem } from '@/components/InfoBlock';
import { ScreenHeader } from '@/components/ScreenHeader';
import { formatMmSs, spokenDuration, totalWorkoutMs } from '@/machine/selectors';
import { size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { presentationFor } from '@/workout/phasePresentation';
import { useWorkout } from '@/workout/WorkoutProvider';
import { useWorkoutRouting } from '@/workout/useWorkoutRouting';

/** The finished-workout screen — node 0:311. */
export default function CompleteScreen() {
  const { state, config, exit } = useWorkout();
  useWorkoutRouting(state.phase);

  const presentation = presentationFor('complete');
  const total = totalWorkoutMs(config);

  const items: InfoItem[] = [
    { label: 'Sets', value: String(config.sets) },
    { label: 'Cycles', value: String(config.cycles) },
    {
      label: 'Total time',
      value: formatMmSs(total),
      accessibilityValue: spokenDuration(total),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: presentation.background }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader title="HIIT TIMER" foreground={presentation.foreground} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.message}>
        <Icon name="success" size={size.successIcon} color={presentation.foreground} />
        <Text style={[styles.title, { color: presentation.foreground }]} accessibilityRole="header">
          Workout{'\n'}complete
        </Text>
        <Text style={[styles.body, { color: presentation.foreground }]}>
          Nice work. You finished every interval.
        </Text>
        </View>

        <View style={styles.spacer} />

        <InfoBlock items={items} foreground={presentation.foreground} />

        <View style={styles.spacer} />
      </ScrollView>

      <ActionButton
        label="DONE"
        onPress={exit}
        accessibilityLabel="Done, return to start"
        style={styles.action}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingBottom: spacing[32],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  message: {
    paddingHorizontal: spacing[16],
    paddingTop: spacing[60],
    gap: spacing[22],
    alignItems: 'flex-start',
  },
  title: {
    ...typography.display.complete,
  },
  body: {
    ...typography.body.medium,
  },
  spacer: {
    flex: 1,
  },
  action: {
    marginHorizontal: spacing[16],
  },
});
