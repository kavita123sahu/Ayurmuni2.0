import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import TablerIcon from './TablerIcon';
import CartBadge from './CartBadge';
import { useCartCount } from '../hooks/Cart';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADDRESS_UPDATED, AddressEvents } from '../common/Utils';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import * as _PROFILE_SERVICES from '../services/ProfileServices';
import LocationBottomSheet from './LocationBottomSheet';
import { useHomeData } from '../hooks/UseHomeData';
import { requireAuth } from '../services/guestAuth';
import { useLocation } from '../context/LocationContext';
import { savedAddressToParsed } from '../services/locationService';
import { useAppDispatch } from '../store/hooks';
import { fetchCart } from '../store/slices/cartSlice';
import { useUnreadNotificationCount } from '../hooks/useNotification';
import { DOSHA } from './Questionnaire/PrakritiQuestTheme';
import { shouldRunThrottled } from '../utils/fetchThrottle';

interface AddressItem {
  id: string;
  type?: string;
  is_default: boolean;
  address_type: string;
  address_type_name: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

type Props = {
  progress1?: number;
  progress2?: number;
};

const AVATAR = 36;
const RING = 42;
const STROKE = 2.5;

const resolvePrakritiName = (customer: any, fallback?: string) => {
  const raw =
    customer?.prakriti_type ||
    customer?.prakriti_result ||
    customer?.prakriti_name ||
    customer?.prakriti ||
    customer?.result ||
    customer?.dosha_type ||
    customer?.dominant_prakriti ||
    fallback ||
    '';
  return String(raw).trim();
};

const normalizePrakritiKey = (name: string) =>
  name
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');

const getPrakritiTheme = (name: string) => {
  const key = name.toLowerCase();
  if (key.includes('vata') && key.includes('pitta')) {
    return { color: DOSHA.pitta.color, soft: '#FFF8EF', imageKey: 'Vata-Pitta' };
  }
  if (key.includes('pitta') && key.includes('kapha')) {
    return { color: DOSHA.pitta.color, soft: DOSHA.pitta.soft, imageKey: 'Pitta-Kapha' };
  }
  if (key.includes('vata') && key.includes('kapha')) {
    return { color: DOSHA.vata.color, soft: DOSHA.vata.soft, imageKey: 'Vata-Kapha' };
  }
  if (
    key.includes('tridosha') ||
    (key.includes('vata') && key.includes('pitta') && key.includes('kapha'))
  ) {
    return { color: Colors.primaryColor, soft: '#ECFDF5', imageKey: 'Tridosha' };
  }
  if (key.includes('vata')) {
    return { color: DOSHA.vata.color, soft: DOSHA.vata.soft, imageKey: 'Vata' };
  }
  if (key.includes('pitta')) {
    return { color: DOSHA.pitta.color, soft: DOSHA.pitta.soft, imageKey: 'Pitta' };
  }
  if (key.includes('kapha')) {
    return { color: DOSHA.kapha.color, soft: DOSHA.kapha.soft, imageKey: 'Kapha' };
  }
  return { color: Colors.primaryColor, soft: '#ECFDF5', imageKey: '' };
};

const ProgressRing = ({
  progress,
  color,
  children,
}: {
  progress: number;
  color: string;
  children: React.ReactNode;
}) => {
  const size = RING;
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8EEF0"
          strokeWidth={STROKE}
          fill="none"
        />
        <G rotation="-90" originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.ringInner}>{children}</View>
    </View>
  );
};

const HomeHeader = ({ progress1 = 0 }: Props) => {
  const navigation = useNavigation<any>();
  const stackNavigation = navigation.getParent?.() || navigation;
  const dispatch = useAppDispatch();
  const cartCount = useCartCount();
  const { unreadCount } = useUnreadNotificationCount();
  const [localAddresses, setLocalAddresses] = useState<AddressItem[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [prakritiResultName, setPrakritiResultName] = useState('');

  const { customerData, fetchCustomerData } = useHomeData();
  const { currentAddress, loadingLocation, setDeliveryLocation } = useLocation();

  const savedAddresses = localAddresses || [];

  const defaultAddress = useMemo(
    () => savedAddresses.find(item => item?.is_default) || savedAddresses[0] || null,
    [savedAddresses],
  );

  const activeLocation = useMemo(() => {
    if (defaultAddress) {
      return savedAddressToParsed(defaultAddress);
    }
    return currentAddress;
  }, [defaultAddress, currentAddress]);

  const shortAddress = useMemo(() => {
    if (defaultAddress) {
      const line =
        defaultAddress.address_line_1 ||
        (defaultAddress as any).address ||
        defaultAddress.address_type_name ||
        defaultAddress.address_type ||
        '';
      const city = defaultAddress.city || '';
      const text = [line, city].filter(Boolean).join(', ');
      return (text || 'Saved address').slice(0, 40);
    }
    if (loadingLocation && !activeLocation) {
      return 'Detecting location...';
    }
    if (!activeLocation) {
      return 'Select location';
    }
    const area =
      activeLocation.address_line_1 ||
      activeLocation.city ||
      activeLocation.formatted_address ||
      '';
    const suffix =
      activeLocation.city && area !== activeLocation.city
        ? `, ${activeLocation.city}`
        : activeLocation.state
          ? `, ${activeLocation.state}`
          : '';
    return `${area}${suffix}`.slice(0, 40);
  }, [activeLocation, defaultAddress, loadingLocation]);

  const prakritiProgress = Math.max(
    0,
    Math.min(100, Math.round(Number(progress1) || 0)),
  );
  const isPrakritiComplete = prakritiProgress >= 100;

  const prakritiName = useMemo(() => {
    const fromCustomer = resolvePrakritiName(customerData, prakritiResultName);
    return fromCustomer ? normalizePrakritiKey(fromCustomer) : '';
  }, [customerData, prakritiResultName]);

  const theme = useMemo(
    () => getPrakritiTheme(prakritiName || 'vata'),
    [prakritiName],
  );

  const locationSubtext =
    isPrakritiComplete && prakritiName
      ? prakritiName
      : isPrakritiComplete
        ? 'Your Prakriti'
        : 'Deliver to';

  const profileImage = customerData?.profile_picture || '';
  const firstLetter = customerData?.first_name?.charAt(0)?.toUpperCase() || '';
  const addressCount = customerData?.addresses?.length || 0;

  useFocusEffect(
    useCallback(() => {
      if (shouldRunThrottled('home-header-focus', 45_000)) {
        fetchCustomerData(false);
        dispatch(fetchCart(false));
      }
    }, [fetchCustomerData, dispatch]),
  );

  useEffect(() => {
    const onAddressUpdated = () => {
      fetchCustomerData();
    };
    const subscription = AddressEvents.addListener(
      ADDRESS_UPDATED,
      onAddressUpdated,
    );
    return () => {
      subscription.remove();
    };
  }, [fetchCustomerData]);

  useEffect(() => {
    if (customerData?.addresses) {
      setLocalAddresses(customerData.addresses);
    }
  }, [customerData]);

  useEffect(() => {
    let cancelled = false;
    const loadPrakritiName = async () => {
      if (!isPrakritiComplete) return;
      if (resolvePrakritiName(customerData)) return;
      try {
        const res: any = await _PROFILE_SERVICES.get_prakriti_info();
        const name = resolvePrakritiName(res?.data, res?.data?.result);
        if (!cancelled && name) {
          setPrakritiResultName(name);
        }
      } catch {
        // ignore
      }
    };
    loadPrakritiName();
    return () => {
      cancelled = true;
    };
  }, [isPrakritiComplete, customerData]);

  const UpdateDefaultAddress = useCallback(
    async (item: AddressItem) => {
      if (item?.is_default) return;

      const previousAddresses = [...localAddresses];
      setLocalAddresses(prev =>
        prev.map(address => ({
          ...address,
          is_default: address.id === item.id,
        })),
      );
      try {
        const res: any = await _PROFILE_SERVICES.UpdateAddresses(item.id, {
          is_default: true,
        });

        if (res?.success || res?.status === 200) {
          setShowSheet(false);
          await setDeliveryLocation(savedAddressToParsed(item));
          await fetchCustomerData();
          AddressEvents.emit(ADDRESS_UPDATED, res);
        }
      } catch (error) {
        setLocalAddresses(previousAddresses);
        console.log('DEFAULT_ADDRESS_ERROR', error);
      }
    },
    [fetchCustomerData, setDeliveryLocation, localAddresses],
  );

  const openProfile = useCallback(() => {
    stackNavigation.navigate('TabStack', { screen: 'Profile' });
  }, [stackNavigation]);

  const openPrakriti = useCallback(() => {
    if (isPrakritiComplete) {
      stackNavigation.navigate('PrakritiProfile');
      return;
    }
    stackNavigation.navigate('PatientFAQ', { allowBack: true });
  }, [isPrakritiComplete, stackNavigation]);

  const openLocationSheet = useCallback(() => {
    setShowSheet(true);
  }, []);

  const ringColor = isPrakritiComplete
    ? theme.color
    : prakritiProgress > 0
      ? Colors.primaryColor
      : '#CBD5E1';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.avatarPress}
            onPress={openProfile}
            activeOpacity={0.85}
          >
            <ProgressRing progress={prakritiProgress} color={ringColor}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[
                    styles.profileFallback,
                    isPrakritiComplete && { backgroundColor: theme.color },
                  ]}
                >
                  <Text style={styles.profileText}>{firstLetter || 'A'}</Text>
                </View>
              )}
            </ProgressRing>

            {!isPrakritiComplete ? (
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{prakritiProgress}%</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationContainer}
            onPress={openLocationSheet}
            activeOpacity={0.85}
          >
            <TouchableOpacity
              onPress={isPrakritiComplete ? openPrakriti : openLocationSheet}
              activeOpacity={0.85}
              hitSlop={{ top: 4, bottom: 2, left: 0, right: 0 }}
            >
              <Text
                style={[
                  styles.locationLabel,
                  isPrakritiComplete && { color: theme.color },
                ]}
                numberOfLines={1}
              >
                {locationSubtext}
              </Text>
            </TouchableOpacity>

            <View style={styles.locationRow}>
              <Text
                style={styles.locationText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {shortAddress}
              </Text>
              <TablerIcon name="chevron-down" size={14} color="#0F172A" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => stackNavigation.navigate('MyCart')}
            activeOpacity={0.8}
          >
            <TablerIcon
              name="shopping-cart"
              size={18}
              color={Colors.primaryColor}
            />
            <CartBadge count={cartCount} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={async () => {
              if (await requireAuth('Please login to view notifications')) {
                stackNavigation.navigate('Notifications');
              }
            }}
          >
            <TablerIcon name="bell" size={18} color="#0F172A" />
            <CartBadge count={unreadCount} />
          </TouchableOpacity>
        </View>
      </View>

      <LocationBottomSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        currentAddress={currentAddress}
        loadingLocation={loadingLocation}
        savedAddresses={savedAddresses}
        addressCount={addressCount}
        onSelectAddress={UpdateDefaultAddress}
        onViewAll={() => {
          setShowSheet(false);
          stackNavigation.navigate('ManageAdrees');
        }}
      />
    </View>
  );
};

export default React.memo(HomeHeader);

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: RING,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  avatarPress: {
    width: RING,
    height: RING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringWrap: {
    width: RING,
    height: RING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  ringInner: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR / 2,
    resizeMode: 'cover',
  },
  profileFallback: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  percentBadge: {
    position: 'absolute',
    right: -4,
    bottom: -1,
    minWidth: 24,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.primaryColor,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 8,
    lineHeight: 10,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  locationContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    gap: 2,
    minWidth: 0,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  locationText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    flexShrink: 1,
    includeFontPadding: false,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 11,
    backgroundColor: '#F4F7F6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8E6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
});
