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
  desc?: string;
  /** Short line under title (e.g. subscription / subtitle) */
  subscription?: string;
  tag?: string;
  approved?: boolean;
  imageLeft?: ImageSourcePropType;
  imageLeftIconName?: TablerIconName;
  showButton?: boolean;
  /** Compact aesthetic card for category landings */
  variant?: 'default' | 'compact';
}

const PromoCard: React.FC<Props> = ({
  onPress,
  image,
  arrowIcon,
  arrowIconName = 'arrow-right',
  title,
  desc,
  subscription,
  imageLeft,
  imageLeftIconName,
  buttontext,
  tag,
  approved = false,
  showButton = true,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const descText = String(desc || '').trim();
  const subText = String(subscription || '').trim();
  const tagText = String(tag || '').trim();

  if (isCompact) {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactAccent} />
        <View style={styles.compactBody}>
          {tagText ? (
            <Text style={styles.compactTag} numberOfLines={1}>
              {tagText}
            </Text>
          ) : null}
          <Text style={styles.compactTitle} numberOfLines={2}>
            {title}
          </Text>
          {subText ? (
            <Text style={styles.compactSubscription} numberOfLines={1}>
              {subText}
            </Text>
          ) : null}
          {descText ? (
            <Text style={styles.compactDesc} numberOfLines={3}>
              {descText}
            </Text>
          ) : null}
        </View>
        {imageLeftIconName ? (
          <View style={styles.compactIconWrap}>
            <TablerIcon
              name={imageLeftIconName}
              size={18}
              color={Colors.primaryColor}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {imageLeft ? (
          <View style={styles.imageWrapper}>
            <Image source={imageLeft} style={styles.imageleft} />
          </View>
        ) : imageLeftIconName ? (
          <View style={styles.imageWrapper}>
            <TablerIcon
              name={imageLeftIconName}
              size={20}
              color={Colors.primaryColor}
            />
          </View>
        ) : null}

        <View style={styles.content}>
          {tagText ? (
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{tagText}</Text>
            </View>
          ) : null}

          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subText ? (
            <Text style={styles.subscription} numberOfLines={1}>
              {subText}
            </Text>
          ) : null}
          {descText ? (
            <View style={styles.descRow}>
              {approved ? (
                <TablerIcon name="approved" size={14} color="#64748B" />
              ) : null}
              <Text style={styles.desc} numberOfLines={2}>
                {descText}
              </Text>
            </View>
          ) : null}
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
          <TouchableOpacity
            style={styles.btnRow}
            onPress={onPress}
            activeOpacity={0.75}
          >
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
  compactCard: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: RADIUS.md,
    backgroundColor: '#F7FAF9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7E5E0',
    overflow: 'hidden',
  },
  compactAccent: {
    width: 3,
    backgroundColor: Colors.primaryColor,
  },
  compactBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  compactIconWrap: {
    alignSelf: 'center',
    marginRight: 10,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#0D614E12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTag: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 20,
  },
  compactSubscription: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
    lineHeight: 15,
  },
  compactDesc: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    lineHeight: 15,
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
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  subscription: {
    fontSize: TYPO.sm,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 4,
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
