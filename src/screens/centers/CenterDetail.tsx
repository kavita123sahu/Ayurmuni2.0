import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CenterCard from '../../component/CenterCard';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import RatingCard from '../../component/RatingCard';
import { NavigationProp } from '@react-navigation/native';
import WellnessDetoxCard from './WellnessDetoxCard';
import { flagshipCenters } from '../../common/datafile';

const { width, height } = Dimensions.get('window');

interface CenterDetailProps {
    onBack?: () => void;
    onShare?: () => void;
    onSearch?: () => void;

    navigation: NavigationProp<any>;

}

const CenterDetail: React.FC<CenterDetailProps> = ({ onBack, onShare, onSearch, navigation }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


    console.log('nativagtionnnnnnnnn:', navigation);
    const images = [
        require('../../assets/images/DetoxCenter.png'), // Replace with your image paths
        require('../../assets/images/DetoxCenter.png'),
        require('../../assets/images/DetoxCenter.png'),
    ];



    const centerData = {
        name: 'Detox Center Name',
        rating: 4.5,
        location: 'Location Name',
        checkIn: '1 PM',
        checkOut: '11 AM',
        dateRange: '20 Mar - 31 Mar',
        guests: '2 Guests',
        offer: 'Offer',
        offerDescription: 'Lorem ipsum dolor sit amet consectetur. Nulla libero ut et arcu morbi. Lorem ipsum dolor sit amet consectetur.',
        aboutProperty: 'Lorem ipsum dolor sit amet consectetur. Nulla libero ut et arcu morbi. Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.',
        amenities: [
            'WiFi', 'Parking', 'Pool', 'Gym', 'Spa', 'Restaurant'
        ]
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Icon
                    key={i}
                    name="star"
                    size={16}
                    color={i <= rating ? '#FFD700' : '#E0E0E0'}
                />
            );
        }
        return stars;
    };

    const handleImageScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const imageIndex = Math.round(contentOffset / width);
        setCurrentImageIndex(imageIndex);
    };

    const renderImageItem = ({ item }: { item: any }) => (
        <Image source={item} style={styles.headerImage} />
    );

    const renderImageIndicators = () => {
        return (
            <View style={styles.imageIndicators}>
                {images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            { backgroundColor: index === currentImageIndex ? '#FFFFFF' : '#FFFFFF80' }
                        ]}
                    />
                ))}
            </View>
        );
    };

    const HeaderCard = () => {

        return (

            <View style={styles.heroOverlay}>
                <View style={styles.centerInfoSection}>
                    {/* <Image source={require('../../assets/images/Homebanner.png')} style={{ height: 115, width: '100%' }} /> */}
                </View>

                <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                        {renderStars(centerData.rating)}
                    </View>
                </View>

                <Text style={styles.centerName}>{centerData.name}</Text>
                <Text style={styles.centerName}>Location:
                    <Text style={styles.centerName}>Location Name</Text>
                </Text>
                <Text style={styles.centerName}>Start Form:
                    <Text style={styles.centerName}> Location Name</Text>
                </Text>

            </View>
        )
    }


    const OfferCard = () => {
        return (
            <View style={styles.offerSection}>
                <View style={styles.offerHeader}>
                    <Image source={require('../../assets/images/offerIcon.png')} style={{ height: 16, width: 16 }} />
                    <Text style={styles.offerTitle}>{centerData.offer}</Text>
                </View>
                <Text style={styles.offerDescription}>{centerData.offerDescription}</Text>
            </View>
        )
    }
    const HeaderSection = () => (
        <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerRightButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={onSearch}>
                    <Icon name="search" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                    <Icon name="share" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    )



    interface TitleObject {
        title: string;
    }
    const TitleHeader = (Item: TitleObject) => {
        return (
            <View style={styles.packageHeader}>
                <Text style={styles.packageTitle}>{Item.title}</Text>
                <Image source={require('../../assets/images/BottomLine.png')} style={{ height: 2, width: 35 }} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <View style={styles.imageContainer}>
                    <FlatList
                        //   ref={flatListRef}
                        data={images}
                        renderItem={renderImageItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleImageScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(_, index) => index.toString()}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                    />

                    <HeaderSection />

                    <TouchableOpacity style={styles.morePhotosButton}>
                        <Text style={styles.morePhotosText}>More photos</Text>
                    </TouchableOpacity>
                    {renderImageIndicators()}

                </View>


                <TouchableOpacity style={styles.searchWrapper} >
                    <CenterCard centerData={centerData} navigation={navigation} />
                </TouchableOpacity>

                <View style={styles.Sectioncontainer}>
                    <OfferCard />

                    <View style={styles.aboutSection}>

                        <TitleHeader title='About the Property' />

                        <Text style={styles.aboutText}>{centerData.aboutProperty}</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewMoreText}>View More</Text>
                        </TouchableOpacity>


                        <View style={styles.dividerLine} />

                        <View style={styles.amenitiesSection}>
                            <View style={styles.packageHeader}>
                                <Text style={styles.packageTitle}>{'Amenites'}</Text>
                                <Image source={require('../../assets/images/BottomLine.png')} style={{ height: 2, width: 35 }} />
                            </View>

                            <View style={styles.amenitiesGrid}>
                                {centerData.amenities.map((amenity, index) => (
                                    <View key={index} style={styles.amenityItem}>
                                        <Text style={styles.amenityText}>{amenity}</Text>
                                    </View>
                                ))}

                                <TouchableOpacity>
                                    <Text style={styles.viewMoreText}>More Amenites</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.dividerLine} />

                        <View style={styles.amenitiesSection}>
                            <View style={styles.packageHeader}>
                                <Text style={styles.packageTitle}>{'Amenites'}</Text>
                                <Image source={require('../../assets/images/BottomLine.png')} style={{ height: 2, width: 35 }} />
                            </View>

                            <View style={styles.photosGrid}>
                                {centerData.amenities.map((photos, index) => (
                                    <View key={index} style={styles.PhotosItem}>
                                        <Text style={styles.photosText}>{photos}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                    </View>

                    <View style={styles.aboutSection}>
                        <View style={styles.packageHeader}>
                            <Text style={styles.packageTitle}>{'Similar Wellness Centers'}</Text>
                            <Image source={require('../../assets/images/BottomLine.png')} style={{ height: 2, width: 35 }} />
                        </View>

                        {/* <View style={styles.amenitiesSection}> */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                {flagshipCenters.map(center => (
                                    <WellnessDetoxCard center={center} isLarge={false} />))
                                }
                            </ScrollView>

                        {/* </View> */}
                    </View>


                    <View style={styles.packageHeader}>
                        <Text style={styles.packageTitle}>{'Reviews & Ratings'}</Text>
                        <Image source={require('../../assets/images/BottomLine.png')} style={{ height: 2, width: 35 }} />
                    </View>

                    <RatingCard title='' />

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        height: height * 0.3,
        position: 'relative',
    },
    headerImage: {
        width: width,
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: StatusBar.currentHeight || 40,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerRightButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
    },
    morePhotosButton: {
        position: 'absolute',
        bottom: 90,
        right: 16,
        backgroundColor: '#00000080',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    morePhotosText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    searchWrapper: {
        paddingHorizontal: 15,

        // width: '100%',
        // width: '100%', // Takes full width minus the 15px padding
        // maxWidth: 400,
        marginTop: -30,
        zIndex: 10, // Optional: set max width if needed
        // Center the wrapper itself
    },
    Sectioncontainer: {
        marginTop: 30,
        paddingHorizontal: 15
    },

    scrollContainer: {
        flex: 1,

    },
    heroOverlay: {

        // justifyContent: 'center',
        // gap: 8,
        elevation: 3,
        backgroundColor: '#fff',
        borderRadius: 10,
        // paddingHorizontal: 15,


        // marginTop: -50,
        // zIndex: 10,
    },

    centerInfoSection: {
        borderRadius: 10,
        height: 115,
        backgroundColor: '#D9D9D9',
    },
    ratingContainer: {
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    centerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 12,
        paddingHorizontal: 15,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 16,
        color: '#333333',
        flex: 1,
    },
    viewOnMapText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    datesGuestsSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    viewCalendarText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    checkInOutContainer: {
        marginBottom: 12,
    },
    checkInOutText: {
        fontSize: 14,
        color: '#666666',
    },
    dateGuestRow: {
        flexDirection: 'row',
        gap: 16,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    guestContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    guestText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    offerSection: {
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    offerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        paddingHorizontal: 10,
        height: 20,
        borderRadius: 20,
        backgroundColor: '#fff',
        elevation: 2,
        top: -10,
        position: 'absolute',
        left: 10,
        // marginBottom: 8,
    },
    offerTitle: {
        fontSize: 10,

        fontWeight: 'bold',
        color: '#FF5722',
    },
    offerDescription: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    aboutSection: {
        padding: 16,
        // borderBottomWidth: 1,
        elevation: 2,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff'
        // borderBottomColor: '#E0E0E0',
    },
    packageHeader: {
        // backgroundColor: '#8BC34A',
        // paddingVertical: 12,
        // paddingHorizontal: 16,
        // borderTopLeftRadius: 12,
        // borderTopRightRadius: 12,
        flex: 1


    },
    packageTitle: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    aboutText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    viewMoreText: {
        fontSize: 14,
        color: Colors.secondaryColor,
        fontFamily: Fonts.PoppinsMedium
    },
    dividerLine: {
        flex: 1,
        height: 1,
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: '#E0E0E0',
    },
    amenitiesSection: {
        flex: 1
    },
    horizontalScroll: {  paddingHorizontal: 0, padding :5 },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        paddingHorizontal: 10,
        gap: 12,
        width: '100%',
        marginTop: 12,
    },
    photosGrid: {
        // flexDirection: 'row',
        // flexWrap: 'wrap',
        // gap: 10,
        // marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        paddingHorizontal: 10,
        gap: 12,
        marginTop: 12,
    },

    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 10,
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
        width: '30%',
        height: 72,
        // minWidth: '35%',
    },

    PhotosItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 10,
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
        width: '30%',
        height: 150,
        // minWidth: '35%',
    },

    amenityIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    amenityText: {
        fontSize: 14,
        color: '#333333',
    },
    photosText: {
        fontSize: 14,
        color: '#333333',
    }
});

export default CenterDetail;