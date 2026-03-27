/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import MyCart from './src/screens/products/MyCart';


AppRegistry.registerComponent(appName, () => MyCart);


