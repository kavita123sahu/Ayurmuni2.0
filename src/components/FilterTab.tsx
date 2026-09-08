import React, { useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TABS } from "../common/DataInterface";
import { Ionicons } from "../common/Vector";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";

type FilterTabsProps = {
  activeTab: string | null;
  setActiveTab: (val: string | null) => void;

  selectedFilters: {
    specialization: any;
    date_range: string;
    from_date: string;
    to_date: string;
    experience: string;
  };

  setSelectedFilters: React.Dispatch<React.SetStateAction<any>>;

  clearFilter: (key: string) => void;

  dropdownOptions: { label: string; value: string }[];

  getTabLabel: (tab: any) => string;

  setTempFromDate: (date: Date | null) => void;
  setTempToDate: (date: Date | null) => void;

  setCalendarStep: (step: "from" | "to") => void;

  setShowCalendar: (val: boolean) => void;

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
    setSelectedFilters,
    getPresetDates,
  } = props;

  const openTab = useMemo(
    () => TABS.find(tab => tab.key === activeTab) || null,
    [activeTab],
  );

  const closeDropdown = () => setActiveTab(null);

  const applyOption = (tabKey: string, item: { label: string; value: string }) => {
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

    setSelectedFilters((prev: any) => ({
      ...prev,
      [tabKey === "speciality" ? "specialization" : "experience"]: item.value,
    }));
    setActiveTab(null);
  };

  return (
    <View style={styles.tabsRow}>
      {TABS.map(tab => {
        const isOpen = activeTab === tab.key;
        const isSelected =
          (tab.key === "speciality" && !!selectedFilters.specialization) ||
          (tab.key === "experience" && !!selectedFilters.experience) ||
          (tab.key === "availability" && !!selectedFilters.date_range);

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

      <Modal
        visible={!!openTab}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeDropdown} />
          <View style={styles.dropdownSheet}>
            <Text style={styles.dropdownTitle}>
              {openTab ? getTabLabel(openTab) : "Filter"}
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
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default FilterTabs;

export const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    gap: 8,
    zIndex: 20,
  },

  tabWrapper: {
    flex: 1,
    minWidth: 0,
  },

  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.PoppinsMedium,
    color: "#0F172A",
    marginRight: 4,
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
    paddingTop: 120,
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
    maxHeight: 280,
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
