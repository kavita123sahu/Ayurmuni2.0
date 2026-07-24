import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import TablerIcon from './TablerIcon';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import {
  PRODUCT_SORT_OPTIONS,
  PRICE_RANGE_OPTIONS,
  ProductSortKey,
  PriceRangeKey,
  getSortLabel,
} from '../utils/productSearchUtils';

type Props = {
  sortBy: ProductSortKey;
  onSortChange: (key: ProductSortKey) => void;
  brandName: string | null;
  onBrandChange: (brand: string | null) => void;
  priceRange: PriceRangeKey;
  onPriceRangeChange: (key: PriceRangeKey) => void;
  brands: string[];
  activeFilterCount: number;
  onClearFilters: () => void;
};

const ProductSearchFilterBar: React.FC<Props> = ({
  sortBy,
  onSortChange,
  brandName,
  onBrandChange,
  priceRange,
  onPriceRangeChange,
  brands,
  activeFilterCount,
  onClearFilters,
}) => {
  const [sheet, setSheet] = useState<'sort' | 'brand' | 'price' | null>(null);

  const closeSheet = () => setSheet(null);

  const priceLabel =
    PRICE_RANGE_OPTIONS.find(option => option.key === priceRange)?.label ?? 'Price';

  const sortActive = sortBy !== 'relevance';
  const brandActive = !!brandName;
  const priceActive = priceRange !== 'all';
  const filtersActive = activeFilterCount > 0;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <FilterChip
          label="Sort"
          selectedText={sortActive ? getSortLabel(sortBy) : undefined}
          icon="list"
          active={sortActive}
          onPress={() => setSheet('sort')}
        />
        <FilterChip
          label="Brand"
          selectedText={brandActive ? brandName ?? undefined : undefined}
          icon="package"
          active={brandActive}
          onPress={() => setSheet('brand')}
        />
        <FilterChip
          label="Price"
          selectedText={priceActive ? priceLabel : undefined}
          icon="cash"
          active={priceActive}
          onPress={() => setSheet('price')}
        />
        <FilterChip
          label="Filters"
          selectedText={filtersActive ? String(activeFilterCount) : undefined}
          icon="filter"
          active={filtersActive}
          onPress={() => {
            if (filtersActive) {
              onClearFilters();
            }
          }}
        />
      </ScrollView>

      <Modal visible={sheet !== null} transparent animationType="fade" onRequestClose={closeSheet}>
        <Pressable style={styles.overlay} onPress={closeSheet}>
          <Pressable style={styles.sheet} onPress={() => { }}>
            {sheet === 'sort' && (
              <>
                <Text style={styles.sheetTitle}>Sort by</Text>
                {PRODUCT_SORT_OPTIONS.map(option => (
                  <OptionRow
                    key={option.key}
                    label={option.label}
                    selected={sortBy === option.key}
                    onPress={() => {
                      onSortChange(option.key);
                      closeSheet();
                    }}
                  />
                ))}
              </>
            )}

            {sheet === 'brand' && (
              <>
                <Text style={styles.sheetTitle}>Brand</Text>
                <OptionRow
                  label="All brands"
                  selected={!brandName}
                  onPress={() => {
                    onBrandChange(null);
                    closeSheet();
                  }}
                />
                {brands.map(brand => (
                  <OptionRow
                    key={brand}
                    label={brand}
                    selected={brandName === brand}
                    onPress={() => {
                      onBrandChange(brand);
                      closeSheet();
                    }}
                  />
                ))}
              </>
            )}

            {sheet === 'price' && (
              <>
                <Text style={styles.sheetTitle}>Price range</Text>
                {PRICE_RANGE_OPTIONS.map(option => (
                  <OptionRow
                    key={option.key}
                    label={option.label}
                    selected={priceRange === option.key}
                    onPress={() => {
                      onPriceRangeChange(option.key);
                      closeSheet();
                    }}
                  />
                ))}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const FilterChip = ({
  label,
  selectedText,
  icon,
  active,
  onPress,
}: {
  label: string;
  selectedText?: string;
  icon: 'list' | 'package' | 'cash' | 'filter';
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <TablerIcon
      name={icon}
      size={14}
      color={active ? Colors.primaryColor : '#64748B'}
    />
    <Text
      style={[styles.chipText, active && styles.chipTextActive]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {active && selectedText ? selectedText : label}
    </Text>
    <TablerIcon name="chevron-down" size={14} color={active ? Colors.primaryColor : '#94A3B8'} />
  </TouchableOpacity>
);

const OptionRow = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.optionRow, selected && styles.optionRowActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text style={[styles.optionText, selected && styles.optionTextActive]}>{label}</Text>
    {selected ? <TablerIcon name="check" size={18} color={Colors.primaryColor} /> : null}
  </TouchableOpacity>
);

export default React.memo(ProductSearchFilterBar);

const CHIP_WIDTH = 88;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  // chip: {
  //   width: CHIP_WIDTH,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   gap: 4,
  //   backgroundColor: '#FFFFFF',
  //   borderWidth: 1,
  //   borderColor: '#E2E8F0',
  //   borderRadius: 12,
  //   paddingHorizontal: 8,
  //   paddingVertical: 8,
  // },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FAF7',
  },
  chipText: {
    marginHorizontal: 6,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  chipTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: '#E8F5F1',
  },
  optionText: {
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  optionTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
