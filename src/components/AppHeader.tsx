import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

type Props = {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIcon?: any;     
  rightIcon?: any;    
};

const AppHeader: React.FC<Props> = ({
  title,
  onLeftPress,
  onRightPress,
  leftIcon,
  rightIcon,
}) => {
  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={onLeftPress} style={styles.iconBox}>
        {leftIcon && (
          <Image source={leftIcon} style={styles.icon} />
        )}
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconBox}>
          <Image source={rightIcon} style={styles.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBox} /> 
      )}

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
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
});