import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import CustomStarRating from '../../component/CustomStarRating'
import { Ionicons } from '../../common/Vector'
import { Fonts } from '../../common/Fonts'
import { colors } from 'react-native-elements'
import { Colors } from '../../common/Colors'
import { fonts } from 'react-native-elements/dist/config'

export default function WellnessDetoxCard({center, isLarge}: {center: any, isLarge?: boolean}) {
   return (
      <TouchableOpacity
        key={center.id}
        style={[styles.detoxCard, isLarge && styles.largeCard]}
      >
        <Image source={{ uri: center.image }} style={[styles.cardImage, isLarge && styles.largeCardImage]} />

        <View style={styles.ratingBadge}>
          <View style={styles.starsContainer}>
            {/* {renderStars(center.rating)} */}
            <CustomStarRating
              rating={center.rating}
              starSize={14}
              maxRating={5} />
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.centerName, isLarge && styles.largeCenterName]}>
            {center.name}
          </Text>
          <Text style={styles.location}>{center.location}</Text>
          <Text style={styles.price}>
            Starts Form: <Text style={styles.priceText}>₹{center.startingPrice}</Text>
          </Text>

          {isLarge && (
            <View style={styles.ratingSection}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F38601" />
                <Text style={styles.ratingText}>{center.rating}</Text>
                <Text style={styles.excellentText}>Excellent</Text>
                <Text style={styles.reviewsText}>({center.reviews}k Ratings)</Text>
              </View>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
}


const { width } = Dimensions.get('window');

const styles = StyleSheet.create({  
     detoxCard: { backgroundColor: '#fff',  borderTopStartRadius : 12, borderTopRightRadius : 12, borderBottomLeftRadius:10, borderBottomRightRadius:10,  borderWidth : 0.3, borderColor : 'grey',   marginRight: 16, width: width / 2.5, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  largeCard: { width: '100%', marginTop: 16 },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover', backgroundColor :'#ffff', borderRadius: 15 },
    largeCardImage: { height: 200 },
     ratingBadge: {
    position: 'absolute',
    top: 90,
    left: 12,
    backgroundColor: '#1E1E1E33',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 5,
  },
   starsContainer: { flexDirection: 'row', alignItems: 'center' },
 cardContent: { padding: 16 },
  centerName: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: '#111827', marginBottom: 2},
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#6B7280', fontFamily: Fonts.PoppinsMedium, marginRight: 8 },
  largeCenterName: { fontSize: 14, fontFamily: Fonts.PoppinsSemiBold },
  location: { fontSize: 12, color: '#666',  fontFamily :Fonts.PoppinsRegular },
  price: { fontSize: 12, color: '#333', fontFamily: Fonts.PoppinsRegular },
  ratingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  priceText: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: Colors.textColor ,  },
    excellentText: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1A1A1A',
    // marginRight: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.PoppinsMedium,
  },
  
  shareButton: {
    padding: 4,
  },
})