import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { color, size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { ActionButton } from './ActionButton';

interface TimerControlsProps {
  readonly paused: boolean;
  readonly onPauseResume: () => void;
  readonly onSkip: () => void;
  readonly onRestart: () => void;
  readonly onExit: () => void;
}

/**
 * Transport controls for the timer screens — node 0:207.
 *
 * The design specifies exactly one control: the full-width PAUSE bar. It is
 * kept at its designed position and nothing is added beside it. Skip, restart
 * and exit are required by the brief but have no design, so they live in a
 * sheet opened by long-pressing the bar, leaving the screen as drawn.
 *
 * A long press is not discoverable on its own, so the bar carries an
 * accessibility hint and the sheet is reachable from the actions rotor.
 */
export function TimerControls({
  paused,
  onPauseResume,
  onSkip,
  onRestart,
  onExit,
}: TimerControlsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);

  const runAndClose = (action: () => void) => () => {
    setSheetOpen(false);
    action();
  };

  return (
    <View style={styles.container}>
      <ActionButton
        label={paused ? 'RESUME' : 'PAUSE'}
        icon={paused ? 'play' : 'pause'}
        onPress={onPauseResume}
        onLongPress={openSheet}
        accessibilityLabel={paused ? 'Resume workout' : 'Pause workout'}
        accessibilityHint="Long press for skip, restart and exit"
        accessibilityActions={[
          { name: 'skip', label: 'Skip to next phase' },
          { name: 'restart', label: 'Restart workout' },
          { name: 'exit', label: 'Exit workout' },
          { name: 'longpress', label: 'More controls' },
        ]}
        onAccessibilityAction={(name) => {
          if (name === 'skip') onSkip();
          else if (name === 'restart') onRestart();
          else if (name === 'exit') onExit();
          else if (name === 'longpress') openSheet();
        }}
      />

      <Modal
        visible={sheetOpen}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <View style={styles.modalRoot}>
          {/*
            The backdrop is a sibling of the sheet rather than its parent:
            nesting pressables would nest buttons, which is invalid markup and
            traps focus oddly for assistive technology.
          */}
          <Pressable
            style={styles.backdrop}
            onPress={closeSheet}
            accessibilityRole="button"
            accessibilityLabel="Close controls"
          />

          <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle} accessibilityRole="header">
                WORKOUT CONTROLS
              </Text>
              <ActionButton
                label="SKIP"
                variant="secondary"
                tone="onDark"
                onPress={runAndClose(onSkip)}
                accessibilityLabel="Skip to next phase"
              />
              <ActionButton
                label="RESTART"
                variant="secondary"
                tone="onDark"
                onPress={runAndClose(onRestart)}
                accessibilityLabel="Restart workout"
                accessibilityHint="Returns to the beginning of the workout"
              />
              <ActionButton
                label="EXIT"
                variant="secondary"
                tone="onDark"
                onPress={runAndClose(onExit)}
                accessibilityLabel="Exit workout"
                accessibilityHint="Asks for confirmation before ending the workout"
              />
              <ActionButton label="CLOSE" variant="text" tone="onDark" onPress={closeSheet} />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[16],
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.background.overlay,
  },
  sheetSafeArea: {
    backgroundColor: color.background.inverse,
  },
  sheet: {
    padding: spacing[16],
    gap: spacing[8],
    backgroundColor: color.background.inverse,
  },
  sheetTitle: {
    ...typography.label.caption,
    color: color.text.secondary,
    minHeight: size.minTouchTarget,
    paddingTop: spacing[8],
  },
});
