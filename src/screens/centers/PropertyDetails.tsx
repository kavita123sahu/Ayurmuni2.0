import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

const PropertyDetails = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={isLargeScreen ? styles.containerLarge : styles.containerSmall}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {/* About Section */}
          <View >
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>About the property</Text>
              <View style={styles.titleUnderline} />
            </View>
            <Text style={styles.aboutText}>
              Lorem ipsum dolor sit amet consectetur. Nulla libero ut et
              arcu vitae. Lorem ipsum dolor sit amet consectetur. Lorem
              ipsum dolor sit amet consectetur.
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amenities}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.titleUnderline} />
            </View>
            <View style={styles.amenitiesGrid}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <TouchableOpacity key={item} style={styles.amenityItem} />
              ))}
            </View>
            <TouchableOpacity>
              <Text style={styles.moreAmenities}>More Amenities</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photos}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <View style={styles.titleUnderline} />
            </View>
            <View style={styles.photosGrid}>
              {[1, 2, 3].map((item) => (
                <TouchableOpacity key={item} style={styles.photoItem}>
                  <View style={styles.photoPlaceholder}>
                    <View style={styles.photoIcon} />
                    <View style={styles.photoLine} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Traditional Science Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceTitle}>
                The Traditional Science Of Ayurveda
              </Text>
              <Text style={styles.serviceSubtitle}>
                Panchakarma Offers The Ultimate Body & Mind Complete Cleanse.
                It Is The Most Effective Detoxifying And Rejuvenating Treatment
                For Mind And Healing From Within.
              </Text>
              <View style={styles.servicePriceContainer}>
                <Text style={styles.servicePrice}>₹50,000</Text>
                <Text style={styles.servicePriceNote}>+GST & Fees</Text>
              </View>
            </View>
          </View>

          {/* Rejuvenation Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceCategory}>Rejuvenation & Immunity</Text>
              <View style={[styles.serviceImage, styles.serviceImageOrange]} />
              <View style={styles.serviceFeatures}>
                <View style={styles.featureItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>Complete Body Detox</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>Immunity Boost Program</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>Nightstay Included</Text>
                </View>
              </View>
              <Text style={styles.serviceDescription}>
                Ayurvedic Rejuvenation Program Designed To Boost Immunity & Vitality
              </Text>
              <View style={styles.servicePriceContainer}>
                <Text style={[styles.servicePrice, styles.servicePriceDark]}>₹50,000</Text>
                <Text style={[styles.servicePriceNote, styles.servicePriceNoteDark]}>
                  +GST & Fees
                </Text>
              </View>
            </View>
          </View>

          {/* Weight Management Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceCategory}>Weight Management</Text>
              <View style={[styles.serviceImage, styles.serviceImageBlue]} />
              <View style={styles.serviceFeatures}>
                <View style={styles.featureItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>Complete Weight Loss Program</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>Integrated Wellness Approach</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.featureText}>Nightstay Included</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerLarge: {
    flexDirection: 'row',
    maxWidth: 1400,
    alignSelf: 'center',
    padding: 20,
    gap: 20,
  },
  containerSmall: {
    padding: 20,
  },
  leftSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 30,
  },
  rightSection: {
    width: isLargeScreen ? 400 : '100%',
    gap: 20,
    marginTop: isLargeScreen ? 0 : 20,
  },
  sectionTitleContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  titleUnderline: {
    width: 50,
    height: 3,
    backgroundColor: '#4CAF50',
  },
  aboutText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  viewMore: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 16,
  },
  amenities: {
    marginTop: 40,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amenityItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    marginBottom: 15,
  },
  moreAmenities: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 16,
  },
  photos: {
    marginTop: 40,
  },
  photosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 4,
    position: 'relative',
  },
  photoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#999',
    borderRadius: 4,
  },
  photoLine: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: '#999',
    borderRadius: 1,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  serviceHeader: {
    padding: 20,
    backgroundColor: '#667eea',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 10,
  },
  servicePriceContainer: {
    marginTop: 10,
  },
  servicePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  servicePriceNote: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  servicePriceDark: {
    color: '#333',
  },
  servicePriceNoteDark: {
    color: '#666',
  },
  serviceContent: {
    padding: 20,
  },
  serviceCategory: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 15,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 15,
  },
  serviceImageOrange: {
    backgroundColor: '#fab1a0',
  },
  serviceImageBlue: {
    backgroundColor: '#74b9ff',
  },
  serviceFeatures: {
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  featureText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  serviceDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
});

export default PropertyDetails;