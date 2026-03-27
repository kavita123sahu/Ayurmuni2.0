import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Ionicons } from '../common/Vector';

type Props = {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIcon?: string;
  rightIcon?: string;
};

const AppHeader: React.FC<Props> = ({
  title,
  onLeftPress,
  onRightPress,
  leftIcon = 'chevron-back',
  rightIcon,
}) => {
  return (
    <View style={styles.container}>
      
      {/* Left Icon */}
      <TouchableOpacity onPress={onLeftPress} style={styles.iconBox}>
        <Ionicons name={leftIcon as any} size={20} color="#111" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right Icon */}
      <TouchableOpacity onPress={onRightPress} style={styles.iconBox}>
        {rightIcon ? (
          <Ionicons name={rightIcon as any} size={20} color="#111" />
        ) : (
          <View style={{ width: 20 }} /> // balance layout
        )}
      </TouchableOpacity>

    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
});