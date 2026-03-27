
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
    PatientDetails : undefined;
    TermsCondition : undefined;
    PatientFAQ : undefined;





};


export type RootBottomParamList = {
    Home: undefined;
    Shop: undefined;
    Consultation: undefined;
    Centers: undefined;
    Consult: undefined;
    Cart: undefined;
    Profile: undefined;
};

export type AllBooksScreenProps = NativeStackScreenProps<RootStackParamList, 'AllBooks'>

