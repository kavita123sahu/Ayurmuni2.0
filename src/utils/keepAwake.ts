import { NativeModules } from 'react-native';

const KeepAwakeNative = NativeModules.KeepAwake as
  | { activate: () => void; deactivate: () => void }
  | undefined;

/** Keep the display on (e.g. during a video call). No-op if the native module is missing. */
export const activateKeepAwake = () => {
  try {
    KeepAwakeNative?.activate();
  } catch (e) {
    console.log('KEEP_AWAKE_ACTIVATE_ERROR =>', e);
  }
};

export const deactivateKeepAwake = () => {
  try {
    KeepAwakeNative?.deactivate();
  } catch (e) {
    console.log('KEEP_AWAKE_DEACTIVATE_ERROR =>', e);
  }
};
