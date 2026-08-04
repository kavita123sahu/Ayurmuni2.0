import React, { useState, useRef, useEffect } from 'react';
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
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    Animated,
    Easing
} from 'react-native';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { ApiResponse, showSuccessToast } from '../../config/Key';
import * as _AUTH_SERVICE from '../../services/AuthService'
import { Utils } from '../../common/Utils';
import { markAsGuest, syncAccessFromProfile } from '../../services/guestAuth';
import { Fonts } from '../../common/Fonts';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { AntDesign } from '../../common/Vector';
import { resetRootToHomeStack } from '../../navigation/navigationUtils';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';

// Constants matching Send OTP screen
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

const COLLAGE_HEIGHT = 500; // Reduced height for OTP screen
const TILE_HEIGHT = 180;
const TILE_GAP = 10;

const IMAGE_POOL = [
    Images.login1,
    Images.login2,
    Images.login3,
    Images.login4,
    Images.login5,
    Images.login6,
    Images.login7,
    Images.login8,
];
const COLUMN_LEFT = [IMAGE_POOL[0], IMAGE_POOL[1], IMAGE_POOL[2], IMAGE_POOL[0], IMAGE_POOL[1]];
const COLUMN_CENTER = [IMAGE_POOL[2], IMAGE_POOL[3], IMAGE_POOL[4], IMAGE_POOL[2], IMAGE_POOL[3]];
const COLUMN_RIGHT = [IMAGE_POOL[1], IMAGE_POOL[3], IMAGE_POOL[4], IMAGE_POOL[0], IMAGE_POOL[2]];

type Direction = 'up' | 'down';

// Marquee Column Component (same as Send OTP)
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

interface OTPVerificationProps {
    navigation?: any;
    route?: any;
}

const OtpVerify: React.FC<OTPVerificationProps> = (props) => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState<number>(60);
    const otpInputRefs = useRef<(TextInput | null)[]>([]);
    const phoneNumber = props.route?.params?.phone;
    const NEW_CUSTOMER = props.route?.params?.customer;

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    console.log("new customer", NEW_CUSTOMER);

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            })
        ]).start();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const loadStoredOtp = async () => {
        try {
            const storedOtp =
                await Utils.getData("_OTP");

            if (storedOtp) {
                setOtp(
                    storedOtp.toString().split(""),
                );
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadStoredOtp();
    }, []);

    // Shake animation for error
    const shake = () => {
        shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
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

            console.log("sverifyyyy---otpppppp", send_data);
            const response: any = await _AUTH_SERVICE.verify_otp(send_data);
            console.log("verify_otp_response--->", response);

            if (response?.success) {
                // New register: token issued, still guest until AccessMode / onboarding done
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

            console.log("sverifyyyy---otpppppp", send_data);
            const response: any = await _AUTH_SERVICE.verify_otp_login(send_data);
            console.log("verify_otp_login_response--->", response);

            if (response?.success) {
                showSuccessToast(response.message || 'OTP verified successfully', 'success');

                await Utils.storeData('_USER_ID', response?.data?.user_id);
                await Utils.storeData('_TOKEN', response?.data?.access);
                await Utils.storeData('_REFRESH_TOKEN', response?.data?.refresh);

                const customerOnboard = response?.data?.customer;
                const hasCustomer =
                    !!customerOnboard && customerOnboard.customer_id != null;

                if (!hasCustomer) {
                    // Returning phone, no customer profile yet → guest + choose path
                    await markAsGuest();
                    resetRootToHomeStack(props.navigation, 'AccessMode');
                    return;
                }

                // Existing customer: sync guest/full from profile
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
                        // Incomplete onboarding — still choose guest browse vs finish
                        await markAsGuest();
                        resetRootToHomeStack(props.navigation, 'AccessMode');
                    }
                } catch {
                    // Profile sync failed — allow browse as guest; actions stay gated
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
        const digit = text.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Animate input
        if (digit) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                })
            ]).start();
        }

        if (digit && index < 3) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace') {
            const newOtp = [...otp];

            if (otp[index]) {
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                newOtp[index - 1] = '';
                setOtp(newOtp);
                otpInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const changeMobileNumber = () => {
        props.navigation.goBack();
    }

    const onResendPress = async () => {
        setResendTimer(60);
        setOtp(['', '', '', '']);
        otpInputRefs.current[0]?.focus();

        try {
            const send_data = {
                phone_number: `+91${phoneNumber}`,
            };

            const response: any = await _AUTH_SERVICE.send_otp(send_data);
            console.log("resend_otp_response", response?.data?.otp);
            Utils.storeData("_OTP", response?.data?.otp)
            await loadStoredOtp();

            setIsLoading(false);
            if (response?.success) {
                setResendTimer(60);
                showSuccessToast('New OTP has been send to your mobile number', 'success');
            } else {
                setIsLoading(false);
                showSuccessToast('Please Resend OTP', 'error')
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }

    return (
        <View style={styles.container}>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{ flex: 1, marginBottom: -60 }}
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
                            <Animated.View
                                style={[
                                    styles.contentContainer,
                                    {
                                        opacity: fadeAnim,
                                        transform: [
                                            { translateY: slideAnim },
                                            { scale: scaleAnim }
                                        ]
                                    }
                                ]}>

                                <View>
                                    <Text style={styles.title}>
                                        Verify Your Mobile Number
                                    </Text>

                                    <Text style={styles.subtitle}>
                                        Please enter the 4 digit code sent to your mobile number
                                        <Text style={styles.phone}> +91 {phoneNumber}</Text>
                                        <TouchableOpacity
                                            style={styles.backBtn}
                                            onPress={changeMobileNumber}>
                                            <AntDesign name="edit"
                                                style={styles.backIcon}
                                                size={20} color={Colors.primaryColor} />
                                        </TouchableOpacity>
                                    </Text>

                                    <Text style={styles.otpLabel}>Enter OTP</Text>

                                    <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
                                        {otp.map((digit, index) => (
                                            <TextInput
                                                placeholderTextColor="#9CA3AF"
                                                key={index}
                                                ref={(ref) => {
                                                    otpInputRefs.current[index] = ref;
                                                }}
                                                style={[
                                                    styles.otpInput,
                                                    digit && styles.otpFilled
                                                ]}
                                                value={digit}
                                                onChangeText={(text) => handleOTPChange(text, index)}
                                                onKeyPress={({ nativeEvent }) =>
                                                    handleKeyPress(nativeEvent.key, index)
                                                }
                                                keyboardType="numeric"
                                                maxLength={1}
                                                textAlign="center"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </Animated.View>

                                    <Text style={styles.timer}>
                                        00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={onResendPress}
                                        disabled={resendTimer > 0}>
                                        <Text style={styles.resendText}>
                                            Didn't receive the code?{" "}
                                            <Text
                                                style={[
                                                    styles.resendLink,
                                                    resendTimer > 0 && styles.disabled
                                                ]}>
                                                Resend
                                            </Text>
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {otp.join('').length === 4 && !isLoading ? (
                                    <TouchableOpacity
                                        onPress={NEW_CUSTOMER ? LoginVerfiyOTP : handleVerifyOTP}
                                        style={styles.activeBtn}
                                        activeOpacity={0.8}>
                                        <Text style={styles.activeBtnText}>Verify</Text>
                                    </TouchableOpacity>
                                ) : isLoading ? (
                                    <View style={styles.activeBtn}>
                                        <ActivityIndicator color="#fff" size="small" />
                                    </View>
                                ) : (
                                    <View style={styles.disabledBtn}>
                                        <Text style={styles.disabledBtnText}>Verify</Text>
                                    </View>
                                )}
                            </Animated.View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

export default OtpVerify;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.sheet,
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
        paddingTop: TILE_GAP,
    },
    marqueeClip: {
        height: COLLAGE_HEIGHT,
        overflow: 'hidden',
        borderRadius: 12,
    },
    tile: {
        width: '100%',
        height: TILE_HEIGHT,
        borderRadius: 12,
        marginBottom: TILE_GAP,
        backgroundColor: '#22301D',
    },
    collageFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 80,
        backgroundColor: 'transparent',
        zIndex: 5,
    },
    sheet: {
        paddingTop: 50,
        flex: 1,
        backgroundColor: C.sheet,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -30,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    contentContainer: {
        flex: 1,
        // FIX 2 (cont.): this is what actually pins the Verify button
        // to the bottom of the sheet instead of leaving dead space
        // below it.
        justifyContent: 'space-between',
    },
    backBtn: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
    backIcon: {
        resizeMode: 'contain',
        marginBottom: -4,
        marginLeft: 6,
    },
    title: {
        fontSize: 28,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 22,
        marginBottom: 20,
    },
    phone: {
        fontFamily: Fonts.PoppinsMedium,
    },
    otpLabel: {
        fontSize: 14,
        color: '#111827',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 14,
        fontWeight: 'bold'
    },
    otpContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 16,
        justifyContent: 'center',
    },
    otpInput: {
        width: 58,
        height: 58,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#0D614E33',
        backgroundColor: '#fff',
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    otpFilled: {
        borderColor: '#0D614E',
        // backgroundColor: '#0D614E0D',
        color: '#0D614E',
        // shadowOpacity: 0.1,
    },
    timer: {
        color: '#0D614E',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 10,
        textAlign: 'center',
    },
    resendText: {
        fontSize: 14,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 30,
        textAlign: 'center',
    },
    resendLink: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },
    disabled: {
        color: Colors.bottomBg,
    },
    activeBtn: {
        height: 52,
        backgroundColor: Colors.primaryColor,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0D614E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    activeBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.5,
    },
    disabledBtn: {
        height: 52,
        backgroundColor: '#E5E7EB',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledBtnText: {
        color: '#64748B',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});