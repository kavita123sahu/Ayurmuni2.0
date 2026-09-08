


import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';
import * as _AUTH_SERVICE from '../../services/AuthService';
import { Utils } from '../../common/Utils';
import { markAsGuest, syncAccessFromProfile } from '../../services/guestAuth';
import { Fonts } from '../../common/Fonts';
import { AntDesign, MaterialCommunityIcons } from '../../common/Vector';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import CommonModal from '../../components/LogoutModal';
import {
  completeWelcomePushFlow,
  loginOneSignalUser,
  requestNotificationPermission,
  ensureDeviceNotificationsEnabled,
} from '../../services/pushNotificationService';

const C = {
  collageBg: '#1A2E28',
  sheet: '#F7F3EA',
  headline: '#1A2E28',
  body: '#5A6B66',
  cta: '#0E4B3A',
  ctaText: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#DDD6C8',
  accent: '#D4A84B',
  soft: '#EFE8DA',
};

const { height, width } = Dimensions.get('window');
const isSmallDevice = height < 700;
const COLLAGE_HEIGHT = Math.round(height * (isSmallDevice ? 0.28 : 0.32));
const TILE_HEIGHT = Math.round(COLLAGE_HEIGHT * 0.64);
const TILE_GAP = 10;
const OTP_LEN = 4;
const BOX_GAP = 10;
const BOX_SIZE = Math.min(58, Math.floor((width - 64 - BOX_GAP * (OTP_LEN - 1)) / OTP_LEN));

const IMAGE_POOL = [
  Images.journeyConsult,
  Images.journeyMedicine,
  Images.journeyDelivery,
  Images.journeyDiet,
  Images.journeyYoga,
  Images.login11,
  Images.login12,
  Images.login13,
];

const COLUMN_LEFT = [IMAGE_POOL[0], IMAGE_POOL[1], IMAGE_POOL[2], IMAGE_POOL[0], IMAGE_POOL[1]];
const COLUMN_CENTER = [IMAGE_POOL[3], IMAGE_POOL[4], IMAGE_POOL[5], IMAGE_POOL[3], IMAGE_POOL[4]];
const COLUMN_RIGHT = [IMAGE_POOL[6], IMAGE_POOL[7], IMAGE_POOL[2], IMAGE_POOL[0], IMAGE_POOL[4]];

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

interface OTPVerificationProps {
  navigation?: any;
  route?: any;
}

const OtpVerify: React.FC<OTPVerificationProps> = props => {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [notifPromptVisible, setNotifPromptVisible] = useState(false);
  const [notifPromptLoading, setNotifPromptLoading] = useState(false);
  const pendingRegisterOtpRef = useRef('');
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const phoneNumber = props.route?.params?.phone;
  const NEW_CUSTOMER = props.route?.params?.customer;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }
    const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  const applyOtpDigits = useCallback((digits: string) => {
    const cleaned = digits.replace(/[^0-9]/g, '').slice(0, OTP_LEN);
    if (!cleaned) {
      return;
    }
    const next = ['', '', '', ''];
    cleaned.split('').forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    const focusAt = Math.min(cleaned.length, OTP_LEN - 1);
    setFocusedIndex(focusAt);
    requestAnimationFrame(() => {
      otpInputRefs.current[focusAt]?.focus();
    });
  }, []);

  const loadStoredOtp = useCallback(async () => {
    try {
      const storedOtp = await Utils.getData('_OTP');
      if (storedOtp) {
        applyOtpDigits(String(storedOtp));
      }
    } catch (error) {
      console.log(error);
    }
  }, [applyOtpDigits]);

  useEffect(() => {
    loadStoredOtp();
  }, [loadStoredOtp]);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleVerifyOTP = async () => {
    console.log('🚀 [STEP 0] handleVerifyOTP STARTED');

    Keyboard.dismiss();

    const otpCode = otp.join('');

    console.log('📝 [STEP 1] OTP:', otpCode);
    console.log('📱 [STEP 1] Phone Number:', phoneNumber);

    if (otpCode.length !== 4) {
      console.log('❌ [STEP 1] Invalid OTP length:', otpCode.length);

      showSuccessToast('Please enter valid OTP', 'error');
      shake();
      return;
    }

    pendingRegisterOtpRef.current = otpCode;
    setNotifPromptVisible(true);
  };

  const submitRegisterWithNotificationPreference = async (
    isNotificationEnabled: boolean,
  ) => {
    const otpCode =
      pendingRegisterOtpRef.current || otp.join('');

    if (otpCode.length !== 4) {
      showSuccessToast(
        'Please enter valid OTP',
        'error',
      );
      shake();
      return;
    }

    setNotifPromptVisible(false);
    setNotifPromptLoading(false);
    setIsLoading(true);

    console.log(
      '⏳ [STEP 2] Loading enabled',
    );

    console.log(
      '🔔 [STEP 2] is_notification_enabled:',
      isNotificationEnabled,
    );

    try {
      // ==========================================
      // STEP 3: Prepare OTP Payload
      // ==========================================

      const send_data = {
        phone_number: `+91${phoneNumber}`,
        otp: otpCode,
        is_notification_enabled:
          isNotificationEnabled,
      };

      console.log(
        '📤 [STEP 3] OTP Verify Payload:',
        send_data,
      );

      // ==========================================
      // STEP 4: Verify OTP API
      // ==========================================

      console.log(
        '🔵 [STEP 4] Calling verify_otp API...',
      );

      const response: any =
        await _AUTH_SERVICE.verify_otp(send_data);

      console.log(
        '🟢 [STEP 4] verify_otp API RESPONSE:',
        response,
      );

      if (response?.success) {
        console.log(
          '✅ [STEP 5] OTP verification SUCCESS',
        );

        // ==========================================
        // STEP 6: Get User ID
        // ==========================================

        const userId =
          response?.data?.user_id;

        console.log(
          '👤 [STEP 6] Backend User ID:',
          userId,
        );

        if (!userId) {
          console.log(
            '❌ [STEP 6] USER ID NOT FOUND',
          );

          showSuccessToast(
            'User information not received. Please try again.',
            'error',
          );

          return;
        }

        console.log(
          '✅ [STEP 6] User ID available:',
          userId,
        );

        // ==========================================
        // STEP 7: Get Tokens
        // ==========================================

        const accessToken =
          response?.data?.access;

        const refreshToken =
          response?.data?.refresh;

        console.log(
          '🔑 [STEP 7] Access Token exists:',
          !!accessToken,
        );

        console.log(
          '🔄 [STEP 7] Refresh Token exists:',
          !!refreshToken,
        );

        if (!accessToken) {
          console.log(
            '❌ [STEP 7] ACCESS TOKEN NOT FOUND',
          );

          showSuccessToast(
            'Authentication token not received.',
            'error',
          );

          return;
        }

        // ==========================================
        // STEP 8: Store User ID
        // ==========================================

        console.log(
          '💾 [STEP 8] Storing _USER_ID...',
        );

        await Utils.storeData(
          '_USER_ID',
          String(userId),
        );

        console.log(
          '✅ [STEP 8] _USER_ID stored',
        );

        // ==========================================
        // STEP 9: Store Access Token
        // ==========================================

        console.log(
          '💾 [STEP 9] Storing _TOKEN...',
        );

        await Utils.storeData(
          '_TOKEN',
          accessToken,
        );

        console.log(
          '✅ [STEP 9] _TOKEN stored',
        );

        // ==========================================
        // STEP 10: Store Refresh Token
        // ==========================================

        if (refreshToken) {
          console.log(
            '💾 [STEP 10] Storing _REFRESH_TOKEN...',
          );

          await Utils.storeData(
            '_REFRESH_TOKEN',
            refreshToken,
          );

          console.log(
            '✅ [STEP 10] _REFRESH_TOKEN stored',
          );
        }

        console.log(
          '✅ [STEP 10] ALL AUTH DATA STORED',
        );

        // ==========================================
        // STEP 11–12: OneSignal ready → Welcome Push
        // Customer already created; auth tokens stored.
        // Flow:
        //   permission → wait subscription+token →
        //   OneSignal.login(userId) → verify association →
        //   welcome notification API
        // ==========================================

        // ==========================================
        // STEP 11–12: OneSignal ready → Welcome Push
        // ==========================================

        if (!isNotificationEnabled) {
          console.log(
            '🔕 [STEP 11] Notifications disabled — skipping welcome push',
          );
        } else {
          try {
            console.log(
              '🔵 [STEP 11] Starting completeWelcomePushFlow for user:',
              userId,
            );

            // Wait 4 seconds before calling welcome push flow
            console.log(
              '⏳ [STEP 11] Waiting 4 seconds before completeWelcomePushFlow...',
            );

            await new Promise<void>(resolve => {
              setTimeout(() => {
                resolve();
              }, 4000);
            });

            console.log(
              '✅ [STEP 11] 4 seconds completed',
            );

            // Now call welcome push API
            console.log(
              '🚀 [STEP 12] Calling completeWelcomePushFlow for user:',
              userId,
            );

            const welcomeResult =
              await completeWelcomePushFlow(userId);

            console.log(
              '🟢 [STEP 12] Welcome push flow result:',
              welcomeResult,
            );

            if (welcomeResult?.success) {
              console.log(
                '🎉 [STEP 12] WELCOME PUSH SUCCESS',
              );
            } else {
              console.log(
                '⚠️ [STEP 12] WELCOME PUSH NOT DELIVERED:',
                welcomeResult?.reason,
              );
            }
          } catch (oneSignalError: any) {
            console.error(
              '❌ [STEP 11] OneSignal / welcome flow ERROR:',
              oneSignalError?.message ??
              oneSignalError,
            );

            // Do not break registration
          }
        }

        // ==========================================
        // STEP 13: markAsGuest
        // ==========================================

        console.log(
          '🔵 [STEP 13] Calling markAsGuest...',
        );

        try {
          await markAsGuest();

          console.log(
            '✅ [STEP 13] markAsGuest SUCCESS',
          );
        } catch (
        guestError: any
        ) {
          console.error(
            '❌ [STEP 13] markAsGuest ERROR:',
            guestError,
          );

          console.error(
            '❌ [STEP 13] guestError message:',
            guestError?.message,
          );

          throw guestError;
        }

        // ==========================================
        // STEP 14: Success Toast
        // ==========================================

        console.log(
          '🟢 [STEP 14] Showing success toast',
        );

        showSuccessToast(
          response?.message ||
          'OTP verified successfully',
          'success',
        );

        // ==========================================
        // STEP 15: Navigation
        // ==========================================

        console.log(
          '🚀 [STEP 15] Navigating to AccessMode...',
        );

        resetRootToHomeStack(
          props.navigation,
          'AccessMode',
        );

        console.log(
          '✅ [STEP 15] Navigation successful',
        );
      } else {
        // ==========================================
        // OTP FAILURE
        // ==========================================

        console.log(
          '❌ [STEP 5] OTP verification FAILED:',
          response,
        );

        showSuccessToast(
          response?.message ||
          'Failed to verify OTP',
          'error',
        );

        shake();
      }
    } catch (error: any) {
      // ==========================================
      // GLOBAL ERROR
      // ==========================================

      console.error(
        '🔥 [GLOBAL ERROR] Registration failed:',
        error,
      );

      console.error(
        '🔥 [GLOBAL ERROR] Message:',
        error?.message,
      );

      console.error(
        '🔥 [GLOBAL ERROR] Response:',
        error?.response?.data,
      );

      console.error(
        '🔥 [GLOBAL ERROR] Status:',
        error?.response?.status,
      );

      showSuccessToast(
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.',
        'error',
      );

      shake();
    } finally {
      console.log(
        '🏁 [FINAL] submitRegisterWithNotificationPreference FINISHED',
      );

      setIsLoading(false);
    }
  };

  const onEnableNotifications = async () => {
    setNotifPromptLoading(true);
    try {
      const granted = await requestNotificationPermission(true);
      await submitRegisterWithNotificationPreference(Boolean(granted));
    } catch {
      await submitRegisterWithNotificationPreference(false);
    }
  };

  const onSkipNotifications = async () => {
    await submitRegisterWithNotificationPreference(false);
  };

  const LoginVerfiyOTP = async () => {
    Keyboard.dismiss();

    const otpCode = otp.join('');

    if (otpCode.length !== 4) {
      showSuccessToast(
        'Please enter valid OTP',
        'error',
      );

      shake();

      return;
    }

    setIsLoading(true);

    try {
      const send_data = {
        phone_number: `+91${phoneNumber}`,
        otp: otpCode,
      };

      console.log('====================================');
      console.log('🔵 VERIFY OTP LOGIN');
      console.log('====================================');

      /**
       * 1️⃣ Existing Login API
       */
      const response: any =
        await _AUTH_SERVICE.verify_otp_login(
          send_data,
        );

      console.log(
        'LOGIN API RESPONSE:',
        response,
      );

      if (response?.success) {
        showSuccessToast(
          response.message ||
          'OTP verified successfully',
          'success',
        );

        /**
         * 2️⃣ Get user ID returned by backend
         *
         * This becomes OneSignal External ID.
         */
        const userId =
          response?.data?.user_id;

        console.log(
          '👤 Backend User ID:',
          userId,
        );

        if (!userId) {
          console.log(
            '⚠️ User ID missing from login response',
          );
        }

        /**
         * 3️⃣ Store existing authentication data
         */
        await Utils.storeData(
          '_USER_ID',
          userId,
        );

        await Utils.storeData(
          '_TOKEN',
          response?.data?.access,
        );

        await Utils.storeData(
          '_REFRESH_TOKEN',
          response?.data?.refresh,
        );

        /**
         * 4️⃣ CONNECT USER WITH ONESIGNAL
         *
         * user_id
         *      ↓
         * OneSignal.login()
         *      ↓
         * External ID
         */
        if (userId) {
          try {
            console.log(
              '====================================',
            );

            console.log(
              '🔵 Connecting user with OneSignal',
            );

            console.log(
              'OneSignal External ID:',
              String(userId),
            );

            // Permission only after OTP (never on app start)
            await ensureDeviceNotificationsEnabled();

            const oneSignalData =
              await loginOneSignalUser(
                userId,
              );

            console.log(
              '✅ OneSignal user connected:',
              oneSignalData,
            );

            console.log(
              '====================================',
            );
          } catch (oneSignalError) {
            /**
             * IMPORTANT:
             *
             * OneSignal failure should NOT
             * break user login.
             */
            console.log(
              '⚠️ OneSignal connection failed:',
              oneSignalError,
            );
          }
        }

        /**
         * 5️⃣ Existing customer logic
         */
        const customerOnboard =
          response?.data?.customer;

        const hasCustomer =
          !!customerOnboard &&
          customerOnboard.customer_id != null;

        if (!hasCustomer) {
          await markAsGuest();

          resetRootToHomeStack(
            props.navigation,
            'AccessMode',
          );

          return;
        }

        /**
         * 6️⃣ Existing profile API
         */
        try {
          const profileRes: any =
            await _PROFILE_SERVICES.user_profile();

          if (profileRes?.data) {
            await Utils.storeData(
              '_USER_INFO',
              profileRes.data,
            );
          }

          const level =
            await syncAccessFromProfile(
              profileRes?.data,
            );

          if (level === 'full') {
            resetRootToHomeStack(
              props.navigation,
              'TabStack',
              {
                screen: 'Home',
              },
            );
          } else {
            await markAsGuest();

            resetRootToHomeStack(
              props.navigation,
              'AccessMode',
            );
          }
        } catch (profileError) {
          console.log(
            '⚠️ Profile API error:',
            profileError,
          );

          await markAsGuest();

          resetRootToHomeStack(
            props.navigation,
            'TabStack',
            {
              screen: 'Home',
            },
          );
        }
      } else {
        showSuccessToast(
          response?.message ||
          'Failed to verify OTP',
          'error',
        );

        shake();
      }
    } catch (error) {
      console.error(
        '❌ Send OTP Error:',
        error,
      );

      showSuccessToast(
        'Something went wrong. Please try again.',
        'error',
      );

      shake();
    } finally {
      setIsLoading(false);
    }
  };


  const handleOTPChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');

    // SMS autofill / paste of full code
    if (cleaned.length > 1) {
      applyOtpDigits(cleaned);
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LEN - 1) {
      setFocusedIndex(index + 1);
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key !== 'Backspace') {
      return;
    }
    const newOtp = [...otp];
    if (otp[index]) {
      newOtp[index] = '';
      setOtp(newOtp);
    } else if (index > 0) {
      newOtp[index - 1] = '';
      setOtp(newOtp);
      setFocusedIndex(index - 1);
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const changeMobileNumber = () => {
    props.navigation.goBack();
  };

  const onResendPress = async () => {
    if (resendTimer > 0) {
      return;
    }
    setResendTimer(60);
    setOtp(['', '', '', '']);
    setFocusedIndex(0);
    otpInputRefs.current[0]?.focus();

    try {
      const send_data = {
        phone_number: `+91${phoneNumber}`,
      };

      const response: any = await _AUTH_SERVICE.send_otp(send_data);
      Utils.storeData('_OTP', response?.data?.otp);
      await loadStoredOtp();

      if (response?.success) {
        setResendTimer(60);
        showSuccessToast(
          'New OTP has been send to your mobile number',
          'success',
        );
      } else {
        showSuccessToast('Please Resend OTP', 'error');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const otpComplete = otp.join('').length === OTP_LEN;
  const onVerify = NEW_CUSTOMER ? LoginVerfiyOTP : handleVerifyOTP;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.collageWrap,
              { height: COLLAGE_HEIGHT + Math.max(insets.top, 0) * 0.2 },
            ]}
          >
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

            <View
              style={[styles.logoBadge, { top: Math.max(insets.top, 10) + 6 }]}
              pointerEvents="none"
            >
              <View style={styles.logoPill}>
                <Image
                  source={Images.FinalLogo2}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandHint}>Your Ayurveda</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 12),
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.formCard}>
              <View style={styles.headerBlock}>
                <Text style={styles.title}>Verify your number</Text>
                <View style={styles.phoneRow}>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    Sent to <Text style={styles.phone}>+91 {phoneNumber}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={changeMobileNumber}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <AntDesign name="edit" size={14} color={C.cta} />
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.otpLabel}>Enter 4-digit OTP</Text>

              <Animated.View
                style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => {
                      otpInputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpFilled : null,
                      focusedIndex === index ? styles.otpFocused : null,
                    ]}
                    value={digit}
                    onChangeText={text => handleOTPChange(text, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, index)
                    }
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? OTP_LEN : 1}
                    textAlign="center"
                    autoFocus={index === 0}
                    selectionColor={C.cta}
                    placeholder=""
                    textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                    autoComplete={index === 0 ? 'sms-otp' : 'off'}
                    importantForAutofill={index === 0 ? 'yes' : 'no'}
                  />
                ))}
              </Animated.View>

              <View style={styles.metaRow}>


                <TouchableOpacity onPress={onResendPress} disabled={resendTimer > 0}>
                  <Text
                    style={[
                      styles.resendLink,
                      resendTimer > 0 && styles.resendDisabled,
                    ]}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={onVerify}
                style={[styles.cta, (!otpComplete || isLoading) && styles.ctaDisabled]}
                activeOpacity={0.88}
                disabled={!otpComplete || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Verify & continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.secureNote}>
              Secure one-time password · never share your code
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CommonModal
        visible={notifPromptVisible}
        icon="🔔"
        title="Stay updated with Ayurmuni"
        subtitle="Allow notifications for appointment reminders, order updates, and wellness tips. You can change this anytime in Settings."
        cancelText="Not now"
        confirmText="Enable alerts"
        stackButtons
        loading={notifPromptLoading}
        onClose={onSkipNotifications}
        onConfirm={onEnableNotifications}
      />
    </View>
  );
};

export default OtpVerify;

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
  logoImg: {
    width: 150,
    height: 30,
    tintColor: Colors.primaryColor,
  },
  brandHint: {
    fontSize: 9,
    letterSpacing: 1.3,
    color: 'rgba(247, 243, 234, 0.9)',
    fontFamily: Fonts.PoppinsMedium,
  },

  sheet: {
    flexGrow: 1,
    backgroundColor: C.sheet,
    marginTop: -26,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8D0C0',
    marginBottom: 10,
  },

  formCard: {
    backgroundColor: '#FFFEFA',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E0D2',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerBlock: {
    marginBottom: 10,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: isSmallDevice ? 26 : 28,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subtitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: C.body,
    fontFamily: Fonts.PoppinsRegular,
  },
  phone: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.soft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  editText: {
    fontSize: 11,
    color: C.cta,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  otpLabel: {
    fontSize: 13,
    color: C.headline,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: BOX_GAP,
    marginBottom: 10,
  },
  otpInput: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    backgroundColor: C.inputBg,
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 0,
  },
  otpFilled: {
    borderColor: C.cta,
    backgroundColor: '#F3FAF7',
    color: C.cta,
  },
  otpFocused: {
    borderColor: C.cta,
    shadowColor: C.cta,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  metaRow: {
    // flexDirection: 'row',
    alignItems: "flex-end",
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.soft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timer: {
    color: C.cta,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resendLink: {
    fontSize: 12,
    color: C.cta,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resendDisabled: {
    color: '#9AA8A3',
    fontFamily: Fonts.PoppinsMedium,
  },

  cta: {
    width: '100%',
    minHeight: 50,
    borderRadius: 26,
    backgroundColor: C.cta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.ctaText,
    letterSpacing: 0.3,
  },
  secureNote: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#8A968F',
    fontFamily: Fonts.PoppinsRegular,
  },
});



