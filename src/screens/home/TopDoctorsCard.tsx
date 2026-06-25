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
import { Feather } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import { Styles } from '../../common/Styles';
import { Fonts } from '../../common/Fonts';

const { width } = Dimensions.get('window');

// 🔥 Dynamic card width
const CARD_WIDTH = Math.min(
  width * 0.60,
  300,
);
// const CARD_WIDTH = width * 0.50;

interface Doctor {
  id: string;
  full_name: string;
  specializations: [];
  experience: string;
  name: string;
  total_reviews: string;
  ranking_score: string;
  experience_years: string;
  profile_image: any;
  has_availability?: boolean;
}

const TopDoctorsCard = ({ data = [], navigation }: any) => {

  console.log("data--->", data);


  const renderItem = useCallback(({ item }: { item: Doctor }) => {
    console.log('item?.specializations', item);
    const therapies = Array.isArray(
      item?.specializations
    )
      ? item.specializations
      : [];
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() =>
        navigation.navigate(
          'DoctorProfile',
          {
            doctorData: item,
          },
        )
      }>

        {/* AVAILABLE TAG */}
        {/* {item.has_availability && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}> {item?.has_availability ? ' Available Now' : ''} </Text>
          </View>
        )} */}

        {/* TOP SECTION */}
        <View style={styles.topRow}>
          <View style={styles.doctorImageWrapper}>
            {
              item?.profile_image ? (
                <Image
                  source={{ uri: item.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(
                      item?.first_name?.charAt(0) ||
                      ''
                    ).toUpperCase()}
                  </Text>
                </View>
              )
            }
          </View>

          <View style={styles.info}>
            <Text
              numberOfLines={2}
              style={styles.name}
            >
              {item?.full_name || item?.name}
            </Text>

            <Text
              numberOfLines={2}
              style={styles.specialization}
            >
              {therapies.join(', ')}
            </Text>

            {item?.has_availability && (
              <View style={styles.availableBadge}>
                <View style={styles.dot} />
                <Text style={styles.availableText}>
                  Available Now
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Image source={Images.clock} style={styles.icon} />
          <Text style={styles.exp}>{item?.experience_years} Yrs. Exp</Text>
        </View>


        <View style={styles.bottomRow}>

          <View style={styles.ratingRow}>
            <Image source={Images.star} style={styles.icon} />
            <Text style={styles.rating}>{item.ranking_score} <Text style={{ color: Colors.subTextColor, fontSize: 9, fontFamily: Fonts.PoppinsRegular }}>{`(${item.total_reviews})`} </Text>  </Text>
          </View>

          {/* <TouchableOpacity style={styles.callBtn}> */}
          <Image source={Images.bookDoctor} style={[styles.IconSize]} />
          {/* </TouchableOpacity> */}

        </View>

      </TouchableOpacity>
    );
  }, []);

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
        length: CARD_WIDTH,
        offset: CARD_WIDTH * index,
        index,
      })}
    />
  );
};

export default React.memo(TopDoctorsCard);


const styles = StyleSheet.create({
  container: {
    paddingRight: 10,
    paddingBottom: 10,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  badge: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 10,
  },

  badgeText: {
    fontSize: 10,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  doctorImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.bgcolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },

  name: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
    lineHeight: 22,

  },



  specialization: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsRegular,
  },

  availableBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.bgcolor,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
    marginRight: 6,
  },

  availableText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },


  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    height: 15,
    width: 15,
    marginRight: 6,   // 🔥 gap between icon & text
  },

  exp: {
    fontSize: 12,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 14,
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: Fonts.PoppinsMedium,
  },
  callBtn: {
    backgroundColor: '#0D614E',
    height: 42,
    width: 42,
    marginBottom: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  IconSize: {
    // marginBottom: 15,
    // borderRadius: 12,
    height: 42,
    width: 42,
    // justifyContent: 'center',
    // alignItems: 'center',
  }
});