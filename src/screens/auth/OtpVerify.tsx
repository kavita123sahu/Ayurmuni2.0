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
    BackHandler
} from 'react-native';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { ApiResponse, showSuccessToast } from '../../config/Key';
import *as _AUTH_SERVICE from '../../services/AuthService'
import { Utils } from '../../common/Utils';
import { formatIndianPhoneNumber } from '../../common/Validator';
import { Fonts } from '../../common/Fonts';
import { useFocusEffect } from '@react-navigation/native';

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
    const IS_NEW_CUSTOMER = props.route?.params?.newCustomer;

    console.log("is-new_user", IS_NEW_CUSTOMER);

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

    const handleVerifyOTP = async () => {
        Keyboard.dismiss();


        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            showSuccessToast('Please enter valid OTP', 'error');
            return;
        }
        setIsLoading(true);

        try {
            const send_data = {
                phone_number: phoneNumber,
                otp: otpCode,
                role: 'customer'
            };

            const response: any = await _AUTH_SERVICE.verify_otp(send_data);
            const { status, data, message } = response;
            console.log("newwwwwwuser", response);

            console.log(response);

            const JSONData = await response.json();

            console.log("verify_otp_response--->", JSONData);

            if (status === 200) {
                console.log(JSONData?.is_new_user,)
                Utils.storeData('_USER_ID', JSONData?.user_id);
                // showSuccessToast(JSONData.message || 'OTP verified successfully', 'success');
                props.navigation.replace('HomeStack', {
                    screen: 'TermsCondition',
                    params: {
                        agreed: false
                    }
                })
            }

            else {
                showSuccessToast(data?.error || 'Failed to verify OTP', 'error');
            }

        } catch (error) {
            console.error('Send OTP Error:', error);
            showSuccessToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    const LoginVerfiyOTP = async () => {
        Keyboard.dismiss();

        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            showSuccessToast('Please enter valid OTP', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const send_data = {
                phone_number: `+91${phoneNumber}`,
                OTP: otpCode,
            };

            const response: any = await _AUTH_SERVICE.verify_otp_login(send_data);

            const { data, message = "", status } = response;
            const datauser = await response.json()
            console.log("verify_otp_login_response", datauser);

            if (response?.status === 200) {
                const roles = datauser?.roles || [];
                showSuccessToast(response.message || 'OTP verified successfully', 'success');
                Utils.storeData('_USER_ID', datauser?.user_id);
                Utils.storeData('_TOKEN', datauser?.access);
                const customer = roles.find((r: any) => r.role === 'customer');
                console.log("customer_role", customer?.details?.id);
                Utils.storeData('_CUSTOMER_ID', customer?.details?.id || '');

                if (!datauser?.is_new_customer) {
                    props.navigation.replace('HomeStack', { screen: 'Home' });
                }
                else {
                    props.navigation.replace('HomeStack', { screen: 'TermsConditions' });

                }
            }

            else {
                showSuccessToast(datauser?.error || 'Failed to verify OTP', 'error');
            }

        } catch (error) {
            console.error('Send OTP Error:', error);
            showSuccessToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    const handleOTPChange = (text: string, index: number) => {
        const digit = text.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
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


    const handleResendOTP = () => {
        if (resendTimer === 0) {
            setResendTimer(60);
            setOtp(['', '', '', '']);
            otpInputRefs.current[0]?.focus();
            showSuccessToast('New OTP has been send to your mobile number', 'success')

        }
    };

    const onResendPress = async () => {
        setResendTimer(60);
        setOtp(['', '', '', '']);
        otpInputRefs.current[0]?.focus();

        try {

            const send_data = {
                phone_number: `+91${phoneNumber}`,
            };


            const response: any = await _AUTH_SERVICE.send_otp(send_data);
            const { data, message = "", status } = response;
            const JSONData = await response.json();
            console.log("resend_otp_response", response, JSONData);
            setIsLoading(false);
            if (status === 200 || response.ok) {
                setResendTimer(60);
                showSuccessToast('New OTP has been send to your mobile number', 'success');
            }
            else {
                setIsLoading(false);
                showSuccessToast('Please Resend OTP', 'error')
            }

        }


        catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F9FAFB' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>

                    <View style={styles.container}>


                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={changeMobileNumber}>
                            <Image
                                source={Images.backIcon}
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>

                        <Text style={styles.title}>
                            Verify Your Mobile Number
                        </Text>

                        <Text style={styles.subtitle}>
                            Please enter the 4 digit code sent to your mobile number
                            <Text style={styles.phone}> +91 {phoneNumber}</Text>
                        </Text>

                        <Text style={styles.otpLabel}>Enter OTP</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
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
                                />
                            ))}
                        </View>

                        <Text style={styles.timer}>
                            00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                        </Text>

                        <TouchableOpacity
                            onPress={onResendPress}
                            disabled={resendTimer > 0}>
                            <Text style={styles.resendText}>
                                Didn’t receive the code?{" "}
                                <Text
                                    style={[
                                        styles.resendLink,
                                        resendTimer > 0 && styles.disabled
                                    ]}>
                                    Resend
                                </Text>
                            </Text>
                        </TouchableOpacity>

                        {
                            otp.join('').length === 4 && !isLoading ? (
                                <TouchableOpacity
                                    onPress={IS_NEW_CUSTOMER ? LoginVerfiyOTP : handleVerifyOTP}
                                    style={styles.activeBtn}>
                                    <Text style={styles.activeBtnText}>Verify</Text>
                                </TouchableOpacity>

                            ) : isLoading ? (
                                <View style={styles.activeBtn}>
                                    <ActivityIndicator color="#fff" />
                                </View>
                            ) : (
                                <View style={styles.disabledBtn}>
                                    <Text style={styles.disabledBtnText}>Verify</Text>
                                </View>
                            )
                        }

                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
export default OtpVerify;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    backIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 30,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 24,
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
        // justifyContent: 'space-between',
        marginBottom: 20,
        gap: 20
    },
    otpInput: {
        width: 54,
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0D614E33',
        backgroundColor: '#fff',

        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',

        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 0,
    },

    otpFilled: {
        borderColor: '#0D614E33',
        backgroundColor: '#0D614E0D',
        color: '#0D614E',
    },

    timer: {
        color: '#0D614E',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 10,
    },

    resendText: {
        fontSize: 14,
        color: Colors.subTextColor,
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 30,
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
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    activeBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    disabledBtn: {
        height: 52,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    disabledBtnText: {
        color: '#64748B',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});