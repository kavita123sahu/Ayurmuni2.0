import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { Colors } from '../common/Colors';
import { Styles } from '../common/Styles';
import DashboardCard from './DashboardCard';



const ProfileHeader = ({ user }: any) => {
  return (
    <View style={styles.wrapper}>
      <View

        style={styles.container}
      >
        {/* 🌿 Leaf Background */}
        <Image source={Images.leaf1} style={styles.leafLeft} />
        <Image source={Images.leaf2} style={styles.leafRight} />

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: user.image }} style={styles.avatar} />

          <View style={styles.editIcon}>
            <Image source={Images.profileEdit} style={Styles.IconSize} />
          </View>
        </View>

        {/* Name */}
        <Text style={styles.name}>{user.name}</Text>

        {/* Info */}
        <Text style={styles.info}>
          {user.phone} • {user.email}
        </Text>

        {/* Stats */}
        <DashboardCard
          data={[
            { value: "02", label: "TUTORIALS" },
            { value: "14", label: "CHEMICALS" },
            { value: "05", label: "REPORTS" },
          ]}
        />
      </View>
    </View>
  );
};



export default React.memo(ProfileHeader);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  container: {
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    overflow: 'hidden', // 👈 IMPORTANT for leaf cut
  },

  // 🌿 Leaves
  leafLeft: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 50,
    height: 50,
    resizeMode: 'contain',
    opacity: 0.5,
  },

  leafRight: {
    position: 'absolute',
    top: 100,
    right: 5,
    width: 60,
    height: 60,
    resizeMode: 'contain',
    opacity: 0.5,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DDEBE8',
    backgroundColor: '#FFFFFF',

    justifyContent: 'center', // 👈 center image vertically
    alignItems: 'center',     // 👈 center image horizontally

    marginBottom: 12,
  },

  avatar: {
    width: 85,
    height: 85,
    borderRadius: 16, // 👈 square rounded (NOT circle)
  },

  editIcon: {
    position: 'absolute',
    bottom: 1,
    right: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // 👈 white border like figma
  },

  editText: {
    color: '#fff',
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#1A1A1A',
  },

  info: {
    fontSize: 12,
    color: Colors.subTextColor,
    marginTop: 4,
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },


});