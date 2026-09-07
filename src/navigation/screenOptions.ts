import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const defaultStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 280,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

export const tabRootOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 200,
};

export const listStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 280,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

export const modalStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade_from_bottom',
  animationDuration: 300,
  gestureEnabled: true,
};

export const productStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_bottom',
  animationDuration: 320,
  gestureEnabled: true,
};

export const detailStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_bottom',
  animationDuration: 300,
  gestureEnabled: true,
};

/** Screens that open as lists — keep horizontal slide */
export const LIST_STACK_SCREENS = new Set([
  'OrderHistory',
  'History',
  'AllDoctors',
  'FavDoctors',
  'ConsultHistory',
  'CategoryDoctor',
  'Notifications',
  'PatientFAQ',
  'MedicalHistory',
  'AssessmentType',
  'LocationPickerScreen',
  'AddEditAddress',
  'PrakritiProfile',
  'Onboarding',
  'FAQScreen',
  'HelpCenterScreen',
  'TermsCondition',
  'PolicyDetail',
  'LegalPoliciesHub',
  'PrivacyCenter',
  'FeedbackInformation',
  'Rewards',
  'Profile',
  'Consult',
  'BookingConfrimScreen',
  'MedicineScreen',
  'ProductsScreen',
  'FavDoctors',
  'SearchScreen',
  'ProductDetails',
  'ReviewPage',
]);

export const MODAL_STACK_SCREENS = new Set(['MyCart', 'Checkout']);

export const getStackScreenOptions = (
  screenName: string,
): NativeStackNavigationOptions => {
  if (screenName === 'TabStack') return tabRootOptions;
  if (MODAL_STACK_SCREENS.has(screenName)) return modalStackOptions;
  if (LIST_STACK_SCREENS.has(screenName)) return listStackOptions;
  return detailStackOptions;
};
