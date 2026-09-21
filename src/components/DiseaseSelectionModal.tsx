import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import {
  getHealthDiseases,
  mapProductCategory,
  normalizeApiList,
} from '../services/ProductServices';
import * as _PROFILE_SERVICES from '../services/ProfileServices';
import { showSuccessToast } from '../config/Key';
import { fetchWithCache, getCached, invalidateCache } from '../services/apiCache';
import { Utils } from '../common/Utils';

export type HealthDiseaseOption = {
  id: string;
  name: string;
  image_url?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Called after successful profile save (or skip). */
  onDone?: (saved: boolean) => void;
  /** Prefill selected disease ids (edit from profile). */
  initialSelectedIds?: string[];
  /** Optional service category to scope health concerns. */
  serviceCategoryId?: string | null;
  /** When true, Skip is hidden (forced edit). */
  requireSelection?: boolean;
  title?: string;
  subtitle?: string;
};

const THEME = {
  ink: Colors.textColor,
  muted: Colors.subTextColor,
  faint: Colors.headercolor,
  line: '#E6EEEA',
  tint: Colors.onfillColor,
  softFill: '#F3F7F5',
  danger: Colors.errorColor,
};

const DiseaseSelectionModal = ({
  visible,
  onClose,
  onDone,
  initialSelectedIds,
  serviceCategoryId,
  requireSelection = false,
  title = 'Personalize your Ayurmuni',
  subtitle = 'Select health concerns to tailor care',
}: Props) => {
  const insets = useSafeAreaInsets();
  const [options, setOptions] = useState<HealthDiseaseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const wasVisibleRef = useRef(false);
  const baselineIdsRef = useRef<string[]>([]);

  const initialIdsKey = useMemo(
    () =>
      (initialSelectedIds || [])
        .map(String)
        .filter(Boolean)
        .sort()
        .join(','),
    [initialSelectedIds],
  );

  const isEditMode = initialIdsKey.length > 0;

  useEffect(() => {
    if (!visible) {
      wasVisibleRef.current = false;
      setSearch('');
      return;
    }
    if (wasVisibleRef.current) return;
    wasVisibleRef.current = true;
    const ids = initialIdsKey ? initialIdsKey.split(',') : [];
    baselineIdsRef.current = ids;
    setSelectedIds(ids);
    setSearch('');
  }, [visible, initialIdsKey]);

  const loadOptions = useCallback(async () => {
    const cacheKey = `health_diseases_${String(serviceCategoryId || 'all')}`;
    const cached = getCached<HealthDiseaseOption[]>(cacheKey, 5 * 60_000);
    if (cached?.length) {
      setOptions(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const list = await fetchWithCache(
        cacheKey,
        async () => {
          const response = await getHealthDiseases(
            serviceCategoryId
              ? { category_id: serviceCategoryId }
              : undefined,
          );
          if (response?.success === false) return [];
          return normalizeApiList(response)
            .map(mapProductCategory)
            .filter(item => item.id && item.name)
            .map(item => ({
              id: String(item.id),
              name: String(item.name),
              image_url: item.image_url || undefined,
            }));
        },
        { ttl: 5 * 60_000 },
      );
      setOptions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.log('DISEASE_OPTIONS_ERROR =>', error);
      if (!cached?.length) setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [serviceCategoryId]);

  useEffect(() => {
    if (visible) loadOptions();
  }, [visible, loadOptions]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(item => item.name.toLowerCase().includes(q));
  }, [options, search]);

  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every(item => selectedIds.includes(item.id));

  const hasChanges = useMemo(() => {
    const baseline = [...baselineIdsRef.current].sort().join(',');
    const current = [...selectedIds].sort().join(',');
    return baseline !== current;
  }, [selectedIds]);

  const toggleDisease = useCallback((id: string) => {
    const key = String(id);
    setSelectedIds(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
    );
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      filteredOptions.forEach(item => next.add(item.id));
      return Array.from(next);
    });
  }, [filteredOptions]);

  const clearLocalSelection = useCallback(() => {
    if (search.trim()) {
      const filteredIds = new Set(filteredOptions.map(item => item.id));
      setSelectedIds(prev => prev.filter(id => !filteredIds.has(id)));
      return;
    }
    setSelectedIds([]);
  }, [filteredOptions, search]);

  const persistDiseases = useCallback(
    async (ids: string[], successMessage: string) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const response: any = await _PROFILE_SERVICES.update_Profile({
          health_disease_ids: ids,
        });
        if (response?.success === false) {
          showSuccessToast(
            response?.message || 'Unable to save health concerns',
            'error',
          );
          return false;
        }

        invalidateCache('home_customer');

        try {
          const cached = (await Utils.getData('_USER_INFO')) || {};
          const nameById = new Map(options.map(o => [o.id, o.name]));
          const diseases = ids.map(id => ({
            id,
            name: nameById.get(id) || id,
          }));
          await Utils.storeData('_USER_INFO', {
            ...cached,
            has_health_diseases: ids.length > 0,
            health_diseases: diseases,
            health_disease_ids: ids,
          });
        } catch {
          // ignore cache write
        }

        showSuccessToast(successMessage, 'success');
        baselineIdsRef.current = ids;
        setSelectedIds(ids);
        onDone?.(true);
        return true;
      } catch (error: any) {
        showSuccessToast(
          error?.message || 'Unable to save health concerns',
          'error',
        );
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onDone, options, submitting],
  );

  const handleClose = () => {
    onDone?.(false);
  };

  const handleSave = async () => {
    if (isEditMode && !hasChanges) return;
    if (!isEditMode && selectedIds.length === 0) return;
    await persistDiseases(
      selectedIds,
      isEditMode ? 'Health concerns updated' : 'Health preferences saved',
    );
  };

  const handleClearAndSave = async () => {
    if (!isEditMode) {
      clearLocalSelection();
      return;
    }
    await persistDiseases([], 'Health concerns cleared');
  };

  const saveLabel = isEditMode ? 'Save changes' : 'Save & personalize';
  const saveDisabled =
    submitting || (isEditMode ? !hasChanges : selectedIds.length === 0);

  const clearDisabled =
    submitting ||
    (isEditMode
      ? baselineIdsRef.current.length === 0 && selectedIds.length === 0
      : selectedIds.length === 0);

  const renderItem = useCallback(
    ({ item }: { item: HealthDiseaseOption }) => {
      const isSelected = selectedIds.includes(String(item.id));
      return (
        <Pressable
          style={[styles.row, isSelected && styles.rowSelected]}
          onPress={() => toggleDisease(item.id)}
          android_ripple={{ color: '#DCEEE8' }}
        >
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={styles.itemImageFallback}>
              <TablerIcon name="heart" size={14} color={Colors.primaryColor} />
            </View>
          )}
          <Text
            style={[styles.itemText, isSelected && styles.itemTextSelected]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
            {isSelected ? (
              <TablerIcon name="check" size={11} color="#FFF" />
            ) : null}
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleDisease],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPress} onPress={handleClose} />

        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>Health profile</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={10}
            >
              <TablerIcon name="x" size={16} color={THEME.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TablerIcon name="search" size={16} color={THEME.faint} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search concerns"
              placeholderTextColor={THEME.faint}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <TablerIcon name="x" size={14} color={THEME.faint} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.toolbar}>
            <Text style={styles.countText}>
              {selectedIds.length} selected
              {options.length ? ` · ${options.length}` : ''}
            </Text>
            <View style={styles.toolbarActions}>
              <TouchableOpacity
                style={styles.toolChip}
                onPress={
                  allFilteredSelected ? clearLocalSelection : selectAllFiltered
                }
                disabled={filteredOptions.length === 0 || loading}
                activeOpacity={0.85}
              >
                <Text style={styles.toolChipText}>
                  {allFilteredSelected ? 'Unselect all' : 'Select all'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolChip, styles.toolChipClear]}
                onPress={handleClearAndSave}
                disabled={clearDisabled}
                activeOpacity={0.85}
              >
                <Text style={[styles.toolChipText, styles.toolChipClearText]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={Colors.primaryColor} />
              <Text style={styles.loaderText}>Loading…</Text>
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              style={styles.list}
              contentContainerStyle={
                filteredOptions.length === 0 ? styles.listEmptyPad : undefined
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {search.trim()
                    ? 'No matching concerns'
                    : 'No health concerns available'}
                </Text>
              }
            />
          )}

          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.saveButton, saveDisabled && styles.saveButtonOff]}
            disabled={saveDisabled}
            onPress={handleSave}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveText}>{saveLabel}</Text>
            )}
          </TouchableOpacity>

          {!requireSelection && !isEditMode ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default DiseaseSelectionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  overlayPress: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '86%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8E2DD',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerCopy: {
    flex: 1,
    marginRight: 8,
  },
  kicker: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.PoppinsSemiBold,
    color: THEME.ink,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: THEME.muted,
    marginTop: 2,
    fontFamily: Fonts.PoppinsRegular,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.softFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: THEME.softFill,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontSize: 14,
    color: THEME.ink,
    fontFamily: Fonts.PoppinsRegular,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  countText: {
    flexShrink: 1,
    fontSize: 12,
    color: THEME.muted,
    fontFamily: Fonts.PoppinsMedium,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.tint,
    borderWidth: 1,
    borderColor: '#CDE3DB',
  },
  toolChipClear: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  toolChipText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  toolChipClearText: {
    color: THEME.danger,
  },
  loaderWrap: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 12,
    color: THEME.faint,
    fontFamily: Fonts.PoppinsMedium,
  },
  list: {
    maxHeight: 320,
    marginBottom: 10,
  },
  listEmptyPad: {
    paddingVertical: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowSelected: {
    backgroundColor: THEME.tint,
  },
  itemImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.line,
  },
  itemImageFallback: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.softFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    color: THEME.ink,
    fontFamily: Fonts.PoppinsMedium,
  },
  itemTextSelected: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C5D4CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  emptyText: {
    textAlign: 'center',
    color: THEME.faint,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 13,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonOff: {
    backgroundColor: '#A8C4BB',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  skipButton: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  skipText: {
    fontSize: 13,
    color: THEME.muted,
    fontFamily: Fonts.PoppinsMedium,
  },
});
