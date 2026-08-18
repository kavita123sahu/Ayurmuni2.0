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
  size?: WaterGlassSize;
  mlLabel?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const WaterGlass = ({
  filled = false,
  size = 'md',
  mlLabel,
  onPress,
  disabled = false,
  style,
}: Props) => {
  const dims = SIZE_MAP[size];
  const Wrapper = onPress ? TouchableOpacity : View;

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
          filled && styles.glassFilled,
        ]}
      >
        <View style={styles.glassHighlight} />
        <View
          style={[
            styles.water,
            filled ? styles.waterFull : styles.waterEmpty,
            {
              left: dims.border + 1,
              right: dims.border + 1,
              bottom: dims.border + 1,
            },
          ]}
        />
        {filled ? <View style={styles.waterShine} /> : null}
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
    borderColor: '#94A3B8',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  glassFilled: {
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(240,249,255,0.9)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 4,
    left: 3,
    width: 4,
    height: '55%',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.65)',
    zIndex: 2,
  },
  water: {
    position: 'absolute',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  waterEmpty: {
    height: '12%',
    backgroundColor: 'rgba(186,230,253,0.35)',
  },
  waterFull: {
    height: '78%',
    backgroundColor: '#38BDF8',
  },
  waterShine: {
    position: 'absolute',
    bottom: '18%',
    left: '22%',
    width: '18%',
    height: '28%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
    zIndex: 1,
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
