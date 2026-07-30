import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Styles } from '../../common/Styles';
import { Feather, FontAwesome5, Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';

interface Props {
  name: string;
  phone: string;
  image: string;
  relation: string;
  navigation: any;
  avatarGroup?: { initials: string; color: string }[];
  onViewRecords?: () => void;
}

const SelectedPatientCard: React.FC<Props> = ({
  name,
  phone,
  image,
  navigation,
  relation,
  avatarGroup = [],
  onViewRecords,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.avatar}
            />
          ) : (
            <Text style={styles.avatarText}>
              {name?.charAt(0)?.toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.selfBadge}>
            <Text style={styles.selfBadgeText}>SELF</Text>
          </View>
          <Text style={Styles.name}>{name}</Text>
          <Text style={[Styles.value, { color: '#64748B', fontFamily: Fonts.PoppinsRegular }]}>{phone}</Text>
        </View>

        <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.BadgeEdit}>
          <Feather name='edit' size={20} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.avatarGroup}>
          {avatarGroup.length > 0 ? (
            avatarGroup.map((item, index) => (
              <View
                key={`${item.initials}-${index}`}
                style={[
                  styles.initialsCircle,
                  { backgroundColor: item.color, marginLeft: index === 0 ? 0 : -8 },
                ]}
              >
                <Text style={styles.initialsText}>{item.initials}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyPatients}>No patients yet</Text>
          )}
        </View>

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
    borderWidth: 1,
    borderColor: Colors.borderColor
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
    width: 80,
    height: 80,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,

  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',

  },
  selfBadge: {
    alignSelf: "flex-start",
    // left: 16,
    backgroundColor: '#E8F3F1',
    borderRadius: 14,
    padding: 5,
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  BadgeEdit: {
    alignSelf: "flex-start",
    // left: 16,
    top: 2,
    right: 10,
    position: 'absolute',
    padding: 5,
    marginBottom: 5,
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
  emptyPatients: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
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