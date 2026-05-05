
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Otp: undefined;
    MentorCheckout : undefined;
    Onboarding: undefined;
    AppointmentDetails: undefined;
    HomeStack: undefined;
    History : undefined;
    AuthStack: undefined;
    SplashStack: undefined;
    WelcomeScreen : undefined;
    AssessmentScreen : undefined;
    OtpVerify: undefined;
    WeeklyMeal: WeeklyMeal;
    Splash: undefined;
    Appointments: undefined;
    OrderHistory: undefined;
    TabStack: undefined;
    MentorOrder : undefined;
    PatientDetails: undefined;
    TermsCondition: undefined;
    YogaScreen: undefined;
    PatientFAQ: undefined;
    EditPatientDetail: undefined;
    ConsultMentor: undefined;
    ProductDetails: undefined;
    TopCategories: undefined;
    ReviewPage: undefined;
    YogaSession: undefined;
    MyCart: undefined;
    Mentor: undefined;
    Checkout: undefined;
    DietScreen: undefined;
    Wishlist: undefined;
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
    MealDetails: undefined;
    SOSConfirmed: undefined;
    SOSRequest: undefined;
    Notifications: undefined;
    ManageAdrees: undefined;
    Prescription: undefined;
    VerifyPresciption: undefined;
    SearchScreen: undefined;
    OrderStatus: undefined;
    MedicineCheckOut: undefined;
    consultHome: undefined;
    MedicalHistory: undefined;
    AssessmentType: undefined;
};


export type RootBottomParamList = {
    Home: undefined;
    Shop: undefined;
    Centers: undefined;
    History: undefined;
    Cart: undefined;
    Profile: undefined;
    Consult: undefined;
    consultHome: undefined;
    Mentor : undefined;
};

export type AllBooksScreenProps = NativeStackScreenProps<RootStackParamList, 'AllBooks'>

