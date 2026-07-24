import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../../components/TablerIcon';
import { RADIUS, SPACING, TYPO } from '../../constants/responsive';

const CARD_WIDTH = 248;
const CARD_GAP = 12;

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

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={() => openDoctorProfile(item)}
        >
          <View style={styles.doctorRow}>
  <View style={styles.avatarWrapper}>
    {item?.profile_image ? (
      <Image source={{ uri: item.profile_image }} style={styles.avatar} />
    ) : (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <TablerIcon name="user" size={18} color={Colors.primaryColor} />
      </View>
    )}

    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: isAvailable ? '#22C55E' : '#CBD5E1',
        },
      ]}
    />
  </View>

  <View style={styles.doctorMeta}>

              <View style={styles.nameRow}>
                <Text style={styles.doctorName} numberOfLines={2}>
                  {item.full_name || item.name}
                </Text>

              
              </View>

              <Text style={styles.speciality} numberOfLines={1}>
                {speciality.split(',').slice(0, 2).join(', ') || 'Ayurveda Specialist'}
              </Text>
            </View>
          </View>

          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <TablerIcon name="clock" size={14} color={Colors.primaryColor} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item?.experience_years || '—'} Yrs
              </Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <TablerIcon name="star" size={14} color="#F59E0B" />
              <Text style={styles.infoText} numberOfLines={1}>
                {item?.average_rating ?? item?.ranking_score ?? '0'}
                {item?.total_reviews != null ? ` (${item.total_reviews})` : ''}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
    backgroundColor: Colors.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginRight: CARD_GAP,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  avatarWrapper: {
  position: 'relative',
  marginRight: SPACING.sm,
},

statusBadge: {
  position: 'absolute',
  right: 1,
  bottom: 1,
  width: 12,
  height: 12,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: '#FFF',
},

doctorName: {
  fontSize: TYPO.subtitle,
  color: Colors.black,
  fontFamily: Fonts.PoppinsSemiBold,
  lineHeight: 18,
  flexShrink: 1,
},

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FAF7',
  },
  doctorMeta: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  // doctorName: {
  //   flex: 1,
  //   fontSize: TYPO.subtitle,
  //   color: Colors.black,
  //   fontFamily: Fonts.PoppinsSemiBold,
  //   lineHeight: 17,
  // },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  statusBtnActive: {
    backgroundColor: '#22C55E',
  },
  statusBtnInactive: {
    backgroundColor: '#E2E8F0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusDotActive: {
    backgroundColor: '#FFFFFF',
  },
  statusDotInactive: {
    backgroundColor: '#94A3B8',
  },
  statusBtnText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    lineHeight: 12,
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  statusBtnTextInactive: {
    color: '#64748B',
  },
  speciality: {
    marginTop: 2,
    fontSize: TYPO.caption,
    color: Colors.grey1,
    fontFamily: Fonts.PoppinsRegular,
    lineHeight: 14,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgcolor,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  infoText: {
    flexShrink: 1,
    fontSize: TYPO.caption,
    marginLeft: 5,
    fontFamily: Fonts.PoppinsMedium,
    color: '#334155',
  },
  infoDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.borderColor,
    marginHorizontal: 4,
  },
});
