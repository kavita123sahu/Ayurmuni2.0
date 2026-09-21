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
  ScrollView,
} from 'react-native';
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

const DiseaseSelectionModal = ({
  visible,
  onClose,
  onDone,
  initialSelectedIds,
  serviceCategoryId,
  requireSelection = false,
  title = 'Personalize your Ayurmuni',
  subtitle = 'Tell us your health concerns',
}: Props) => {
  const [options, setOptions] = useState<HealthDiseaseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wasVisibleRef = useRef(false);

  // Stable key — Home often omits initialSelectedIds (default [] would be new every render)
  const initialIdsKey = useMemo(
    () =>
      (initialSelectedIds || [])
        .map(String)
        .filter(Boolean)
        .sort()
        .join(','),
    [initialSelectedIds],
  );

  // Prefill only when modal opens; never reset checks on parent re-renders
  useEffect(() => {
    if (!visible) {
      wasVisibleRef.current = false;
      setDropdownOpen(false);
      return;
    }
    if (wasVisibleRef.current) return;
    wasVisibleRef.current = true;
    setSelectedIds(initialIdsKey ? initialIdsKey.split(',') : []);
    setDropdownOpen(true);
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
    if (visible) {
      loadOptions();
    }
  }, [visible, loadOptions]);

  const toggleDisease = useCallback((id: string) => {
    const key = String(id);
    setSelectedIds(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
    );
  }, []);

  const selectedOptions = useMemo(
    () => options.filter(o => selectedIds.includes(o.id)),
    [options, selectedIds],
  );

  const handleClose = () => {
    onDone?.(false);
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const response: any = await _PROFILE_SERVICES.update_Profile({
        health_disease_ids: selectedIds,
      });
      if (response?.success === false) {
        showSuccessToast(
          response?.message || 'Unable to save health concerns',
          'error',
        );
        return;
      }

      invalidateCache('home_customer');

      try {
        const cached = (await Utils.getData('_USER_INFO')) || {};
        const nameById = new Map(options.map(o => [o.id, o.name]));
        const diseases = selectedIds.map(id => ({
          id,
          name: nameById.get(id) || id,
        }));
        await Utils.storeData('_USER_INFO', {
          ...cached,
          has_health_diseases: true,
          health_diseases: diseases,
          health_disease_ids: selectedIds,
        });
      } catch {
        // ignore cache write
      }

      showSuccessToast('Health preferences saved', 'success');
      onDone?.(true);
    } catch (error: any) {
      showSuccessToast(
        error?.message || 'Unable to save health concerns',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View style={styles.badge}>
                <TablerIcon
                  name="heart-handshake"
                  size={14}
                  color={Colors.primaryColor}
                />
                <Text style={styles.badgeText}>Health profile</Text>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <TablerIcon name="x" size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          <View style={styles.noteContainer}>
            <TablerIcon name="leaf" size={16} color={Colors.primaryColor} />
            <Text style={styles.noteText}>
              If you want to personalize the complete app according to your
              health problems, select your concerns below. We use this to
              recommend doctors, diet, and products.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={Colors.primaryColor} />
              <Text style={styles.loaderText}>Loading health concerns…</Text>
            </View>
          ) : (
            <View style={styles.dropdownSection}>
              <Text style={styles.fieldLabel}>Health concerns</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.dropdownTrigger,
                  dropdownOpen && styles.dropdownTriggerOpen,
                ]}
                onPress={() => setDropdownOpen(prev => !prev)}
              >
                <View style={styles.dropdownTriggerLeft}>
                  {selectedOptions.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.selectedChipRow}
                    >
                      {selectedOptions.map(item => (
                        <View key={item.id} style={styles.selectedChip}>
                          {item.image_url ? (
                            <Image
                              source={{ uri: item.image_url }}
                              style={styles.selectedChipImage}
                            />
                          ) : (
                            <View style={styles.selectedChipImageFallback}>
                              <TablerIcon
                                name="heart"
                                size={10}
                                color={Colors.primaryColor}
                              />
                            </View>
                          )}
                          <Text
                            style={styles.selectedChipText}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={styles.placeholderText}>
                      Select health concerns
                    </Text>
                  )}
                </View>
                <TablerIcon
                  name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {dropdownOpen ? (
                <View style={styles.dropdownPanel}>
                  <FlatList
                    data={options}
                    keyExtractor={item => item.id}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.dropdownList}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>
                        No health concerns available right now.
                      </Text>
                    }
                    renderItem={({ item }) => {
                      const isSelected = selectedIds.includes(String(item.id));
                      return (
                        <Pressable
                          style={[
                            styles.dropdownItem,
                            isSelected && styles.dropdownItemSelected,
                          ]}
                          onPress={() => toggleDisease(item.id)}
                          android_ripple={{ color: '#E8F3F1' }}
                        >
                          {item.image_url ? (
                            <Image
                              source={{ uri: item.image_url }}
                              style={styles.itemImage}
                            />
                          ) : (
                            <View style={styles.itemImageFallback}>
                              <TablerIcon
                                name="heart-handshake"
                                size={16}
                                color={Colors.primaryColor}
                              />
                            </View>
                          )}
                          <Text
                            style={[
                              styles.itemText,
                              isSelected && styles.itemTextSelected,
                            ]}
                            numberOfLines={2}
                          >
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.selectedCheckbox,
                            ]}
                          >
                            {isSelected ? (
                              <TablerIcon name="check" size={12} color="#FFF" />
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    }}
                  />
                </View>
              ) : null}
            </View>
          )}

          {selectedIds.length > 0 ? (
            <Text style={styles.selectedCount}>
              {selectedIds.length} health concern
              {selectedIds.length > 1 ? 's' : ''} selected
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              (selectedIds.length === 0 || submitting) && styles.disabledButton,
            ]}
            disabled={selectedIds.length === 0 || submitting}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.continueText}>Save & personalize</Text>
            )}
          </TouchableOpacity>

          {!requireSelection ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ height: 8 }} />
          )}
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  overlayPress: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
    marginRight: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontFamily: Fonts.PoppinsRegular,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F8F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8EBE4',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
  },
  loaderWrap: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  dropdownSection: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 8,
  },
  dropdownTrigger: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownTriggerOpen: {
    borderColor: Colors.primaryColor,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownTriggerLeft: {
    flex: 1,
    minWidth: 0,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
  selectedChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F8F5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8EBE4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 160,
  },
  selectedChipImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
  },
  selectedChipImageFallback: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChipText: {
    flexShrink: 1,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  dropdownPanel: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.primaryColor,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    maxHeight: 280,
  },
  dropdownList: {
    maxHeight: 280,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F8F5',
  },
  itemImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  itemImageFallback: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  itemTextSelected: {
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
  },
  selectedCheckbox: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    paddingVertical: 24,
  },
  selectedCount: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 4,
    marginBottom: 8,
  },
  continueButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
});
