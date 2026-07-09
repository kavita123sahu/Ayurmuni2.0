import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../../components/TablerIcon';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.66, 270);
const CARD_HEIGHT = 196;

interface Doctor {
  id: string;
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
  const stackNav = navigation?.getParent?.() || navigation;

  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => {
      const therapies = Array.isArray(item?.health_diseases)
        ? item.health_diseases.map((disease: any) => disease.name).join(', ')
        : '';

      const openProfile = () =>
        stackNav.navigate('DoctorProfile', { doctorData: item });

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={openProfile}
        >
          <View style={styles.accentBar} />

          <View style={styles.topRow}>

            <View style={styles.doctorImageWrapper}>
              {item?.profile_image ? (
                <Image
                  source={{ uri: item.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(item?.first_name?.charAt(0) || 'D').toUpperCase()}
                  </Text>
                </View>
              )}
              {item?.has_availability && (
                <View style={styles.onlineDot} />
              )}
            </View>

            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.name}>
                {item.full_name || item.name}
              </Text>
              <Text numberOfLines={2} style={styles.specialization}>
                {therapies?.split(',').slice(0, 2).join(', ') || 'Ayurveda Specialist'}
              </Text>

              <View style={styles.expRow}>
                <TablerIcon name="briefcase" size={13} color="#64748B" />
                <Text style={styles.exp}>
                  {item?.experience_years || '—'} Yrs Exp
                </Text>
              </View>
            </View>

          </View>

          <View style={styles.footer}>
            <View style={styles.ratingPill}>
              <TablerIcon name="star" size={14} color="#F59E0B" />
              <Text style={styles.rating}>{item.ranking_score || '4.8'}</Text>
              <Text style={styles.reviewCount}>
                ({item.total_reviews || '0'})
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bookPill}
              activeOpacity={0.85}
              onPress={openProfile}
            >
              <Text style={styles.bookText}>Book</Text>
              <TablerIcon name="calendar" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      );
    },
    [stackNav],
  );

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      getItemLayout={(_, index) => ({
        length: CARD_WIDTH + 12,
        offset: (CARD_WIDTH + 12) * index,
        index,
      })}
    />
  );
};

export default React.memo(TopDoctorsCard);

const styles = StyleSheet.create({
  container: {
    paddingRight: 10,
    paddingBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8EEF3',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primaryColor,
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 16,
    height: 50,   //118
  },

  doctorImageWrapper: {
    width: 62,
    height: 62,
    borderRadius: 18,
    overflow: 'visible',
    marginRight: 12,
    backgroundColor: '#F0FAF7',
    borderWidth: 2,
    borderColor: '#E2F3EE',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  info: {
    flex: 1,
    height: 90,
    justifyContent: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    lineHeight: 20,
  },
  specialization: {
    marginTop: 4,
    minHeight: 32,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  exp: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFCFB',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rating: {
    fontSize: 12,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  reviewCount: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  bookPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    minWidth: 96,
    justifyContent: 'center',
  },
  bookText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
