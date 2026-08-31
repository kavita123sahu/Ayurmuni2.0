import React, { useState } from 'react';
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
import { HOME_SECTION_GAP } from '../constants/layout';
import BackIconButton from './BackIconButton';

export const SEARCH_SECTION_GAP = HOME_SECTION_GAP;

interface Props {
  placeholder?: string;
  icon?: ImageSourcePropType;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  compact?: boolean;
  containerStyle?: ViewStyle;
  showFilterIcon?: boolean;
  showMicIcon?: boolean;
  autoFocus?: boolean;
  onFilterPress?: () => void;
  onMicPress?: () => void;
  filterActive?: boolean;
}

export const SearchIconButton = ({
  onPress,
  active = false,
  size = 40,
}: {
  onPress: () => void;
  active?: boolean;
  size?: number;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      styles.iconButton,
      { width: size, height: size, borderRadius: size / 2 - 4 },
      active && styles.iconButtonActive,
    ]}
  >
    <TablerIcon
      name="search"
      size={20}
      color={active ? Colors.primaryColor : '#64748B'}
    />
  </TouchableOpacity>
);

type ExpandableSearchProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onNavigate?: () => void;
  showFilterIcon?: boolean;
  onFilterPress?: () => void;
  filterActive?: boolean;
  containerStyle?: ViewStyle;
  /** Hide inline icon — expand from header search button instead */
  showTrigger?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export const ExpandableSearch: React.FC<ExpandableSearchProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onNavigate,
  showFilterIcon,
  onFilterPress,
  filterActive,
  containerStyle,
  showTrigger = true,
  expanded: expandedProp,
  onExpandedChange,
}) => {
  const [expandedInternal, setExpandedInternal] = useState(false);
  const expanded = expandedProp ?? expandedInternal;

  const setExpanded = (next: boolean) => {
    if (expandedProp === undefined) {
      setExpandedInternal(next);
    }
    onExpandedChange?.(next);
  };

  const closeSearch = () => {
    setExpanded(false);
    onChangeText('');
  };

  if (onNavigate) {
    return (
      <View style={[styles.searchSection, containerStyle]}>
        <SearchIconButton onPress={onNavigate} />
      </View>
    );
  }

  if (!expanded) {
    if (!showTrigger) {
      return null;
    }

    return (
      <View style={[styles.searchSection, containerStyle]}>
        <SearchIconButton onPress={() => setExpanded(true)} active={!!value} />
        {showFilterIcon ? (
          <TouchableOpacity
            style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
            onPress={onFilterPress}
            activeOpacity={0.85}
          >
            <TablerIcon name="filter" size={18} color={Colors.primaryColor} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.searchSection, styles.searchSectionExpanded, containerStyle]}>
      <View style={styles.expandedWrap}>
        <SearchBar
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          autoFocus
          compact
          showFilterIcon={showFilterIcon}
          onFilterPress={onFilterPress}
          filterActive={filterActive}
          containerStyle={styles.expandedField}
        />
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={closeSearch}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <TablerIcon name="x" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchBar: React.FC<Props> = ({
  placeholder = 'Search...',
  icon,
  value,
  onChangeText,
  onPress,
  compact = false,
  containerStyle,
  showFilterIcon = false,
  showMicIcon = false,
  autoFocus = false,
  onFilterPress,
  onMicPress,
  filterActive = false,
}) => {
  const content = (
    <View
      style={[styles.container, compact && styles.compact, containerStyle]}
    >
      {icon ? (
        <Image source={icon} style={styles.icon} />
      ) : (
        <TablerIcon name="search" size={compact ? 16 : 17} color="#94A3B8" />
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={[styles.input, compact && styles.inputCompact]}
        value={value}
        onChangeText={onChangeText}
        editable={!onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
        autoFocus={autoFocus}
        returnKeyType="search"
      />

      {!onPress && !!value?.length && onChangeText ? (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
          accessibilityLabel="Clear search"
        >
          <TablerIcon name="x" size={compact ? 14 : 15} color="#64748B" />
        </TouchableOpacity>
      ) : null}

      {showMicIcon ? (
        <TouchableOpacity
          style={styles.trailing}
          onPress={onMicPress ?? onPress}
          activeOpacity={0.85}
          disabled={!onMicPress && !onPress}
        >
          <TablerIcon name="mic" size={16} color={Colors.primaryColor} />
        </TouchableOpacity>
      ) : null}

      {showFilterIcon ? (
        <TouchableOpacity
          style={[styles.trailing, filterActive && styles.trailingActive]}
          onPress={onFilterPress}
          activeOpacity={0.85}
          disabled={!onFilterPress}
        >
          <TablerIcon name="filter" size={16} color={Colors.primaryColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

/** Search screen top bar: back + search field (no title header). */
export const SearchScreenHeader = ({
  onBack,
  placeholder,
  value,
  onChangeText,
  autoFocus = true,
}: {
  onBack: () => void;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}) => (
  <View style={styles.searchScreenHeader}>
    <BackIconButton onPress={onBack} />
    <SearchBar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      showMicIcon
      containerStyle={styles.searchScreenField}
    />
  </View>
);

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  compact: {
    height: 44,
    borderRadius: 12,
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
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailing: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8EEF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconButtonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primaryColor,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SEARCH_SECTION_GAP,
  },
  searchSectionExpanded: {
    marginBottom: SEARCH_SECTION_GAP,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primaryColor,
  },
  expandedWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedField: {
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  searchScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.headerBackground,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  searchScreenField: {
    flex: 1,
  },
});
