
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Otp: undefined;
  MentorCheckout: undefined;
  ChatScreen: {
    // appointmentId: string;
    // role: 'doctor' | 'patient';
    doctorId: string;
    doctorName: string;
  };
  ConsultScreen: undefined;
  Onboarding: undefined;
  AccessMode: undefined;
  CompleteDetails: { reason?: string } | undefined;
  ProductRazorpayScreen: undefined;
  FavDoctors: undefined;
  AppointmentDetails:
    | { consultation_id?: string; appointment_id?: string; [key: string]: any }
    | undefined;
  HomeStack: { screen: string; params?: any } | undefined;
  Welcome: undefined; ChatContainer: undefined;
  // ChatScreen: undefined;
  PatientVideoCallScreen: undefined;
  AddEditAddress: { type?: string; data?: any; selectedLocation?: any } | undefined;
  ConfirmScreen: undefined;
  Consult: undefined;
  History: undefined;
  PolicyAccept: undefined;
  LocationPickerScreen: undefined;
  MultipleDoctorSlip: undefined;
  PrescriptionDetail: undefined;
  AuthStack: undefined;
  // DoctorSlot: undefined;
  DoctorSlot: {
    doctorDetails: string;
  };
  DoctorConsultationHistory: undefined;
  DoctorProfile: undefined;
  AddCalendar: undefined;
  SplashStack: undefined;
  ConsultHistory: undefined;
  DoctorSlipScreen: undefined;
  ExchangeScreen: undefined;
  WelcomeScreen: undefined;
  PrakritiProfile: undefined;
  OtpVerify: undefined;
  EditProfile: undefined;
  WeeklyMeal: WeeklyMeal;
  // MedicalReceipt: undefined;
  MedicalReceipt: {
    consultationId: string
  }
  AllDoctors: undefined;
  CategoryDoctor: {
    categoryName?: string;
    categoryId?: string;
    categoryDesc?: string;
    categorySubscription?: string;
    categorySymptoms?: string[];
    categoryImage?: string;
    categoryTag?: string;
  };
  OrangeLabScreen: undefined;
  PackagesScreen: { planId?: string } | undefined;
  MyPlansScreen: { highlightId?: string } | undefined;
  Splash: undefined;
  BookingConfrimScreen: undefined;
  Appointments:
  | {
    mode?: 'upcoming' | 'all';
  }
  | undefined;
  OrderHistory: undefined;
  OrderDetailsScreen: { order?: any };
  TabStack: undefined;
  MentorOrder: undefined;
  PatientDetails: undefined;
  RefundScreen: undefined;
  TermsCondition:
  | {
    agreed?: boolean;
    policyType?: string;
  }
  | undefined;
  PolicyAccept:
  | {
    nextRoute?: {
      name?: string;
      params?: any;
    };
  }
  | undefined;
  PolicyDetail:
  | {
    policyType?: string;
    policyId?: string;
    title?: string;
    requireAccept?: boolean;
    agreed?: boolean;
  }
  | undefined;
  LegalPoliciesHub: undefined;
  PrivacyCenter: undefined;
  FeedbackInformation: undefined;
  YogaScreen: undefined;
  PatientFAQ: undefined;
  AddEditPatientDetail: undefined;
  ConsultMentor: undefined;
  ProductDetails: undefined;
  TopCategories: undefined;
  ReviewPage: undefined;
  ShareExperienceScreen: {
    entityType?: 'doctor' | 'product' | 'diet_plan';
    entityName?: string;
    entitySubtitle?: string;
    appointmentId?: string;
    variantId?: string;
    orderId?: string;
    patientDietPlanId?: string;
    initialRating?: number;
    initialReview?: string;
    initialImages?: string[];
    isEdit?: boolean;
  };
  YogaSession: undefined;
  MyCart: undefined;
  Mentor: undefined;
  RazorpayScreen: undefined;
  Checkout: undefined;
  DietScreen: undefined;
  DietPlanDetail: undefined;
  Wishlist: undefined;
  Rewards: undefined;
  MedicalRecords: undefined;
  OrderConfirmation: undefined;
  MedicineScreen: undefined;
  ProductsScreen: undefined;
  FAQScreen: undefined;
  HelpCenterScreen: undefined;
  Settings: undefined;
  PaymentsScreen: undefined;
  TransactionDetailsScreen: { transaction?: any };
  EmergencySOS: undefined;
  SOSConfirmed: undefined;
  SOSCancel: undefined;
  SOSPayment: undefined;
  MealDetails: undefined;
  ReviewGalleryScreen: undefined;
  SOSConfirmed: undefined;
  SOSRequest: undefined;
  Notifications: undefined;
  ManageAdrees: undefined;
  Prescription: undefined;
  VerifyPresciption: undefined;
  SearchScreen: undefined;
  CategoryProducts:
  | {
    categoryId?: string;
    categoryName?: string;
    categoryMode?: 'health' | 'product' | 'both';
    productSubcategoryId?: string;
    healthCategoryId?: string;
    healthDiseaseId?: string;
    brand_name_id?: string;
    brandName?: string;
    brandId?: string;
    brandID?: string;
    /** Banner / Trusted Brands — filter by brand; sidebar stays API categories only */
    brandOnly?: boolean;
    serviceCategoryId?: string;
    categoryDesc?: string;
    categorySubscription?: string;
  }
  | undefined;
  OrderStatus: undefined;
  MedicineCheckOut: undefined;
  ConsultHome: undefined;
  MedicalHistory: undefined;
  AssessmentType: undefined;
};

export type RootBottomParamList = {
  Home: undefined;
  Shop: undefined;
  Centers: undefined;
  Medicine: undefined;
  History: undefined;
  Diet: undefined;
  MyCart: undefined;
  Products: undefined;
  Profile: undefined;
  Medicines: undefined;
  Consult: undefined;
  // ConsultScreen: undefined;
  Mentor: undefined;
};

export type AllBooksScreenProps = NativeStackScreenProps<RootStackParamList, 'AllBooks'>

