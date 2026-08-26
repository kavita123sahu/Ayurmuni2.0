// import React, { useEffect, useRef } from 'react'
// import { View } from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Provider } from 'react-redux'
// import Navigator from './src/navigation/Navigator'
// import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
// import { store } from './src/store/store';
// import AppDataInitializer from './src/components/AppDataInitializer';
// import { Fonts } from './src/common/Fonts';
// import { LocationProvider } from './src/context/LocationContext';
// import { VideoCallProvider } from './src/context/VideoCallContext';
// import FloatingVideoOverlay from './src/components/FloatingVideoOverlay';
// import WishlistToastBar from './src/components/WishlistToastBar';
// import { initializeOneSignal } from './src/services/pushNotificationService';
// import CustomNotification, { CustomNotificationRef } from './src/components/CustomNotification';
// import { handleNotificationNavigation } from './src/screens/notifications/notificationRouter';


// // console.log = () => { };
// // console.warn = () => { };
// // console.error = () => { };

// const toastConfig = {
//   success: (props: any) => (

//     <BaseToast
//       {...props}
//       style={{
//         borderLeftColor: '#0D614E',
//         marginTop: 10,
//       }}
//       contentContainerStyle={{
//         paddingHorizontal: 15,
//       }}
//       text1Style={{
//         display: 'none',
//       }}
//       text2NumberOfLines={3}
//       text2Style={[
//         {
//           fontSize: 14,
//           color: '#0D614E',
//           textAlign: 'center',
//           fontFamily: Fonts.PoppinsMedium,
//         },
//         props.text2Style, // ✅ IMPORTANT
//       ]}
//     />
//   ),

//   error: (props: any) => (

//     <ErrorToast
//       {...props}
//       style={{
//         borderLeftColor: '#F43F5E',
//         marginTop: 10,
//       }}
//       contentContainerStyle={{
//         paddingHorizontal: 15,
//       }}
//       text1Style={{
//         display: 'none',
//       }}
//       text2NumberOfLines={3}
//       text2Style={[
//         {
//           fontSize: 14,
//           color: '#F43F5E',
//           textAlign: 'center',
//           fontFamily: Fonts.PoppinsMedium,
//         },
//         props.text2Style, // ✅ IMPORTANT
//       ]}
//     />
//   ),
// };


// const App = () => {
//   // useEffect(() => {
//   //   initializePushNotifications();
//   // }, []);

//   const notificationRef =
//     useRef<CustomNotificationRef>(
//       null,
//     );




//   useEffect(() => {
//     initializeOneSignal();
//   }, []);
//   return (

//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <Provider store={store} >
//           <VideoCallProvider>
//             <LocationProvider>
//               <View style={{ flex: 1 }}>
//                 <AppDataInitializer />
//                 <Navigator />
//                 <FloatingVideoOverlay />
//                 <WishlistToastBar />

//                 <CustomNotification
//                   ref={notificationRef}
//                   onPress={
//                     handleNotificationNavigation
//                   }
//                 />
//                 <Toast config={toastConfig} />
//               </View>
//             </LocationProvider>
//           </VideoCallProvider>
//         </Provider>
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   )
// }

// export default App



import React, {
  useEffect,
  useRef,
} from 'react';

import {
  View,
} from 'react-native';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
  Provider,
} from 'react-redux';

import Navigator from './src/navigation/Navigator';

import Toast, {
  BaseToast,
  ErrorToast,
} from 'react-native-toast-message';

import {
  store,
} from './src/store/store';

import AppDataInitializer from './src/components/AppDataInitializer';

import {
  Fonts,
} from './src/common/Fonts';

import {
  LocationProvider,
} from './src/context/LocationContext';

import {
  VideoCallProvider,
} from './src/context/VideoCallContext';

import FloatingVideoOverlay from './src/components/FloatingVideoOverlay';

import WishlistToastBar from './src/components/WishlistToastBar';

import {
  initializeOneSignal,
} from './src/services/pushNotificationService';

import CustomNotification, {
  CustomNotificationRef,
} from './src/components/CustomNotification';

import {
  handleNotificationNavigation,
} from './src/screens/notifications/notificationRouter';

import {
  navigationRef,
} from './src/navigation/navigationRef';


// =====================================================
// TOAST CONFIG
// =====================================================

const toastConfig = {

  success: (props: any) => (

    <BaseToast
      {...props}

      style={{
        borderLeftColor: '#0D614E',
        marginTop: 10,
      }}

      contentContainerStyle={{
        paddingHorizontal: 15,
      }}

      text1Style={{
        display: 'none',
      }}

      text2NumberOfLines={3}

      text2Style={[
        {
          fontSize: 14,
          color: '#0D614E',
          textAlign: 'center',
          fontFamily: Fonts.PoppinsMedium,
        },

        props.text2Style,
      ]}
    />

  ),

  error: (props: any) => (

    <ErrorToast
      {...props}

      style={{
        borderLeftColor: '#F43F5E',
        marginTop: 10,
      }}

      contentContainerStyle={{
        paddingHorizontal: 15,
      }}

      text1Style={{
        display: 'none',
      }}

      text2Style={[
        {
          fontSize: 14,
          color: '#F43F5E',
          textAlign: 'center',
          fontFamily: Fonts.PoppinsMedium,
        },

        props.text2Style,
      ]}

      text2NumberOfLines={3}
    />

  ),
};



console.log = () => { };
console.warn = () => { };
console.error = () => { };

// =====================================================
// APP
// =====================================================

const App = () => {

  // ===================================================
  // CUSTOM NOTIFICATION REF
  // ===================================================

  const notificationRef =
    useRef<CustomNotificationRef>(
      null,
    );


  // ===================================================
  // CUSTOM NOTIFICATION PRESS
  // ===================================================

  const handleCustomNotificationPress = (
    data: any,
  ) => {

    console.log(
      '====================================',
    );

    console.log(
      '🔘 CUSTOM NOTIFICATION PRESSED',
    );

    console.log(
      '📦 Notification Data:',
      data,
    );

    console.log(
      '====================================',
    );


    // Send notification data
    // to notification router

    handleNotificationNavigation(
      navigationRef,
      data,
    );
  };


  // ===================================================
  // ONESIGNAL INITIALIZATION
  // ===================================================

  useEffect(() => {

    console.log(
      '🔵 App: Initializing OneSignal',
    );

    initializeOneSignal();

  }, []);


  // ===================================================
  // UI
  // ===================================================

  return (

    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >

      <SafeAreaProvider>

        <Provider
          store={store}
        >

          <VideoCallProvider>

            <LocationProvider>

              <View
                style={{
                  flex: 1,
                }}
              >

                {/* ===================================
                    APP DATA INITIALIZER
                =================================== */}

                <AppDataInitializer />


                {/* ===================================
                    NAVIGATION
                =================================== */}

                <Navigator />


                {/* ===================================
                    FLOATING VIDEO
                =================================== */}

                <FloatingVideoOverlay />


                {/* ===================================
                    WISHLIST TOAST
                =================================== */}

                <WishlistToastBar />


                {/* ===================================
                    CUSTOM PUSH NOTIFICATION
                =================================== */}

                <CustomNotification
                  ref={notificationRef}
                  onPress={
                    handleCustomNotificationPress
                  }
                />


                {/* ===================================
                    TOAST
                =================================== */}

                <Toast
                  config={toastConfig}
                />

              </View>

            </LocationProvider>

          </VideoCallProvider>

        </Provider>

      </SafeAreaProvider>

    </GestureHandlerRootView>

  );
};


export default App;