import AsyncStorage from "@react-native-async-storage/async-storage";



export const Utils = {

    async storeData(key: any, value: any) {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue)
        } catch (e) {
            // saving error
        }
    },

    async getData(key: any) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
        }
    },

    
    async storeStringData(key: any, value: any) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            // saving error
        }
    },

    async getStringData(key: any) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue;
        } catch (e) {
            // error reading value
        }
    },


    async clearAllData() {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (e) {
            console.log(e);
            // error reading value
        }
    },

    notNull(val: any) {
        return (val !== null && val !== undefined && val !== "NULL" && val !== "null" && val !== "undefined" && val !== "UNDEFINED" && (val + "").trim() !== "")
    }
}