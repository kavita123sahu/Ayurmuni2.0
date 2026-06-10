import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { Images } from '../../common/Images';
import { Utils } from '../../common/Utils';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { showSuccessToast } from '../../config/Key';
import { useDispatch } from 'react-redux';
import *as _AUTH_SERVICES from '../../services/AuthService';


const Splash = (props: any) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getUser();
    }
  }, [isFocused]);

  const getUser = async () => {
    try {
      const token = await Utils.getData('_TOKEN');

      if (!token) {
        props.navigation.replace('AuthStack', {
          screen: 'Login',
        });
        return;
      }

      const result: any =
        await _PROFILE_SERVICES.user_profile();

      console.log('PROFILE RESULT =>', result);

      const isCustomer =
        result?.data?.user_roles?.includes(
          'customer'
        );

      console.log('isCustomerisCustomer', isCustomer)

      if (result?.status === 404) {
        props.navigation.replace(
          'HomeStack',
          {
            screen: 'Onboarding',
          },
        );
        return;
      }

      if (!isCustomer) {
        props.navigation.replace(
          'HomeStack',
          {
            screen: 'Onboarding',
          },
        );
        return;
      }

      if (!result?.data?.is_onboarded && !result?.data?.is_skipped) {
        props.navigation.replace(
          'HomeStack',
          {
            screen: 'AssessmentType',
          },
        );
        return;
      }

      if (result?.data?.is_skipped) {
        props.navigation.replace(
          'HomeStack',
          {
            screen: 'Home',
          },
        );
        return;
      }

      if (!result?.success) {
        showSuccessToast(
          result?.message ||
          'Something went wrong',
          'error',
        );
        return;
      }

      // SUCCESS

      console.log(
        'PROFILE DATA =>',
        result,
      );

      await Utils.storeData(
        '_USER_INFO',
        result?.data,
      );

      props.navigation.replace(
        'HomeStack',
        {
          screen: 'Home',
        },
      );

    } catch (error: any) {
      console.log(
        'GET USER ERROR =>',
        error,
      );

      if (
        error?.response?.status === 403
      ) {
        props.navigation.reset({
          index: 0,
          routes: [
            {
              name: 'AccountInactiveScreen',
            },
          ],
        });

        return;
      }

      showSuccessToast(
        'Network Error',
        'error',
      );
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#466425'} barStyle={'light-content'} />

      <Animatable.View
        animation="slideInDown"
        duration={1500}
        useNativeDriver
        style={styles.logoContainer}>

        <Image
          source={Images.FinalLogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animatable.View>
    </View>
  );
};

export default Splash;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: '70%',
    height: '20%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 60,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
  },
});

