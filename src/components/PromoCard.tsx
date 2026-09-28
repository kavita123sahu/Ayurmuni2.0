// components/PromoCard.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon, { TablerIconName } from './TablerIcon';
import { BUTTON, RADIUS, SPACING, TYPO } from '../constants/responsive';
import { resolveImageUri } from '../utils/imageUtils';

interface Props {
  onPress?: () => void;
  image?: ImageSourcePropType | string | null;
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
  /** compact = slim strip; banner = clean hero with optional symptom bullets */
  variant?: 'default' | 'compact' | 'banner';
  /** Symptom / concern bullets (banner variant) */
  symptoms?: string[] | null;
}

const normalizeSymptoms = (raw?: string[] | null, max = 6): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(s => {
      if (s == null) return '';
      if (typeof s === 'string') return s.trim();
      if (typeof s === 'object') {
        return String(
          (s as any).name ||
            (s as any).symptom ||
            (s as any).title ||
            (s as any).label ||
            '',
        ).trim();
      }
      return String(s).trim();
    })
    .filter(Boolean)
    .slice(0, max);
};

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
  symptoms,
}) => {
  const isCompact = variant === 'compact';
  const isBanner = variant === 'banner';
  const descText = String(desc || '').trim();
  const subText = String(subscription || '').trim();
  const tagText = String(tag || '').trim();
  const symptomList = useMemo(() => normalizeSymptoms(symptoms), [symptoms]);
console.log("symptomssymptomssymptomssymptoms",symptoms)
  const imageSource: ImageSourcePropType | null = useMemo(() => {
    if (!image) return null;
    if (typeof image === 'string') {
      const uri = resolveImageUri(image) || image.trim();
      return uri ? { uri } : null;
    }
    return image;
  }, [image]);

  if (isBanner) {
    return (
      <View style={styles.bannerShell}>
        <LinearGradient
          colors={['#EEF8F4', '#F7FBFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerStrip}
        >
          <View style={styles.bannerTop}>
            <View style={styles.bannerCopy}>
              {tagText ? (
                <Text style={styles.bannerTag} numberOfLines={1}>
                  {tagText}
                </Text>
              ) : null}
              <Text style={styles.bannerTitle} numberOfLines={1}>
                {title}
              </Text>
              {subText ? (
                <Text style={styles.bannerSub} numberOfLines={1}>
                  {subText}
                </Text>
              ) : null}
              {descText ? (
                <Text style={styles.bannerDesc} numberOfLines={3}>
                  {descText}
                </Text>
              ) : null}
            </View>

            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.bannerImage, styles.bannerImageFallback]}>
                <TablerIcon
                  name={imageLeftIconName || 'heart'}
                  size={24}
                  color={Colors.primaryColor}
                />
              </View>
            )}
          </View>

          {symptomList.length > 0 ? (
            <View style={styles.symptomList}>
              {symptomList.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.symptomBulletRow}>
                  <Text style={styles.bulletGlyph}>•</Text>
                  <Text style={styles.symptomText} numberOfLines={2}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </LinearGradient>
      </View>
    );
  }

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
          {symptomList.length > 0 ? (
            <View style={styles.compactSymptoms}>
              {symptomList.slice(0, 3).map((item, index) => (
                <View key={`${item}-${index}`} style={styles.symptomRow}>
                  <View style={styles.bulletDotCompact} />
                  <Text style={styles.compactSymptomText} numberOfLines={1}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
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

        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
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
const BANNER_IMAGE = 72;

const styles = StyleSheet.create({
  bannerShell: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bannerStrip: {
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
  },
  bannerTag: {
    fontSize: 10,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bannerSub: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  bannerDesc: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  bannerImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D614E12',
  },
  bannerImage: {
    width: BANNER_IMAGE,
    height: BANNER_IMAGE,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  symptomList: {
    marginTop: 10,
    gap: 6,
  },
  symptomBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D5E8E1',
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletGlyph: {
    fontSize: 14,
    lineHeight: 18,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 0,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 5,
    backgroundColor: Colors.primaryColor,
  },
  symptomText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
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
  compactSymptoms: {
    marginTop: 8,
    gap: 4,
  },
  bulletDotCompact: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 5,
    backgroundColor: Colors.primaryColor,
  },
  compactSymptomText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
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
