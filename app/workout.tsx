import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoBlock, type InfoItem } from '@/components/InfoBlock';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TimerControls } from '@/components/TimerControls';
import { TimerDisplay } from '@/components/TimerDisplay';
import {
  cycleNumber,
  formatMmSs,
  isRunning,
  remainingMs,
  setNumber,
  spokenDuration,
  totalRemainingMs,
} from '@/machine/selectors';
import { flexRatio, spacing } from '@/theme/tokens';
import { presentationFor } from '@/workout/phasePresentation';
import { useWorkout } from '@/workout/WorkoutProvider';
import { useWorkoutRouting } from '@/workout/useWorkoutRouting';

/**
 * The active-workout screen — nodes 0:3, 0:194, 0:233 and 0:272.
 *
 * Those four frames differ only in background colour and subtitle, so one
 * layout renders them all and takes its appearance from `phasePresentation`.
 * This screen owns no timing logic whatsoever: it reads machine state and
 * renders it.
 */
export default function WorkoutScreen() {
  const {
    state,
    config,
    now,
    pause,
    resume,
    skip,
    restart,
    exit,
    muted,
    setMuted,
    hapticsEnabled,
    setHapticsEnabled,
  } = useWorkout();
  const router = useRouter();
  useWorkoutRouting(state.phase);

  const presentation = presentationFor(state.phase);
  const remaining = remainingMs(state, now);
  const paused = !isRunning(state);

  const items: InfoItem[] = [
    {
      label: 'Sets',
      value: `${setNumber(state)}/${config.sets}`,
      accessibilityValue: `${setNumber(state)} of ${config.sets}`,
    },
    {
      label: 'Cycles',
      value: `${cycleNumber(state)}/${config.cycles}`,
      accessibilityValue: `${cycleNumber(state)} of ${config.cycles}`,
    },
    {
      label: 'Total time',
      value: formatMmSs(totalRemainingMs(state, config, now)),
      accessibilityValue: `${spokenDuration(totalRemainingMs(state, config, now))} remaining`,
    },
  ];

  const confirmExit = () => {
    Alert.alert(
      'End workout?',
      'Your progress in this workout will be lost.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End workout', style: 'destructive', onPress: exit },
      ],
      { cancelable: true },
    );
  };

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

      <View style={styles.headerToReadout} />

      <TimerDisplay
        title={paused ? `${presentation.title} — paused` : presentation.title}
        time={formatMmSs(remaining)}
        accessibilityLabel={`${presentation.title}, ${spokenDuration(remaining)} remaining`}
        foreground={presentation.foreground}
      />

      <View style={styles.readoutToInfo} />

      <InfoBlock items={items} foreground={presentation.foreground} />

      <View style={styles.infoToControls} />

      <TimerControls
        paused={paused}
        muted={muted}
        hapticsEnabled={hapticsEnabled}
        onToggleMuted={() => setMuted(!muted)}
        onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
        onPauseResume={paused ? resume : pause}
        onSkip={skip}
        onRestart={restart}
        onExit={confirmExit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingBottom: spacing[32],
  },
  headerToReadout: {
    flex: flexRatio.headerToReadout,
  },
  readoutToInfo: {
    flex: flexRatio.readoutToInfo,
  },
  infoToControls: {
    flex: flexRatio.infoToControls,
  },
});
