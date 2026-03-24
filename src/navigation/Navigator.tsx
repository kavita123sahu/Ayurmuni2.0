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

import { Colors } from "../common/Colors";
import { Images } from "../common/Images";

import Login from "../screens/auth/Login";
import OtpVerify from "../screens/auth/OtpVerify";
import Splash from "../screens/auth/Splash";

import HomePage from "../screens/home/HomePage";
import consultHome from "../screens/consult/consultHome";
import CenterWellness from "../screens/centers/CenterWellness";
import ProfilePage from "../screens/profile/ProfilePage";
import CartPage from "../screens/cart/CartPage";

import { useNetworkStatus } from "../hooks/useDebaunce";
import NetworkError from "../screens/NetworkError";

enableScreens();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screen_height = Dimensions.get("screen").height;

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
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.white,
          height: screen_height * 0.08,
        },
        tabBarActiveTintColor: Colors.primaryColor,
        tabBarInactiveTintColor: Colors.tabtrasparent,
        tabBarLabelStyle: {
          fontSize: 12,
          bottom: 5,
          fontWeight: "500",
        },
      }}
    >
      {/* Home */}
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={Images.home}
              style={{
                height: 20,
                width: 20,
                tintColor: focused
                  ? Colors.primaryColor
                  : Colors.tabtrasparent,
              }}
            />
          ),
        }}
      />

      {/* Cart */}
      <Tab.Screen
        name="Cart"
        component={CartPage}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={Images.shop}
              style={{
                height: 20,
                width: 20,
                tintColor: focused
                  ? Colors.primaryColor
                  : Colors.tabtrasparent,
              }}
            />
          ),
        }}
      />

      {/* Consultation */}
      <Tab.Screen
        name="Consultation"
        component={consultHome}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={Images.consult}
              style={{
                height: 20,
                width: 20,
                tintColor: focused
                  ? Colors.primaryColor
                  : Colors.tabtrasparent,
              }}
            />
          ),
        }}
      />

      {/* Centers */}
      <Tab.Screen
        name="Centers"
        component={CenterWellness}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={Images.centers}
              style={{
                height: 20,
                width: 20,
                tintColor: focused
                  ? Colors.primaryColor
                  : Colors.tabtrasparent,
              }}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={Images.profile}
              style={{
                height: 20,
                width: 20,
                tintColor: focused
                  ? Colors.primaryColor
                  : Colors.tabtrasparent,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


// 🔥 HOME STACK
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen name="TabStack" component={TabStack} />
    </Stack.Navigator>
  );
};


// 🔥 AUTH STACK
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OtpVerify" component={OtpVerify} />
    </Stack.Navigator>
  );
};


// 🔥 SPLASH STACK
const SplashStack = () => {
  return (
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen name="Splash" component={Splash} />
    </Stack.Navigator>
  );
};


// 🔥 MAIN NAVIGATOR
const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen name="SplashStack" component={SplashStack} />
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="HomeStack" component={HomeStack} />
    </Stack.Navigator>
  );
};


// 🔥 ROOT NAVIGATOR
const Navigator = () => {
  const isConnected = useNetworkStatus();

  return (
    <NavigationContainer>
      {isConnected ? <MainNavigator /> : <NetworkError />}
    </NavigationContainer>
  );
};

export default Navigator;