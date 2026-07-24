import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { BUTTON, RADIUS, SPACING, TYPO } from '../constants/responsive';

export type SegmentTabItem = {
  key: string;
  label: string;
};

type Props = {
  tabs: SegmentTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'pill' | 'underline';
  style?: ViewStyle;
};

const SegmentTabs: React.FC<Props> = ({
  tabs,
  activeKey,
  onChange,
  variant = 'pill',
  style,
}) => {
  if (variant === 'underline') {
    return (
      <View style={[styles.underlineWrap, style]}>
        {tabs.map(tab => {
          const active = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.underlineItem}
              activeOpacity={0.75}
              onPress={() => onChange(tab.key)}
            >
              <Text
                style={[styles.underlineText, active && styles.underlineTextActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {active ? <View style={styles.underlineIndicator} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.pillWrap, style]}>
      {tabs.map((tab, index) => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.75}
            onPress={() => onChange(tab.key)}
            style={[
              styles.pillItem,
              active && styles.pillItemActive,
              index < tabs.length - 1 && styles.pillItemGap,
            ]}
          >
            <Text
              style={[styles.pillText, active && styles.pillTextActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default React.memo(SegmentTabs);

const styles = StyleSheet.create({
  pillWrap: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pillItem: {
    flex: 1,
    minHeight: BUTTON.heightSm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: '#FFFFFF',
  },
  pillItemGap: {
    marginRight: SPACING.sm,
  },
  pillItemActive: {
    backgroundColor: '#065F46',
    borderColor: '#065F46',
  },
  pillText: {
    fontSize: TYPO.tab,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    textAlign: 'center',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  underlineWrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginTop: SPACING.xs,
  },
  underlineItem: {
    flex: 1,
    minHeight: BUTTON.heightSm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  underlineText: {
    fontSize: TYPO.md,
    color: '#999',
    fontFamily: Fonts.PoppinsMedium,
  },
  underlineTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primaryColor,
    borderRadius: 2,
  },
});
