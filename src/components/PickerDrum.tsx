import { useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { color, lineHeight, opacity, size, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/** Rows visible at once — two either side of the selection, as in node 0:370. */
const VISIBLE_ROWS = 5;
const ROWS_ABOVE_SELECTION = 2;

/**
 * Height of the column's label band: the caption's line box plus the gap
 * beneath it. Pinning the label's line height makes this deterministic, so the
 * active-row highlight and the ":" separator can be aligned to the drum band
 * without measuring.
 */
const DRUM_LABEL_BAND = lineHeight[26] + spacing[16];

/**
 * Distance from the top of a column to the TOP of its selected row.
 *
 * The scroll content is padded by `ROWS_ABOVE_SELECTION` rows and scrolled by
 * the selected index, so the selected row always comes to rest exactly that far
 * down the scroll window.
 */
export const drumSelectedRowTop = (): number =>
  DRUM_LABEL_BAND + ROWS_ABOVE_SELECTION * size.pickerActiveRowHeight;

/** Full height of a column: its label band plus the visible rows. */
export const drumColumnHeight = (): number =>
  DRUM_LABEL_BAND + VISIBLE_ROWS * size.pickerActiveRowHeight;

interface PickerDrumProps {
  /** Column heading, e.g. "Minutes" — node 0:369. */
  readonly label: string;
  /** The values this column offers, in order. */
  readonly values: readonly number[];
  readonly selectedIndex: number;
  readonly onSelectIndex: (index: number) => void;
  /** How a value is rendered, e.g. zero-padded. */
  readonly format: (value: number) => string;
  /** Spoken name of the column, for the accessibility adjustable. */
  readonly accessibilityLabel: string;
}

/**
 * One scrolling column of a picker — node 0:368.
 *
 * Rows snap to a fixed pitch, with the selection held in the middle and
 * neighbours fading out by distance. The drum is also an adjustable for
 * assistive technology, so it can be changed with increment and decrement
 * rather than by imitating a scroll gesture.
 */
export function PickerDrum({
  label,
  values,
  selectedIndex,
  onSelectIndex,
  format,
  accessibilityLabel,
}: PickerDrumProps) {
  const scrollRef = useRef<ScrollView>(null);
  const itemHeight = size.pickerActiveRowHeight;

  // Scroll to the current value on mount. `contentOffset` is not honoured on
  // every platform, so the position is set explicitly instead.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * itemHeight, animated: false });
    // Only on mount: later changes are either the user's own scroll, which is
    // already in position, or a step, which scrolls itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
      const clamped = Math.min(values.length - 1, Math.max(0, index));
      if (clamped !== selectedIndex) onSelectIndex(clamped);
    },
    [itemHeight, onSelectIndex, selectedIndex, values.length],
  );

  const step = (delta: number) => {
    const next = Math.min(values.length - 1, Math.max(0, selectedIndex + delta));
    if (next === selectedIndex) return;
    onSelectIndex(next);
    scrollRef.current?.scrollTo({ y: next * itemHeight, animated: true });
  };

  return (
    <View style={styles.column}>
      {/*
        Font scaling is off on the label and the values alike: the drum is a
        fixed-pitch control, and a grown label would slide every row out of
        the highlight.
      */}
      <Text style={styles.label} numberOfLines={1} allowFontScaling={false}>
        {label}
      </Text>

      <View
        style={{ height: itemHeight * VISIBLE_ROWS }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: format(values[selectedIndex] ?? 0) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          step(event.nativeEvent.actionName === 'increment' ? 1 : -1);
        }}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={{ paddingVertical: itemHeight * ROWS_ABOVE_SELECTION }}
        >
          {values.map((value, index) => {
            const distance = Math.abs(index - selectedIndex);
            return (
              <View key={value} style={[styles.row, { height: itemHeight }]}>
                <Text
                  style={[
                    distance === 0 ? styles.valueSelected : styles.value,
                    distance === 1 && { opacity: opacity.drumNear },
                    distance >= 2 && { opacity: opacity.drumFar },
                  ]}
                  allowFontScaling={false}
                >
                  {format(value)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[16],
  },
  label: {
    ...typography.label.caption,
    lineHeight: lineHeight[26],
    color: color.text.secondary,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.value.picker,
    color: color.text.inverse,
    textAlign: 'center',
  },
  valueSelected: {
    ...typography.value.pickerSelected,
    color: color.text.tertiary,
    textAlign: 'center',
  },
});
