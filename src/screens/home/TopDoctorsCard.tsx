import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { Ionicons } from '../../common/Vector';
import TablerIcon from '../../components/TablerIcon';

const CARD_WIDTH = 232;
const CARD_GAP = 10;

interface Doctor {
  id: string;
  average_rating?: string;
  full_name: string;
  health_diseases: [];
  experience: string;
  name: string;
  total_reviews: string;
  ranking_score: string;
  experience_years: string;
  profile_image: any;
  has_availability?: boolean;
  first_name?: string;
}

const TopDoctorsCard = ({ data = [], navigation }: any) => {
  const openDoctorProfile = useCallback(
    (item: Doctor) => {
      navigation?.navigate?.('DoctorProfile', { doctorData: item });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => {
      const speciality = Array.isArray(item?.health_diseases)
        ? item.health_diseases.map((disease: any) => disease.name).join(', ')
        : 'Ayurveda Specialist';

      const isAvailable = item?.has_availability === true;
      const rating = item?.average_rating ?? item?.ranking_score ?? '0';
      const reviewCount = item?.total_reviews ?? '0';
      const experience = item?.experience_years || item?.experience || '0';
      const displayName = item.full_name || item.name || 'Doctor';
      const shortSpeciality =
        speciality.split(',').slice(0, 2).join(', ') || 'Ayurveda Specialist';

      return (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            // isAvailable ? styles.cardActive : styles.cardIdle,
            // pressed && styles.cardPressed,
          ]}
          onPress={() => openDoctorProfile(item)}
        >
          <View style={styles.bodyRow}>
            <View style={styles.imageWrapper}>
              <Image
                source={
                  item?.profile_image?.trim?.()
                    ? { uri: item.profile_image }
                    : Images.doctorImage
                }
                style={[styles.image, !isAvailable && styles.imageMuted]}
              />
              {isAvailable ? <View style={styles.liveDot} /> : null}
            </View>

            <View style={styles.content}>
              <View style={styles.tagRow}>
                {/* <View style={[styles.tag, !isAvailable && styles.tagIdle]}>
                  <Text style={[styles.tagText, !isAvailable && styles.tagTextIdle]}>
                    {isAvailable ? 'Active' : 'Inactive'}
                  </Text>
                </View> */}
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>

              <Text style={styles.speciality} numberOfLines={1}>
                {shortSpeciality}
              </Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={12} color="#64748B" />
                  <Text style={styles.infoText}>{experience} Yrs</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.infoText}>
                    {rating}
                    <Text style={styles.reviewCount}> ({reviewCount})</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* /!isAvailable && styles.consultBtnIdle */}
          <View style={[styles.consultBtn,]}>
            <TablerIcon name="consult" size={16} color="#FFFFFF" />
            <Text style={styles.consultText}>Consult Now</Text>
          </View>
        </Pressable>
      );
    },
    [openDoctorProfile],
  );

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      getItemLayout={(_, index) => ({
        length: CARD_WIDTH + CARD_GAP,
        offset: (CARD_WIDTH + CARD_GAP) * index,
        index,
      })}
    />
  );
};

export default React.memo(TopDoctorsCard);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    paddingRight: 4,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    borderRadius: 14,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF2',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#0D614E',
    //     shadowOffset: { width: 0, height: 3 },
    //     shadowOpacity: 0.07,
    //     shadowRadius: 8,
    //   },
    //   // android: { elevation: 3 },
    // }),
  },
  cardActive: {
    borderColor: '#CFE8DF',
  },
  cardIdle: {
    backgroundColor: '#FAFBFC',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrapper: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: Colors.bgborderColor,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageMuted: {
    opacity: 0.75,
  },
  liveDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  tag: {
    backgroundColor: '#EAF8F4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  tagIdle: {
    backgroundColor: '#F1F5F9',
  },
  tagText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  tagTextIdle: {
    color: '#94A3B8',
  },
  name: {
    fontSize: 13,
    lineHeight: 17,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  speciality: {
    fontSize: 10,
    lineHeight: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  consultBtn: {
    marginTop: 8,
    height: 34,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
    gap: 5,
  },
  consultBtnIdle: {
    backgroundColor: '#94A3B8',
  },
  consultText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
