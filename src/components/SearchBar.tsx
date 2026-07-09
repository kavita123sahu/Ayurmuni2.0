import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';

interface Props {
  placeholder?: string;
  icon?: ImageSourcePropType;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  compact?: boolean;
  containerStyle?: ViewStyle;
}

const SearchBar: React.FC<Props> = ({
  placeholder = 'Search...',
  icon,
  value,
  onChangeText,
  onPress,
  compact = false,
  containerStyle,
}) => {
  const content = (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        containerStyle,
      ]}
    >
      {icon ? (
        <Image source={icon} style={styles.icon} />
      ) : (
        <TablerIcon name="search" size={compact ? 18 : 20} color="#64748B" />
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={[styles.input, compact && styles.inputCompact]}
        value={value}
        onChangeText={onChangeText}
        editable={!onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
      />

      <View style={styles.trailing}>
        <TablerIcon name="filter" size={16} color={Colors.primaryColor} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDF2',
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  compact: {
    height: 46,
    borderRadius: 12,
    marginVertical: 0,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    fontSize: 14,
    minWidth: 0,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  inputCompact: {
    fontSize: 13,
  },
  trailing: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.BGIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
