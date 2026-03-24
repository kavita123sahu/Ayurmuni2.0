import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import Header from '../../component/Header';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface Package {
    id: string;
    title: string;
    image: any;
    features: string[];
    nights: string;
    description: string;
    price: number;
    gstFees: string;
}

const PackageSelect: React.FC = () => {

    const packages: Package[] = [
        {
            id: '1',
            title: 'Yogic Detox',
            image: require('../../assets/images/DetoxImage.png'), // Replace with your image path
            features: ['Comprehensive', 'Intensive'],
            nights: '7, 14, 21',
            description: 'Yogic Detox Programme Uses Asana (Posture) And Pranayama (Yogic Breathing) To Activate The Organs And Prepare.',
            price: 50000,
            gstFees: '+GST & Fees'
        },
        {
            id: '2',
            title: 'Panchakarma',
            image: require('../../assets/images/DetoxImage.png'), // Replace with your image path
            features: ['Comprehensive', 'Intensive'],
            nights: '21',
            description: 'The Traditional Science Of Ayurvedic Panchakarma Offers The Most Natural And Complete Cleanse. It Is The Ideal Method Of Detoxifying And Rejuvenating The Body And Mind And Healing From Within',
            price: 50000,
            gstFees: '+GST & Fees'
        },
        {
            id: '3',
            title: 'Rejuvenation',
            image: require('../../assets/images/DetoxImage.png'), // Replace with your image path
            features: ['Comprehensive', 'Intensive'],
            nights: '7, 14, 21',
            description: 'Experience complete mind and body rejuvenation through our specialized wellness programs designed to restore your natural balance.',
            price: 45000,
            gstFees: '+GST & Fees'
        }
    ];

    const handleBookNow = (packageId: string) => {
        console.log(`Booking package: ${packageId}`);
    };

    const renderFeatureTag = (feature: string, index: number) => (
        <View key={index} style={styles.featureTag}>
            <View style={styles.detailRow}>
                <View style={styles.dotIcon} />
                <Text style={styles.featureText}>{feature}</Text>
            </View>
        </View>
    );

    const renderPackageCard = (pkg: Package) => (
        <View key={pkg.id} style={styles.packageCard}>
            <View style={styles.packageHeader}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Image source={require('../../assets/images/BottomLine.png')} style={{ height: 2, width: 35, }} />
            </View>

            <View style={styles.packageContent}>
                <View style={styles.packageRow}>
                    {/* <View style={styles.packageDetails}> */}
                    <Image source={pkg.image} style={styles.packageImage} resizeMode='cover' />
                    {/* </View> */}

                    <View style={styles.packageInfo}>
                        <View style={styles.featuresContainer}>
                            {pkg.features.map((feature, index) => renderFeatureTag(feature, index))}
                        </View>
                        <Text style={styles.nightsText}>Nights: <Text style={styles.textShift}> {pkg.nights}</Text> </Text>
                    </View>

                </View>

                <View style={styles.dividerLine} />

                <Text style={styles.description}>{pkg.description}</Text>

                <View style={styles.dividerLine} />

                <View style={styles.priceContainer}>
                    <View style={styles.priceSection}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceSymbol}>₹</Text>
                            <Text style={styles.priceAmount}>{pkg.price.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.gstText}>{pkg.gstFees}</Text>
                    </View>

                    <LinearGradient
                        colors={[Colors.secondaryColor, Colors.primaryColor]}
                        start={{ x: 0, y: 0 }}
                        style={styles.bookButton}
                        end={{ x: 1, y: 0 }}>
                        <TouchableOpacity

                            onPress={() => handleBookNow(pkg.id)}
                        >
                            <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>

        </View>
    );

    return (
        <View style={styles.container}>
            <Header title='Select Package' Is_Tab={false} />

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {packages.map(pkg => renderPackageCard(pkg))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    scrollContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    packageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,

    },
    packageHeader: {
        // backgroundColor: '#8BC34A',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        flex: 1


    },
    packageTitle: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
    },
    packageContent: {
        padding: 16,
    },
    packageRow: {
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        justifyContent: 'space-between'

    },
    packageImage: {
        width: '45%',
        height: 80,
        
        borderRadius: 8,
        marginBottom: 12,
    },
    packageDetails: {
        width: '50%',
        borderRadius: 10,
        borderWidth: 0.5,
        marginBottom: 12,

    },
    packageInfo: {
        flex: 1,
        paddingLeft: 20,
        width: '55%'
    },
    featuresContainer: {
        // flexDirection: 'row',
        marginBottom: 8,
        gap: 8,
    },
    featureTag: {
        // flex:1,
        flexDirection: 'column'
    },
    detailRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    dotIcon: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.subTextColor,
        marginRight: 10,
        // marginTop: 2,
    },
    featureText: {
        fontSize: 14,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsMedium,
    },
    nightsText: {
        fontSize: 14,
        color: Colors.subTextColor,
        marginBottom: 12,
        fontFamily: Fonts.PoppinsMedium
    },
    textShift: {
        fontSize: 14,
        color: Colors.textColor,
        marginBottom: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },
    description: {
        fontSize: 14,
        color: '#666666',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 20,
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        marginBottom: 8,
        backgroundColor: '#E0E0E0',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceSection: {
        flex: 1,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    priceSymbol: {
        fontSize: 18,
        color: '#333333',
        fontWeight: 'bold',
    },
    priceAmount: {
        fontSize: 18,
        color: '#333333',
        fontWeight: 'bold',
        // marginTop: -4,
    },
    gstText: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    bookButton: {

        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        marginLeft: 16,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium
    },
});

export default PackageSelect;