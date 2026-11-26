import React, { useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TABS } from "../common/DataInterface";
import { Ionicons } from "../common/Vector";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";

export type SelectedFilters = {
  specialization: any;
  date_range: string;
  from_date: string;
  to_date: string;
  experience: string;
  start_time?: string;
  end_time?: string;
};

type FilterOption = {
  label: string;
  value: string;
  start?: string;
  end?: string;
};

type FilterTabsProps = {
  activeTab: string | null;
  setActiveTab: (val: string | null) => void;

  selectedFilters: SelectedFilters;

  setSelectedFilters: React.Dispatch<React.SetStateAction<any>>;

  clearFilter: (key: string) => void;

  dropdownOptions: FilterOption[];

  getTabLabel: (tab: any) => string;

  setTempFromDate: (date: Date | null) => void;
  setTempToDate: (date: Date | null) => void;

  setCalendarStep: (step: "from" | "to") => void;

  setShowCalendar: (val: boolean) => void;

  /** Opens custom From / To time picker for Available time */
  setShowTimePicker?: (val: boolean) => void;

  getPresetDates: (type: string) => { from: string; to: string };
};

const FilterTabs = React.memo((props: FilterTabsProps) => {
  const {
    activeTab,
    setActiveTab,
    selectedFilters,
    clearFilter,
    dropdownOptions,
    getTabLabel,
    setTempFromDate,
    setTempToDate,
    setCalendarStep,
    setShowCalendar,
    setShowTimePicker,
    setSelectedFilters,
    getPresetDates,
  } = props;

  const openTab = useMemo(
    () => TABS.find(tab => tab.key === activeTab) || null,
    [activeTab],
  );

  const closeDropdown = () => setActiveTab(null);

  const applyOption = (tabKey: string, item: FilterOption) => {
    if (tabKey === "availability" && item.value === "custom_date") {
      setShowCalendar(true);
      setTempFromDate(null);
      setTempToDate(null);
      setCalendarStep("from");
      setActiveTab(null);
      return;
    }

    if (tabKey === "availability") {
      const range = getPresetDates(item.value);
      setSelectedFilters((prev: any) => ({
        ...prev,
        date_range: item.value,
        from_date: range.from,
        to_date: range.to,
      }));
      setActiveTab(null);
      return;
    }

    if (tabKey === "available_time") {
      if (item.value === "custom") {
        setShowTimePicker?.(true);
        setActiveTab(null);
        return;
      }
      if (item.value === "any" || !item.start || !item.end) {
        setSelectedFilters((prev: any) => ({
          ...prev,
          start_time: "",
          end_time: "",
        }));
        setActiveTab(null);
        return;
      }
      setSelectedFilters((prev: any) => ({
        ...prev,
        start_time: item.start,
        end_time: item.end,
      }));
      setActiveTab(null);
      return;
    }

    setSelectedFilters((prev: any) => ({
      ...prev,
      [tabKey === "speciality" ? "specialization" : "experience"]: item.value,
    }));
    setActiveTab(null);
  };

  return (
    <View style={styles.tabsRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {TABS.map(tab => {
          const isOpen = activeTab === tab.key;
          const isSelected =
            (tab.key === "speciality" && !!selectedFilters.specialization) ||
            (tab.key === "experience" && !!selectedFilters.experience) ||
            (tab.key === "availability" && !!selectedFilters.date_range) ||
            (tab.key === "available_time" &&
              !!selectedFilters.start_time &&
              !!selectedFilters.end_time &&
              selectedFilters.end_time > selectedFilters.start_time);

          return (
            <View key={tab.key} style={styles.tabWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setActiveTab(activeTab === tab.key ? null : tab.key)
                }
                style={[styles.tabBtn, isSelected && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, isSelected && styles.activeTabText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getTabLabel?.(tab) ?? tab.label}
                </Text>

                <View style={styles.tabIcons}>
                  {isSelected ? (
                    <TouchableOpacity
                      onPress={e => {
                        e.stopPropagation?.();
                        clearFilter(tab.key);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.clearIconWrap}
                    >
                      <Ionicons
                        name="close"
                        size={12}
                        color={isSelected ? "#fff" : "#0F172A"}
                      />
                    </TouchableOpacity>
                  ) : null}
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={isSelected ? "#fff" : "#64748B"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!openTab}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={closeDropdown}
            accessibilityRole="button"
            accessibilityLabel="Close filter"
          />
          <Pressable style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle} numberOfLines={1}>
              {openTab
                ? openTab.key === "available_time"
                  ? "Available time"
                  : getTabLabel(openTab)
                : "Filter"}
            </Text>
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => openTab && applyOption(openTab.key, item)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.optionText} numberOfLines={2}>
                    {item.label}
                    {item.start && item.end
                      ? `  (${item.start}–${item.end})`
                      : ""}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
});

export default FilterTabs;

export const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    zIndex: 20,
  },

  tabsScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 4,
  },

  tabWrapper: {
    minWidth: 88,
    maxWidth: 140,
  },

  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 32,
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
  },

  activeTab: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },

  tabText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: "#0F172A",
    marginRight: 2,
    textTransform: "capitalize",
  },

  activeTabText: {
    color: "#fff",
  },

  tabIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  clearIconWrap: {
    padding: 2,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 118,
    paddingHorizontal: 16,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },

  dropdownSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 320,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  dropdownTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: "#0F172A",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    textTransform: "capitalize",
  },

  option: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#fff",
  },

  optionText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#111827",
    fontFamily: Fonts.PoppinsMedium,
  },
});
