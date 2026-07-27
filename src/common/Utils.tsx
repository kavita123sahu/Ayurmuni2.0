import AsyncStorage from "@react-native-async-storage/async-storage";

type EventListener = (...args: unknown[]) => void;

class SimpleEventEmitter {
  private listeners = new Map<string, Set<EventListener>>();

  addListener(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return {
      remove: () => {
        this.listeners.get(event)?.delete(listener);
      },
    };
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(listener => listener(...args));
  }
}
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

    async removeData(key: any) {
        try {
            await AsyncStorage.removeItem(key);

        } catch (e) {
            console.log(e);
            // error reading value
        }

    },

    notNull(val: any) {
        return (val !== null && val !== undefined && val !== "NULL" && val !== "null" && val !== "undefined" && val !== "UNDEFINED" && (val + "").trim() !== "")
    }
}


export const AddressEvents = new SimpleEventEmitter();

export const ADDRESS_UPDATED =
    'ADDRESS_UPDATED';