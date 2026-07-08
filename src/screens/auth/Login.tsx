import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { showSuccessToast } from '../../config/Key';
import * as _AUTH_SERVICE from '../../services/AuthService';
import { Utils } from '../../common/Utils';

/* ============================================================
   PHONE / OTP ENTRY — Figma match + animated photo marquee
   ------------------------------------------------------------
   Collage header is now 3 independent vertical marquee columns:
     • Column 1 — scrolls UP, continuously
     • Column 2 — scrolls DOWN, continuously
     • Column 3 — scrolls UP, continuously
   Each column loops its image set seamlessly (content is
   duplicated end-to-end, so the wrap-around is invisible).
   Logo now sits in a solid frosted badge so it stays readable
   no matter what's scrolling behind it.
   ============================================================ */

const C = {
  collageBg: '#33422C',
  sheet: '#F7F3EA',
  headline: '#1B2B36',
  body: '#4B5A62',
  cta: '#0E4B3A',
  ctaText: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#E4E1D6',
  dotActive: '#1B2B36',
  dotInactive: '#D8D4C8',
  checkboxBg: '#0E4B3A',
  link: '#1B2B36',
};

// const COLLAGE_HEIGHT = 520;
const TILE_HEIGHT = 230;
const TILE_GAP = 13;

const { width, height } = Dimensions.get('window');

const isSmallDevice = height < 700;
const COLLAGE_HEIGHT = height * 0.45;


// Add as many photos as you like here — fallback keeps things
// working even before you wire up real assets.
const IMAGE_POOL = Array.from({ length: 14 }, (_, i) => (Images as any)[`login${i}`] ?? Images.FinalLogo);

// Hardcoded shuffled columns with no duplicates at same position
const COLUMN_LEFT = [IMAGE_POOL[1], IMAGE_POOL[2], IMAGE_POOL[3], IMAGE_POOL[4], IMAGE_POOL[5]];
const COLUMN_CENTER = [IMAGE_POOL[6], IMAGE_POOL[7], IMAGE_POOL[8], IMAGE_POOL[9], IMAGE_POOL[10]];
const COLUMN_RIGHT = [IMAGE_POOL[11], IMAGE_POOL[12], IMAGE_POOL[13], IMAGE_POOL[14], IMAGE_POOL[1]];

type Direction = 'up' | 'down';

const MarqueeColumn = ({
  images,
  direction = 'up',
  duration = 14000,
  style,
}: {
  images: any[];
  direction?: Direction;
  duration?: number;
  style?: any;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const setHeight = images.length * (TILE_HEIGHT + TILE_GAP);

  useEffect(() => {
    if (direction === 'down') {
      translateY.setValue(-setHeight);
    }
    const anim = Animated.loop(
      Animated.timing(translateY, {
        toValue: direction === 'up' ? -setHeight : 0,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [direction, setHeight]);

  const doubled = [...images, ...images];

  return (
    <View style={[styles.marqueeClip, style]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {doubled.map((img, i) => (
          <Image key={i} source={img} style={styles.tile} />
        ))}
      </Animated.View>
    </View>
  );
};

// ============================================================
// NEW: Text Carousel with Dots
// ============================================================
const TextCarousel = ({
  texts,
  duration = 3000,
  style,
  dotStyle,
  activeDotStyle,
}: {
  texts: Array<{ text: string; style?: any } | string>;
  duration?: number;
  style?: any;
  dotStyle?: any;
  activeDotStyle?: any;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    if (containerWidth.current > 0) {
      setItemWidth(containerWidth.current - 40);
    }
  }, [containerWidth]);

  useEffect(() => {
    if (itemWidth === 0) return;

    const animate = () => {
      const nextIndex = (currentIndex + 1) % texts.length;
      const toValue = -(nextIndex * itemWidth);

      Animated.timing(translateX, {
        toValue,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(nextIndex);
      });
    };

    const timer = setTimeout(animate, duration);
    return () => clearTimeout(timer);
  }, [currentIndex, itemWidth, texts.length, duration]);

  return (
    <View
      style={[styles.carouselContainer, style]}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
        setItemWidth(e.nativeEvent.layout.width - 40);
      }}
    >
      <Animated.View style={[styles.carouselTrack, { transform: [{ translateX }] }]}>
        {texts.map((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          const customStyle = typeof item === 'string' ? {} : item.style || {};

          return (
            <View key={i} style={[styles.carouselItem, { width: itemWidth || 300 }]}>
              <Text style={[styles.carouselText, customStyle]}>
                {text}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {texts.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
              i === currentIndex ? activeDotStyle : dotStyle
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const PhoneAuthScreen = (props: any) => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async () => {
    Keyboard.dismiss();

    if (phone.length !== 10) {
      showSuccessToast(
        'Please enter a valid 10-digit mobile number',
        'error',
      );
      return;
    }

    setIsLoading(true);

    try {
      const send_data = {
        phone_number: `+91${phone}`,
      };

      const response: any =
        await _AUTH_SERVICE.send_otp(send_data);

      const OTP = response?.data?.otp;

      // console.log('OTP Response-->:', OTP);


      const isCustomer =
        response?.data?.user_roles?.some(
          (role: string) =>
            role?.toLowerCase() === 'customer',
        );

      if (response?.success) {

        Utils.storeData("_OTP", OTP)

        showSuccessToast(
          response.message || 'OTP sent successfully',
          'success',
        );

        props.navigation.navigate('OtpVerify', {
          phone: phone,
          customer: isCustomer,

        });
      } else {
        showSuccessToast(
          response?.message ||
          'Please Enter Valid Mobile Number',
          'error',
        );
      }
    } catch (error) {
      console.error('Send OTP Error:', error);

      showSuccessToast(
        'Something went wrong. Please try again.',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1, }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ---- Animated collage header ---- */}
            <View style={styles.collageWrap}>
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.2)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={styles.collageRow}>
                <MarqueeColumn images={COLUMN_LEFT} direction="up" duration={28000} style={{ flex: 1 }} />
                <MarqueeColumn images={COLUMN_CENTER} direction="down" duration={28000} style={{ flex: 1 }} />
                <MarqueeColumn images={COLUMN_RIGHT} direction="up" duration={28000} style={{ flex: 1 }} />
              </View>

              {/* Logo + wordmark — solid badge so it reads over any photo */}
              <View style={styles.logoBadge}>
                <View style={styles.logoIconWrap}>
                  <Image source={Images.FinalLogo2} style={styles.logoImg} resizeMode="contain" />
                </View>
              </View>

              {/* Fade from collage green into the cream sheet */}
              <View style={styles.collageFade} pointerEvents="none" />
            </View>

            {/* ---- Cream sheet ---- */}
            <View style={styles.sheet}>
              <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">

                {/* Text Carousel with Dots */}
                <TextCarousel
                  texts={[
                    { text: 'Rooted in Tradition, Guided by Science.' },
                    { text: 'Your Wellness, Our Commitment.' },
                    { text: 'Natural Care for Modern Living.' },
                    { text: 'Empowering Health Through Ayurveda.' },
                    { text: 'Discover the Power of Holistic Healing.' },
                    { text: 'Experience the Wisdom of Timeless Wellness.' },
                    { text: 'Because Your Health Deserves Nature’s Best.' }
                  ]}
                  duration={3000}
                  style={{ marginBottom: 20 }}
                />

                {/* <View style={styles.dotsRow}>
            {Array.from({ length: dotsCount }).map((_, i) => (
              <View key={i} style={[styles.dot, i === activeDot ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View> */}

                <Text style={styles.label}>Enter your mobile</Text>

                <View style={styles.inputPill}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.code}>+91</Text>
                  <View style={styles.divider} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter mobile number"
                    placeholderTextColor={C.body}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <TouchableOpacity style={styles.termsRow} activeOpacity={0.8} onPress={() => setAgreed(!agreed)}>
                  <View
                    style={[
                      styles.checkbox,
                      { backgroundColor: agreed ? C.checkboxBg : '#fff', borderColor: agreed ? C.checkboxBg : C.inputBorder },
                    ]}
                  >
                    {agreed && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                  </View>
                  <Text style={styles.termsText}>
                    By continuing, you agree to our <Text style={styles.termsLink}>Terms</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cta,
                    (!agreed || isLoading) && { opacity: 0.6 }
                  ]}
                  activeOpacity={0.88}
                  onPress={onLogin}
                  disabled={!agreed || isLoading}
                >
                  <Text style={styles.ctaText}>
                    {isLoading ? "Sending..." : "GET OTP"}
                  </Text>

                  {!isLoading && (
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={18}
                      color={C.ctaText}
                    />
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.sheet,
  },

  collageWrap: {
    height: COLLAGE_HEIGHT,
    backgroundColor: "#fff",
    position: 'relative',
    overflow: 'hidden',
    marginLeft: -20,
    marginRight: -20
  },
  collageRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: TILE_GAP,
    gap: TILE_GAP,
    paddingTop: TILE_GAP
  },

  marqueeClip: {
    height: COLLAGE_HEIGHT,
    overflow: 'hidden',
    borderRadius: 18
  },
  tile: {
    width: '100%',
    height: TILE_HEIGHT,
    borderRadius: 18,
    marginBottom: TILE_GAP,
    backgroundColor: '#22301D'
  },

  logoBadge: {
    position: 'absolute',
    top: 38,
    left: "10%",
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
    alignSelf: 'center',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '80%',
  },
  logoIconWrap: {
    width: 178,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: { width: 178, height: 35 },

  collageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  sheet: {
    flex: 1,
    backgroundColor: C.sheet,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -height * 0.04,
  },

  // sheet: {
  //   flex: 1,
  //   backgroundColor: C.sheet,
  //   borderTopLeftRadius: 50,
  //   borderTopRightRadius: 50,
  //   marginTop: -40,
  // },
  sheetScroll: {
    paddingHorizontal: width * 0.06,
    paddingTop: isSmallDevice ? 22 : 32,
    paddingBottom: 30,
  },
  // sheetScroll: {
  //   paddingHorizontal: 24,
  //   paddingTop: 32,
  //   paddingBottom: 0,
  // },

  // Text Carousel Styles
  carouselContainer: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 10,
  },
  carouselTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  carouselItem: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselText: {
    fontSize: 26,
    color: '#333',
    textAlign: 'center',
    fontWeight: '800',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#1B2B36',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D8D4C8',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 28
  },

  label: {
    fontSize: width * 0.055,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
    marginBottom: 14,
  },
  // label: {
  //   fontSize: 22,
  //   fontFamily: Fonts.PoppinsSemiBold ?? undefined,
  //   color: C.headline,
  //   marginBottom: 14
  // },

  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 20,
  },
  flag: { fontSize: 20, marginRight: 8 },
  code: { fontSize: 16, fontFamily: Fonts.PoppinsMedium, color: C.headline },
  divider: { width: 1, height: 24, backgroundColor: C.inputBorder, marginHorizontal: 12 },
  input: { flex: 1, fontSize: 16, fontFamily: Fonts.PoppinsMedium, color: C.headline },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 28 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  termsText: { flex: 1, fontSize: 13, lineHeight: 20, fontFamily: Fonts.PoppinsMedium, color: C.body },
  termsLink: { color: C.link, fontFamily: Fonts.PoppinsSemiBold ?? undefined, textDecorationLine: 'underline' },

  cta: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.cta,
    borderRadius: 50,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: isSmallDevice ? 25 : 40,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold ?? undefined,
    color: C.ctaText,
    letterSpacing: 1
  },
});

export default PhoneAuthScreen;