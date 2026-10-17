import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import LinearGradient, { LinearGradientProps } from 'react-native-linear-gradient';

type Props = LinearGradientProps & ViewProps;

const RADIUS_KEYS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
] as const;

/**
 * Drop-in for `react-native-linear-gradient`. The library is a legacy view that runs
 * through the New Architecture interop layer on iOS, which mis-sizes its children
 * (button labels and card content get clipped). Layout is done by a plain View and
 * the gradient is painted behind it.
 */
const GradientView = ({
  colors,
  start,
  end,
  locations,
  useAngle,
  angle,
  angleCenter,
  style,
  children,
  ...rest
}: Props) => {
  const flat = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const radii: ViewStyle = {};
  RADIUS_KEYS.forEach(key => {
    if (flat[key] != null) {
      (radii as any)[key] = flat[key];
    }
  });

  return (
    <View style={style} {...rest}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        locations={locations}
        useAngle={useAngle}
        angle={angle}
        angleCenter={angleCenter}
        style={[StyleSheet.absoluteFill, radii]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
};

export default GradientView;
