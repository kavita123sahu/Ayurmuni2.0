import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';
import {
  TAB_BAR_BOTTOM_OFFSET,
  TAB_BAR_HEIGHT,
  TAB_CART_FAB_SIZE,
  TAB_CONSULT_FAB_SIZE,
} from '../constants/layout';
import { useCartCount } from '../hooks/Cart';

const { width } = Dimensions.get('window');
const scale = Math.min(width / 400, 1);

const BAR_HEIGHT = TAB_BAR_HEIGHT * scale;
const CART_SIZE = TAB_CART_FAB_SIZE * scale;
const CONSULT_SIZE = TAB_CONSULT_FAB_SIZE * scale;

const TAB_ICONS: Record<string, TablerIconName> = {
  Home: 'home',
  Products: 'package',
  // Medicine: 'pill',
  Consult: 'file-medical',
  Profile: 'user',
};

const LEFT_TABS = ['Home', 'Products'] as const;
const RIGHT_TABS = ['Consult', 'Profile'] as const;

type SideTab = (typeof LEFT_TABS)[number] | (typeof RIGHT_TABS)[number];

const CustomeTab = (props: any) => {
  const { state, navigation } = props;
  const insets = useSafeAreaInsets();
  const cartCount = useCartCount();
  const stackNavigation = navigation.getParent?.() || navigation;
  const bottomPad = Math.max(insets.bottom || 0, 8) + TAB_BAR_BOTTOM_OFFSET;

  const activeName = state.routes[state.index]?.name as string;
  const isCartActive = activeName === 'MyCart';
  const isConsultActive = activeName === 'Consult';

  const routeByName = useMemo(() => {
    const map: Record<string, any> = {};
    state.routes.forEach((route: any) => {
      map[route.name] = route;
    });
    return map;
  }, [state.routes]);

  const renderSideTab = (name: SideTab) => {
    const route = routeByName[name];
    if (!route) return null;

    const isFocused = activeName === name;
    const iconName = TAB_ICONS[name] ?? 'home';
    const color = isFocused ? Colors.primaryColor : '#94A3B8';

    return (
      <TouchableOpacity
        key={route.key}
        onPress={() => navigation.navigate(name)}
        style={styles.sideTab}
        activeOpacity={0.75}
      >
        <View style={[styles.iconCircle, isFocused && styles.iconCircleActive]}>
          <TablerIcon name={iconName} size={20} color={color} />
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.sideLabel,
            {
              color,
              fontFamily: isFocused
                ? Fonts.PoppinsSemiBold
                : Fonts.PoppinsMedium,
            },
          ]}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.wrapper, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      {/* Only cover the safe-area strip under the pill — not a tall empty band */}
      <View style={[styles.backdrop, { height: bottomPad + 8 }]} />

      <View style={styles.row}>
        <View style={styles.barWrap}>
          <View style={styles.bar}>
            <View style={styles.sideGroup}>{LEFT_TABS.map(renderSideTab)}</View>
            <View style={styles.centerGap} />
            <View style={styles.sideGroup}>{RIGHT_TABS.map(renderSideTab)}</View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyCart')}
            activeOpacity={0.88}
            style={[
              styles.cartFab,
              { bottom: BAR_HEIGHT / 2 - CART_SIZE / 2 + 12 },
              isCartActive && styles.cartFabActive,
            ]}
          >
            <TablerIcon name="shopping-cart" size={22} color="#FFFFFF" />
            {cartCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : String(cartCount)}
                </Text>
              </View>
            ) : (
              <View style={styles.plusHint}>
                <TablerIcon name="plus" size={10} color={Colors.primaryColor} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
          onPress={() => stackNavigation.navigate('ConsultScreen')}
          activeOpacity={0.85}
          style={[
            styles.consultFab,
            isConsultActive && styles.consultFabActive,
          ]}
        >
          <TablerIcon name="stethoscope" size={20} color="#fff" />
          <Text style={styles.consultLabel}>Consult</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default CustomeTab;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 16,
    paddingHorizontal: 10,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    //  backgroundColor: '#868633',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  barWrap: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    overflow: 'visible',
    // shadowColor: '#0F172A',
    // shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  centerGap: {
    width: CART_SIZE + 8,
  },
  sideTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: 'rgba(13, 97, 78, 0.14)',
    borderRadius: 18,
  },
  sideLabel: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  cartFab: {
    position: 'absolute',
    alignSelf: 'center',
    width: CART_SIZE,
    height: CART_SIZE,
    borderRadius: CART_SIZE / 2,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: Colors.primaryColor,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
    zIndex: 2,
  },
  cartFabActive: {
    backgroundColor: '#0A4F40',
  },
  consultFab: {
    width: CONSULT_SIZE,
    height: CONSULT_SIZE,
    borderRadius: CONSULT_SIZE / 2,
    marginLeft: 8,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primaryColor,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  consultFabActive: {
    backgroundColor: '#0A4F40',
  },
  consultLabel: {
    color: '#fff',
    fontSize: 9 * scale,
    marginTop: 2,
    fontFamily: Fonts.PoppinsMedium,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  plusHint: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
