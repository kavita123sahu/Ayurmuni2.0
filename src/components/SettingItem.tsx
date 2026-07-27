import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '../common/Vector';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import CustomToggle from './CustomToggle';
import TablerIcon, { TablerIconName } from './TablerIcon';

export type SettingItemData = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconName?: TablerIconName;
  type: 'arrow' | 'toggle';
  value?: boolean;
  screen?: string;
  onPress?: () => void;
};

type Props = {
  item: SettingItemData;
  navigation?: any;
  enabled?: boolean;
  onToggle?: (value: boolean) => void;
};

const SettingItem = ({ item, navigation, enabled = false, onToggle }: Props) => {
  const handlePress = () => {
    if (item.type !== 'arrow') {
      return;
    }

    if (item.onPress) {
      item.onPress();
      return;
    }

    if (item.screen && navigation?.navigate) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={item.type === 'arrow' ? 0.7 : 1}
      onPress={handlePress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.iconBox}>
        {item.icon ? (
          item.icon
        ) : item.iconName ? (
          <TablerIcon name={item.iconName} size={20} color={Colors.primaryColor} />
        ) : null}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
      </View>

      {item.type === 'arrow' && (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      )}

      {item.type === 'toggle' && (
        <CustomToggle
          value={enabled}
          onToggle={() => onToggle?.(!enabled)}
        />
      )}
    </TouchableOpacity>
  );
};

export default SettingItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F3F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
    marginBottom: -5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsRegular,
  },
});
