import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

interface TimerDisplayProps {
  /** The phase name shown above the countdown. */
  readonly title: string;
  /** Formatted `mm:ss` countdown. */
  readonly time: string;
  /** How the countdown should be spoken, e.g. "1 minute 30 seconds left". */
  readonly accessibilityLabel: string;
  readonly foreground: string;
}

/**
 * The phase subtitle and countdown — nodes 0:196 and 0:195.
 *
 * The countdown is a live region so assistive technology follows it, but it is
 * announced politely: an assertive region would interrupt the user on every
 * tick. `allowFontScaling` is off on the 120pt display only, where scaling
 * would overflow any screen; the label above it scales normally.
 */
export function TimerDisplay({
  title,
  time,
  accessibilityLabel,
  foreground,
}: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: foreground }]} accessibilityRole="header">
        {title}
      </Text>
      <Text
        style={[styles.time, { color: foreground }]}
        accessibilityLiveRegion="polite"
        accessibilityLabel={accessibilityLabel}
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[16],
    gap: spacing[8],
  },
  title: {
    ...typography.heading.subtitle,
  },
  time: {
    ...typography.display.timer,
  },
});
