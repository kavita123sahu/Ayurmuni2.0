import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Animated
} from 'react-native';

import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { showSuccessToast } from '../config/Key';
import { Images } from '../common/Images';

const TermsCondition = (props: any) => {
  const { agreed } = props?.route?.params;
  const scrollY = new Animated.Value(0);
  const fadeAnim = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleAgree = () => {
    showSuccessToast('Accepted Terms and Condition! Welcome aboard.', 'success');
    props.navigation.replace('HomeStack', { screen: 'Onboarding' });
  };

  const handleDisagree = () => {
    showSuccessToast('You need to accept terms to continue', 'error');
  };

  const handleBack = () => {
    props.navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Image source={Images.backIcon} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationBanner}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>Hello,</Text>
          <Text style={styles.notificationText}>
            {!agreed
              ? 'Before you create an account, please read and accept our '
              : 'Congratulations, You have Successfully Accepted! '}
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </Text>
        </View>

        <Image
          source={require('../assets/images/HelloIcon.png')}
          style={styles.bannerIcon}
        />
      </View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.lastUpdated}>
            Last Updated: <Text style={styles.updateDate}>Yesterday</Text>
          </Text>
        </View>

        <Text style={styles.termsText}>
          Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio...
        </Text>
      </Animated.ScrollView>

      {!agreed && (
        <View style={styles.buttonContainer}>

          <TouchableOpacity
            onPress={handleAgree}
            activeOpacity={0.8}
            style={styles.agreeButton}
          >
            <Text style={styles.agreeButtonText}>Agree</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disagreeButton}
            onPress={handleDisagree}
          >
            <Text style={styles.disagreeButtonText}>Disagree</Text>
          </TouchableOpacity>

        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 35,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  backIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  notificationBanner: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryColor,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 10,
  },

  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 4,
  },

  notificationText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsRegular,
  },

  linkText: {
    fontFamily: Fonts.PoppinsMedium,
    textDecorationLine: 'underline',
  },

  bannerIcon: {
    height: 20,
    width: 20,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  titleSection: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.textColor,
    marginBottom: 8,
  },

  lastUpdated: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.subTextColor,
  },

  updateDate: {
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.textColor,
  },

  termsText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.black,
    lineHeight: 20,
    textAlign: 'justify',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  agreeButton: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  agreeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },

  disagreeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },

  disagreeButtonText: {
    color: Colors.primaryColor,
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },
});

export default TermsCondition;