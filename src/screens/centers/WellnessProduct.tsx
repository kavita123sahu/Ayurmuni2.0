import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '../../common/Vector';


const WellnessCenterCard = memo(( center : any ) => {
  const renderStars = (rating : any) => {
    return Array.from({ length: 5 }, (_, index) => (
     <>
     </>
    ));
  };

  return (
    <View style={styles.centerCard}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: center.image }}
          style={styles.centerImage}
          resizeMode="cover"
        />
        <View style={styles.starsOverlay}>
          {renderStars(center.rating)}
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.centerName}>{center.name}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>Location: </Text>
          <Text style={styles.locationValue}>{center.location}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Starts Form: </Text>
          <Text style={styles.priceValue}>{center.price}</Text>
        </View>
      </View>
    </View>
  );
});



const RatingOverview = memo(() => {
  const renderStars = (rating : any) => {
    return Array.from({ length: 5 }, (_, index) => (
        <>
        </>
    //   <Star
    //     key={index}
    //     size={16}
    //     fill={index < rating ? "#FFD700" : "transparent"}
    //     color={index < rating ? "#FFD700" : "#E5E5E5"}
    //   />
    ));
  };

  return (
    <View style={styles.ratingOverview}>
      <Text style={styles.bigRating}>4.9</Text>
      <View style={styles.overallStars}>
        {renderStars(5)}
      </View>
    </View>
  );
});

const WellnessProduct = memo(() => {
  const centers = [
    {
      id: 1,
      name: "Detox Center Name 1",
      location: "Location Name",
      price: "₹50,000",
      rating: 5,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      name: "Detox Center Name 2", 
      location: "Location Name",
      price: "₹50,000",
      rating: 5,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop"
    }
  ];

  const ratingBars = [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 10 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Similar Wellness Centers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Similar Wellness Centers</Text>
        <View style={styles.underline} />
        
        <View style={styles.centersContainer}>
          {centers.map(center => (
            <WellnessCenterCard key={center.id} center={center} />
          ))}
        </View>
      </View>

      {/* Reviews & Ratings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
        <View style={styles.underline} />
        
        <View style={styles.reviewsContainer}>
          <RatingOverview />
          
          <View style={styles.ratingBars}>
            {ratingBars.map(bar => (
                <>
                </>
            //   <RatingBar 
            //     key={bar.stars} 
            //     stars={bar.stars} 
            //     percentage={bar.percentage} 
            //   />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: '#7CB342',
    marginBottom: 20,
  },
  centersContainer: {
    gap: 16,
  },
  centerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  centerImage: {
    width: '100%',
    height: '100%',
  },
  starsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 2,
  },
  cardContent: {
    padding: 16,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
  },
  locationValue: {
    fontSize: 14,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewsContainer: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'flex-start',
  },
  ratingOverview: {
    alignItems: 'center',
    gap: 8,
  },
  bigRating: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 64,
  },
  overallStars: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingBars: {
    flex: 1,
    gap: 8,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 12,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
});

WellnessCenterCard.displayName = 'WellnessCenterCard';

RatingOverview.displayName = 'RatingOverview';
WellnessProduct.displayName = 'WellnessProduct';

export default WellnessProduct;