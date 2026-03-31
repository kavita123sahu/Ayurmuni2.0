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
          props.navigation.navigate('OtpVerify', { phone: phoneNumber, newCustomer: JSONReponse.is_customer });    // chnage krwana h backned s is_customer wrong aa rh h
        }

        else if (JSONReponse.is_new_user && !JSONReponse.is_customer) {
          props.navigation.navigate('OtpVerify', { phone: phoneNumber, newCustomer: JSONReponse.is_customer });
        }

        else if (!JSONReponse.is_new_user && !JSONReponse.is_customer) {
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

  const isValid = phoneNumber.length === 10;


  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
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
            </Text>

          </View>

          <View style={styles.formContainer1}>
            <Image source={Images.loginbanner} style={{ height: 21, width: 300 }} />
          </View>

          <View style={styles.formContainer}>

            <Text style={styles.inputLabel}>Mobile Number</Text>

            <View
              style={[
                styles.phoneInputContainer,
                isValid && styles.phoneInputContainerActive,
              ]}
            >
              <View style={styles.countryCodeContainer}>
                <Text
                  style={[
                    styles.countryCode,
                    isValid && styles.countryCodeActive,
                  ]}
                >
                  +91
                </Text>
              </View>

              <TextInput
                style={[
                  styles.phoneInput,
                  isValid && styles.phoneInputActive,
                ]}
                placeholder="XXX-XXX-XXXX"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>


            <TouchableOpacity
              onPress={onLogin}
              disabled={phoneNumber.length !== 10 || isLoading}
              style={[
                styles.button,
                phoneNumber.length === 10
                  ? styles.buttonActive
                  : styles.buttonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    phoneNumber.length === 10
                      ? styles.textActive
                      : styles.textDisabled,
                  ]}
                >
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>

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
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  logo: {
    width: 76,
    height: 76,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 120,
    marginBottom: 30,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5
  },
  welcomeTitle: {
    fontSize: 26,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1, marginTop: 10,

  },
  formContainer1: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 50
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  phoneInputContainerActive: {
  borderColor: Colors.bgborderColor, 
  backgroundColor: Colors.onfillColor, 
},
phoneInputActive: {
  color: Colors.primaryColor, 
},
countryCodeActive: {
  color: Colors.primaryColor,
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
    color: Colors.primaryColor,
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
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.primaryColor,
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
  inputLabel: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonActive: {
    backgroundColor: Colors.primaryColor,
  },
  buttonDisabled: {
    backgroundColor: Colors.bottomBg,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  textActive: {
    color: Colors.white,
  },
  textDisabled: {
    color: '#64748B',
  },
});

export default Login;