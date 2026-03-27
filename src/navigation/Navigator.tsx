import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import {
  NavigationContainer,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import {
  BackHandler,
  Dimensions,
  Image,
  ToastAndroid,
  View,
} from "react-native";
import Login from "../screens/auth/Login";
import OtpVerify from "../screens/auth/OtpVerify";
import Splash from "../screens/auth/Splash";

import HomePage from "../screens/home/HomePage";
import consultHome from "../screens/consult/consultHome";
import ProfilePage from "../screens/profile/ProfilePage";
import CartPage from "../screens/cart/CartPage";

import { useNetworkStatus } from "../hooks/useDebaunce";
import NetworkError from "../screens/NetworkError";
import CustomeTab from "../components/CustomeTab";
import AppointmentScreen from "../screens/profile/Appointment";
import OrderHistoryScreen from "../screens/profile/OrderHistory";
import AppointmentDetailsScreen from "../screens/profile/AppointmentDetails";
import { RootBottomParamList, RootStackParamList } from "../../type";
import PatientDetails from "../screens/patient/PatientDetails";
import TermsCondition from "../screens/TermsCondition";
import Onboarding from "../screens/auth/Onboarding";
import PatientFAQ from "../screens/PatientFAQ";

enableScreens();


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootBottomParamList>();
const hideHeader = { headerShown: false };


// 🔥 TAB STACK
const TabStack = () => {
  const navigation = useNavigation();
  const navState = useNavigationState((state) => state);
  const exitCount = useRef(0);

  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) return false;

      if (exitCount.current === 0) {
        exitCount.current = 1;
        ToastAndroid.show("Press again to exit", ToastAndroid.SHORT);

        setTimeout(() => (exitCount.current = 0), 2000);
        return true;
      }

      BackHandler.exitApp();
      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => sub.remove();
  }, [navigation, navState]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomeTab {...props} />} // 🔥 CUSTOM TAB
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Cart" component={CartPage} />
      <Tab.Screen name="Consult" component={consultHome} />
      {/* <Tab.Screen name="Centers" component={CenterWellness} /> */}
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

// 🔥 HOME STACK
const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="TabStack"  screenOptions={hideHeader}>
      <Stack.Screen name="TabStack" component={TabStack} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Appointments" component={AppointmentScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PatientDetails" component={PatientDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PatientFAQ" component={PatientFAQ} options={{ headerShown: false, animation: 'slide_from_right' }}/>
      <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false, animation: 'slide_from_right' }}/>
      <Stack.Screen name="TermsCondition" component={TermsCondition} options={{ headerShown: false, animation: 'slide_from_right' }}/>
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
};


// 🔥 AUTH STACK
const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={hideHeader}>
      <Stack.Screen name="Login" component={Login} options={{
                headerShown: false,
                animation: 'slide_from_right',
            }} />
      <Stack.Screen name="OtpVerify" component={OtpVerify} options={{
                headerShown: false,
                animation: 'slide_from_right',
            }} />
    </Stack.Navigator>
  );
};


// 🔥 SPLASH STACK
const SplashStack = () => {
  return (
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen name="Splash" component={Splash} options={{
                headerShown: false,
                animation: 'slide_from_right',
            }} />
    </Stack.Navigator>
  );
};

// 🔥 MAIN NAVIGATOR
const MainNavigator = () => {
  return (

    <Stack.Navigator  screenOptions={hideHeader}>
      {/* <Stack.Screen name="SplashStack" component={SplashStack} /> */}
      <Stack.Screen name="AuthStack" component={AuthStack} options={hideHeader}  />
      <Stack.Screen name="HomeStack" component={HomeStack} options={hideHeader} />
    </Stack.Navigator>
  );
};


// 🔥 ROOT NAVIGATOR
const Navigator = () => {
  const isConnected = useNetworkStatus();

  return (
   
    <NavigationContainer >
   
       {isConnected ? <MainNavigator /> : <NetworkError />}
  
    </NavigationContainer>
    
  );
};

export default Navigator;