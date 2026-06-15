import { useEffect, useState } from "react";
import NetInfo from '@react-native-community/netinfo';

export const useDebounce = (
    value: string,
    delay = 500,
) => {
    const [debounced,
        setDebounced] =
        useState(value);

    useEffect(() => {
        const timer =
            setTimeout(() => {
                setDebounced(value);
            }, delay);

        return () =>
            clearTimeout(timer);
    }, [value, delay]);

    return debounced;
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


