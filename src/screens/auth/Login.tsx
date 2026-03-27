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
} from 'react-native';

import { Images } from '../../common/Images';
import *as _AUTH_SERVICE from '../../services/AuthService'
import { showSuccessToast } from '../../config/Key';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import GradientButton from '../../components/GradientButton';



const Login: React.FC = (props: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tendername, setenderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const onLogin = async () => {
    console.log("phoneNumber===>", phoneNumber);

    Keyboard.dismiss();

    if (phoneNumber.length !== 10) {
      setIsLoading(false);
      showSuccessToast('Please enter a valid 10-digit mobile number', 'error')
      return;
    }

    setIsLoading(true);

    try {
      const send_data = {
        phone_number: `+91${phoneNumber}`,
      };

      const response: any = await _AUTH_SERVICE.send_otp(send_data);

      const { data, message = "", status } = response;

      console.log("response-otp", response);

      const JSONReponse = await response.json();

      console.log("reponse-userr", JSONReponse);

      if (status === 200) {
        setIsLoading(false);
        showSuccessToast(response.message || 'OTP send successfully', 'success');

        if (!JSONReponse.is_new_user && JSONReponse.is_customer) {
          // props.navigation.navigate('HomeStack', { Screen: 'Home' });
          props.navigation.navigate('OtpVerify', { phone: phoneNumber, newCustomer: JSONReponse.is_customer });    // chnage krwana h backned s is_customer wrong aa rh h
        }

        else if (JSONReponse.is_new_user && !JSONReponse.is_customer) {
          // User true, Customer false - OtpVerify with newUser true
          props.navigation.navigate('OtpVerify', { phone: phoneNumber, newCustomer: JSONReponse.is_customer });
          // props.navigation.navigate('HomeStack', { screen: 'Onboarding' });
        }

        else if (!JSONReponse.is_new_user && !JSONReponse.is_customer) {
          // User false, Customer true - OtpVerify without newUser flag
          props.navigation.navigate('OtpVerify', { phone: phoneNumber, newCustomer: JSONReponse.is_customer });
        }

        else {
          props.navigation.navigate('OtpVerify', { phone: phoneNumber, newCustomer: JSONReponse.is_customer });

        }

      }

      else {
        setIsLoading(false);
        showSuccessToast(JSONReponse?.phone_number || "Please Enter Valid Mobile Number", 'error');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Send OTP Error:', error);
      showSuccessToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled" // Yeh important hai
          showsVerticalScrollIndicator={false}>

          <View style={styles.logoContainer}>
            <Image
              source={Images.newlogo}
              style={styles.logo}
              resizeMode='contain'
            />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Ayurmuni</Text>
            <Text style={styles.welcomeSubtitle}>
              Elevate your healthy lifestyle experience{'\n'}
              with our trusted, seamless and{'\n'}
              efficient services.
              {/* Tender Name : {tendername} */}
            </Text>

          </View>

          <View style={styles.formContainer1}>
            <Image source={Images.loginbanner} style={{ height: 21, width: 300 }} />
          </View>

          <View style={styles.formContainer}>

            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+91</Text>
              </View>

              <TextInput
                style={styles.phoneInput}
                placeholder="XXX-XXX-XXXX"
                placeholderTextColor="#C7C7C7"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>


            {phoneNumber.length === 10 && !isLoading ? (

              <GradientButton
                onPress={onLogin}
                color={false}
                text='Send OTP'
              />

            )
              :
              isLoading ? (
                <TouchableOpacity
                  // onPress={onLogin}
                  disabled={true}
                  style={[styles.verifyButton, styles.verifyButtonLoading]}

                >

                  <ActivityIndicator size="small" color={Colors.questionGreen} />
                  <Text style={[styles.verifyButtonText, styles.loadingText]}>
                    Processing...

                  </Text>

                </TouchableOpacity>
              ) :
                (

                  <GradientButton
                    onPress={onLogin}
                    color={true}
                    text='Send OTP'
                  />
                )
            }

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing in you agreed to allforcure's{'\n'}
                <Text style={styles.linkText}>Terms and Conditions</Text> Guidelines and our{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 120,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 30,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 5
  },
  welcomeTitle: {
    fontSize: 24,
    color: Colors.questionGreen,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1, marginTop: 10,

  },
  formContainer1: {
    alignItems: 'center',
    paddingHorizontal: 20
  },


  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  countryCodeContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  countryCode: {
    fontSize: 16,
    color: Colors.questionGreen,
    fontFamily: Fonts.PoppinsMedium,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  termsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  termsText: {
    fontSize: 14,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    color: Colors.questionGreen,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.questionGreen,
  },
  verifyButtonLoading: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButton: {
    height: 50,
    backgroundColor: '#E8EDE3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  verifyButtonText: {
    color: Colors.questionGreen,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;