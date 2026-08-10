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
import { BUTTON, RADIUS, SPACING, TYPO } from '../constants/responsive';

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
      <View style={styles.row}>
        {imageLeft ? (
          <View style={styles.imageWrapper}>
            <Image source={imageLeft} style={styles.imageleft} />
          </View>
        ) : imageLeftIconName ? (
          <View style={styles.imageWrapper}>
            <TablerIcon name={imageLeftIconName} size={36} color={Colors.primaryColor} />
          </View>
        ) : null}

        <View style={styles.content}>
          {tag ? (
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{tag}</Text>
            </View>
          ) : null}

          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.descRow}>
            {approved ? <TablerIcon name="approved" size={14} color="#64748B" /> : null}
            <Text style={styles.desc} numberOfLines={2}>
              {desc}
            </Text>
          </View>
        </View>

        {image ? (
          <Image source={image} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <TablerIcon name="package" size={32} color={Colors.primaryColor} />
          </View>
        )}
      </View>

      {showButton ? (
        <>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.btnRow} onPress={onPress} activeOpacity={0.75}>
            <Text style={styles.btnText} numberOfLines={1}>
              {buttontext}
            </Text>
            {arrowIcon ? (
              <Image source={arrowIcon} style={styles.arrow} />
            ) : (
              <TablerIcon name={arrowIconName} size={22} color="#0D614E" />
            )}
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

export default PromoCard;

const IMAGE_SIZE = 72;

const styles = StyleSheet.create({
  card: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.pill,
    backgroundColor: '#0D614E0D',
    borderWidth: 1,
    borderColor: '#0D614E33',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: SPACING.md,
  },
  imageWrapper: {
    backgroundColor: '#0D614E0D',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignSelf: 'flex-start',
  },
  imageleft: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D614E0D',
    borderRadius: RADIUS.md,
    flexShrink: 0,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  tag: {
    fontSize: TYPO.xs,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  title: {
    fontSize: TYPO.title,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  descRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-start',
  },
  desc: {
    flex: 1,
    fontSize: TYPO.sm,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    marginVertical: SPACING.md,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: BUTTON.heightSm,
  },
  btnText: {
    flex: 1,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: TYPO.button,
    marginRight: SPACING.sm,
  },
  arrow: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
});
