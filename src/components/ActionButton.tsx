import {
  Pressable,
  StyleSheet,
  Text,
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { color, opacity, size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

import { Icon } from './Icon';
import type { IconName } from './iconSources';

export type ActionButtonVariant = 'primary' | 'accent' | 'secondary' | 'text';

/** Which background the button sits on, so the label picks the right token. */
export type ActionButtonTone = 'onLight' | 'onDark';

interface ActionButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly onLongPress?: () => void;
  readonly variant?: ActionButtonVariant;
  readonly tone?: ActionButtonTone;
  readonly icon?: IconName;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly accessibilityActions?: readonly AccessibilityActionInfo[];
  readonly onAccessibilityAction?: (actionName: string) => void;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * The full-width action bar used across the designs — node 0:207.
 *
 * `primary` is the black bar with inverse text. `accent` is the lime bar the
 * settings and picker screens confirm with (node 0:183). `secondary` uses the
 * translucent overlay fill, matching the settings icon containers. `text` is
 * label-only.
 *
 * Pressed and disabled states are not specified in the Figma file; both are
 * expressed as opacity steps rather than new colours, so no value enters the
 * app that has no basis in the design.
 */
export function ActionButton({
  label,
  onPress,
  onLongPress,
  variant = 'primary',
  tone = 'onLight',
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityActions,
  onAccessibilityAction,
  style,
}: ActionButtonProps) {
  // The black bar always carries inverse text. Everything else follows the
  // background it sits on.
  const foreground =
    variant === 'primary' || (tone === 'onDark' && variant !== 'accent')
      ? color.text.inverse
      : color.text.primary;

  return (
    <Pressable
      onPress={onPress}
      {...(onLongPress !== undefined ? { onLongPress } : {})}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      {...(accessibilityHint !== undefined ? { accessibilityHint } : {})}
      {...(accessibilityActions !== undefined ? { accessibilityActions } : {})}
      {...(onAccessibilityAction !== undefined
        ? {
            onAccessibilityAction: (event: AccessibilityActionEvent) =>
              onAccessibilityAction(event.nativeEvent.actionName),
          }
        : {})}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'accent' && styles.accent,
        variant === 'secondary' && styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon !== undefined ? <Icon name={icon} size={size.icon} color={foreground} /> : null}
      <Text style={[styles.label, { color: foreground }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    minHeight: size.actionButtonHeight,
    paddingHorizontal: spacing[16],
  },
  primary: {
    backgroundColor: color.action.primary,
  },
  accent: {
    backgroundColor: color.action.inverse,
  },
  secondary: {
    backgroundColor: color.background.overlay,
  },
  label: {
    ...typography.label.button,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
});
