import { View, Text, Image, StyleSheet, StatusBar, Dimensions, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Images } from '../../common/Images';
import { Utils } from '../../common/Utils';
import { isGuestUser } from '../../services/guestAuth';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { showSuccessToast } from '../../config/Key';
import * as _AUTH_SERVICES from '../../services/AuthService';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const Splash = (props: any) => {
  const isFocused = useIsFocused();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const leafAnim1 = useRef(new Animated.Value(0)).current;
  const leafAnim2 = useRef(new Animated.Value(0)).current;
  const leafAnim3 = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      // Start animations
      startAnimations();
      // Load user data after animations
      setTimeout(() => {
        getUser();
      }, 2500);
    }
  }, [isFocused]);

  const startAnimations = () => {
    // Logo entrance animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();

    // Logo rotation (subtle)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating dots animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(dot1Anim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Leaf animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim2, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim3, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim3, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text animation
    Animated.parallel([
      Animated.spring(textSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getUser = async () => {
    try {
      const token = await Utils.getData('_TOKEN');
      const guest = await isGuestUser();

      if (!token) {
        if (guest) {
          props.navigation.replace('HomeStack', { screen: 'Home' });
          return;
        }
        props.navigation.replace('Welcome');
        return;
      }

      const result: any = await _PROFILE_SERVICES.user_profile();

      console.log('PROFILE RESULT =>', result);

      const isCustomer = result?.data?.user_roles?.includes('customer');

      console.log('isCustomerisCustomer', isCustomer);

      if (!isCustomer) {
        props.navigation.replace('Welcome');
        // props.navigation.replace('AuthStack', {
        //   screen: 'Login',
        // });
        return;
      }

      if (!result?.data?.is_onboarded && !result?.data?.is_skipped) {
        props.navigation.replace('HomeStack', {
          screen: 'AssessmentType',
        });
        return;
      }

      if (result?.data?.is_skipped) {
        props.navigation.replace('HomeStack', {
          screen: 'Home',
        });
        return;
      }

      if (!result?.success) {
        showSuccessToast(
          result?.message || 'Something went wrong',
          'error',
        );
        return;
      }

      console.log('PROFILE DATA =>', result);

      await Utils.storeData('_USER_INFO', result?.data);

      props.navigation.replace('HomeStack', {
        screen: 'Home',
      });
    } catch (error: any) {
      console.log('GET USER ERROR =>', error);

      if (error?.response?.status === 403) {
        props.navigation.replace('AuthStack', {
          screen: 'Login',
        });
        return;
      }

      showSuccessToast('Network Error', 'error');
    }
  };

  // Interpolations
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmer = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0)'],
  });

  const dotFloat1 = dot1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const dotFloat2 = dot2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const dotFloat3 = dot3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const leafMove1 = leafAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const leafMove2 = leafAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const leafMove3 = leafAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#0F3D2E'} barStyle={'light-content'} />

      {/* Animated Gradient Background */}
      <LinearGradient
        colors={['#0F3D2E', '#1A5C3A', '#2D7A4F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Leaves */}
      <Animated.View
        style={[
          styles.leaf1,
          {
            transform: [
              { translateX: leafMove1 },
              { translateY: leafMove1 },
              { rotate: '45deg' },
            ],
          },
        ]}
      >
        <View style={styles.leafShape} />
      </Animated.View>

      <Animated.View
        style={[
          styles.leaf2,
          {
            transform: [
              { translateX: leafMove2 },
              { translateY: leafMove2 },
              { rotate: '-30deg' },
            ],
          },
        ]}
      >
        <View style={styles.leafShape2} />
      </Animated.View>

      <Animated.View
        style={[
          styles.leaf3,
          {
            transform: [
              { translateX: leafMove3 },
              { translateY: leafMove3 },
              { rotate: '15deg' },
            ],
          },
        ]}
      >
        <View style={styles.leafShape3} />
      </Animated.View>

      {/* Floating Herbal Dots */}
      <Animated.View
        style={[
          styles.floatingDot1,
          { transform: [{ translateY: dotFloat1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingDot2,
          { transform: [{ translateY: dotFloat2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingDot3,
          { transform: [{ translateY: dotFloat3 }] },
        ]}
      />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { rotate: rotate }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={Images.FinalLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { backgroundColor: shimmer },
              ]}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textSlide }],
            },
          ]}
        >
          <Text style={styles.brandName}>AYURMUNI</Text>
          <Text style={styles.tagline}>Ancient Wisdom • Modern Wellness</Text>

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot}>
              <Animated.View
                style={[
                  styles.loadingDotInner,
                  {
                    transform: [
                      {
                        scale: dot1Anim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.5, 1.2, 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <View style={styles.loadingDot}>
              <Animated.View
                style={[
                  styles.loadingDotInner,
                  {
                    transform: [
                      {
                        scale: dot2Anim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.5, 1.2, 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <View style={styles.loadingDot}>
              <Animated.View
                style={[
                  styles.loadingDotInner,
                  {
                    transform: [
                      {
                        scale: dot3Anim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.5, 1.2, 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F3D2E',
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // Decorative Leaves
  leaf1: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 70,
    height: 70,
  },

  leafShape: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(45, 122, 79, 0.25)',
    borderRadius: 35,
  },

  leaf2: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 90,
    height: 90,
  },

  leafShape2: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(26, 92, 58, 0.2)',
    borderRadius: 45,
  },

  leaf3: {
    position: 'absolute',
    top: 200,
    left: -30,
    width: 80,
    height: 80,
  },

  leafShape3: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(45, 122, 79, 0.15)',
    borderRadius: 40,
  },

  // Floating Dots
  floatingDot1: {
    position: 'absolute',
    top: 150,
    right: 80,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  floatingDot2: {
    position: 'absolute',
    bottom: 150,
    right: 60,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  floatingDot3: {
    position: 'absolute',
    top: 250,
    right: 120,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },

  logo: {
    width: 80,
    height: 80,
    tintColor: '#FFFFFF',
  },

  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },

  brandName: {
    fontSize: 38,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 6,
  },

  tagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 1,
  },

  loadingContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});