import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon, { TablerIconName } from './TablerIcon';
import BackIconButton from './BackIconButton';

type Props = {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  onSearchPress?: () => void;
  onRefreshPress?: () => void;
  /** Extra action shown to the left of the primary right icon (e.g. wishlist) */
  onSecondaryRightPress?: () => void;
  useLocalBackIcon?: boolean;
  leftIconName?: TablerIconName;
  rightIconName?: TablerIconName;
  rightIconColor?: string;
  secondaryRightIconName?: TablerIconName;
  secondaryRightIconColor?: string;
  rightLabel?: string;
  /** Custom right-side content (e.g. Mark all / Clear) */
  rightContent?: ReactNode;
};

const AppHeader: React.FC<Props> = ({
  title,
  onLeftPress,
  onRightPress,
  onSearchPress,
  onSecondaryRightPress,
  rightIconName,
  rightIconColor,
  secondaryRightIconName,
  secondaryRightIconColor,
  rightLabel,
  rightContent,
}) => {
  const hasRightActions = Boolean(
    onSearchPress || rightIconName || secondaryRightIconName,
  );

  return (
    <View style={styles.shell}>
      <View style={styles.container}>
        {onLeftPress ? (
          <BackIconButton onPress={onLeftPress} />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title || ' '}
        </Text>

        {rightContent ? (
          <View style={styles.rightContent}>{rightContent}</View>
        ) : rightLabel ? (
          <TouchableOpacity onPress={onRightPress} style={styles.labelBox}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rightActions}>
            {onSearchPress ? (
              <TouchableOpacity onPress={onSearchPress} style={styles.iconBox}>
                <TablerIcon name="search" size={22} color={Colors.primaryColor} />
              </TouchableOpacity>
            ) : null}
            {secondaryRightIconName ? (
              <TouchableOpacity
                onPress={onSecondaryRightPress}
                style={styles.iconBox}
                disabled={!onSecondaryRightPress}
              >
                <TablerIcon
                  name={secondaryRightIconName}
                  size={22}
                  color={secondaryRightIconColor || Colors.primaryColor}
                />
              </TouchableOpacity>
            ) : null}
            {rightIconName ? (
              <TouchableOpacity onPress={onRightPress} style={styles.iconBox}>
                <TablerIcon
                  name={rightIconName}
                  size={22}
                  color={rightIconColor || Colors.primaryColor}
                />
              </TouchableOpacity>
            ) : !hasRightActions ? (
              <View style={styles.iconPlaceholder} />
            ) : null}
          </View>
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  shell: {
    backgroundColor: Colors.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E6',
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '48%',
  },
  labelBox: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  rightLabel: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
    marginHorizontal: 10,
  },
  divider: {
    height: 0,
  },
});
