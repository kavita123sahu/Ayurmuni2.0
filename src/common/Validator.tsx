
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { showSuccessToast } from '../config/Key';
import { Platform } from 'react-native';


// export const EmailValidator = (email: string) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

export const EmailValidator = (email: string) => {
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check if it ends with proper domain extensions
  const validDomains = [
    '@gmail.com',
    '@yahoo.com', 
    '@hotmail.com',
    '@outlook.com',
    '@rediffmail.com',
    '@yahoo.co.in'
  ];
  
  // Check if email ends with any valid domain
  return validDomains.some(domain => email.toLowerCase().endsWith(domain));
};

export const PasswordValidator = (password: string) => {
  const minLength = 8; 
  const hasUpperCase = /[A-Z]/.test(password); 
  const hasLowerCase = /[a-z]/.test(password); 
  const hasNumber = /[0-9]/.test(password); 
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber
  );
};


 export const requestCameraPermission = async () => {
    try {
        const permission = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.CAMERA 
            : PERMISSIONS.ANDROID.CAMERA;
            
        const result = await request(permission);
        return result === RESULTS.GRANTED;
    } catch (error) {
        return false;
    }
};


 export const formatIndianPhoneNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7, 12)}`;
  }

  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  }

  return number; 
};
