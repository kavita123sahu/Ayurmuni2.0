import React, { useCallback, useMemo, useState } from 'react';
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

interface SuggestedItem {
  id?: string | number;
  type?: 'diet' | 'yoga' | string;

  title?: string;
  name?: string;

  // Common
  price?: number | string;
  is_paid?: boolean;

  // Diet
  guidance?: string;
  subtitle?: string;
  season?: string;
  short_description?: string;
  prakriti?: string;
  thumbnail_url?: string;
  image_url?: string;
  diet_plan_gallery?: Array<{
    image_url?: string;
    is_cover?: boolean;
  }>;
  suggested_doctor_name?: string;
  doctor_name?: string;
  suggested_by_doctor_name?: string;
  patient_assignment_status?: string;
  status?: string;

  // Yoga
  difficulty?: string;
  health_diseases?: Array<{
    name?: string;
  }>;

  [key: string]: any;
}

interface Props {
  data: SuggestedItem[];
  price?: boolean;
  isGrid?: boolean;
  header?: boolean;
  navigation: any;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  home?: boolean;
  edgeScroll?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  VIDEO                                     */
/* -------------------------------------------------------------------------- */

const YogaPreviewVideo = ({
  uri,
  fallbackUri,
}: {
  uri: string;
  fallbackUri?: string;
}) => {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
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
        <TablerIcon
          name="video"
          size={12}
          color="#FFFFFF"
        />
      </View>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const SuggestedCard: React.FC<Props> = ({
  data,
  price = false,
  isGrid = false,
  header = false,
  navigation,
  ListHeaderComponent,
  home = false,
  edgeScroll = false,
}) => {
  const [showAll, setShowAll] = useState(false);

  const safeData = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  const displayData = useMemo(
    () => (showAll ? safeData : safeData.slice(0, 6)),
    [safeData, showAll],
  );

  const formattedData = useMemo(() => {
    if (isGrid && displayData.length % 2 !== 0) {
      return [
        ...displayData,
        {
          id: '__empty__',
          type: '__empty__',
        },
      ];
    }

    return displayData;
  }, [displayData, isGrid]);

  /* ------------------------------------------------------------------------ */
  /*                                NAVIGATION                                */
  /* ------------------------------------------------------------------------ */

  const handleDietPress = useCallback(
    (item: SuggestedItem) => {
      const planId = String(
        (item as any)?.diet_plan_id || item?.id || '',
      ).trim();
      navigation.navigate('DietPlanDetail', {
        planId: planId || undefined,
        item,
      });
    },
    [navigation],
  );

  const handleYogaPress = useCallback(
    (item: SuggestedItem) => {
      navigation.navigate('YogaSession', {
        item,
      });
    },
    [navigation],
  );

  /* ------------------------------------------------------------------------ */
  /*                              DIET HELPERS                                */
  /* ------------------------------------------------------------------------ */

  const getDietImage = useCallback((item: SuggestedItem) => {
    const coverImage = item?.diet_plan_gallery?.find(
      image => image?.is_cover,
    )?.image_url;

    return (
      item?.thumbnail_url ||
      item?.image_url ||
      coverImage ||
      ''
    ).trim();
  }, []);

  const getDietSubtitle = useCallback((item: SuggestedItem) => {
    return String(
      item?.guidance ||
      item?.subtitle ||
      item?.season ||
      item?.short_description ||
      '',
    ).trim();
  }, []);

  const getDoctorName = useCallback((item: SuggestedItem) => {
    return String(
      item?.suggested_doctor_name ||
      item?.doctor_name ||
      item?.suggested_by_doctor_name ||
      '',
    ).trim();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                              YOGA HELPERS                                */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
  /*                              HEADER                                      */
  /* ------------------------------------------------------------------------ */

  const DefaultHeader = useCallback(
    () => (
      <>
        <PromoCard
          title="The Wellness Essentials"
          desc="Discover our loved organic selections, cold-pressed to preserve nature’s power."
          tag="CURATED EXCELLENCE"
          image={require('../assets/images/FinalLogo2.png')}
          showButton={false}
        />

        <SectionHeader
          title="Top Selling Products"
          actionText="View all"
        />
      </>
    ),
    [],
  );

  /* ------------------------------------------------------------------------ */
  /*                             EMPTY STATE                                  */
  /* ------------------------------------------------------------------------ */

  if (safeData.length === 0) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /*                              DIET CARD                                   */
  /* ------------------------------------------------------------------------ */

  const renderDietCard = (item: SuggestedItem) => {
    const title = item?.title || item?.name || '';

    const subtitle = getDietSubtitle(item);

    const prakriti = String(
      item?.prakriti || '',
    ).trim();

    const doctorName = getDoctorName(item);

    const doctorLabel = doctorName.replace(
      /^dr\.?\s*/i,
      '',
    );

    const ratingText =
      formatDietPlanRatingBadgeText(item);

    const dietStatus = String(
      item?.patient_assignment_status ||
      item?.status ||
      '',
    )
      .replace(/_/g, ' ')
      .trim();

    const imageUri = getDietImage(item);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleDietPress(item)}
        style={[
          styles.card,
          isGrid && styles.gridCard,
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require('../assets/images/login/7.jpg')
            }
            style={styles.image}
            resizeMode="cover"
          />

          {!!prakriti && (
            <View
              style={[
                styles.prakritiOverlay,
                styles.prakritiBadge,
              ]}
            >
              <Text
                style={[
                  styles.prakritiOverlayText,
                  styles.prakritiBadgeText,
                ]}
                numberOfLines={1}
              >
                {prakriti}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.subContainer}>
          <View style={styles.contentColumn}>
            <Text
              style={styles.title}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            {!!subtitle && (
              <Text
                style={styles.subtitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            )}

            {!subtitle && !!doctorName && (
              <View style={styles.doctorSuggestChip}>
                <TablerIcon
                  name="stethoscope"
                  size={11}
                  color="#0D614E"
                />

                <View style={styles.doctorSuggestChipCopy}>
                  <Text
                    style={styles.doctorSuggestChipLabel}
                  >
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
            )}

            <View style={styles.infoRow}>
              {!!ratingText && (
                <View style={styles.ratingBadge}>
                  <TablerIcon
                    name="star"
                    size={10}
                    color="#F59E0B"
                    strokeWidth={2}
                  />

                  <Text
                    style={styles.ratingBadgeText}
                    numberOfLines={1}
                  >
                    {ratingText}
                  </Text>
                </View>
              )}

              {!!dietStatus && (
                <View style={styles.badge}>
                  <Text
                    style={styles.badgeText}
                    numberOfLines={1}
                  >
                    {dietStatus.charAt(0).toUpperCase() +
                      dietStatus.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {price && (
              <View style={styles.priceContainer}>
                {item?.is_paid === false ||
                  Number(item?.price) === 0 ? (
                  <Text style={styles.price}>
                    Free
                  </Text>
                ) : (
                  <RupeeAmount
                    value={item?.price}
                    style={styles.price}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                              YOGA CARD                                   */
  /* ------------------------------------------------------------------------ */

  const renderYogaCard = (item: SuggestedItem) => {
    console.log("yogadataaaaaaaaaaaaa", item)
    const title = item?.title || item?.name || '';

    const short_description = item?.short_description;

    const difficulty = String(
      item?.difficulty || '',
    ).trim();

    const imageUri =
      resolveYogaThumbnailUri(item);

    const videoUri =
      resolveYogaVideoUri(item);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleYogaPress(item)}
        style={[
          styles.card,
          isGrid && styles.gridCard,
        ]}
      >
        <View style={styles.imageContainer}>
          {videoUri ? (
            <YogaPreviewVideo
              uri={videoUri}
              fallbackUri={
                imageUri || undefined
              }
            />
          ) : (
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : require('../assets/images/login/7.jpg')
              }
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.subContainer}>
          <View style={styles.contentColumn}>
            <Text
              style={styles.title}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            {!!short_description && (
              <Text
                style={styles.subtitle}
                numberOfLines={3}
              // ellipsizeMode="tail"
              >
                {short_description}
              </Text>
            )}

            {!!difficulty && (
              <View style={styles.infoRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {difficulty}
                  </Text>
                </View>
              </View>
            )}

            {price && (
              <View style={styles.priceContainer}>
                {item?.is_paid === false ||
                  Number(item?.price) === 0 ? (
                  <Text style={styles.price}>
                    Free
                  </Text>
                ) : (
                  <RupeeAmount
                    value={item?.price}
                    style={styles.price}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                              RENDER ITEM                                 */
  /* ------------------------------------------------------------------------ */

  const renderItem = ({
    item,
  }: {
    item: SuggestedItem;
  }) => {
    if (item?.type === '__empty__') {
      return (
        <View
          style={[
            styles.card,
            styles.gridCard,
            styles.emptyCard,
          ]}
        />
      );
    }

    if (item?.type === 'diet') {
      return renderDietCard(item);
    }

    if (item?.type === 'yoga') {
      return renderYogaCard(item);
    }

    return null;
  };

  /* ------------------------------------------------------------------------ */
  /*                              FOOTER                                      */
  /* ------------------------------------------------------------------------ */

  const renderFooter = () => {
    if (!isGrid || safeData.length <= 6) {
      return null;
    }

    return (
      <View style={styles.footerContainer}>
        {!showAll && (
          <TouchableOpacity
            style={styles.discoverBtn}
            activeOpacity={0.85}
            onPress={() => setShowAll(true)}
          >
            <Text style={styles.discoverText}>
              Discover More
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.countText}>
          Showing{' '}
          {showAll ? safeData.length : 6} of{' '}
          {safeData.length} items
        </Text>
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                               FLATLIST                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <FlatList
      key={isGrid ? 'grid' : 'list'}
      data={formattedData}
      keyExtractor={(item, index) =>
        item?.id?.toString() ||
        index.toString()
      }
      horizontal={!isGrid}
      numColumns={isGrid ? 2 : 1}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContent,
        home && styles.listContentHome,
        home &&
        edgeScroll &&
        styles.listContentEdge,
      ]}
      ListHeaderComponent={
        header
          ? ListHeaderComponent || (
            <DefaultHeader />
          )
          : undefined
      }
      columnWrapperStyle={
        isGrid
          ? {
            justifyContent: 'space-between',
            marginBottom: 14,
          }
          : undefined
      }
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
    />
  );
};

export default React.memo(SuggestedCard);

/* -------------------------------------------------------------------------- */
/*                                  STYLES                                    */
/* -------------------------------------------------------------------------- */

const { width } = Dimensions.get('window');

const GRID_CARD_WIDTH =
  (width - 48) / 2;

const LIST_CARD_WIDTH =
  Math.min(width * 0.42, 156);

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

  /* ------------------------------- Diet -------------------------------- */

  prakritiOverlay: {
    position: 'absolute',
    left: 6,
    top: 6,
    maxWidth: '88%',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  prakritiOverlayText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  prakritiBadge: {
    backgroundColor: '#D1FAE5',
    borderColor: '#047857',
  },

  prakritiBadgeText: {
    color: '#047857',
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

  /* ------------------------------- Yoga --------------------------------- */

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

  /* ------------------------------- Common -------------------------------- */

  subContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  contentColumn: {
    flex: 1,
    minWidth: 0,
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

  priceContainer: {
    marginTop: 15,
  },

  price: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0D614E',
    marginTop: 2,
  },

  /* -------------------------------- Footer ------------------------------- */

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
