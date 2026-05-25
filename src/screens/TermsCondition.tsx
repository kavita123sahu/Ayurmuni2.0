import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';

import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { showSuccessToast } from '../config/Key';
import { Images } from '../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const TermsCondition = (props: any) => {
  const { agreed } = props?.route?.params;

  // ✅ FIX: stable animation value
  const scrollY = useRef(new Animated.Value(0)).current;

  const fadeAnim = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleAgree = () => {
    showSuccessToast('Accepted Terms & Conditions', 'success');
    props.navigation.replace('HomeStack', { screen: 'Onboarding' });
  };

  const handleDisagree = () => {
    showSuccessToast('You need to accept terms to continue', 'error');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Image source={Images.backIcon} style={styles.backIcon} />
        </TouchableOpacity> */}
      </View>

      {/* BANNER */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Hello,</Text>
          <Text style={styles.bannerText}>
            {agreed
              ? 'Successfully accepted Terms & Conditions'
              : 'Please read and accept Terms & Conditions'}
          </Text>
        </View>

        <Image source={require('../assets/images/HelloIcon.png')} style={styles.bannerIcon} />
      </View>

      {/* SCROLL */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms & Conditions</Text>

        <Text style={styles.text}>
          Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio... Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio...
        </Text>
      </Animated.ScrollView>

      {/* BUTTONS (SAFE FIX) */}
      {!agreed && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleAgree}
            activeOpacity={0.8}
            style={styles.agreeBtn}
          >
            <Text style={styles.agreeText}>Agree</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDisagree}
            style={styles.disagreeBtn}
          >
            <Text style={styles.disagreeText}>Disagree</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TermsCondition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  backIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  banner: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
  },

  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  bannerText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    fontFamily: Fonts.PoppinsRegular,
  },

  bannerIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100, // ✅ safe for all devices
  },

  title: {
    fontSize: 22,
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 10,
  },

  text: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsRegular,
    color: '#333',
    textAlign: 'justify',
  },

  bottomContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,

    // ✅ IMPORTANT FIX
    paddingBottom: 20,
  },

  agreeBtn: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  disagreeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  agreeText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.PoppinsMedium,
  },

  disagreeText: {
    color: Colors.primaryColor,
    fontSize: 15,
    fontFamily: Fonts.PoppinsMedium,
  },
});