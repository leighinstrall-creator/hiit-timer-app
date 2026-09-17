import { StyleSheet, Text, View } from 'react-native';

import { size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export interface InfoItem {
  readonly label: string;
  readonly value: string;
  /** Spoken form, when the visible value is too terse to stand alone. */
  readonly accessibilityValue?: string;
}

interface InfoBlockProps {
  readonly items: readonly InfoItem[];
  readonly foreground: string;
}

/**
 * The three-row workout summary — node 0:197.
 *
 * Each row pairs a regular label with a bold, right-aligned value. Label and
 * value are merged into a single accessibility node so a screen reader reads
 * "Sets, 10" rather than announcing two disconnected fragments.
 */
export function InfoBlock({ items, foreground }: InfoBlockProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View
          key={item.label}
          style={styles.row}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${item.label}, ${item.accessibilityValue ?? item.value}`}
        >
          <Text style={[styles.label, { color: foreground }]}>{item.label}</Text>
          <Text style={[styles.value, { color: foreground }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[16],
    gap: spacing[42],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  label: {
    ...typography.label.stat,
    flex: 1,
  },
  value: {
    ...typography.value.stat,
    minWidth: size.statValueColumnWidth,
    textAlign: 'right',
  },
});
