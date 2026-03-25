/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import FAQScreen from './src/screens/auth/OtpVerify';
import ProfilePage from './src/screens/profile/AppointmentDetails';
import ProductsScreen from './src/screens/products/ProductsScreen';


AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => ProductsScreen);


