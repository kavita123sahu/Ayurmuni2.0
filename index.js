/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import ProfilePage from './src/screens/profile/AppointmentDetails';


AppRegistry.registerComponent(appName, () => ProfilePage);


