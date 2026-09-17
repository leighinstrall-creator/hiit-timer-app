import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { presentationFor } from '@/workout/phasePresentation';
import { useWorkout } from '@/workout/WorkoutProvider';
import { useWorkoutRouting } from '@/workout/useWorkoutRouting';

/**
 * The entry point — node 0:42.
 *
 * The design shows an instruction and a session counter rather than a workout
 * summary; the configured workout is reviewed on the Settings screen.
 */
export default function IntroScreen() {
  const { state, start } = useWorkout();
  const router = useRouter();
  useWorkoutRouting(state.phase);

  const presentation = presentationFor('idle');

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: presentation.background }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader
        title="HIIT TIMER"
        foreground={presentation.foreground}
        action={{
          icon: 'filter',
          label: 'Settings',
          onPress: () => router.push('/settings'),
        }}
      />

      <View style={styles.body}>
        <Text style={[styles.instruction, { color: presentation.foreground }]}>
          Press play to start
        </Text>
        <Text
          style={[styles.counter, { color: presentation.foreground }]}
          accessibilityLabel={`Workouts completed: ${state.completedWorkouts}`}
        >
          Workouts completed:{' '}
          <Text style={styles.counterValue}>{state.completedWorkouts}</Text>
        </Text>
      </View>

      <ActionButton
        label="PLAY"
        icon="play"
        onPress={start}
        accessibilityLabel="Start workout"
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
  body: {
    flex: 1,
    paddingHorizontal: spacing[16],
    paddingTop: spacing[60],
    gap: spacing[16],
  },
  instruction: {
    ...typography.heading.subtitle,
  },
  counter: {
    ...typography.label.inline,
  },
  counterValue: {
    ...typography.value.inlineBold,
  },
  action: {
    marginHorizontal: spacing[16],
  },
});
