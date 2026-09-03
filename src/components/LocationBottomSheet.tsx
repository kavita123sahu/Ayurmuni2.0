import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TablerIcon from './TablerIcon';
import CustomBottomSheet from './CustomBottomSheet';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { ParsedAddress } from '../services/locationService';
import { useLocation } from '../context/LocationContext';

type AddressItem = {
  id: string;
  is_default: boolean;
  address_type: string;
  address_type_name: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  zipcode?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  currentAddress: ParsedAddress | null;
  loadingLocation: boolean;
  savedAddresses: AddressItem[];
  onSelectAddress: (item: AddressItem) => void;
  onViewAll?: () => void;
  addressCount: number;
};

const LocationBottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  currentAddress,
  loadingLocation,
  savedAddresses,
  onSelectAddress,
  onViewAll,
  addressCount,
}) => {
  const navigation = useNavigation<any>();
  const stackNav = navigation.getParent?.() || navigation;
  const { setDeliveryLocation, refreshCurrentLocation } = useLocation();

  const openAddAddressForm = useCallback(() => {
    onClose();
    setTimeout(() => {
      stackNav.navigate('AddEditAddress', { type: 'ADD', returnToHome: true });
    }, 280);
  }, [onClose, stackNav]);

  const openMapPicker = useCallback(
    (returnToForm = true) => {
      onClose();
      setTimeout(() => {
        if (returnToForm) {
          stackNav.navigate('LocationPickerScreen', {
            returnScreen: 'AddEditAddress',
            returnParams: { type: 'ADD', returnToHome: true },
          });
        } else {
          stackNav.navigate('LocationPickerScreen');
        }
      }, 280);
    },
    [onClose, stackNav],
  );

  const useCurrentLocation = useCallback(async () => {
    onClose();
    let addr = currentAddress;
    if (!addr) {
      addr = await refreshCurrentLocation();
    }
    if (addr) {
      await setDeliveryLocation(addr);
      return;
    }
    Alert.alert(
      'Location unavailable',
      'Could not detect GPS. Pick your location on the map instead.',
      [{ text: 'Open map', onPress: () => openMapPicker(true) }],
    );
  }, [
    onClose,
    currentAddress,
    refreshCurrentLocation,
    setDeliveryLocation,
    openMapPicker,
  ]);

  const gpsPreview = currentAddress?.formatted_address
    || (loadingLocation ? 'Detecting your location...' : 'Enable GPS to detect location');

  const gpsSubtext = currentAddress
    ? [currentAddress.city, currentAddress.state, currentAddress.zipcode]
      .filter(Boolean)
      .join(', ')
    : 'Tap to use GPS for delivery';

  return (
    <CustomBottomSheet visible={visible} onClose={onClose}>
      <TouchableOpacity
        style={styles.gpsCard}
        activeOpacity={0.85}
        onPress={useCurrentLocation}
      >
        <View style={styles.gpsIcon}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color={Colors.primaryColor} />
          ) : (
            <TablerIcon name="current-location" size={22} color={Colors.primaryColor} />
          )}
        </View>
        <View style={styles.gpsText}>
          <View style={styles.gpsTitleRow}>
            <Text style={styles.gpsTitle}>Use current location</Text>
            <View style={styles.gpsBadge}>
              <Text style={styles.gpsBadgeText}>GPS</Text>
            </View>
          </View>
          <Text style={styles.gpsAddress} numberOfLines={2}>
            {gpsPreview}
          </Text>
          {!!gpsSubtext && (
            <Text style={styles.gpsSub} numberOfLines={1}>
              {gpsSubtext}
            </Text>
          )}
        </View>
        <TablerIcon name="chevron-right" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addCard}
        activeOpacity={0.85}
        onPress={openAddAddressForm}
      >
        <View style={styles.addIcon}>
          <TablerIcon name="plus" size={20} color={Colors.primaryColor} />
        </View>
        <View style={styles.addText}>
          <Text style={styles.addTitle}>Add new address</Text>
          <Text style={styles.addSub}>Enter manually or pick on map inside form</Text>
        </View>
        <TablerIcon name="chevron-right" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <View style={styles.savedHeader}>
        <Text style={styles.savedTitle}>
          Saved Addresses {savedAddresses.length > 0 ? `(${savedAddresses.length})` : ''}
        </Text>
        {addressCount > 2 && onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      {savedAddresses.length === 0 ? (
        <View style={styles.emptyBox}>
          <TablerIcon name="map-pin" size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>No saved addresses yet</Text>
          <Text style={styles.emptySub}>
            Add your first address using GPS or map pin
          </Text>
        </View>
      ) : (
        savedAddresses.map(item => {
          const fullAddress = `${item?.address_line_1 || ''}, ${item?.city || ''}, ${item?.state || ''} ${item?.zipcode || ''}`;
          const isSelected = item?.is_default;
          return (
            <TouchableOpacity
              key={item?.id}
              style={[styles.savedCard, isSelected && styles.savedCardActive]}
              activeOpacity={0.8}
              onPress={() => onSelectAddress(item)}
            >
              <View style={styles.savedIcon}>
                <TablerIcon
                  name={item?.address_type === 'office' ? 'briefcase' : 'home'}
                  size={20}
                  color={Colors.primaryColor}
                />
              </View>
              <View style={styles.savedInfo}>
                <Text style={styles.savedName}>
                  {item?.address_type_name || item?.address_type}
                </Text>
                <Text style={styles.savedAddr} numberOfLines={2}>
                  {fullAddress}
                </Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioActive]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </CustomBottomSheet>
  );
};

export default LocationBottomSheet;

const styles = StyleSheet.create({
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
    gap: 12,
  },
  gpsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.BGIcon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsText: { flex: 1 },
  gpsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gpsTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  gpsBadge: {
    backgroundColor: Colors.BGIcon,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gpsBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  gpsAddress: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
    color: '#334155',
    lineHeight: 18,
  },
  gpsSub: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    marginTop: 2,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { flex: 1 },
  addTitle: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  addSub: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 2,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savedTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#64748B',
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  savedCardActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F8FFFB',
  },
  savedIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.BGIcon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedInfo: { flex: 1 },
  savedName: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  savedAddr: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: Colors.primaryColor },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryColor,
  },
});
