import React from 'react';
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { Images } from '../common/Images';

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
  iconStyle?: ImageStyle;
  disabled?: boolean;
};

const BackIconButton: React.FC<Props> = ({
  onPress,
  style,
  iconStyle,
  disabled,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.btn, style]}
    disabled={disabled || !onPress}
    activeOpacity={0.8}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Image source={Images.backIcon} style={[styles.icon, iconStyle]} />
  </TouchableOpacity>
);

export default BackIconButton;

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
