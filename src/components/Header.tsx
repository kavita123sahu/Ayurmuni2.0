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
import { Images } from '../common/Images';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: ImageSourcePropType;
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
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Image
            source={backIcon ?? Images.backIcon}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

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
    paddingTop: 4,
    paddingBottom: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backPlaceholder: {
    width: 40,
    height: 40,
  },

  backIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  textContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
  },

  subtitle: {
    fontSize: 12,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium
  },
});