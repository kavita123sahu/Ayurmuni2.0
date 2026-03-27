import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import Navigator from './src/navigation/Navigator'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { store } from './src/reduxfile/Store';
const toastConfig = {

  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#0D614E',   
      }}
      text2Style={{
        fontSize: 12,
        color: '#0D614E',             
        textAlign: 'center'
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      text2Style={{
        fontSize: 12,
        textAlign: 'center'
      }}
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