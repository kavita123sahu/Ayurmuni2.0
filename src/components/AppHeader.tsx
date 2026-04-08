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
        <View style={styles.iconBox1} />
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
    // width: 40,
    // height: 40,
    // borderRadius: 10,
    // justifyContent: 'center',
    // alignItems: 'center',

    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBox1: {
    height: 40,
    width: 40,
    borderRadius: 12,
    // backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: 40,
    width: 40,
    resizeMode: "contain",
    // width: 50,
    // height: 50,
    // resizeMode: 'contain',
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },
});