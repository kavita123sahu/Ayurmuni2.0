/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import MedicalRecords from './src/screens/profile/MedicalRecords';
import EditPatientDetail from './src/screens/patient/EditPatientDetail';
import FAQScreen from './src/screens/auth/OtpVerify';
import ProfilePage from './src/screens/patient/PatientDetails';
import ProductDetails from './src/screens/products/ProductDetails';
import  ReviewPage from './src/screens/products/ReviewPage';
import  OrderStatus from './src/screens/medicines/OrderStatus';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SOSCancelScreen from './src/screens/SOS/SOSCancelScreen'


AppRegistry.registerComponent(appName, () => NotificationsScreen);


