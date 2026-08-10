import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
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
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'P';
  const familyCount = avatarGroup.length;

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />

      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.badgeRow}>
            <View style={styles.selfBadge}>
              <Text style={styles.selfBadgeText}>
                {(relation || 'Self').toUpperCase()}
              </Text>
            </View>
            {familyCount > 0 ? (
              <Text style={styles.familyHint}>
                {familyCount} family {familyCount === 1 ? 'member' : 'members'}
              </Text>
            ) : null}
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          {!!phone && (
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={13} color="#64748B" />
              <Text style={styles.phone} numberOfLines={1}>
                {phone}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editBtn}
          hitSlop={8}
        >
          <Feather name="edit-2" size={15} color={Colors.primaryColor} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.avatarGroup}>
          {familyCount > 0 ? (
            avatarGroup.slice(0, 4).map((item, index) => (
              <View
                key={`${item.initials}-${index}`}
                style={[
                  styles.initialsCircle,
                  {
                    backgroundColor: item.color,
                    marginLeft: index === 0 ? 0 : -8,
                    zIndex: 4 - index,
                  },
                ]}
              >
                <Text style={styles.initialsText}>{item.initials}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyPatients}>No family members yet</Text>
          )}
          {familyCount > 4 ? (
            <View style={[styles.initialsCircle, styles.moreCircle, { marginLeft: -8 }]}>
              <Text style={styles.initialsText}>+{familyCount - 4}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={onViewRecords}
          style={styles.viewRecordsBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.viewRecordsText}>View Records</Text>
          <FontAwesome5 name="arrow-right" size={11} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectedPatientCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F2EE',
    overflow: 'hidden',
  },

  accentBar: {
    height: 3,
    backgroundColor: Colors.primaryColor,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },

  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F0F7F4',
    borderWidth: 1,
    borderColor: '#D7EBE3',
    marginRight: 12,
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
  },

  avatarText: {
    fontSize: 22,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
  },

  info: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },

  selfBadge: {
    backgroundColor: '#E8F3F1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  selfBadgeText: {
    color: Colors.primaryColor,
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.5,
  },

  familyHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },

  name: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  phone: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },

  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0F7F4',
    borderWidth: 1,
    borderColor: '#D7EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFCFB',
  },

  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  initialsCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  moreCircle: {
    backgroundColor: '#E2E8F0',
  },

  initialsText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },

  emptyPatients: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },

  viewRecordsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  viewRecordsText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
