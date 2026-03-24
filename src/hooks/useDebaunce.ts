import { useEffect, useState } from "react";
import NetInfo from '@react-native-community/netinfo';

export const useDebouncedValue = (inputValue: string, delay: any) => {
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, delay]);

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
