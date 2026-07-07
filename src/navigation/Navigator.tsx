import React, { useEffect, useRef, useState } from "react";
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
// import ConsultHome from "../screens/consult/ConsultHome";
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
// import EmergencySOS from "../screens/SOS/EmergencySOS";
// import SOSPayment from "../screens/SOS/SOSPayment";
// import SOSRequest from "../screens/SOS/SOSRequest";
// import SOSCancelScreen from "../screens/SOS/SOSCancelScreen";
// import SOSDoctorAssigned from "../screens/SOS/SOSConfirmed";
// import SOSConfirmed from "../screens/SOS/SOSConfirmed";
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
import RazorpayScreen from "../screens/payment/RazorpayScreen";
import AddEditPatientDetail from "../screens/patient/AddEditPatientDetail";
import AllFavDoctors from "../screens/consult/AllFAvDoctor";
import consultHome from "../screens/consult/consultHome";
import ReviewGalleryScreen from "../components/ReviewGalleryScreen";
import { navigationRef } from "./navigationRef";
import PatientVideoCall from "../screens/consult/PatientVideoCall";
import ChatScreen from "../screens/profile/ChatScreen";
import { ChatContainer } from "../chatSystem/components/chat/chatContainer";
import ConfirmScreen from "../screens/products/ConfirmScreen";
import { ScrollHideProvider } from "../context/ScrollHideContext";

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootBottomParamList>();
import { defaultStackOptions, getStackScreenOptions } from "./screenOptions";


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
    <ScrollHideProvider>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={(props) => <CustomeTab {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomePage} />
        <Tab.Screen name="Products" component={ProductsScreen} />
        <Tab.Screen name="Medicine" component={MedicineScreen} />
        <Tab.Screen name="Profile" component={ProfilePage} />
      </Tab.Navigator>
    </ScrollHideProvider>
  );
};

// 🔥 HOME STACK
const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="TabStack"
      screenOptions={({ route }) => getStackScreenOptions(route.name)}
    >
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="Appointments" component={AppointmentScreen} />
      <Stack.Screen name="PatientDetails" component={PatientDetails} />
      <Stack.Screen name="PatientFAQ" component={PatientFAQ} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="TermsCondition" component={TermsCondition} />
      <Stack.Screen name="TopCategories" component={TopCategories} />
      <Stack.Screen name="AddEditPatientDetail" component={AddEditPatientDetail} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="ReviewPage" component={ReviewPage} />
      <Stack.Screen name="MyCart" component={MyCart} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="MedicalRecords" component={MedicalRecords} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} />
      <Stack.Screen name="MedicineScreen" component={MedicineScreen} />
      <Stack.Screen name="ProductsScreen" component={ProductsScreen} />
      <Stack.Screen name="FAQScreen" component={FAQScreen} />
      <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PaymentsScreen" component={PaymentsScreen} />
      {/* <Stack.Screen name="SOSPayment" component={SOSPayment} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="EmergencySOS" component={EmergencySOS} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSCancel" component={SOSCancelScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSConfirmed" component={SOSConfirmed} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="SOSRequest" component={SOSRequest} options={{ headerShown: false, animation: 'slide_from_right' }} /> */}
      <Stack.Screen name="Prescription" component={Prescription} />
      <Stack.Screen name="SearchScreen" component={Prescription} />
      <Stack.Screen name="ManageAdrees" component={ManageAdrees} />
      <Stack.Screen name="VerifyPresciption" component={VerifyPresciption} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MedicineCheckOut" component={MedicineCheckOut} />
      <Stack.Screen name="OrderStatus" component={OrderStatus} />
      <Stack.Screen name="Wishlist" component={Wishlist} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistory} />
      <Stack.Screen name="AssessmentType" component={AssessmentType} />
      <Stack.Screen name="Mentor" component={MentorProfile} />
      <Stack.Screen name="YogaScreen" component={YogaScreen} />
      <Stack.Screen name="DietScreen" component={DietScreen} />
      <Stack.Screen name="MealDetails" component={MealDetails} />
      <Stack.Screen name="WeeklyMeal" component={WeeklyMeal} />
      <Stack.Screen name="YogaSession" component={YogaSession} />
      <Stack.Screen name="MentorCheckout" component={MentorCheckout} />
      <Stack.Screen name="ConsultMentor" component={ConsultMentor} />
      <Stack.Screen name="MentorOrder" component={MentorOrder} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="History" component={OrderHistory} />
      <Stack.Screen name="PrakritiProfile" component={PrakritiProfile} />
      <Stack.Screen name="RefundScreen" component={RefundScreen} />
      <Stack.Screen name="ExchangeScreen" component={ExchangeScreen} />
      <Stack.Screen name="MedicalReceipt" component={MedicalReceipt} />
      <Stack.Screen name="ConsultHistory" component={ConsultHistory} />
      <Stack.Screen name="AllDoctors" component={AllDoctors} />
      <Stack.Screen name="DoctorSlot" component={DoctorSlot} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfile} />
      <Stack.Screen name="BookingConfrimScreen" component={BookingConfrimScreen} />
      <Stack.Screen name="AddCalendar" component={AddCalendar} />
      <Stack.Screen name="CategoryDoctor" component={CategoryDoctor} />
      <Stack.Screen name="DoctorSlipScreen" component={DoctorSlipScreen} />
      <Stack.Screen name="AddEditAddress" component={AddEditAddress} />
      <Stack.Screen name="MultipleDoctorSlip" component={MultipleDoctorSlip} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetail} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="RazorpayScreen" component={RazorpayScreen} />
      <Stack.Screen name="FavDoctors" component={AllFavDoctors} />
      <Stack.Screen name="Consult" component={consultHome} />
      <Stack.Screen name="ReviewGalleryScreen" component={ReviewGalleryScreen} />
      <Stack.Screen name="PatientVideoCallScreen" component={PatientVideoCall} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ConfirmScreen" component={ConfirmScreen} />
      <Stack.Screen
        name="ChatContainer"
      >
        {(props) => (
          <ChatContainer
            appointmentId="a059b339-296b-42c0-8e4c-7cba0b62e4c5"
            role="patient"
            doctorName="Dr. Mohit Beniwal"
            patientName="Sonam Wangchu"
          // onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
      {/* <Stack.Screen name="ChatContainer" component={ChatContainer} options={{ headerShown: false, animation: 'slide_from_right' }} /> */}
    </Stack.Navigator>
  );
};


// 🔥 AUTH STACK
const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={defaultStackOptions}>
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
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Splash" component={Splash} options={{
        headerShown: false,
        animation: 'slide_from_right',
      }} />
    </Stack.Navigator>
  );
};


const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SplashStack" screenOptions={defaultStackOptions}>
      <Stack.Screen name="SplashStack" component={SplashStack} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="HomeStack" component={HomeStack} />
    </Stack.Navigator>
  );
};


// 🔥 ROOT NAVIGATOR
const Navigator = () => {
  const isConnected = useNetworkStatus();

  if (isConnected === null) {
    return null; // ya ActivityIndicator
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isConnected ? <MainNavigator /> : <NetworkError />}
    </NavigationContainer>
  );
};
export default Navigator;