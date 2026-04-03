// // import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
// // import React, { useEffect, useState } from 'react';
// // import * as Animatable from 'react-native-animatable';
// // import { Fonts } from '../../common/Fonts';
// // import { useIsFocused } from '@react-navigation/native';
// // import { Images } from '../../common/Images';
// // import { Utils } from '../../common/Utils';
// // import *as _PROFILE_SERVICES from '../../services/ProfileServices';
// // import { showSuccessToast } from '../../config/Key';
// // import { useDispatch } from 'react-redux';
// // import { setUserInfo } from '../../reduxfile/action/UserInfoAction';



// // const Splash = (props: any) => {
// //     const isFocused = useIsFocused();
// //     const dispatch = useDispatch();

// //     useEffect(() => {

// //         getUser();
// //         // setTimeout(() => {
// //         //     props.navigation.replace('HomeStack', { screeen: 'Home' })
// //         // }, 2000);

// //     }, [isFocused]);


// //     const getUser = async () => {
// //         try {
// //             const token = await Utils.getData('_TOKEN');
// //             console.log('tokenn', token);
// //             if (token) {
// //                 const result: any = await _PROFILE_SERVICES.user_profile();
// //                 const JSONUser = await result.json();
// //                 console.log("User Profile Data:", JSONUser);
// //                 if (result.status === 200) {
// //                     Utils.storeData('_USER_INFO', JSONUser);
// //                     dispatch(setUserInfo(JSONUser));
// //                     setTimeout(() => {
// //                         props.navigation.replace('HomeStack', { screeen: 'Home' })
// //                     }, 1000);
// //                     // props.navigation.replace('HomeStack', { screeen: 'Home' })
// //                 }

// //                 else {
// //                     showSuccessToast("Customer Not Found", 'error')
// //                     props.navigation.replace('AuthStack', { screeen: 'Login' })
// //                 }
// //             }

// //             else {

// //                 setTimeout(() => {
// //                     props.navigation.replace('AuthStack', { screeen: 'Login' })
// //                 }, 2000);
// //                 // props.navigation.replace('AuthStack', { screeen: 'Login' })

// //             }
// //         } catch (error) {
// //             console.log(error);
// //         }
// //     }




// //     return (
// //         <View style={styles.container} >

// //             <StatusBar backgroundColor={'#466425'} barStyle={'light-content'} />

// //             <Animatable.View
// //                 animation={'slideInDown'}
// //                 duration={2000}
// //                 useNativeDriver={true}
// //                 style={styles.logoContainer}
// //             >
// //                 <Image
// //                     source={Images.splashlogo}
// //                     style={styles.logo}
// //                     resizeMode='center'
// //                 />
// //             </Animatable.View>

// //         </View>
// //     );
// // }

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         backgroundColor: '#fff',
// //     },

// //     logoContainer: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         width: '100%',
// //     },
// //     logo: {
// //         width: '70%',
// //         height: '20%',
// //     },
// //     textContainer: {
// //         position: 'absolute',
// //         bottom: 60,
// //     },
// //     welcomeText: {
// //         color: 'white',
// //         fontSize: 24,
// //     },
// // });

// // export default Splash;



import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { Images } from '../../common/Images';
import { Utils } from '../../common/Utils';
import * as _PROFILE_SERVICES from '../../services/ProfileServices';
import { showSuccessToast } from '../../config/Key';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../../reduxfile/action/UserInfoAction';


const Splash = (props: any) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isFocused) {
      getUser();
    }
  }, [isFocused]);



  const getUser = async () => {
    try {
      const token = await Utils.getData('_TOKEN');
      console.log('tokenn---->>>', token);
      if (token) {
        const result: any = await _PROFILE_SERVICES.user_profile();
        const JSONUser = await result.json();
        console.log("UserProfileData:", JSONUser);
        if (result.status === 200) {
          Utils.storeData('_USER_INFO', JSONUser);
          dispatch(setUserInfo(JSONUser));
          
          setTimeout(() => {
            props.navigation.replace('HomeStack', { screeen: 'Home' })
          }, 1000);
          // props.navigation.replace('HomeStack', { screeen: 'Home' })
        }

        else {
          showSuccessToast("Please Fill the Onboarding Form to Access the Application", 'error')
          props.navigation.replace('AuthStack', { screeen: 'Login' })
        }
      }

      else {
        setTimeout(() => {
          props.navigation.replace('AuthStack', { screeen: 'Login' })
        }, 2000);
        // props.navigation.replace('AuthStack', { screeen: 'Login' })

      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#466425'} barStyle={'light-content'} />
      
      <Animatable.View
        animation="slideInDown"
        duration={1500}
        useNativeDriver
        style={styles.logoContainer}
      >
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



// import { View, Text, Image, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
// import React from 'react';
// import * as Animatable from 'react-native-animatable';
// import { Images } from '../../common/Images';
// import { Utils } from '../../common/Utils';
// import * as _PROFILE_SERVICES from '../../services/ProfileServices';
// import { showSuccessToast } from '../../config/Key';


// const Splash = (props: any) => {

//   const getUser = async () => {
//     try {
//       const token = await Utils.getData('_TOKEN');

//       if (token) {
//         const result: any = await _PROFILE_SERVICES.user_profile();
//         const JSONUser = await result.json();

//         if (result.status === 200) {
//           Utils.storeData('_USER_INFO', JSONUser);
//           props.navigation.replace('HomeStack', { screen: 'Home' });

//         } else {
//           showSuccessToast("Please Fill the Onboarding Form to Access the Application", 'error');
//           props.navigation.navigate('Login');
//         }

//       } else {
//         props.navigation.navigate('Login');
//       }

//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={'#FFFFFF'} barStyle={'dark-content'} />

//       <Animatable.View
//         animation="fadeInDown"
//         duration={1200}
//         style={styles.logoWrapper}
//       >
//         <Text style={styles.title}>
//           Ayur <Text style={styles.highlight}>Muni</Text>
//         </Text>

//         <Text style={styles.subtitle}>
//           Ancient wisdom for your modern lifestyle.
//         </Text>


//         <View style={styles.imageContainer}>
//           <Image source={Images.backgroundFlower} style={styles.bgImage} resizeMode="contain" />
//           <Image source={Images.meditationIcon} style={styles.topImage} resizeMode="contain" />
//         </View>
//       </Animatable.View>

//       <Animatable.View
//         animation="fadeInUp"
//         duration={1200}
//         delay={300}
//         style={styles.bottomContainer}
//       >
//         <Text style={styles.continueText}>Continue With</Text>

//         <TouchableOpacity
//           style={styles.googleBtn}
//           onPress={getUser}
//         >
//           <View style={styles.row}>
//             <Image source={Images.googleIcon} style={styles.icon} />
//             <Text style={styles.googleText}>Google</Text>
//           </View>
//         </TouchableOpacity>

//         {/* MOBILE BUTTON */}
//         <TouchableOpacity
//           style={styles.mobileBtn}
//           onPress={() => props.navigation.navigate('Login')}
//         >
//           <View style={styles.row}>
//             <Image source={Images.phoneIcon} style={styles.icon} />
//             <Text style={styles.mobileText}>Mobile Number</Text>
//           </View>
//         </TouchableOpacity>

//         <Text style={styles.loginText}>
//           Already have an account?{' '}
//           <Text
//             style={styles.loginHighlight}
//             onPress={() => props.navigation.navigate('Login')}
//           >
//             Login
//           </Text>
//         </Text>
//       </Animatable.View>
//     </View>
//   );
// };

// export default Splash;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 24,
//     justifyContent: 'space-between',
//   },

//   logoWrapper: {
//     alignItems: 'center',
//     marginTop: 100,
//   },

//   title: {
//     fontSize: 36,
//     fontWeight: '600',
//     color: '#1E1E1E',
//   },

//   highlight: {
//     color: '#0D614E',
//     fontWeight: '700',
//   },

//   subtitle: {
//     marginTop: 6,
//     fontSize: 16,
//     color: '#64748B',
//     textAlign: 'center',
//     fontWeight: '400',
//   },

//   imageContainer: {
//     marginTop: 80,
//     width: 300,
//     height: 300,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   bgImage: {
//     position: 'absolute',
//     width: 350,
//     height: 350,
//   },

//   topImage: {
//     width: 120,
//     height: 120,
//   },

//   bottomContainer: {
//     marginBottom: 40,
//   },

//   continueText: {
//     textAlign: 'center',
//     color: '#1E293B',
//     marginBottom: 10,
//     fontSize: 20,
//     fontWeight: '400',
//     top: -60
//   },

//   googleBtn: {
//     borderWidth: 1,
//     borderColor: '#0D614E33',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 12,
//     top: -30
//   },

//   mobileBtn: {
//     borderWidth: 1,
//     borderColor: '#0D614E33',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 20,
//     top: -30
//   },

//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },

//   icon: {
//     width: 18,
//     height: 18,
//     resizeMode: 'contain',
//   },

//   googleText: {
//     fontSize: 16,
//     color: '#0D614E',
//     fontWeight: '500',
//   },

//   mobileText: {
//     fontSize: 14,
//     color: '#0D614E',
//     fontWeight: '500',
//   },

//   loginText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#52525B',
//     fontWeight: 400,
//     top: -30
//   },

//   loginHighlight: {
//     color: '#0D614E',
//     fontWeight: '600',
//   },
// });