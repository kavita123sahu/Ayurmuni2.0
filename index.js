/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import FAQScreen from './src/screens/auth/OtpVerify';
import ProfilePage from './src/screens/patient/PatientDetails';
import ProductsScreen from './src/screens/profile/ProfilePage';
import  ReviewPage from './src/'


AppRegistry.registerComponent(appName, () => ReviewPage);


