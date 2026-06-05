import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';

import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { Colors } from '../common/Colors';

import DashboardCard from './DashboardCard';

import { Feather } from '../common/Vector';
import * as _PROFILE_SERVICE from '../services/ProfileServices';

import { showSuccessToast } from '../config/Key';

const ProfileHeader = ({ user }: any) => {

  console.log('UserinProfileHeader:', user);

  const [loading, setLoading] =
    useState(false);

  const [profileImage, setProfileImage] =
    useState('');



  useEffect(() => {

    if (user?.profile_picture) {

      setProfileImage(
        user.profile_picture
      );
    }

  }, [user]);
  /*
  =====================================================
      IMAGE PICKER
  =====================================================
  */

  /*
  =====================================================
      FIRST LETTER
  =====================================================
  */

  const firstLetter =
    user?.first_name
      ?.charAt(0)
      ?.toUpperCase() || 'U';

  return (
    <View style={styles.wrapper}>

      <View style={styles.container}>

        {/* LEAFS */}

        <Image
          source={Images.leaf1}
          style={styles.leafLeft}
        />

        <Image
          source={Images.leaf2}
          style={styles.leafRight}
        />

        {/* AVATAR */}

        <View style={styles.avatarBgWrapper}>

          <ImageBackground
            source={Images.BackgroundImage}
            style={styles.avatarBg}
            imageStyle={{
              borderRadius: 100,
            }}
          >

            <View
              style={styles.avatarWrapper}
            >

              {/* IMAGE */}

              {profileImage ? (

                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={styles.avatar}
                />

              ) : (
                <View
                  style={
                    styles.initialWrapper
                  }
                >
                  <Text
                    style={
                      styles.initialText
                    }
                  >
                    {firstLetter}
                  </Text>
                </View>
              )}

              {/* LOADER */}

              {loading && (
                <View
                  style={
                    styles.loaderOverlay
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                </View>
              )}

              {/* EDIT */}

              {/* <TouchableOpacity
                activeOpacity={0.8}
                style={styles.editIcon}
                onPress={
                  handleAddImage
                }
              >

                <Image
                  source={
                    Images.profileEdit
                  }
                  style={
                    styles.IconSize
                  }
                />

              </TouchableOpacity> */}

            </View>

          </ImageBackground>
        </View>

        {/* NAME */}

        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {`${user?.first_name || ''
            } ${user?.last_name || ''
            }`}
        </Text>

        {/* INFO */}

        <Text style={styles.info}>
          +91{' '}
          {user?.phone_number?.slice(
            -10,
          )}{' '}
          • {user?.email}
        </Text>

        {/* STATS */}

        <View style={styles.statsRow}>
          <DashboardCard
            data={[
              {
                value: '02',
                label: 'CONSULTS',
              },
              {
                value: '14',
                label: 'ORDERS',
              },
              {
                value: '05',
                label: 'REPORTS',
              },
            ]}
          />
        </View>

      </View>
    </View>
  );
};

export default React.memo(
  ProfileHeader,
);

const styles = StyleSheet.create({

  wrapper: {
    flex: 1,
  },

  container: {
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    overflow: 'hidden',
  },

  leafLeft: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 60,
    height: 60,
    tintColor:
      Colors.secondaryColor,
    resizeMode: 'contain',
    opacity: 0.5,
  },

  leafRight: {
    position: 'absolute',
    top: 100,
    right: 5,
    width: 60,
    height: 60,
    tintColor:
      Colors.secondaryColor,
    resizeMode: 'contain',
    opacity: 0.5,
  },

  avatarBgWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -10,
  },

  avatarBg: {
    padding: 30,
    height: 150,
    width: 200,
    borderRadius: 100,
    overflow: 'hidden',

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarWrapper: {
    width: 105,
    height: 105,

    borderRadius: 24,

    borderWidth: 1,
    borderColor: '#DDEBE8',

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 12,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 6,
    elevation: 5,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },

  /*
  =====================================================
      FIRST LETTER UI
  =====================================================
  */

  initialWrapper: {
    width: 90,
    height: 90,

    borderRadius: 18,

    backgroundColor:
      Colors.primaryColor,

    justifyContent: 'center',
    alignItems: 'center',
  },

  initialText: {
    fontSize: 34,

    color: '#fff',

    fontFamily:
      Fonts.PoppinsBold,
  },

  /*
  =====================================================
      LOADER
  =====================================================
  */

  loaderOverlay: {
    position: 'absolute',

    width: '100%',
    height: '100%',

    backgroundColor:
      'rgba(0,0,0,0.45)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  editIcon: {
    position: 'absolute',
    bottom: -2,
    right: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },

  IconSize: {
    width: 30,
    height: 30,
  },

  name: {
    fontSize: 18,

    flexShrink: 1,

    fontFamily:
      Fonts.PoppinsSemiBold,

    color: '#1A1A1A',
  },

  info: {
    fontSize: 12,

    color: Colors.subTextColor,

    fontFamily:
      Fonts.PoppinsMedium,

    marginBottom: 18,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',

    width: '100%',
  },
});