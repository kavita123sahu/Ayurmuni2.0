import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../../common/Images';
import { Utils } from '../../common/Utils';
import { Fonts } from '../../common/Fonts';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import {
  isGuestUser,
  markAsGuest,
  syncAccessFromProfile,
} from '../../services/guestAuth';

const { width: W, height: H } = Dimensions.get('window');
/** Auth runs immediately; short brand beat so it still feels like a splash. */
const MIN_SPLASH_MS = 900;

const Splash = (props: any) => {
  const isFocused = useIsFocused();
  const navigatedRef = useRef(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandY = useRef(new Animated.Value(18)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isFocused) return;
    navigatedRef.current = false;
    const startedAt = Date.now();

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 48,
        useNativeDriver: true,
      }),
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 560,
        delay: 160,
        useNativeDriver: true,
      }),
      Animated.timing(brandY, {
        toValue: 0,
        duration: 560,
        delay: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb2, {
          toValue: 0,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // const finish = async (navigate: () => void) => {
    //   if (navigatedRef.current) return;
    //   const wait = Math.max(0, MIN_SPLASH_MS - (Date.now() - startedAt));
    //   if (wait) await new Promise(r => setTimeout(r, wait));
    //   if (navigatedRef.current) return;
    //   navigatedRef.current = true;
    //   navigate();
    // };

    const finish = async (navigate: () => void) => {
      if (navigatedRef.current) return;

      const wait = Math.max(
        0,
        MIN_SPLASH_MS - (Date.now() - startedAt),
      );

      if (wait) {
        await new Promise<void>(resolve => setTimeout(resolve, wait));
      }

      if (navigatedRef.current) return;

      navigatedRef.current = true;
      navigate();
    };
    const routeUser = async () => {
      try {
        const token = await Utils.getData('_TOKEN');
        if (!token) {
          await finish(() => props.navigation.replace('Welcome'));
          return;
        }

        const result: any = await _PROFILE_SERVICES.user_profile();
        if (result?.data) {
          await Utils.storeData('_USER_INFO', result.data);
        }

        if (result?.data?.is_onboarded) {
          await syncAccessFromProfile(result.data);
          await finish(() =>
            resetRootToHomeStack(props.navigation, 'TabStack', {
              screen: 'Home',
            }),
          );
          return;
        }

        if (await isGuestUser()) {
          await finish(() =>
            resetRootToHomeStack(props.navigation, 'TabStack', {
              screen: 'Home',
            }),
          );
          return;
        }

        const isCustomer = result?.data?.user_roles?.includes('customer');
        if (!isCustomer || result?.data?.is_skipped) {
          await markAsGuest();
          await finish(() =>
            resetRootToHomeStack(props.navigation, 'TabStack', {
              screen: 'Home',
            }),
          );
          return;
        }

        if (!result?.data?.is_onboarded) {
          await finish(() =>
            resetRootToHomeStack(props.navigation, 'AssessmentType'),
          );
          return;
        }

        await finish(() =>
          resetRootToHomeStack(props.navigation, 'TabStack', {
            screen: 'Home',
          }),
        );
      } catch (error: any) {
        if (error?.response?.status === 403) {
          await finish(() =>
            props.navigation.replace('AuthStack', { screen: 'Login' }),
          );
          return;
        }
        await markAsGuest();
        await finish(() =>
          resetRootToHomeStack(props.navigation, 'TabStack', {
            screen: 'Home',
          }),
        );
      }
    };

    routeUser();
  }, [isFocused]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.12],
  });
  const orb1Y = orb1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const orb2Y = orb2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#06241C" barStyle="light-content" />

      <LinearGradient
        colors={['#041914', '#0A3328', '#0F4A38', '#0A3328']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmosphere orbs */}
      <Animated.View
        pointerEvents="none"
        style={[styles.orbTop, { transform: [{ translateY: orb1Y }] }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.orbBottom, { transform: [{ translateY: orb2Y }] }]}
      />

      {/* Decorative leaf images */}
      <Image
        source={Images.leaf1}
        style={styles.leafTL}
        resizeMode="contain"
      />
      <Image
        source={Images.leaf2}
        style={styles.leafBR}
        resizeMode="contain"
      />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.pulseRing,
            { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
          ]}
        />

        <Animated.View
          style={[
            styles.logoPlate,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#F8F4EA', '#FFFFFF', '#F0E6C8']}
            style={styles.logoPlateInner}
          >
            <Image
              source={Images.FinalLogo}
              style={styles.logo}
              resizeMode="contain"
            />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.brandBlock,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandY }],
            },
          ]}
        >
          <Text style={styles.brand}>AYURMUNI</Text>
          <View style={styles.goldLine} />
          <Text style={styles.tagline}>Heal · Balance · Thrive</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottom, { opacity: brandOpacity }]}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                opacity: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.55, 1],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.bottomLabel}>Preparing your wellness space</Text>
      </Animated.View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06241C',
  },
  orbTop: {
    position: 'absolute',
    top: -H * 0.08,
    right: -W * 0.2,
    width: W * 0.7,
    height: W * 0.7,
    borderRadius: W * 0.35,
    backgroundColor: 'rgba(32, 140, 100, 0.22)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -H * 0.05,
    left: -W * 0.25,
    width: W * 0.75,
    height: W * 0.75,
    borderRadius: W * 0.375,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  leafTL: {
    position: 'absolute',
    top: H * 0.1,
    left: -10,
    width: 90,
    height: 90,
    opacity: 0.18,
    transform: [{ rotate: '-25deg' }],
  },
  leafBR: {
    position: 'absolute',
    bottom: H * 0.14,
    right: -8,
    width: 100,
    height: 100,
    opacity: 0.16,
    transform: [{ rotate: '20deg' }],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.55)',
  },
  logoPlate: {
    width: 152,
    height: 152,
    borderRadius: 105,
    padding: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  logoPlateInner: {
    flex: 1,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  brandBlock: {
    marginTop: 34,
    alignItems: 'center',
  },
  brand: {
    fontSize: 34,
    letterSpacing: 6,
    color: '#F7F3EA',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  goldLine: {
    marginTop: 12,
    marginBottom: 12,
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#D4AF37',
  },
  tagline: {
    fontSize: 13,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(247, 243, 234, 0.7)',
    fontFamily: Fonts.PoppinsMedium,
  },
  bottom: {
    paddingBottom: 48,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressTrack: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    width: '70%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  bottomLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: 'rgba(247, 243, 234, 0.45)',
    fontFamily: Fonts.PoppinsRegular,
  },
});
