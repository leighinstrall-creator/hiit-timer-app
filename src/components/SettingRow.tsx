import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, opacity, size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { Icon } from './Icon';
import type { IconName } from './iconSources';

interface SettingRowProps {
  readonly label: string;
  readonly value: string;
  readonly icon: IconName;
  readonly onPress: () => void;
}

/**
 * One row of the settings list — node 0:85.
 *
 * A glyph in a translucent square, the setting's name above its current
 * value, and a disclosure chevron. The whole row is one control, so it is a
 * single accessibility node reading "Exercise interval, 30 Seconds".
 */
export function SettingRow({ label, value, icon, onPress }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      accessibilityHint="Opens a picker to change this setting"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={icon}
          size={icon === 'timer' ? size.iconTimer : size.icon}
          color={color.icon.inverse}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>

      <Icon name="chevronRight" size={size.icon} color={color.icon.inverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    minHeight: size.minTouchTarget,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  iconContainer: {
    width: size.iconContainer,
    height: size.iconContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.background.overlay,
  },
  info: {
    flex: 1,
  },
  label: {
    ...typography.body.medium,
    color: color.text.inverse,
  },
  value: {
    ...typography.body.small,
    color: color.text.secondary,
  },
});
