
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Otp: undefined;
    Onboarding: undefined;
    AppointmentDetails: undefined;
    HomeStack: undefined;
    AuthStack: undefined;
    SplashStack: undefined;
    OtpVerify: undefined;
    Splash: undefined;
    Appointments: undefined;
    OrderHistory: undefined;
    TabStack: undefined;
    PatientDetails: undefined;
    TermsCondition: undefined;
    PatientFAQ: undefined;
    EditPatientDetail: undefined;
    ProductDetails: undefined;
    TopCategories: undefined;
    ReviewPage: undefined;
    MyCart: undefined;
    Checkout: undefined;
    
    MedicalRecords: undefined;
    OrderConfirmation: undefined;
    MedicineScreen: undefined;
    ProductsScreen: undefined;
    FAQScreen: undefined;
    HelpCenterScreen: undefined;
    Settings: undefined;
    PaymentsScreen: undefined;
    EmergencySOS: undefined;
    SOSConfirmed: undefined;
    SOSCancel: undefined;
    SOSPayment: undefined;
    SOSConfirmed: undefined;
    SOSRequest: undefined;
    Notifications: undefined;
    ManageAdrees: undefined;
    Prescription: undefined;
    VerifyPresciption : undefined;
    SearchScreen: undefined;
    OrderStatus : undefined;
    MedicineCheckOut : undefined;
    consultHome: undefined;
};


export type RootBottomParamList = {
    Home: undefined;
    Shop: undefined;
    Centers: undefined;
    History: undefined;
    Cart: undefined;
    Profile: undefined;
    Consult : undefined;
    consultHome: undefined;
};

export type AllBooksScreenProps = NativeStackScreenProps<RootStackParamList, 'AllBooks'>

