import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from './TablerIcon';

type Props = {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
};

const LocationPermissionModal: React.FC<Props> = ({
  visible,
  onAllow,
  onDeny,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <TablerIcon name="map-pin" size={28} color={Colors.primaryColor} />
        </View>

        <Text style={styles.title}>Enable Location</Text>

        <Text style={styles.description}>
          Allow Ayurmuni to access your location for accurate delivery addresses
          and nearby doctor recommendations.
        </Text>

        <TouchableOpacity style={styles.allowBtn} onPress={onAllow}>
          <Text style={styles.allowText}>Enable Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.denyBtn} onPress={onDeny}>
          <Text style={styles.denyText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default LocationPermissionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.BGIcon,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    color: '#111827',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: '#667085',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 22,
  },
  allowBtn: {
    marginTop: 22,
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allowText: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
  },
  denyBtn: {
    marginTop: 10,
    paddingVertical: 8,
  },
  denyText: {
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 14,
  },
});
