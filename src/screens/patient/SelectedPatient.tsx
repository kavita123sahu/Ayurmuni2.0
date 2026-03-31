import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Styles } from '../../common/Styles';
import { FontAwesome5, Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';

interface Props {
  name: string;
  phone: string;
  image: string;
  relation: string;
  avatarGroup?: { initials: string; color: string }[];
  onViewRecords?: () => void;
}

const SelectedPatientCard: React.FC<Props> = ({
  name,
  phone,
  image,
  relation,
  avatarGroup = [
    { initials: 'AS', color: '#CBD5E1' },
    { initials: 'PS', color: '#BAE6FD' },
    { initials: 'AA', color: '#BBF7D0' },
  ],
  onViewRecords,
}) => {
  return (
    <View style={styles.card}>
      {/* Avatar + Info + View Records */}
      <View style={styles.topRow}>
        {/* Avatar with SELF badge */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: image }} style={styles.avatar} />

        </View>

        {/* Name & Phone */}
        <View style={styles.info}>
          <View style={styles.selfBadge}>
            <Text style={styles.selfBadgeText}>SELF</Text>
          </View>
          <Text style={Styles.name}>{name}</Text>
          <Text style={Styles.value}>{phone}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row: avatar group + view records */}
      <View style={styles.bottomRow}>
        {/* Initials avatar group */}
        <View style={styles.avatarGroup}>
          {avatarGroup.map((item, index) => (
            <View
              key={index}
              style={[
                styles.initialsCircle,
                { backgroundColor: item.color, marginLeft: index === 0 ? 0 : -8 },
              ]}
            >
              <Text style={styles.initialsText}>{item.initials}</Text>
            </View>
          ))}
        </View>

        {/* View Records */}
        <TouchableOpacity onPress={onViewRecords} style={styles.viewRecordsBtn}>
          <Text style={Styles.addBtn}>View Records  </Text>
          <FontAwesome5 name='arrow-right' color={Colors.primaryColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectedPatientCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    borderWidth:1,
    borderColor:Colors.borderColor
  },

  // ── Top Row ──
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  selfBadge: {
    alignSelf: "flex-start",
    // left: 16,
    backgroundColor: '#E8F3F1',
    borderRadius: 14,
    padding:5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selfBadgeText: {
    color: Colors.primaryColor,
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.6,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: '#64748B',
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },

  // ── Bottom Row ──
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialsCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initialsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewRecordsBtn: {
    paddingVertical: 4,
    paddingLeft: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewRecordsText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '600',
  },
});