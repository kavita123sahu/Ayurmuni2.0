import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  ScrollView,
  KeyboardEvent,
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

const C = {
  collageBg: '#1A2E28',
  sheet: '#F7F3EA',
  headline: '#1A2E28',
  body: '#5A6B66',
  cta: '#0E4B3A',
  ctaText: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#DDD6C8',
  soft: '#EFE8DA',
};

const { height, width } = Dimensions.get('window');
const isSmallDevice = height < 700;
/** Same top/body proportions as Login */
const COLLAGE_HEIGHT = Math.round(height * (isSmallDevice ? 0.34 : 0.38));
const TILE_HEIGHT = Math.round(COLLAGE_HEIGHT * 0.64);
const TILE_GAP = 10;
const OTP_LEN = 4;
const BOX_GAP = 10;
const BOX_SIZE = Math.min(58, Math.floor((width - 44 - BOX_GAP * (OTP_LEN - 1)) / OTP_LEN));

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
  const [recoverVisible, setRecoverVisible] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverDays, setRecoverDays] = useState(30);
  const [pendingRecoverOtp, setPendingRecoverOtp] = useState('');
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const phoneNumber = props.route?.params?.phone;
  const NEW_CUSTOMER = props.route?.params?.customer;
  const routeRetentionDays = Number(props.route?.params?.retentionDays);

  useEffect(() => {
    if (
      props.route?.params?.accountDeleted &&
      Number.isFinite(routeRetentionDays) &&
      routeRetentionDays > 0
    ) {
      setRecoverDays(routeRetentionDays);
    }
  }, [props.route?.params?.accountDeleted, routeRetentionDays]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
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

  const openRecoverPrompt = async (
    info: {
      retentionDays: number;
      message?: string;
    },
    otpCode: string,
  ) => {
    // Never keep a session for a deleted account unless they recover.
    await Utils.removeData('_TOKEN');
    await Utils.removeData('_REFRESH_TOKEN');
    await Utils.removeData('_IS_GUEST');
    await Utils.storeData('_DELETED_ACCOUNT_HOLD', {
      phone: `+91${phoneNumber}`,
      retention_days: info.retentionDays,
      held_at: Date.now(),
    });
    setRecoverDays(info.retentionDays);
    setPendingRecoverOtp(otpCode);
    setRecoverVisible(true);
  };

  /** Without recover, this number cannot enter the app during retention. */
  const dismissRecoverWithoutEntry = async () => {
    setRecoverVisible(false);
    await Utils.removeData('_TOKEN');
    await Utils.removeData('_REFRESH_TOKEN');
    await Utils.removeData('_IS_GUEST');
    showSuccessToast(
      `This number is under deletion recovery for ${recoverDays} days. Recover to enter, or use a different number.`,
      'error',
    );
    props.navigation.navigate('Login');
  };

  const recoverDeletedAccount = async () => {
    const otpCode = pendingRecoverOtp || otp.join('');
    if (!otpCode || otpCode.length < 4) {
      showSuccessToast('Please enter a valid OTP', 'error');
      return;
    }
    setRecoverLoading(true);
    try {
      // Recover API must run without auth token
      await Utils.removeData('_TOKEN');
      await Utils.removeData('_REFRESH_TOKEN');

      const res: any = await _PROFILE_SERVICES.recoverAccount({
        phone_number: `+91${phoneNumber}`,
        otp: otpCode,
      });

      if (res?.success === false) {
        showSuccessToast(
          res?.message || 'Unable to recover account',
          'error',
        );
        return;
      }

      await Utils.removeData('_DELETED_ACCOUNT_HOLD');

      if (res?.data?.access) {
        await Utils.storeData('_TOKEN', res.data.access);
      }
      if (res?.data?.refresh) {
        await Utils.storeData('_REFRESH_TOKEN', res.data.refresh);
      }
      if (res?.data?.user_id) {
        await Utils.storeData('_USER_ID', res.data.user_id);
      }

      showSuccessToast(
        res?.message || 'Account recovered successfully',
        'success',
      );
      setRecoverVisible(false);

      try {
        const profileRes: any = await _PROFILE_SERVICES.user_profile();
        if (profileRes?.data) {
          await Utils.storeData('_USER_INFO', profileRes.data);
        }
        const level = await syncAccessFromProfile(profileRes?.data);
        if (level === 'full') {
          resetRootToHomeStack(props.navigation, 'TabStack', {
            screen: 'Home',
          });
        } else {
          await markAsGuest();
          resetRootToHomeStack(props.navigation, 'AccessMode');
        }
      } catch {
        await markAsGuest();
        resetRootToHomeStack(props.navigation, 'AccessMode');
      }
    } catch {
      showSuccessToast('Unable to recover account. Try again.', 'error');
    } finally {
      setRecoverLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      showSuccessToast('Please enter valid OTP', 'error');
      shake();
      return;
    }
    setIsLoading(true);

    try {
      const send_data = {
        phone_number: `+91${phoneNumber}`,
        otp: otpCode,
      };
      const response: any = await _AUTH_SERVICE.verify_otp(send_data);
      const deletedInfo = _PROFILE_SERVICES.parseDeletedAccountInfo(response);

      if (deletedInfo) {
        await openRecoverPrompt(deletedInfo, otpCode);
        return;
      }

      if (response?.success) {
        await Utils.storeData('_USER_ID', response?.data?.user_id);
        await Utils.storeData('_TOKEN', response?.data?.access);
        await Utils.storeData('_REFRESH_TOKEN', response?.data?.refresh);
        await markAsGuest();
        showSuccessToast(response.message || 'OTP verified successfully', 'success');
        resetRootToHomeStack(props.navigation, 'AccessMode');
      } else {
        showSuccessToast(response?.message || 'Failed to verify OTP', 'error');
        shake();
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showSuccessToast('Something went wrong. Please try again.', 'error');
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  const LoginVerfiyOTP = async () => {
    Keyboard.dismiss();
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      showSuccessToast('Please enter valid OTP', 'error');
      shake();
      return;
    }

    setIsLoading(true);

    try {
      const send_data = {
        phone_number: `+91${phoneNumber}`,
        otp: otpCode,
      };
      const response: any = await _AUTH_SERVICE.verify_otp_login(send_data);
      const deletedInfo = _PROFILE_SERVICES.parseDeletedAccountInfo(response);

      if (deletedInfo) {
        await openRecoverPrompt(deletedInfo, otpCode);
        return;
      }

      if (response?.success) {
        showSuccessToast(response.message || 'OTP verified successfully', 'success');
        await Utils.storeData('_USER_ID', response?.data?.user_id);
        await Utils.storeData('_TOKEN', response?.data?.access);
        await Utils.storeData('_REFRESH_TOKEN', response?.data?.refresh);

        const customerOnboard = response?.data?.customer || response?.data;
        const hasCustomer =
          !!customerOnboard &&
          (customerOnboard.customer_id != null ||
            customerOnboard.is_customer_profile_created === true ||
            customerOnboard.is_profile === true);

        if (!hasCustomer) {
          await markAsGuest();
          resetRootToHomeStack(props.navigation, 'AccessMode');
          return;
        }

        try {
          const profileRes: any = await _PROFILE_SERVICES.user_profile();
          if (profileRes?.data) {
            await Utils.storeData('_USER_INFO', profileRes.data);
          }
          const level = await syncAccessFromProfile(
            profileRes?.data || customerOnboard,
          );
          if (level === 'full') {
            resetRootToHomeStack(props.navigation, 'TabStack', {
              screen: 'Home',
            });
          } else {
            await markAsGuest();
            resetRootToHomeStack(props.navigation, 'AccessMode');
          }
        } catch {
          await markAsGuest();
          resetRootToHomeStack(props.navigation, 'TabStack', {
            screen: 'Home',
          });
        }
      } else {
        showSuccessToast(response?.message || 'Failed to verify OTP', 'error');
        shake();
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showSuccessToast('Something went wrong. Please try again.', 'error');
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
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
      const response: any = await _AUTH_SERVICE.send_otp({
        phone_number: `+91${phoneNumber}`,
      });
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
  const scrollRef = useRef<ScrollView>(null);

  const ensureVerifyVisible = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'ios' ? 60 : 100);
    });
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (_e: KeyboardEvent) => {
      ensureVerifyVisible();
    };
    const onHide = () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [ensureVerifyVisible]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
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
              <Text style={styles.brandHint}>ANCIENT WISDOM · MODERN CARE</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 14),
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.title}>Verify your OTP</Text>

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

            <Text style={styles.label}>Enter OTP</Text>

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
                  onFocus={() => {
                    setFocusedIndex(index);
                    ensureVerifyVisible();
                  }}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LEN : 1}
                  textAlign="center"
                  autoFocus={index === 0}
                  selectionColor={C.cta}
                  textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                  autoComplete={index === 0 ? 'sms-otp' : 'off'}
                  importantForAutofill={index === 0 ? 'yes' : 'no'}
                />
              ))}
            </Animated.View>

            <View style={styles.metaRow}>
              <Text style={styles.timer}>
                00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
              </Text>
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
                  <Text style={styles.ctaText}>Verify</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CommonModal
        visible={recoverVisible}
        icon="♻️"
        title="Account was deleted"
        subtitle={`This number is scheduled for deletion. Recover within ${recoverDays} days to keep your data and enter the app. Without recovery you cannot use this number until the ${recoverDays}-day period ends — or sign in with a new number.`}
        cancelText="Use another number"
        confirmText="Recover account"
        stackButtons
        loading={recoverLoading}
        onClose={dismissRecoverWithoutEntry}
        onConfirm={recoverDeletedAccount}
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

  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: isSmallDevice ? 26 : 28,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 13,
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
    gap: 4,
    backgroundColor: C.soft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editText: {
    fontSize: 12,
    color: C.cta,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  label: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.headline,
    marginBottom: 8,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: BOX_GAP,
    marginBottom: 12,
  },
  otpInput: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    backgroundColor: C.inputBg,
    fontSize: 22,
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
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timer: {
    color: C.cta,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resendLink: {
    fontSize: 13,
    color: C.cta,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  resendDisabled: {
    color: '#9AA8A3',
    fontFamily: Fonts.PoppinsMedium,
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
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: C.ctaText,
    letterSpacing: 0.6,
  },
});
