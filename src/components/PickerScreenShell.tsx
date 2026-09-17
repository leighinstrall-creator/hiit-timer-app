import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borderWidth, color, opacity, size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { ActionButton } from './ActionButton';
import { Icon } from './Icon';
import { drumColumnHeight, drumSelectedRowTop } from './PickerDrum';

interface PickerScreenShellProps {
  readonly title: string;
  readonly onBack: () => void;
  readonly onConfirm: () => void;
  /** The "Selected: ..." readout — node 0:398. */
  readonly selectionSummary: string;
  readonly children: ReactNode;
}

/**
 * The chrome shared by both pickers — nodes 0:351 and 0:402.
 *
 * Navigation header, the drum area with its active-row highlight, the
 * selection readout, and the lime confirm bar. The two picker screens differ
 * only in what they put in `children`, so neither duplicates this.
 */
export function PickerScreenShell({
  title,
  onBack,
  onConfirm,
  selectionSummary,
  children,
}: PickerScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.navHeader}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to settings"
          style={({ pressed }) => [styles.backTarget, pressed && styles.pressed]}
        >
          <Icon name="chevronLeft" size={size.icon} color={color.icon.inverse} />
        </Pressable>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.drums}>
          {/*
            The highlight marks the selected row. It is aligned to the drum
            band rather than to the container, so it lands on the selected row
            whatever sits above it, and it is decorative: the drums themselves
            report the selection.
          */}
          <View
            style={[
              styles.activeRowHighlight,
              { top: drumSelectedRowTop() },
            ]}
            pointerEvents="none"
          />
          {children}
        </View>
      </View>

      <Text style={styles.selection} accessibilityLiveRegion="polite">
        {selectionSummary}
      </Text>

      <View style={styles.action}>
        <ActionButton
          label="SET"
          variant="accent"
          onPress={onConfirm}
          accessibilityLabel={`Set ${title}`}
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    minHeight: size.navHeaderHeight,
    paddingHorizontal: spacing[16],
  },
  backTarget: {
    padding: spacing[8],
    minWidth: size.minTouchTarget,
    minHeight: size.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.background.overlay,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  title: {
    ...typography.heading.screenTitle,
    color: color.text.inverse,
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  drums: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[24],
    paddingHorizontal: spacing[32],
    height: drumColumnHeight(),
  },
  activeRowHighlight: {
    position: 'absolute',
    left: spacing[16],
    right: spacing[16],
    height: size.pickerActiveRowHeight,
    backgroundColor: color.state.restSubtle,
    borderTopWidth: borderWidth.pickerActiveRow,
    borderBottomWidth: borderWidth.pickerActiveRow,
    borderColor: color.state.rest,
  },
  selection: {
    ...typography.label.inline,
    color: color.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing[40],
  },
  action: {
    paddingHorizontal: spacing[16],
  },
});
