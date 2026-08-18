import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { SPACING, TYPO } from '../constants/responsive';

export type WaterGlassSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<
  WaterGlassSize,
  { width: number; height: number; border: number; label: number }
> = {
  xs: { width: 18, height: 26, border: 1.5, label: 8 },
  sm: { width: 28, height: 40, border: 1.5, label: 9 },
  md: { width: 44, height: 58, border: 2, label: 10 },
  lg: { width: 52, height: 68, border: 2, label: 11 },
};

type Props = {
  filled?: boolean;
  /** 0–1 fill height. When set, overrides the default full/empty look. */
  fillRatio?: number;
  size?: WaterGlassSize;
  mlLabel?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const WaterGlass = ({
  filled = false,
  fillRatio,
  size = 'md',
  mlLabel,
  onPress,
  disabled = false,
  style,
}: Props) => {
  const dims = SIZE_MAP[size];
  const Wrapper = onPress ? TouchableOpacity : View;
  const hasCustomFill = typeof fillRatio === 'number';
  const ratio = hasCustomFill
    ? Math.max(0, Math.min(1, fillRatio))
    : filled
      ? 0.74
      : 0.1;
  const isFilled = hasCustomFill ? ratio > 0.12 : filled;

  return (
    <Wrapper
      style={[styles.wrap, style]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled}
    >
      <View
        style={[
          styles.glass,
          {
            width: dims.width,
            height: dims.height,
            borderWidth: dims.border,
          },
          isFilled && styles.glassFilled,
        ]}
      >
        <View style={styles.glassHighlight} />
        <View
          style={[
            styles.water,
            {
              left: dims.border + 1,
              right: dims.border + 1,
              bottom: dims.border + 1,
              height: `${Math.round(ratio * 100)}%`,
              backgroundColor: isFilled ? '#0F766E' : 'rgba(13,97,78,0.12)',
            },
          ]}
        />
      </View>
      {mlLabel ? (
        <Text
          style={[
            styles.label,
            { fontSize: dims.label },
            filled && styles.labelFilled,
          ]}
          numberOfLines={1}
        >
          {mlLabel}
        </Text>
      ) : null}
    </Wrapper>
  );
};

type RowProps = {
  totalGlasses: number;
  filledGlasses: number;
  size?: WaterGlassSize;
  maxVisible?: number;
  onGlassPress?: (index: number) => void;
  disabled?: boolean;
};

export const WaterGlassRow = memo(
  ({
    totalGlasses,
    filledGlasses,
    size = 'sm',
    maxVisible,
    onGlassPress,
    disabled = false,
  }: RowProps) => {
    const count = maxVisible
      ? Math.min(totalGlasses, maxVisible)
      : totalGlasses;
    const indices = Array.from({ length: count }, (_, i) => i);

    return (
      <View style={styles.row}>
        {indices.map(index => (
          <WaterGlass
            key={`glass-${index}`}
            size={size}
            filled={filledGlasses > index}
            mlLabel={size !== 'xs' ? '250' : undefined}
            onPress={onGlassPress ? () => onGlassPress(index) : undefined}
            disabled={disabled}
          />
        ))}
        {maxVisible && totalGlasses > maxVisible ? (
          <Text style={styles.more}>+{totalGlasses - maxVisible}</Text>
        ) : null}
      </View>
    );
  },
);

export const WaterGoalGlassPreview = memo(
  ({ glassCount, selected }: { glassCount: number; selected: boolean }) => {
    const previewCount = Math.min(glassCount, 8);
    const extra = glassCount - previewCount;

    return (
      <View style={styles.previewWrap}>
        <View style={styles.previewRow}>
          {Array.from({ length: previewCount }, (_, i) => (
            <WaterGlass
              key={`preview-${i}`}
              size="xs"
              filled={selected}
              style={styles.previewGlass}
            />
          ))}
          {extra > 0 ? (
            <Text style={styles.previewMore}>+{extra}</Text>
          ) : null}
        </View>
      </View>
    );
  },
);

export default memo(WaterGlass);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  glass: {
    borderColor: '#C5D4CE',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  glassFilled: {
    borderColor: Colors.primaryColor,
  },
  glassHighlight: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 3,
    height: '46%',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 2,
  },
  water: {
    position: 'absolute',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: {
    marginTop: 4,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  labelFilled: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  more: {
    fontSize: TYPO.caption,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    alignSelf: 'center',
    marginLeft: 2,
  },
  previewWrap: {
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  previewGlass: {
    opacity: 0.95,
  },
  previewMore: {
    fontSize: TYPO.xs,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 2,
    marginLeft: 2,
  },
});
