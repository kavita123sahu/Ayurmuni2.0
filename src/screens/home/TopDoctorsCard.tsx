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
const CARD_WIDTH = width * 0.65;

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: string;
  image: any;
  available?: boolean;
}

const TopDoctorsCard = ({ data = [], navigation }: any) => {

  const renderItem = useCallback(({ item }: { item: Doctor }) => {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>

        {/* AVAILABLE TAG */}
        {item.available && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Available Now</Text>
          </View>
        )}

        {/* TOP SECTION */}
        <View style={styles.topRow}>

          <View style={{
            height: 55, width: 55,
            borderRadius: 10,
            justifyContent: 'center',   // vertical center
            alignItems: 'center',
            marginRight: 10, backgroundColor: Colors.bgcolor
          }}>
            <Image source={item.image} style={styles.avatar} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.specialization}>
              {item.specialization}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Image source={Images.clock} style={styles.icon} />
          <Text style={styles.exp}>{item.experience}</Text>
        </View>

        {/* RATING + CALL */}
        <View style={styles.bottomRow}>

          <View style={styles.ratingRow}>
            <Image source={Images.star} style={styles.icon} />
            <Text style={styles.rating}>{item.rating} <Text style={{ color: Colors.subTextColor, fontSize: 9, fontFamily: Fonts.PoppinsRegular }}>{'(839)'} </Text>  </Text>
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
    // paddingHorizontal:10,
    paddingBottom: 10,
  },

  card: {
    width: CARD_WIDTH,

    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 15,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  badge: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
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
    flex: 1,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    resizeMode: 'contain'
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1E293B',
  },

  specialization: {

    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsRegular,

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',   // 🔥 vertical center
    marginTop: 10,
    marginBottom: -15
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
  },

  rating: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
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
    marginBottom: 10,
    borderRadius: 12,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  }
});