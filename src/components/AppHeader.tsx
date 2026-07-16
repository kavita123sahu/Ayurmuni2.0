import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import TablerIcon, { TablerIconName } from './TablerIcon';

type Props = {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  useLocalBackIcon?: boolean;
  leftIconName?: TablerIconName;
  rightIconName?: TablerIconName;
  rightLabel?: string;
};

const AppHeader: React.FC<Props> = ({
  title,
  onLeftPress,
  onRightPress,
  useLocalBackIcon = true,
  leftIconName = 'arrow-left',
  rightIconName,
  rightLabel,
}) => {
  return (
    <View style={styles.shell}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={onLeftPress}
          style={styles.iconBox}
          disabled={!onLeftPress}
        >
          {onLeftPress ? (
            useLocalBackIcon ? (
              <Image source={Images.backIcon} style={styles.backImage} />
            ) : (
              <TablerIcon name={leftIconName} size={22} color={Colors.primaryColor} />
            )
          ) : null}
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {title || ' '}
        </Text>

        {rightLabel ? (
          <TouchableOpacity onPress={onRightPress} style={styles.labelBox}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : rightIconName ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBox}>
            <TablerIcon name={rightIconName} size={22} color={Colors.primaryColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  shell: {
    // backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 12,
    marginTop: 6,
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
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
});
