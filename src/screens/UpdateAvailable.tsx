import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { showSuccessToast } from '../config/Key';

interface UpdateScreenProps {
    navigation?: any;
    route?: any;
}

const UpdateScreen: React.FC<UpdateScreenProps> = (props) => {

    const handleUpdateNow = (): void => {
        showSuccessToast('Update Now Pressed', 'success')
    };


    const handleAskMeLater = (): void => {
        props.navigation.navigate('HomeStack',{screen :'TermsConditions'})
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.primaryColor} barStyle="light-content" />

            <View style={styles.content}>
                <Text style={styles.title}>New Update Available</Text>
                <View style={styles.iconContainer}>
                    <Image source={require('../assets/images/NewUpdate.png')} style={{ height: 205, width: 195 }} />
                </View>

                <View style={styles.textSection}>
                    <Text style={styles.subtitle}>Time to Update</Text>
                    <Text style={styles.description}>
                        We have added lots of new features and fixed
                        some bugs to make your experience smooth
                        as possible
                    </Text>
                </View>

                <View style={styles.buttonSection}>
                    <LinearGradient
                        colors={[Colors.secondaryColor, Colors.primaryColor]}
                        style={styles.updateButtonGradient}
                    >
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdateNow}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.updateButtonText}>Update Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <TouchableOpacity
                        style={styles.laterButton}
                        onPress={handleAskMeLater}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.laterButtonText}>Ask me later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  content: {flex: 1, paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 24, fontWeight: '600', color: '#333333', textAlign: 'center', marginBottom: 20},
  iconSection: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  iconContainer: {position: 'relative', marginBottom: 10},
  iconGradient: {width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', position: 'relative', shadowColor: '#4CAF50', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8},
  gearContainer: {width: 50, height: 50, justifyContent: 'center', alignItems: 'center', position: 'relative'},
  gearCenter: {width: 20, height: 20, backgroundColor: 'white', borderRadius: 10, position: 'absolute', zIndex: 3},
  gearTooth: {width: 6, height: 14, backgroundColor: 'white', position: 'absolute', borderRadius: 3},
  gearTooth1: {top: -12, left: 22},
  gearTooth2: {top: -8, right: -8, transform: [{ rotate: '45deg' }]},
  gearTooth3: {right: -12, top: 18, transform: [{ rotate: '90deg' }]},
  gearTooth4: {bottom: -8, right: -8, transform: [{ rotate: '135deg' }]},
  gearTooth5: {bottom: -12, left: 22, transform: [{ rotate: '180deg' }]},
  gearTooth6: {bottom: -8, left: -8, transform: [{ rotate: '225deg' }]},
  gearTooth7: {left: -12, top: 18, transform: [{ rotate: '270deg' }]},
  gearTooth8: {top: -8, left: -8, transform: [{ rotate: '315deg' }]},
  arrowContainer: {position: 'absolute', top: 15, right: 15},
  arrowBody: {width: 3, height: 20, backgroundColor: 'white', borderRadius: 1.5, transform: [{ rotate: '45deg' }]},
  arrowHead: {width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'white', position: 'absolute', top: -6, left: -2.5, transform: [{ rotate: '45deg' }]},
  textSection: {alignItems: 'center', paddingHorizontal: 10},
  subtitle: {fontSize: 20, fontFamily: Fonts.PoppinsSemiBold, color: Colors.black, textAlign: 'center', marginBottom: 8},
  description: {fontSize: 14, fontFamily: Fonts.PoppinsRegular, color: Colors.subTextColor, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10},
  buttonSection: {width: '100%', paddingTop: 30},
  updateButtonGradient: {borderRadius: 10, marginBottom: 16, shadowColor: '#4CAF50', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6},
  updateButton: {height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 12},
  updateButtonText: {color: Colors.white, fontSize: 14, fontFamily: Fonts.PoppinsMedium},
  laterButton: {height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: Colors.primaryColor},
  laterButtonText: {color: Colors.primaryColor, fontSize: 14, fontFamily: Fonts.PoppinsMedium}
});

export default UpdateScreen;