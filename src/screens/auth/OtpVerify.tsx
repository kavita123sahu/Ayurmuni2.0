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
import GradientButton from '../../component/GradientButton';
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
                // Return true to prevent default back action
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

            const response : any = await _AUTH_SERVICE.verify_otp(send_data);
            const { status, data, message } = response;
            console.log("newwwwwwuser", response);

            console.log( response);

            const JSONData = await response.json();

            console.log("verify_otp_response", response, JSONData);

            if (status === 200) {
                Utils.storeData('_USER_ID', JSONData?.user_id);
                showSuccessToast(response.message || 'OTP verified successfully', 'success');

                if (data?.is_customer) {

                    props.navigation.replace('HomeStack', { screen: 'Home' });
                }

                else {
                    props.navigation.replace('HomeStack', {
                        screen: 'TermsConditions',
                        params: {
                            agreed: false
                        }
                    })

                }
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
                // role: 'customer'
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
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    style={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.logoContainer}>
                        <Image
                            source={Images.MobileLogo}
                            style={styles.logo}
                            resizeMode='contain'
                        />
                    </View>

                    <Text style={styles.title}>Enter Verification Code</Text>

                    <Text style={styles.subtitle}>
                        Enter 4-digit OTP sent to
                        <Text style={styles.linkText}> (+91-{phoneNumber})</Text>
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    otpInputRefs.current[index] = ref;
                                }}
                                style={[styles.otpInput, digit && styles.otpInputFilled]}
                                value={digit}
                                onChangeText={(text) => handleOTPChange(text, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity onPress={onResendPress} disabled={resendTimer > 0}>
                        <Text style={styles.resendText}>
                            Didn't receive code ? {
                                resendTimer > 0 ? (
                                    <Text style={styles.linkTextDisabled}>Resend in {resendTimer}s</Text>
                                ) : (
                                    <Text style={styles.linkText}>Resend now</Text>
                                )
                            }
                        </Text>
                    </TouchableOpacity>


                    {
                        otp.join('').length === 4 && !isLoading ? (
                            <GradientButton
                                text="Verify and proceed"
                                onPress={IS_NEW_CUSTOMER ? LoginVerfiyOTP : handleVerifyOTP}
                            />

                        ) : isLoading ? (
                            <TouchableOpacity
                                disabled={true}
                                // onPress={IS_NEW_CUSTOMER ? LoginVerfiyOTP : handleVerifyOTP}
                                style={[styles.verifyButton, styles.verifyButtonLoading]}
                            >

                                <ActivityIndicator size="small" color={Colors.questionGreen} />
                                <Text style={[styles.verifyButtonText, styles.loadingText]}>
                                    Verifying...
                                </Text>
                            </TouchableOpacity>
                        ) :
                            (
                                <TouchableOpacity
                                    // disabled={true}

                                    // onPress={handleVerifyOTP}
                                    onPress={IS_NEW_CUSTOMER ? LoginVerfiyOTP : handleVerifyOTP}
                                    style={[styles.verifyButton]}
                                >
                                    <Text style={styles.verifyButtonText}>Verify and proceed</Text>
                                </TouchableOpacity>
                            )
                    }

                    <TouchableOpacity>
                        <Text style={styles.changeNumberText} onPress={() => changeMobileNumber()}>
                            Entered wrong mobile number? <Text style={styles.linkText}>Change.</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 80,
        marginBottom: 30,
    },
    logo: {
        width: 200,
        height: 140,
    },


    linkText: {
        color: Colors.questionGreen,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14
    },
    linkTextDisabled: {
        color: '#9ca3af',
        fontWeight: '500',
        fontSize: 14
    },
    title: {
        fontSize: 28,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingHorizontal: 20,
        color:Colors.questionGreen
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        color: Colors.questionGreen,
    },
    otpInputFilled: {
        borderColor: "#0D614E4A",
        backgroundColor: '#f0fdf4',
    },
    resendText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 30,
    },
    verifyButtonLoading: {
        backgroundColor: '#0D614E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        marginLeft: 8,
        color: Colors.questionGreen,
    },
    verifyButton: {
        height: 50,
        backgroundColor: '#0D614E0D',
        borderRadius: 8,
        borderColor:'#0D614E4A',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },

    verifyButtonText: {
        color: Colors.questionGreen,
        fontSize: 16,
        fontWeight: '600',
    },
    changeNumberText: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: Fonts.PoppinsMedium,
        textAlign: 'center',
        marginBottom: 30,
    },
})

export default OtpVerify;