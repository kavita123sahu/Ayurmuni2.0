import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import Navigator from './src/navigation/Navigator'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { store } from './src/reduxfile/Store';
import { Fonts } from './src/common/Fonts';

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

    <Provider store={store} >
      <Navigator />
      <Toast config={toastConfig} />
    </Provider>
  )
}

export default App