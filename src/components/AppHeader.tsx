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


//  rightIcon === "skip" ? (
//         <TouchableOpacity onPress={onRightPress} style={styles.iconBox}>
//           {/* <Image source={rightIcon} style={styles.icon} /> */}
//           <Text style={{ color: 'red' }}>Skip</Text>
//         </TouchableOpacity>
//       ) :

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    paddingTop: 25,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
});