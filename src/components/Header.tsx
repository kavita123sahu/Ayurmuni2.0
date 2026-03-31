import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon: ImageSourcePropType;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  backIcon,
}) => {
  return (
    <View style={styles.container}>

      {/* LEFT BACK BUTTON */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Image source={backIcon} style={styles.backIcon} />
      </TouchableOpacity>

      {/* RIGHT TEXT */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingTop: 25,
    // backgroundColor:Colors.white,
    paddingBottom: 10,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },


  backIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  textContainer: {
    alignItems: 'flex-end',
  },

  title: {
    fontSize: 24,
    marginBottom:-5,
    fontFamily : Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },

  subtitle: {
    fontSize: 14,
    color: '#0D614E',
    fontFamily : Fonts.PoppinsMedium
  },
});