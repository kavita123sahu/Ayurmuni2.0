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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialCommunityIcons } from '../../common/Vector';
import { Fonts } from '../../common/Fonts';
import { Images } from '../../common/Images';
import { showSuccessToast } from '../../config/Key';
import * as _AUTH_SERVICE from '../../services/AuthService';
import { Utils } from '../../common/Utils';
import { Colors } from '../../common/Colors';

const C = {
  collageBg: '#1A2E28',
  sheet: '#F7F3EA',
  headline: '#1A2E28',
  body: '#5A6B66',
  cta: '#0E4B3A',
  ctaText: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#DDD6C8',
  inputFocus: '#0E4B3A',
  accent: '#D4A84B',
  checkboxBg: '#0E4B3A',
  link: '#0E4B3A',
  soft: '#EFE8DA',
};

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;
const COLLAGE_HEIGHT = Math.round(height * (isSmallDevice ? 0.34 : 0.38));
const TILE_HEIGHT = Math.round(COLLAGE_HEIGHT * 0.64);
const TILE_GAP = 10;

const IMAGE_POOL = [
  Images.journeyConsult,
  Images.journeyMedicine,
  Images.journeyDelivery,
  Images.journeyDiet,
  Images.journeyYoga,
  Images.login11,
  Images.login12,
  Images.login13,
  Images.login2,
  Images.login10,
  Images.login8,
  Images.login14,
];

const COLUMN_LEFT = [IMAGE_POOL[0], IMAGE_POOL[1], IMAGE_POOL[2], IMAGE_POOL[3], IMAGE_POOL[4]];
const COLUMN_CENTER = [IMAGE_POOL[5], IMAGE_POOL[6], IMAGE_POOL[7], IMAGE_POOL[8], IMAGE_POOL[9]];
const COLUMN_RIGHT = [IMAGE_POOL[10], IMAGE_POOL[11], IMAGE_POOL[0], IMAGE_POOL[3], IMAGE_POOL[5]];

const HEADLINES = [
  'Rooted in tradition, guided by science.',
  'Your wellness, our commitment.',
  'Natural care for modern living.',
  'Empowering health through Ayurveda.',
  'Discover holistic healing.',
  'Timeless wellness, made simple.',
];

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
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [direction, setHeight, duration, translateY]);

  const doubled = [...images, ...images];

  return (
    <View style={[styles.marqueeClip, style]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {doubled.map((img, i) => (
          <Image key={i} source={img} style={styles.tile} resizeMode="cover" />
        ))}
      </Animated.View>
    </View>
  );
};

const TextCarousel = ({
  texts,
  duration = 3200,
}: {
  texts: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(prev => (prev + 1) % texts.length);
        Animated.timing(fade, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }).start();
      });
    }, duration);
    return () => clearInterval(timer);
  }, [duration, fade, texts.length]);

  return (
    <View style={styles.carouselBlock}>
      <Animated.Text style={[styles.carouselText, { opacity: fade }]} numberOfLines={2}>
        {texts[currentIndex]}
      </Animated.Text>
      <View style={styles.dotsContainer}>
        {texts.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
};

const PhoneAuthScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const onChangePhone = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(digits);
  };

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

      const response: any = await _AUTH_SERVICE.send_otp(send_data);
      const OTP = response?.data?.otp;

      const isCustomer = response?.data?.user_roles?.some(
        (role: string) => role?.toLowerCase() === 'customer',
      );

      if (response?.success) {
        Utils.storeData('_OTP', OTP);
        showSuccessToast(response.message || 'OTP sent successfully', 'success');
        props.navigation.navigate('OtpVerify', {
          phone,
          customer: isCustomer,
        });
      } else {
        showSuccessToast(
          response?.message || 'Please Enter Valid Mobile Number',
          'error',
        );
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showSuccessToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.collageWrap, { height: COLLAGE_HEIGHT + Math.max(insets.top, 0) * 0.2 }]}>
            <View style={styles.collageRow}>
              <MarqueeColumn images={COLUMN_LEFT} direction="up" duration={26000} style={styles.col} />
              <MarqueeColumn images={COLUMN_CENTER} direction="down" duration={28000} style={styles.col} />
              <MarqueeColumn images={COLUMN_RIGHT} direction="up" duration={24000} style={styles.col} />
            </View>

            <LinearGradient
              colors={[
                'rgba(10, 28, 24, 0.5)',
                'rgba(10, 28, 24, 0.12)',
                'rgba(247, 243, 234, 0.98)',
              ]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={[styles.logoBadge, { top: Math.max(insets.top, 10) + 6 }]} pointerEvents="none">
              <View style={styles.logoPill}>
                <Image source={Images.FinalLogo2} style={styles.logoImg} resizeMode="contain" />
              </View>
              <Text style={styles.brandHint}>ANCIENT WISDOM · MODERN CARE</Text>
            </View>
          </View>

          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <View style={styles.sheetHandle} />

            <TextCarousel texts={HEADLINES} />

            <Text style={styles.label}>Enter your mobile</Text>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={[styles.inputPill, focused && styles.inputPillFocused]}
            >
              <View style={styles.codeChip}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.code}>+91</Text>
              </View>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="#9AA8A3"
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={onChangePhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                editable
                returnKeyType="done"
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
              {phone.length === 10 ? (
                <MaterialCommunityIcons name="check-circle" size={20} color={C.cta} />
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.8}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? (
                  <MaterialCommunityIcons name="check" size={13} color="#fff" />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cta, (!agreed || isLoading) && styles.ctaDisabled]}
              activeOpacity={0.88}
              onPress={onLogin}
              disabled={!agreed || isLoading}
            >
              <Text style={styles.ctaText}>
                {isLoading ? 'Sending...' : 'GET OTP'}
              </Text>
              {!isLoading ? (
                <MaterialCommunityIcons name="arrow-right" size={18} color={C.ctaText} />
              ) : null}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: C.sheet,
  },
  scrollContent: {
    flexGrow: 1,
  },

  collageWrap: {
    backgroundColor: C.collageBg,
    overflow: 'hidden',
  },
  collageRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: TILE_GAP,
    gap: TILE_GAP,
    paddingTop: TILE_GAP,
  },
  col: { flex: 1 },
  marqueeClip: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  tile: {
    width: '100%',
    height: TILE_HEIGHT,
    borderRadius: 16,
    marginBottom: TILE_GAP,
    backgroundColor: '#22301D',
  },

  logoBadge: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    gap: 6,
  },
  logoPill: {
    backgroundColor: 'rgba(247, 243, 234, 0.95)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  logoImg: { width: 150, tintColor: Colors.primaryColor, height: 30 },
  brandHint: {
    fontSize: 9,
    letterSpacing: 1.3,
    color: 'rgba(247, 243, 234, 0.9)',
    fontFamily: Fonts.PoppinsMedium,
  },

  sheet: {
    flexGrow: 1,
    backgroundColor: C.sheet,
    marginTop: -22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8D0C0',
    marginBottom: 12,
  },

  carouselBlock: {
    marginBottom: 12,
    minHeight: isSmallDevice ? 62 : 70,
    justifyContent: 'center',
  },
  carouselText: {
    fontSize: isSmallDevice ? 19 : 21,
    lineHeight: isSmallDevice ? 26 : 29,
    color: C.headline,
    textAlign: 'center',
    fontFamily: Fonts.PoppinsSemiBold,
    paddingHorizontal: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 18,
    backgroundColor: C.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D4CBB8',
  },

  label: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
    marginBottom: 8,
  },

  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 56,
    gap: 8,
  },
  inputPillFocused: {
    borderColor: C.inputFocus,
    backgroundColor: '#FFFEFA',
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.soft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  flag: { fontSize: 16 },
  code: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
    color: C.headline,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    includeFontPadding: false,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: C.checkboxBg,
    borderColor: C.checkboxBg,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Fonts.PoppinsRegular,
    color: C.body,
  },
  termsLink: {
    color: C.link,
    fontFamily: Fonts.PoppinsSemiBold,
    textDecorationLine: 'underline',
  },

  cta: {
    width: '100%',
    minHeight: 54,
    borderRadius: 28,
    backgroundColor: C.cta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.ctaText,
    letterSpacing: 0.8,
  },
});

export default PhoneAuthScreen;



// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   TouchableOpacity,
//   Image,
//   TextInput,
//   Animated,
//   Easing,
//   ScrollView,
//   Keyboard,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Platform,
// } from 'react-native';
// import { MaterialCommunityIcons } from '../../common/Vector';
// import { Fonts } from '../../common/Fonts';
// import { Images } from '../../common/Images';
// import { useNavigation } from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient';
// import { showSuccessToast } from '../../config/Key';
// import * as _AUTH_SERVICE from '../../services/AuthService';
// import { Utils } from '../../common/Utils';


// const C = {
//   collageBg: '#33422C',
//   sheet: '#F7F3EA',
//   headline: '#1B2B36',
//   body: '#4B5A62',
//   cta: '#0E4B3A',
//   ctaText: '#FFFFFF',
//   inputBg: '#FFFFFF',
//   inputBorder: '#E4E1D6',
//   dotActive: '#1B2B36',
//   dotInactive: '#D8D4C8',
//   checkboxBg: '#0E4B3A',
//   link: '#1B2B36',
// };

// // const COLLAGE_HEIGHT = 520;
// const TILE_HEIGHT = 230;
// const TILE_GAP = 13;

// const { width, height } = Dimensions.get('window');

// const isSmallDevice = height < 700;
// const COLLAGE_HEIGHT = height * 0.45;


// /** HD journey + portrait assets (same set as Welcome / OTP) */
// const IMAGE_POOL = [
//   Images.journeyConsult,
//   Images.journeyMedicine,
//   Images.journeyDelivery,
//   Images.journeyDiet,
//   Images.journeyYoga,
//   Images.login11,
//   Images.login12,
//   Images.login13,
//   Images.login2,
//   Images.login10,
//   Images.login8,
//   Images.login14,
// ];

// const COLUMN_LEFT = [IMAGE_POOL[0], IMAGE_POOL[1], IMAGE_POOL[2], IMAGE_POOL[3], IMAGE_POOL[4]];
// const COLUMN_CENTER = [IMAGE_POOL[5], IMAGE_POOL[6], IMAGE_POOL[7], IMAGE_POOL[8], IMAGE_POOL[9]];
// const COLUMN_RIGHT = [IMAGE_POOL[10], IMAGE_POOL[11], IMAGE_POOL[0], IMAGE_POOL[3], IMAGE_POOL[5]];


// type Direction = 'up' | 'down';

// const MarqueeColumn = ({
//   images,
//   direction = 'up',
//   duration = 14000,
//   style,
// }: {
//   images: any[];
//   direction?: Direction;
//   duration?: number;
//   style?: any;
// }) => {
//   const translateY = useRef(new Animated.Value(0)).current;
//   const setHeight = images.length * (TILE_HEIGHT + TILE_GAP);

//   useEffect(() => {
//     if (direction === 'down') {
//       translateY.setValue(-setHeight);
//     }
//     const anim = Animated.loop(
//       Animated.timing(translateY, {
//         toValue: direction === 'up' ? -setHeight : 0,
//         duration,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     );
//     anim.start();
//     return () => anim.stop();
//   }, [direction, setHeight]);

//   const doubled = [...images, ...images];

//   return (
//     <View style={[styles.marqueeClip, style]}>
//       <Animated.View style={{ transform: [{ translateY }] }}>
//         {doubled.map((img, i) => (
//           <Image key={i} source={img} style={styles.tile} resizeMode="cover" />
//         ))}
//       </Animated.View>
//     </View>
//   );
// };

// // ============================================================
// // NEW: Text Carousel with Dots
// // ============================================================
// const TextCarousel = ({
//   texts,
//   duration = 3000,
//   style,
//   dotStyle,
//   activeDotStyle,
// }: {
//   texts: Array<{ text: string; style?: any } | string>;
//   duration?: number;
//   style?: any;
//   dotStyle?: any;
//   activeDotStyle?: any;
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const translateX = useRef(new Animated.Value(0)).current;
//   const containerWidth = useRef(0);
//   const [itemWidth, setItemWidth] = useState(0);

//   useEffect(() => {
//     if (containerWidth.current > 0) {
//       setItemWidth(containerWidth.current - 40);
//     }
//   }, [containerWidth]);

//   useEffect(() => {
//     if (itemWidth === 0) return;

//     const animate = () => {
//       const nextIndex = (currentIndex + 1) % texts.length;
//       const toValue = -(nextIndex * itemWidth);

//       Animated.timing(translateX, {
//         toValue,
//         duration: duration,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }).start(() => {
//         setCurrentIndex(nextIndex);
//       });
//     };

//     const timer = setTimeout(animate, duration);
//     return () => clearTimeout(timer);
//   }, [currentIndex, itemWidth, texts.length, duration]);

//   return (
//     <View
//       style={[styles.carouselContainer, style]}
//       onLayout={(e) => {
//         containerWidth.current = e.nativeEvent.layout.width;
//         setItemWidth(e.nativeEvent.layout.width - 40);
//       }}
//     >
//       <Animated.View style={[styles.carouselTrack, { transform: [{ translateX }] }]}>
//         {texts.map((item, i) => {
//           const text = typeof item === 'string' ? item : item.text;
//           const customStyle = typeof item === 'string' ? {} : item.style || {};

//           return (
//             <View key={i} style={[styles.carouselItem, { width: itemWidth || 300 }]}>
//               <Text style={[styles.carouselText, customStyle]}>
//                 {text}
//               </Text>
//             </View>
//           );
//         })}
//       </Animated.View>

//       {/* Dots indicator */}
//       <View style={styles.dotsContainer}>
//         {texts.map((_, i) => (
//           <View
//             key={i}
//             style={[
//               styles.dot,
//               i === currentIndex ? styles.dotActive : styles.dotInactive,
//               i === currentIndex ? activeDotStyle : dotStyle
//             ]}
//           />
//         ))}
//       </View>
//     </View>
//   );
// };

// // ============================================================
// // MAIN COMPONENT
// // ============================================================
// const PhoneAuthScreen = (props: any) => {
//   const navigation = useNavigation();
//   const [phone, setPhone] = useState('');
//   const [agreed, setAgreed] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const onLogin = async () => {
//     Keyboard.dismiss();

//     if (phone.length !== 10) {
//       showSuccessToast(
//         'Please enter a valid 10-digit mobile number',
//         'error',
//       );
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const send_data = {
//         phone_number: `+91${phone}`,
//       };

//       const response: any =
//         await _AUTH_SERVICE.send_otp(send_data);

//       const OTP = response?.data?.otp;

//       // console.log('OTP Response-->:', OTP);


//       const isCustomer =
//         response?.data?.user_roles?.some(
//           (role: string) =>
//             role?.toLowerCase() === 'customer',
//         );

//       if (response?.success) {

//         Utils.storeData("_OTP", OTP)

//         showSuccessToast(
//           response.message || 'OTP sent successfully',
//           'success',
//         );

//         props.navigation.navigate('OtpVerify', {
//           phone: phone,
//           customer: isCustomer,

//         });
//       } else {
//         showSuccessToast(
//           response?.message ||
//           'Please Enter Valid Mobile Number',
//           'error',
//         );
//       }
//     } catch (error) {
//       console.error('Send OTP Error:', error);

//       showSuccessToast(
//         'Something went wrong. Please try again.',
//         'error',
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1, }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <ScrollView
//             style={{ flex: 1, }}
//             contentContainerStyle={{ flexGrow: 1 }}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             {/* ---- Animated collage header ---- */}
//             <View style={styles.collageWrap}>
//               <LinearGradient
//                 colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.2)']}
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   bottom: 0,
//                   zIndex: 1,
//                 }}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 0, y: 1 }}
//               />
//               <View style={styles.collageRow}>
//                 <MarqueeColumn images={COLUMN_LEFT} direction="up" duration={28000} style={{ flex: 1 }} />
//                 <MarqueeColumn images={COLUMN_CENTER} direction="down" duration={28000} style={{ flex: 1 }} />
//                 <MarqueeColumn images={COLUMN_RIGHT} direction="up" duration={28000} style={{ flex: 1 }} />
//               </View>

//               {/* Logo + wordmark — solid badge so it reads over any photo */}
//               <View style={styles.logoBadge}>
//                 <View style={styles.logoIconWrap}>
//                   <Image source={Images.FinalLogo2} style={styles.logoImg} resizeMode="contain" />
//                 </View>
//               </View>

//               {/* Fade from collage green into the cream sheet */}
//               <View style={styles.collageFade} pointerEvents="none" />
//             </View>

//             {/* ---- Cream sheet ---- */}
//             <View style={styles.sheet}>
//               <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">

//                 {/* Text Carousel with Dots */}
//                 <TextCarousel
//                   texts={[
//                     { text: 'Rooted in Tradition, Guided by Science.' },
//                     { text: 'Your Wellness, Our Commitment.' },
//                     { text: 'Natural Care for Modern Living.' },
//                     { text: 'Empowering Health Through Ayurveda.' },
//                     { text: 'Discover the Power of Holistic Healing.' },
//                     { text: 'Experience the Wisdom of Timeless Wellness.' },
//                     { text: 'Because Your Health Deserves Nature’s Best.' }
//                   ]}
//                   duration={3000}
//                   style={{ marginBottom: 20 }}
//                 />

//                 {/* <View style={styles.dotsRow}>
//             {Array.from({ length: dotsCount }).map((_, i) => (
//               <View key={i} style={[styles.dot, i === activeDot ? styles.dotActive : styles.dotInactive]} />
//             ))}
//           </View> */}

//                 <Text style={styles.label}>Enter your mobile</Text>

//                 <View style={styles.inputPill}>
//                   <Text style={styles.flag}>🇮🇳</Text>
//                   <Text style={styles.code}>+91</Text>
//                   <View style={styles.divider} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Enter mobile number"
//                     placeholderTextColor={C.body}
//                     keyboardType="number-pad"
//                     maxLength={10}
//                     value={phone}
//                     onChangeText={setPhone}
//                   />
//                 </View>

//                 <TouchableOpacity style={styles.termsRow} activeOpacity={0.8} onPress={() => setAgreed(!agreed)}>
//                   <View
//                     style={[
//                       styles.checkbox,
//                       { backgroundColor: agreed ? C.checkboxBg : '#fff', borderColor: agreed ? C.checkboxBg : C.inputBorder },
//                     ]}
//                   >
//                     {agreed && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
//                   </View>
//                   <Text style={styles.termsText}>
//                     By continuing, you agree to our <Text style={styles.termsLink}>Terms</Text> and{' '}
//                     <Text style={styles.termsLink}>Privacy Policy</Text>
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[
//                     styles.cta,
//                     (!agreed || isLoading) && { opacity: 0.6 }
//                   ]}
//                   activeOpacity={0.88}
//                   onPress={onLogin}
//                   disabled={!agreed || isLoading}
//                 >
//                   <Text style={styles.ctaText}>
//                     {isLoading ? "Sending..." : "GET OTP"}
//                   </Text>

//                   {!isLoading && (
//                     <MaterialCommunityIcons
//                       name="arrow-right"
//                       size={18}
//                       color={C.ctaText}
//                     />
//                   )}
//                 </TouchableOpacity>
//               </ScrollView>
//             </View>
//           </ScrollView>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, backgroundColor: C.sheet,
//   },

//   collageWrap: {
//     height: COLLAGE_HEIGHT,
//     backgroundColor: "#fff",
//     position: 'relative',
//     overflow: 'hidden',
//     marginLeft: -20,
//     marginRight: -20
//   },
//   collageRow: {
//     flex: 1,
//     flexDirection: 'row',
//     paddingHorizontal: TILE_GAP,
//     gap: TILE_GAP,
//     paddingTop: TILE_GAP
//   },

//   marqueeClip: {
//     height: COLLAGE_HEIGHT,
//     overflow: 'hidden',
//     borderRadius: 18
//   },
//   tile: {
//     width: '100%',
//     height: TILE_HEIGHT,
//     borderRadius: 18,
//     marginBottom: TILE_GAP,
//     backgroundColor: '#22301D'
//   },

//   logoBadge: {
//     position: 'absolute',
//     top: 38,
//     left: "10%",
//     right: 0,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//     zIndex: 10,
//     alignSelf: 'center',
//     borderRadius: 30,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     maxWidth: '80%',
//   },
//   logoIconWrap: {
//     width: 178,
//     height: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoImg: { width: 178, height: 35 },

//   collageFade: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 160,
//     backgroundColor: 'transparent',
//     zIndex: 5,
//   },
//   sheet: {
//     flex: 1,
//     backgroundColor: C.sheet,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginTop: -height * 0.04,
//   },

//   // sheet: {
//   //   flex: 1,
//   //   backgroundColor: C.sheet,
//   //   borderTopLeftRadius: 50,
//   //   borderTopRightRadius: 50,
//   //   marginTop: -40,
//   // },
//   sheetScroll: {
//     paddingHorizontal: width * 0.06,
//     paddingTop: isSmallDevice ? 22 : 32,
//     paddingBottom: 30,
//   },
//   // sheetScroll: {
//   //   paddingHorizontal: 24,
//   //   paddingTop: 32,
//   //   paddingBottom: 0,
//   // },

//   // Text Carousel Styles
//   carouselContainer: {
//     width: '100%',
//     overflow: 'hidden',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   carouselTrack: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//   },
//   carouselItem: {
//     paddingHorizontal: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   carouselText: {
//     fontSize: 26,
//     color: '#333',
//     textAlign: 'center',
//     fontWeight: '800',
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 15,
//     gap: 8,
//   },
//   dot: {
//     height: 4,
//     borderRadius: 2,
//   },
//   dotActive: {
//     width: 24,
//     backgroundColor: '#1B2B36',
//   },
//   dotInactive: {
//     width: 8,
//     backgroundColor: '#D8D4C8',
//   },

//   dotsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 6,
//     marginTop: 20,
//     marginBottom: 28
//   },

//   label: {
//     fontSize: width * 0.055,
//     fontFamily: Fonts.PoppinsSemiBold,
//     color: C.headline,
//     marginBottom: 14,
//   },
//   // label: {
//   //   fontSize: 22,
//   //   fontFamily: Fonts.PoppinsSemiBold ?? undefined,
//   //   color: C.headline,
//   //   marginBottom: 14
//   // },

//   inputPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: C.inputBg,
//     borderWidth: 1,
//     borderColor: C.inputBorder,
//     borderRadius: 16,
//     paddingHorizontal: 16,
//     height: 60,
//     marginBottom: 20,
//   },
//   flag: { fontSize: 20, marginRight: 8 },
//   code: { fontSize: 16, fontFamily: Fonts.PoppinsMedium, color: C.headline },
//   divider: { width: 1, height: 24, backgroundColor: C.inputBorder, marginHorizontal: 12 },
//   input: { flex: 1, fontSize: 16, fontFamily: Fonts.PoppinsMedium, color: C.headline },

//   termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 28 },
//   checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
//   termsText: { flex: 1, fontSize: 13, lineHeight: 20, fontFamily: Fonts.PoppinsMedium, color: C.body },
//   termsLink: { color: C.link, fontFamily: Fonts.PoppinsSemiBold ?? undefined, textDecorationLine: 'underline' },

//   cta: {
//     width: '100%',
//     minHeight: 58,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: C.cta,
//     borderRadius: 50,
//     paddingHorizontal: 20,
//     marginTop: 10,
//     marginBottom: isSmallDevice ? 25 : 40,
//   },
//   ctaText: {
//     fontSize: 15,
//     fontFamily: Fonts.PoppinsSemiBold ?? undefined,
//     color: C.ctaText,
//     letterSpacing: 1
//   },
// });

// export default PhoneAuthScreen;