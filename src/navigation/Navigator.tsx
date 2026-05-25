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
import ConsultHome from "../screens/consult/ConsultHome";
import ProfilePage from "../screens/profile/ProfilePage";
import { useNetworkStatus } from "../hooks/useDebaunce";
import CustomeTab from "../components/CustomeTab";
import AppointmentScreen from "../screens/profile/Appointment";
import AppointmentDetailsScreen from "../screens/profile/AppointmentDetails";
import { RootBottomParamList, RootStackParamList } from "../../type";
import PatientDetails from "../screens/patient/PatientDetails";
import TermsCondition from "../screens/TermsCondition";
import Onboarding from "../screens/auth/Onboarding";
import PatientFAQ from "../screens/PatientFAQ";
import EditPatientDetail from "../screens/patient/EditPatientDetail";
import OrderHistory from "../screens/orders/OrderHistory";
import ProductsScreen from "../screens/products/ProductsScreen";
import TopCategories from "../screens/products/TopCategories";
import ProductDetails from "../screens/products/ProductDetails";
import ReviewPage from "../screens/products/ReviewPage";
import MyCart from "../screens/cart/MyCart";
import Checkout from "../screens/products/Checkout";
import MedicalRecords from "../screens/profile/MedicalRecords";
import OrderConfirmation from "../screens/products/OrderConfirmation";
import MedicineScreen from "../screens/medicines/MedicineScreen";
import FAQScreen from "../screens/profile/FAQScreen";
import HelpCenterScreen from "../screens/profile/HelpCenter";
import SettingsScreen from "../screens/profile/Settings";
import PaymentsScreen from "../screens/profile/PaymentScreen";
import EmergencySOS from "../screens/SOS/EmergencySOS";
import SOSPayment from "../screens/SOS/SOSPayment";
import SOSRequest from "../screens/SOS/SOSRequest";
import SOSCancelScreen from "../screens/SOS/SOSCancelScreen";
import SOSDoctorAssigned from "../screens/SOS/SOSConfirmed";
import SOSConfirmed from "../screens/SOS/SOSConfirmed";
import NotificationsScreen from "../screens/NotificationsScreen";
import ManageAdrees from "../screens/ManageAdrees";
import Prescription from "../screens/medicines/Prescription";
import VerifyPresciption from "../screens/medicines/VerifyPresciption";
import MedicineCheckOut from "../screens/medicines/CheckOut";
import OrderStatus from "../screens/medicines/OrderStatus";
import Wishlist from "../screens/profile/Wishlist";
import MedicalHistory from "../screens/MedicalHistory";
import AssessmentType from "../screens/AssesmentType";
import MentorProfile from "../screens/mentor/MentorProfile";
import YogaScreen from "../screens/mentor/YogaScreen";
import YogaSession from "../screens/mentor/YogaSession";
import DietScreen from "../screens/mentor/DietScreen";
import MealDetails from "../screens/mentor/MealDetails";
import WeeklyMeal from "../screens/mentor/WeeklyMeal";
import ConsultMentor from "../screens/mentor/ConsultMentor";
import MentorCheckout from "../screens/mentor/MentorCheckout";
import MentorOrder from "../screens/mentor/MentorOrder";
import WelcomeScreen from "../screens/auth/WelcomeScree";
import RefundScreen from "../screens/mentor/RefundScreen";
import ExchangeScreen from "../screens/mentor/ExchangeScreen";
import MedicalReceipt from "../screens/consult/MedicalReceipt";
import ConsultHistory from "../screens/consult/ConsultHistory";
import AllDoctors from "../screens/consult/AllDoctors";
import DoctorSlot from "../screens/consult/DoctorSlot";
import DoctorProfile from "../screens/consult/DoctorProfile";
import BookingConfrimScreen from "../screens/consult/BookingConfirmScreen";
import AddCalendar from "../screens/consult/AddCalendar";
import CategoryDoctor from "../screens/consult/CategoryDoctor";
import DoctorSlipScreen from "../screens/consult/DoctorSlip";
import MultipleDoctorSlip from "../screens/consult/MultipleDoctorSlip";
import NetworkError from "../screens/NetworkError";
import AddEditAddress from "../components/AddEditAddress";
import PrakritiProfile from "../screens/auth/PrakritiProfile";
import PrescriptionDetail from "../screens/profile/PrescriptionDetail";
import EditProfile from "../screens/profile/EditProfile";

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootBottomParamList>();
const hideHeader = { headerShown: false };


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
      tabBar={(props) => <CustomeTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Products" component={ProductsScreen} />

      {/* <Tab.Screen name="History" component={OrderHistory} /> */}
      <Tab.Screen name="Profile" component={ProfilePage} />
      <Tab.Screen
        name="Consult"
        component={ConsultHome}
        options={{ tabBarButton: () => null }} // 👈 hide from default tab
      />
    </Tab.Navigator>
  );
};

// 🔥 HOME STACK
const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="TabStack" screenOptions={hideHeader}>
      <Stack.Screen name="TabStack" component={TabStack} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Appointments" component={AppointmentScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PatientDetails" component={PatientDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PatientFAQ" component={PatientFAQ} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="TermsCondition" component={TermsCondition} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="TopCategories" component={TopCategories} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="EditPatientDetail" component={EditPatientDetail} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ReviewPage" component={ReviewPage} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MyCart" component={MyCart} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MedicalRecords" component={MedicalRecords} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MedicineScreen" component={MedicineScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ProductsScreen" component={ProductsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="FAQScreen" component={FAQScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PaymentsScreen" component={PaymentsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSPayment" component={SOSPayment} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOS} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSCancel" component={SOSCancelScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSConfirmed" component={SOSConfirmed} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSRequest" component={SOSRequest} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Prescription" component={Prescription} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SearchScreen" component={Prescription} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ManageAdrees" component={ManageAdrees} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="VerifyPresciption" component={VerifyPresciption} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MedicineCheckOut" component={MedicineCheckOut} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="OrderStatus" component={OrderStatus} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Wishlist" component={Wishlist} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistory} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="AssessmentType" component={AssessmentType} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Mentor" component={MentorProfile} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="YogaScreen" component={YogaScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="DietScreen" component={DietScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MealDetails" component={MealDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="WeeklyMeal" component={WeeklyMeal} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="YogaSession" component={YogaSession} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MentorCheckout" component={MentorCheckout} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ConsultMentor" component={ConsultMentor} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MentorOrder" component={MentorOrder} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="History" component={OrderHistory} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PrakritiProfile" component={PrakritiProfile} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="RefundScreen" component={RefundScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ExchangeScreen" component={ExchangeScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MedicalReceipt" component={MedicalReceipt} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ConsultHistory" component={ConsultHistory} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="AllDoctors" component={AllDoctors} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="DoctorSlot" component={DoctorSlot} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfile} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="BookingConfrimScreen" component={BookingConfrimScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="AddCalendar" component={AddCalendar} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="CategoryDoctor" component={CategoryDoctor} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="DoctorSlipScreen" component={DoctorSlipScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="AddEditAddress" component={AddEditAddress} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MultipleDoctorSlip" component={MultipleDoctorSlip} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetail} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false, animation: 'slide_from_right' }} />
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


const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SplashStack" screenOptions={hideHeader}>
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

    <NavigationContainer >

      {isConnected ?
        <MainNavigator />
        : <NetworkError />}

    </NavigationContainer>

  );
};

export default Navigator;