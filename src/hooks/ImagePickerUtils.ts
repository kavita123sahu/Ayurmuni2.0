import { Alert } from 'react-native';

import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';

const pickerOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1200,
  saveToPhotos: true,
  maxHeight: 1200,
};


import { PermissionsAndroid, Platform } from 'react-native';

const requestCameraPermission =
  async () => {
    if (Platform.OS !== 'android')
      return true;

    const granted =
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS
          .CAMERA,
      );

    return (
      granted ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  };

export const openCamera = async () => {
  return new Promise<Asset | null>((resolve) => {
    launchCamera(
      pickerOptions as CameraOptions,
      response => {

        console.log(
          'CAMERA RESPONSE =>',
          JSON.stringify(response, null, 2),
        );

        if (response.didCancel) {
          console.log('CAMERA CANCELLED');
          resolve(null);
          return;
        }

        if (response.errorCode) {
          console.log(
            'CAMERA ERROR =>',
            response.errorCode,
          );

          console.log(
            'CAMERA MESSAGE =>',
            response.errorMessage,
          );

          resolve(null);
          return;
        }

        resolve(response.assets?.[0] || null);
      },
    );
  });
};

export const openGallery = async () => {
  return new Promise<Asset | null>((resolve) => {
    launchImageLibrary(
      pickerOptions as ImageLibraryOptions,
      response => {
        if (
          response.didCancel ||
          response.errorCode ||
          response.errorMessage
        ) {
          resolve(null);
          return;
        }

        resolve(response.assets?.[0] || null);
      },
    );
  });
};

export const showImagePicker = (
  onSelect: (image: Asset) => void,
) => {
  Alert.alert(
    'Select Image',
    'Choose an option',
    [
      {
        text: 'Camera',
        onPress: async () => {

          const hasPermission =
            await requestCameraPermission();

          if (!hasPermission) {
            console.log(
              'Camera permission denied',
            );
            return;
          }

          const image =
            await openCamera();

          if (image) {
            onSelect(image);
          }
        },
      },

      {
        text: 'Gallery',
        onPress: async () => {
          const image =
            await openGallery();

          if (image) {
            onSelect(image);
          }
        },
      },

      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
  );
};