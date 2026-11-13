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
  Modal,
  Pressable,
  ActivityIndicator,
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
import { AuthTheme as C } from '../../common/AuthTheme';
import { parseDeletedAccountInfo } from '../../services/ProfileServices';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import InfiniteMarquee from '../../components/InfiniteMarquee';
import PolicyContentRenderer from '../../components/PolicyContentRenderer';
import {
  getLegalRequiredPolicies,
  getPoliciesList,
  getPolicyDocument,
  normalizePolicyContent,
} from '../../services/PolicyServices';

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

const HEADLINES: Array<{ text: string; icon: TablerIconName }> = [
  {
    text: 'Bringing Ayurveda into your everyday life',
    icon: 'leaf',
  },
  {
    text: 'Discover personalised Ayurveda for your lifestyle.',
    icon: 'heart-handshake',
  },
  {
    text: 'A wellness journey created around you.',
    icon: 'chart-pie',
  },
  {
    text: 'Expert guidance for your everyday wellness.',
    icon: 'stethoscope',
  },
  {
    text: 'A healthier rhythm for your life',
    icon: 'mood-smile',
  },
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
  items,
}: {
  items: Array<{ text: string; icon: TablerIconName }>;
}) => {
  if (!items?.length) return null;

  return (
    <View style={styles.carouselBlock}>
      <InfiniteMarquee speed={32} gap={36} style={styles.marqueeClipH}>
        {items.map((item, index) => (
          <View key={`${item.text}-${index}`} style={styles.marqueeItem}>
            <View style={styles.carouselIcon}>
              <TablerIcon name={item.icon} size={15} color={C.primary} />
            </View>
            <Text style={styles.carouselText} numberOfLines={1}>
              {item.text}
            </Text>

          </View>
        ))}
      </InfiniteMarquee>
    </View>
  );
};

const PhoneAuthScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [policySheet, setPolicySheet] = useState<{
    type: 'terms_and_conditions' | 'privacy_policy';
    title: string;
  } | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyDoc, setPolicyDoc] = useState<any>(null);

  const canSendOtp = phone.length === 10 && termsAgreed && !isLoading;

  const openPolicy = async (
    policyType: 'terms_and_conditions' | 'privacy_policy',
  ) => {
    const title =
      policyType === 'terms_and_conditions'
        ? 'Terms of Use'
        : 'Privacy Policy';

    setPolicySheet({ type: policyType, title });
    setPolicyLoading(true);
    setPolicyError(null);
    setPolicyDoc(null);

    try {
      const res: any = await getLegalRequiredPolicies(policyType);
      if (res?.success === false) {
        setPolicyError(
          res?.message || 'Unable to load this policy right now.',
        );
        return;
      }

      const list = getPoliciesList(res);
      const entry =
        list.find(
          (item: any) =>
            (item?.policy?.policy_type || item?.policy_type) === policyType,
        ) || list[0];
      const doc = getPolicyDocument(entry);

      if (!doc) {
        setPolicyError('Unable to load this policy right now.');
        return;
      }

      setPolicyDoc({
        ...doc,
        content: normalizePolicyContent(doc?.content),
      });
    } catch (e: any) {
      setPolicyError(e?.message || 'Failed to load policy.');
    } finally {
      setPolicyLoading(false);
    }
  };

  const closePolicySheet = () => {
    setPolicySheet(null);
    setPolicyDoc(null);
    setPolicyError(null);
    setPolicyLoading(false);
  };

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

    if (!termsAgreed) {
      showSuccessToast(
        'Please agree to the Terms of Use and Privacy Policy',
        'error',
      );
      return;
    }

    setIsLoading(true);

    try {
      const fullPhone = `+91${phone}`;

      // Client hold after delete without recover — block same number during retention.
      const hold = await Utils.getData('_DELETED_ACCOUNT_HOLD');
      if (hold?.phone && String(hold.phone) === fullPhone) {
        const days = Number(hold.retention_days) || 30;
        const heldAt = Number(hold.held_at) || 0;
        const msLeft = heldAt + days * 24 * 60 * 60 * 1000 - Date.now();
        if (msLeft > 0) {
          const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
          // Still allow OTP so they can open recover flow on verify
        } else {
          await Utils.removeData('_DELETED_ACCOUNT_HOLD');
        }
      }

      const send_data = {
        phone_number: fullPhone,
      };

      const response: any = await _AUTH_SERVICE.send_otp(send_data);

      const OTP = response?.data?.otp;
      const deletedInfo = parseDeletedAccountInfo(response);

      const isCustomer = response?.data?.user_roles?.some(
        (role: string) => role?.toLowerCase() === 'customer',
      );
      // User accepted Terms/Privacy on this screen before Send OTP
      await Utils.storeData('_POLICY_ACCEPTED_CUSTOMER', true);

      if (deletedInfo) {
        await Utils.storeData('_DELETED_ACCOUNT_HOLD', {
          phone: fullPhone,
          retention_days: deletedInfo.retentionDays,
          held_at: Date.now(),
        });

        Utils.storeData('_OTP', OTP);

        props.navigation.navigate('OtpVerify', {
          phone,
          customer: isCustomer,
          accountDeleted: true,
          retentionDays: deletedInfo.retentionDays,
          policyAcceptedCustomer: true,
        });

        return;
      }

      if (response?.success) {
        Utils.storeData('_OTP', OTP);

        showSuccessToast(
          response.message || 'OTP sent successfully',
          'success',
        );

        props.navigation.navigate('OtpVerify', {
          phone,
          customer: isCustomer,
          policyAcceptedCustomer: true,
        });
      } else {
        const errorMessage =
          response?.data?.errors?.phone_number?.[0] ||
          response?.message ||
          'Please enter a valid mobile number';

        showSuccessToast(errorMessage, 'error');
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
                'rgba(15, 61, 52, 0.45)',
                'rgba(232, 248, 242, 0.55)',
                C.page,
              ]}
              locations={[0, 0.58, 1]}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={[styles.logoBadge, { top: Math.max(insets.top, 10) + 6 }]} pointerEvents="none">
              <View style={styles.logoPill}>
                <Image source={Images.FinalLogo2} style={styles.logoImg} resizeMode="contain" />
              </View>
              <Text style={styles.brandHint}>Your Ayurveda</Text>
            </View>
          </View>

          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <View style={styles.sheetHandle} />

            <TextCarousel items={HEADLINES} />

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
                placeholderTextColor={C.muted}
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
                <MaterialCommunityIcons name="check-circle" size={20} color={C.primary} />
              ) : null}
            </TouchableOpacity>

            <View style={styles.termsBlock}>
              <TouchableOpacity
                style={styles.termsRow}
                activeOpacity={0.85}
                onPress={() => setTermsAgreed(prev => !prev)}
              >
                <View style={[styles.checkbox, termsAgreed && styles.checkboxOn]}>
                  {termsAgreed ? (
                    <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => openPolicy('terms_and_conditions')}
                  >
                    Terms of Use
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => openPolicy('privacy_policy')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.ctaWrap, !canSendOtp && styles.ctaDisabled]}
              activeOpacity={0.88}
              onPress={onLogin}
              disabled={!canSendOtp}
            >
              <LinearGradient
                colors={C.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cta}
              >
                <Text style={styles.ctaText}>
                  {isLoading ? 'Sending...' : 'GET OTP'}
                </Text>
                {!isLoading ? (
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                ) : null}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={!!policySheet}
        transparent
        animationType="slide"
        onRequestClose={closePolicySheet}
      >
        <View style={styles.policyOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closePolicySheet}
          />
          <View
            style={[
              styles.policySheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.policyHandle} />
            <View style={styles.policyHeader}>
              <Text style={styles.policyTitle} numberOfLines={1}>
                {policySheet?.title || 'Policy'}
              </Text>
              <TouchableOpacity
                onPress={closePolicySheet}
                hitSlop={10}
                style={styles.policyClose}
              >
                <MaterialCommunityIcons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {policyLoading ? (
              <View style={styles.policyCenter}>
                <ActivityIndicator size="large" color={C.primary} />
              </View>
            ) : policyError ? (
              <View style={styles.policyCenter}>
                <Text style={styles.policyError}>{policyError}</Text>
                <TouchableOpacity
                  style={styles.policyRetry}
                  onPress={() =>
                    policySheet && openPolicy(policySheet.type)
                  }
                >
                  <Text style={styles.policyRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                style={styles.policyScroll}
                contentContainerStyle={styles.policyScrollContent}
                showsVerticalScrollIndicator
                bounces
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {!!policyDoc?.title && (
                  <Text style={styles.policyDocTitle}>{policyDoc.title}</Text>
                )}
                <PolicyContentRenderer content={policyDoc?.content} />
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.policyDone}
              activeOpacity={0.9}
              onPress={closePolicySheet}
            >
              <Text style={styles.policyDoneText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: C.page,
  },
  scrollContent: {
    flexGrow: 1,
  },

  collageWrap: {
    backgroundColor: C.collage,
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
    backgroundColor: '#1A4A40',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  logoImg: { width: 150, tintColor: Colors.primaryColor, height: 30 },
  brandHint: {
    fontSize: 9,
    letterSpacing: 1.3,
    color: 'rgba(255, 255, 255, 0.92)',
    fontFamily: Fonts.PoppinsMedium,
  },

  sheet: {
    flexGrow: 1,
    backgroundColor: C.page,
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
    backgroundColor: C.handle,
    marginBottom: 12,
  },

  carouselBlock: {
    marginBottom: 14,
    minHeight: isSmallDevice ? 44 : 48,
    justifyContent: 'center',
  },
  marqueeClipH: {
    height: isSmallDevice ? 40 : 44,
    justifyContent: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 28,
  },
  carouselIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    marginRight: 8
  },
  carouselText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 20 : 22,
    color: C.headline,
    textAlign: 'left',
    fontFamily: Fonts.PoppinsSemiBold,
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
    backgroundColor: C.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: C.borderSoft,
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
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 56,
    gap: 8,
  },
  inputPillFocused: {
    borderColor: C.focus,
    backgroundColor: C.inputSoft,
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.chipBg,
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

  termsBlock: {
    marginTop: 10,
    marginBottom: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Fonts.PoppinsRegular,
    color: C.body,
  },
  termsLink: {
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
    textDecorationLine: 'underline',
  },

  policyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  policySheet: {
    maxHeight: height * 0.86,
    height: height * 0.82,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  policyHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 4,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  policyTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    paddingRight: 12,
  },
  policyClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyCenter: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  policyError: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginBottom: 14,
  },
  policyRetry: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  policyRetryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  policyScroll: {
    flex: 1,
    minHeight: 160,
  },
  policyScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  policyDocTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 12,
  },
  policyDone: {
    marginHorizontal: 18,
    marginTop: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyDoneText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  ctaWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cta: {
    width: '100%',
    minHeight: 54,
    borderRadius: 16,
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
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});

export default PhoneAuthScreen;

//       if (response?.success) {

//         Utils.storeData("_OTP", OTP)
