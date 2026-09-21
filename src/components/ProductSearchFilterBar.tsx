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

export type BrandFilterOption = {
  id: string;
  name: string;
};

type Props = {
  sortBy: ProductSortKey;
  onSortChange: (key: ProductSortKey) => void;
  brandIds: string[];
  brandNames?: string[] | null;
  onBrandChange: (brands: BrandFilterOption[]) => void;
  priceRange: PriceRangeKey;
  onPriceRangeChange: (key: PriceRangeKey) => void;
  brands: BrandFilterOption[];
  activeFilterCount: number;
  onClearFilters: () => void;
};

const ProductSearchFilterBar: React.FC<Props> = ({
  sortBy,
  onSortChange,
  brandIds,
  brandNames,
  onBrandChange,
  priceRange,
  onPriceRangeChange,
  brands,
  activeFilterCount,
  onClearFilters,
}) => {
  const [sheet, setSheet] = useState<'sort' | 'brand' | 'price' | null>(null);
  const [draftBrandIds, setDraftBrandIds] = useState<string[]>([]);

  const closeSheet = () => setSheet(null);

  const openBrandSheet = () => {
    if (brandIds.length > 0) {
      setDraftBrandIds(brandIds);
    } else if (brandNames && brandNames.length > 0) {
      const nameSet = new Set(brandNames);
      setDraftBrandIds(
        brands.filter(brand => nameSet.has(brand.name)).map(brand => brand.id),
      );
    } else {
      setDraftBrandIds([]);
    }
    setSheet('brand');
  };

  const priceLabel =
    PRICE_RANGE_OPTIONS.find(option => option.key === priceRange)?.label ??
    'Price';

  const sortActive = sortBy !== 'relevance';
  const selectedBrandCount =
    brandIds.length > 0 ? brandIds.length : brandNames?.length ?? 0;
  const brandActive = selectedBrandCount > 0;
  const brandChipText =
    selectedBrandCount === 0
      ? undefined
      : selectedBrandCount === 1
        ? brandNames?.[0] ??
          brands.find(brand => brand.id === brandIds[0])?.name ??
          '1 brand'
        : `${selectedBrandCount} brands`;
  const priceActive = priceRange !== 'all';
  const filtersActive = activeFilterCount > 0;

  const toggleDraftBrand = (id: string) => {
    setDraftBrandIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const applyBrandDraft = () => {
    const selected = brands.filter(brand => draftBrandIds.includes(brand.id));
    onBrandChange(selected);
    closeSheet();
  };

  const clearBrandDraft = () => {
    setDraftBrandIds([]);
  };

  const sheetTitle =
    sheet === 'sort' ? 'Sort by' : sheet === 'brand' ? 'Brand' : 'Price range';

  return (
    <>
      <View style={styles.bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          style={styles.scroll}
          nestedScrollEnabled
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
            selectedText={brandActive ? brandChipText : undefined}
            icon="package"
            active={brandActive}
            onPress={openBrandSheet}
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
      </View>

      <Modal
        visible={sheet !== null}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <Pressable style={styles.overlay} onPress={closeSheet}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{sheetTitle}</Text>
              <TouchableOpacity
                onPress={closeSheet}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
                accessibilityLabel="Close filter"
              >
                <TablerIcon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {sheet === 'sort' &&
              PRODUCT_SORT_OPTIONS.map(option => (
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

            {sheet === 'brand' && (
              <>
                <ScrollView
                  style={styles.brandList}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {brands.map(brand => {
                    const selected = draftBrandIds.includes(brand.id);
                    return (
                      <CheckboxRow
                        key={brand.id}
                        label={brand.name}
                        selected={selected}
                        onPress={() => toggleDraftBrand(brand.id)}
                      />
                    );
                  })}
                </ScrollView>
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearBrandDraft}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyBrandDraft}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {sheet === 'price' &&
              PRICE_RANGE_OPTIONS.map(option => (
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
      size={13}
      color={active ? Colors.primaryColor : '#64748B'}
    />
    <Text
      style={[styles.chipText, active && styles.chipTextActive]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {active && selectedText ? selectedText : label}
    </Text>
    <TablerIcon
      name="chevron-down"
      size={13}
      color={active ? Colors.primaryColor : '#94A3B8'}
    />
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
    <Text style={[styles.optionText, selected && styles.optionTextActive]}>
      {label}
    </Text>
    {selected ? (
      <TablerIcon name="check" size={16} color={Colors.primaryColor} />
    ) : null}
  </TouchableOpacity>
);

const CheckboxRow = ({
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
    <Text style={[styles.optionText, selected && styles.optionTextActive]}>
      {label}
    </Text>
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected ? <TablerIcon name="check" size={12} color="#FFFFFF" /> : null}
    </View>
  </TouchableOpacity>
);

export default React.memo(ProductSearchFilterBar);

const FILTER_BAR_HEIGHT = 34;

const styles = StyleSheet.create({
  bar: {
    height: FILTER_BAR_HEIGHT,
    marginBottom: 4,
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 8,
  },
  chipActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FAF7',
  },
  chipText: {
    marginHorizontal: 4,
    fontSize: 11,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    flex: 1,
    paddingRight: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandList: {
    maxHeight: 320,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginBottom: 0,
  },
  optionRowActive: {
    backgroundColor: '#E8F5F1',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
    flex: 1,
    paddingRight: 8,
  },
  optionTextActive: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    borderColor: Colors.primaryColor,
    backgroundColor: Colors.primaryColor,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  clearButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  applyButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
  },
  applyButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
