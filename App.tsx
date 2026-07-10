import React, { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux'
import Navigator from './src/navigation/Navigator'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { store } from './src/store/store';
import AppDataInitializer from './src/components/AppDataInitializer';
import { Fonts } from './src/common/Fonts';
import { LocationProvider } from './src/context/LocationContext';


console.log = () => { };
console.warn = () => { };
console.error = () => { };


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
        props.text2Style, // ✅ IMPORTANT
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
      text2NumberOfLines={3}
      text2Style={[
        {
          fontSize: 14,
          color: '#F43F5E',
          textAlign: 'center',
          fontFamily: Fonts.PoppinsMedium,
        },
        props.text2Style, // ✅ IMPORTANT
      ]}
    />
  ),
};

const App = () => {

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store} >
        <LocationProvider>
          <AppDataInitializer />
          <Navigator />
          <Toast config={toastConfig} />
        </LocationProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}


export default App