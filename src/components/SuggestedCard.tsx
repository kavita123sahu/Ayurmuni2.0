import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { Fonts } from '../common/Fonts';
import PromoCard from './PromoCard';
import SectionHeader from './SectionHeader';
import TablerIcon from './TablerIcon';
import {
  resolveYogaThumbnailUri,
  resolveYogaVideoUri,
} from '../utils/yogaUtils';
import { formatDietPlanRatingBadgeText } from '../utils/dietPlanUtils';
import { RupeeAmount } from '../utils/currencyUtils';
import { SCREEN_PADDING_H } from '../constants/layout';

interface Props {
  data: any[];
  price?: boolean;
  isGrid?: boolean;
  header?: boolean;
  navigation: any;
  ListHeaderComponent?: React.ReactNode;
  home?: boolean;
  edgeScroll?: boolean;
}

const YogaPreviewVideo = ({
  uri,
  fallbackUri,
}: {
  uri: string;
  fallbackUri?: string;
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Image
        source={
          fallbackUri
            ? { uri: fallbackUri }
            : require('../assets/images/FinalLogo2.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
    );
  }

  return (
    <>
      {fallbackUri ? (
        <Image
          source={{ uri: fallbackUri }}
          style={[styles.image, styles.videoPoster]}
          resizeMode="cover"
        />
      ) : null}
      <Video
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        muted
        repeat
        paused={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="obey"
        disableFocus
        shutterColor="transparent"
        onError={() => setFailed(true)}
      />
      <View style={styles.videoBadge} pointerEvents="none">
        <TablerIcon name="video" size={12} color="#FFFFFF" />
      </View>
    </>
  );
};

const SuggestedCard: React.FC<Props> = ({
  data,
  price = false,
  isGrid = false,
  header = false,
  navigation,
  home = false,
  edgeScroll = false,
}) => {
  const [showAll, setShowAll] = useState(false);

  const safeData = Array.isArray(data) ? data : [];
  const displayData = showAll ? safeData : safeData.slice(0, 6);


  const formattedData =
    isGrid && displayData.length % 2 !== 0
      ? [...displayData, { id: 'empty', empty: true }]
      : displayData;

  console.log('formattedData', formattedData);

  const ListHeaderComponent = () => (
    <>
      <PromoCard
        title="The Wellness Essentials"
        desc="Discover our loved organic selections, cold-pressed to preserve nature’s power."
        tag="CURATED EXCELLENCE"
        image={require('../assets/images/FinalLogo2.png')}
        showButton={false}
      />
      <SectionHeader title="Top  Selling Products" actionText="View all" />
    </>
  );

  return (
    <FlatList
      key={isGrid ? 'grid' : 'list'}
      data={formattedData}
      keyExtractor={(item, index) => item.id || index.toString()}
      horizontal={!isGrid}
      numColumns={isGrid ? 2 : 1}
      ListHeaderComponent={header ? <ListHeaderComponent /> : undefined}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContent,
        home && styles.listContentHome,
        home && edgeScroll && styles.listContentEdge,
      ]}
      columnWrapperStyle={
        isGrid
          ? {
            justifyContent: 'space-between',
            marginBottom: 14,
          }
          : undefined
      }
      renderItem={({ item }) => {
        if (item.empty) {
          return (
            <View style={[styles.card, styles.gridCard, styles.emptyCard]} />
          );
        }

        const isDiet = item?.type === 'diet';
        const isYoga = item?.type === 'yoga' || !isDiet;
        const title = item?.title || item?.name || '';
        const subtitle =
          item?.short_description ||
          item?.health_diseases
            ?.map((d: any) => d?.name)
            .filter(Boolean)
            .join(', ') ||
          '';
          const dieseases = item?.health_diseases
            ?.map((d: any) => d?.name)
            .filter(Boolean)
        const prakriti = String(item?.prakriti || '').trim();
        const season = String(item?.season || '').trim();
        const badgeText = item?.difficulty || season || '';
        const doctorName = String(
          item?.suggested_doctor_name ||
          item?.doctor_name ||
          item?.suggested_by_doctor_name ||
          '',
        ).trim();
        const doctorLabel = doctorName.replace(/^dr\.?\s*/i, '');
        const dietRatingText = isDiet ? formatDietPlanRatingBadgeText(item) : null;
        const imageUri = isYoga
          ? resolveYogaThumbnailUri(item)
          : (
            item?.thumbnail_url ||
            item?.image_url ||
            item?.diet_plan_gallery?.find((img: any) => img.is_cover)
              ?.image_url ||
            ''
          ).trim();
        const videoUri = isYoga ? resolveYogaVideoUri(item) : null;

        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(isDiet ? 'DietScreen' : 'YogaSession', {
                item,
              })
            }
            style={[styles.card, isGrid && styles.gridCard]}
          >
            <View style={styles.imageContainer}>
              {videoUri ? (
                <YogaPreviewVideo
                  uri={videoUri}
                  fallbackUri={imageUri || undefined}
                />
              ) : (
                <Image
                  source={
                    imageUri
                      ?
                      { uri: imageUri }
                      : require('../assets/images/login/7.jpg')
                  }
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
              {isDiet && !!prakriti ? (

                <View style={[styles.prakritiOverlay, styles.prakritiBadge]}>
                  <Text style={[styles.prakritiOverlayText, styles.prakritiBadgeText]} numberOfLines={1}>
                    {prakriti}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.subContainer}>
              <View style={{ flex: 1 }}>
                <Text
                  style={styles.title}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>

                {isDiet && !!doctorName ? (
                  <View style={styles.doctorSuggestChip}>
                    <TablerIcon name="stethoscope" size={11} color="#0D614E" />
                    <View style={styles.doctorSuggestChipCopy}>
                      <Text style={styles.doctorSuggestChipLabel}>
                        Suggested by
                      </Text>
                      <Text
                        style={styles.doctorSuggestChipName}
                        numberOfLines={1}
                      >
                        Dr. {doctorLabel}
                      </Text>
                    </View>
                  </View>
                ) : !!dieseases ? (
                  <Text
                    style={styles.subtitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {dieseases.join(', ')}
                  </Text>
                ) : null}

                <View style={styles.infoRow}>
                  {isDiet && !!dietRatingText ? (
                    <View style={styles.ratingBadge}>
                      <TablerIcon name="star" size={10} color="#F59E0B" strokeWidth={2} />
                      <Text style={styles.ratingBadgeText} numberOfLines={1}>
                        {dietRatingText}
                      </Text>
                    </View>
                  ) : null}
                  {!!badgeText && badgeText !== prakriti && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badgeText}</Text>
                    </View>
                  )}
                </View>
                {price && (
                  <View style={styles.priceContainer}>
                    {item?.is_paid === false || Number(item?.price) === 0 ? (
                      <Text style={styles.price}>Free</Text>
                    ) : (
                      <RupeeAmount value={item.price} style={styles.price} />
                    )}
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      ListFooterComponent={
        isGrid && data.length > 6 ? (
          <View style={styles.footerContainer}>
            {!showAll && (
              <TouchableOpacity
                style={styles.discoverBtn}
                onPress={() => setShowAll(true)}
              >
                <Text style={styles.discoverText}>Discover More</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.countText}>
              Showing {showAll ? data.length : 6} of {data.length} items
            </Text>
          </View>
        ) : null
      }
    />
  );
};

export default React.memo(SuggestedCard);

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 48) / 2;
const LIST_CARD_WIDTH = Math.min(width * 0.42, 156);

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  listContentHome: {
    paddingBottom: 0,
  },
  listContentEdge: {
    paddingLeft: 0,
    paddingRight: SCREEN_PADDING_H,
  },
  card: {
    width: LIST_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    overflow: 'hidden',
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    marginRight: 0,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  imageContainer: {
    backgroundColor: '#F1F5F9',
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  doctorOverlay: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13, 97, 78, 0.9)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  doctorOverlayText: {
    flexShrink: 1,
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  prakritiOverlay: {
    position: 'absolute',
    left: 6,
    top: 6,
    maxWidth: '88%',
    backgroundColor: 'rgba(13, 97, 78, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  prakritiOverlayText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  doctorSuggestChip: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  doctorSuggestChipCopy: {
    flex: 1,
    minWidth: 0,
  },
  doctorSuggestChipLabel: {
    fontSize: 9,
    color: '#0F766E',
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  doctorSuggestChipName: {
    fontSize: 11,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  videoPoster: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  videoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 97, 78, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  title: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 2,
    fontFamily: Fonts.PoppinsMedium,
  },
  priceContainer: {
    marginTop: 15,
  },
  price: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  prakritiBadge: {
    backgroundColor: '#D1FAE5',
    borderColor: '#047857',
    // borderWidth: 0.5,
  },
  prakritiBadgeText: {
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  ratingBadgeText: {
    flexShrink: 1,
    fontSize: 10,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  discoverBtn: {
    backgroundColor: '#0D614E',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  discoverText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
  },
  countText: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 40,
  },
});
