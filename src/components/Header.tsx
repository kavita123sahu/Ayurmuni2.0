import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon, { TablerIconName } from './TablerIcon';
import BackIconButton from './BackIconButton';
import CartBadge from './CartBadge';
import { useCartCount } from '../hooks/Cart';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: ImageSourcePropType;
  onSearchPress?: () => void;
  onRefreshPress?: () => void;
  refreshing?: boolean;
  rightIconName?: TablerIconName;
  onRightPress?: () => void;
  /** Homepage-style cart icon with badge */
  showCart?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  onSearchPress,
  onRefreshPress,
  refreshing = false,
  rightIconName,
  onRightPress,
  showCart = false,
}) => {
  const navigation = useNavigation<any>();
  const cartCount = useCartCount();
  const stackNavigation = navigation.getParent?.() || navigation;

  const hasRightActions = !!(
    onSearchPress ||
    onRefreshPress ||
    rightIconName ||
    showCart
  );

  return (
    <View style={styles.shell}>
      <View style={styles.row}>
        {onBack ? (
          <BackIconButton onPress={onBack} />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {hasRightActions ? (
          <View style={styles.rightActions}>
            {onSearchPress ? (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onSearchPress}
                activeOpacity={0.75}
              >
                <TablerIcon name="search" size={20} color={Colors.primaryColor} />
              </TouchableOpacity>
            ) : null}
            {onRefreshPress ? (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onRefreshPress}
                activeOpacity={0.75}
                disabled={refreshing}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={Colors.primaryColor} />
                ) : (
                  <TablerIcon name="refresh" size={20} color={Colors.primaryColor} />
                )}
              </TouchableOpacity>
            ) : null}
            {rightIconName ? (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onRightPress}
                activeOpacity={0.75}
              >
                <TablerIcon
                  name={rightIconName}
                  size={20}
                  color={Colors.primaryColor}
                />
              </TouchableOpacity>
            ) : null}
            {showCart ? (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => stackNavigation.navigate('MyCart')}
                activeOpacity={0.75}
              >
                <TablerIcon
                  name="shopping-cart"
                  size={20}
                  color={Colors.primaryColor}
                />
                <CartBadge count={cartCount} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  shell: {
    backgroundColor: Colors.headerBackground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
});
