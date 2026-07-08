// components/PromoCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon, { TablerIconName } from './TablerIcon';

interface Props {
  onPress?: () => void;
  image?: ImageSourcePropType;
  arrowIcon?: ImageSourcePropType;
  arrowIconName?: TablerIconName;
  buttontext?: string;
  title: string;
  desc: string;
  tag?: string;
  approved?: boolean;
  imageLeft?: ImageSourcePropType;
  imageLeftIconName?: TablerIconName;
  showButton?: boolean;
}

const PromoCard: React.FC<Props> = ({
  onPress,
  image,
  arrowIcon,
  arrowIconName = 'arrow-right',
  title,
  desc,
  imageLeft,
  imageLeftIconName,
  buttontext,
  tag,
  approved = false,
  showButton = true,
}) => {
  return (
    <View style={styles.card}>

      {/* ROW */}
      <View style={styles.row}>

        {imageLeft ? (
          <View style={styles.imageWrapper}>
            <Image source={imageLeft} style={styles.imageleft} />
          </View>
        ) : imageLeftIconName ? (
          <View style={styles.imageWrapper}>
            <TablerIcon name={imageLeftIconName} size={40} color={Colors.primaryColor} />
          </View>
        ) : null}

        <View style={styles.content}>

          {tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{tag}</Text>
            </View>

          )}

          <Text style={styles.title}>{title}</Text>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            {approved && <TablerIcon name="approved" size={15} color="#64748B" />}

            <Text style={styles.desc}>{desc}</Text>

          </View>

        </View>

        {image ? (
          <Image source={image} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <TablerIcon name="package" size={36} color={Colors.primaryColor} />
          </View>
        )}
      </View>

      {/* 👇 CONDITIONALLY SHOW */}
      {showButton && (
        <>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.btnRow} onPress={onPress}>
            <Text style={styles.btnText}>{buttontext}</Text>
            {arrowIcon ? (
              <Image source={arrowIcon} style={styles.arrow} />
            ) : (
              <TablerIcon name={arrowIconName} size={24} color="#0D614E" />
            )}
          </TouchableOpacity>

        </>
      )}

    </View>
  );
};

export default PromoCard;

const styles = StyleSheet.create({
  card: {
    // marginHorizontal: 5,
    marginTop: 12,
    padding: 18,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#0D614E0D',
    borderWidth: 1,
    borderColor: '#0D614E33',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    paddingLeft: 20,
    // paddingRight: 20,
  },

  imageWrapper: {
    backgroundColor: '#0D614E0D',
    borderRadius: 12,
    padding: 20, // 👈 /thoda spacing for design
    alignSelf: 'flex-start', // 👈 important (shrink to content)
  },

  imageleft: {
    width: 40,
    height: 40,
    backgroundColor: '#0D614E0D',
    resizeMode: 'contain',
    // marginBottom: 10
  },

  image: {
    width: 80,
    height: 75,
    resizeMode: 'contain',
  },

  imagePlaceholder: {
    width: 80,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D614E0D',
    borderRadius: 12,
  },

  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },

  tag: {
    fontSize: 10,
    color: '#0D614E', fontFamily: Fonts.PoppinsSemiBold
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 24,
    // marginTop: 20,
    marginBottom: 10
  },

  desc: {
    fontSize: 12,
    color: '#64748B',

    fontFamily: Fonts.PoppinsMedium,
  },

  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    marginVertical: 12,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  btnText: {
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
  },

  arrow: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});