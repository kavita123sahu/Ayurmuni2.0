


import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../../common/Images';
// import logo from '../../../assets/images//backButton.png';

interface ChatHeaderProps {
  title: string;
  avatar?: string;
  isOnline: boolean;
  role: 'doctor' | 'patient';
  onBack?: () => void;
}

const THEME = '#0D614E';

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, avatar, isOnline, role, onBack }) => {
  const navigation = useNavigation();
  const handleBack = () => (onBack ? onBack() : navigation.goBack());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.leftContainer}>

        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          {/* <Text style={styles.backIcon}>‹</Text> */}
          <Image source={Images.backIcon} style={styles.backImage} />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{title?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
          )}
          <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Unknown'}</Text>
          <Text style={styles.subtitle}>
            {isOnline ? 'Online' : 'Offline'} • {role === 'doctor' ? 'Doctor' : 'Patient'}
          </Text>
        </View>
      </View>

      {/* <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
        <Text style={styles.moreIcon}>⋯</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    minHeight: 64,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',

    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  leftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { padding: 6, marginRight: 4, borderRadius: 8 },
  backIcon: { fontSize: 32, color: THEME, fontWeight: '300', includeFontPadding: false },
  avatarContainer: { position: 'relative', marginRight: 12 },
  backImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  avatarPlaceholder: { backgroundColor: THEME, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  statusDot: {
    position: 'absolute', bottom: 0, right: 0, width: 14, height: 14,
    borderRadius: 7, borderWidth: 2.5, borderColor: '#FFFFFF',
  },
  statusOnline: { backgroundColor: '#22C55E' },
  statusOffline: { backgroundColor: '#9CA3AF' },
  titleContainer: { flex: 1 },
  title: { fontSize: 17, fontWeight: '600', color: '#1F2937' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  moreButton: { padding: 8, borderRadius: 8 },
  moreIcon: { fontSize: 22, color: '#6B7280', fontWeight: '600' },
});