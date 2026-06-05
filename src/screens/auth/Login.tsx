import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { Images } from '../../common/Images';
import * as _AUTH_SERVICE from '../../services/AuthService';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';

const Login: React.FC = (props: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async () => {
    Keyboard.dismiss();

    if (phoneNumber.length !== 10) {
      showSuccessToast(
        'Please enter a valid 10-digit mobile number',
        'error',
      );
      return;
    }

    setIsLoading(true);

    try {
      const send_data = {
        phone_number: `+91${phoneNumber}`,
      };

      const response: any =
        await _AUTH_SERVICE.send_otp(send_data);
        
      console.log('OTP Response:', response);

      const isCustomer =
        response?.data?.user_roles?.some(
          (role: string) =>
            role?.toLowerCase() === 'customer',
        );

      if (response?.success) {
        showSuccessToast(
          response.message || 'OTP sent successfully',
          'success',
        );

        props.navigation.navigate('OtpVerify', {
          phone: phoneNumber,
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

  const isValid = phoneNumber.length === 10;

  return (
    // <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={20}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContainer
          }
        >
          {/* ===== TOP GREEN SECTION ===== */}

          <View style={styles.topContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={Images.FinalLogo}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.brandName}>
                AYURMUNI
              </Text>

              <Text style={styles.tagLine}>
                ANCIENT WISDOM FOR YOUR MODERN
                LIFESTYLE.
              </Text>
            </View>
          </View>

          {/* ===== BOTTOM SECTION ===== */}

          <View style={styles.bottomContainer}>
            <Text style={styles.heading}>
              Login with mobile number
            </Text>

            <Text style={styles.subHeading}>
              Continue your Ayurvedic wellness
              journey with personalized insights
              crafted for your lifestyle.
            </Text>

            {/* ===== INPUT ===== */}

            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>
                +91
              </Text>

              <View style={styles.divider} />

              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter mobile number"
                placeholderTextColor="#A0A7B5"
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
              />
            </View>

            {/* ===== TERMS ===== */}

            <View style={styles.termsWrapper}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>
                  ✓
                </Text>
              </View>

              <View style={styles.termsContent}>
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    props.navigation.navigate(
                      'TermsCondition',
                    )
                  }>
                  <Text style={styles.linkText}>
                    Terms
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  {' '}and{' '}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    props.navigation.navigate(
                      'PrivacyPolicy',
                    )
                  }
                >
                  <Text style={styles.linkText}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== BUTTON ===== */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onLogin}
              disabled={!isValid || isLoading}
              style={[
                styles.button,
                !isValid &&
                styles.buttonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  GET OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    // </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#0D6B57',
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8F8F8',
    paddingBottom: 40,
  },

  // ===== TOP SECTION =====

  topContainer: {
    height: 350,
    backgroundColor: '#0D6B57',
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    paddingHorizontal: 24,
  },

  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },

  logo: {
    width: 95,
    height: 95,
    tintColor: '#FFFFFF',
    marginBottom: 22,
  },

  brandName: {
    fontSize: 50,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsBold,
    letterSpacing: 1,
    marginBottom: -8,
  },

  tagLine: {
    color: '#C8DDD7',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.8,
  },

  // ===== BOTTOM SECTION =====

  bottomContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 30,
  },

  heading: {
    fontSize: 28,
    color: '#1F2937',
    fontFamily: Fonts.PoppinsBold,
    lineHeight: 42,
  },

  subHeading: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 25,
    fontFamily: Fonts.PoppinsRegular,
    marginBottom: 36,
  },

  // ===== INPUT =====

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D9DEE5',
    paddingBottom: 14,
  },

  countryCode: {
    fontSize: 20,
    color: '#374151',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 16,
  },

  input: {
    flex: 1,
    fontSize: 20,
    color: '#1F2937',
    fontFamily: Fonts.PoppinsSemiBold,
    paddingVertical: 0,
  },

  // ===== TERMS =====

  termsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28,
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  checkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Fonts.PoppinsBold,
  },

  termsContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: 10,
  },

  termsText: {
    color: '#8A94A6',
    fontSize: 13,
    lineHeight: 22,
    fontFamily: Fonts.PoppinsMedium,
  },

  linkText: {
    color: '#6A9E90',
    fontSize: 13,
    textDecorationLine: 'underline',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  // ===== BUTTON =====

  button: {
    height: 58,
    backgroundColor: '#0D6B57',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 55,
    marginBottom: 20,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    letterSpacing: 0.5,
    fontFamily: Fonts.PoppinsBold,
  },
});