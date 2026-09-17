import { Pressable, StyleSheet, Text, View } from 'react-native';

import { opacity, size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { Icon } from './Icon';
import type { IconName } from './iconSources';

interface ScreenHeaderProps {
  readonly title: string;
  /** Foreground colour for this screen's background. */
  readonly foreground: string;
  readonly action?: {
    readonly icon: IconName;
    readonly label: string;
    readonly onPress: () => void;
  };
  /** Hides the title while keeping its space, as the Settings header does. */
  readonly titleHidden?: boolean;
}

/**
 * The header shared by every screen — node 4:74.
 *
 * The title sits left with an optional action icon at the trailing edge.
 */
export function ScreenHeader({ title, foreground, action, titleHidden }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: foreground }, titleHidden === true && styles.hidden]}
        accessibilityRole="header"
        // The Settings header keeps the title's space but hides it visually;
        // it should not be announced either.
        accessibilityElementsHidden={titleHidden === true}
        numberOfLines={1}
      >
        {title}
      </Text>

      {action !== undefined ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={spacing[8]}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Icon name={action.icon} size={size.iconLarge} color={foreground} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[16],
  },
  title: {
    ...typography.label.button,
    flex: 1,
  },
  hidden: {
    opacity: opacity.hidden,
  },
  action: {
    minWidth: size.minTouchTarget,
    minHeight: size.minTouchTarget,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
