/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import ProfilePage from './src/screens/profile/AppointmentDetails';
import ProductsScreen from './src/screens/products/ProductsScreen';

AppRegistry.registerComponent(appName, () => ProductsScreen);


