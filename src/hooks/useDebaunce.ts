import { useEffect, useState } from "react";
import NetInfo from '@react-native-community/netinfo';


export const useDebounce = <T,>(
  value: T,
  delay = 500,
): T => {
  const [debouncedValue, setDebouncedValue] =
    useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};


export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return unsubscribe;
    }, []);

    return isConnected;
};


import dayjs from 'dayjs';

export const getAvailabilityRange =
(value:string)=>{

   const today =
   dayjs().startOf('day');

   switch(value){

      case 'today':
         return {
            from:today.format('YYYY-MM-DD'),
            to:today.format('YYYY-MM-DD'),
         };

      case 'tomorrow':
         return {
            from:today
            .add(1,'day')
            .format('YYYY-MM-DD'),

            to:today
            .add(1,'day')
            .format('YYYY-MM-DD'),
         };

      default:
         return {
            from:'',
            to:'',
         };
   }
};


