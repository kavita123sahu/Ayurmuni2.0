import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TABS } from "../common/DataInterface";
import { Ionicons } from "../common/Vector";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import {
  FILTER_CHIP_PADDING_H,
  FILTER_CHIP_PADDING_V,
  FILTER_CHIP_RADIUS,
} from "../constants/layout";


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

    console.log("CHILD activeTab =>", activeTab);

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

                        {/* TAB BUTTON */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                console.log("Pressed Tab =>", tab.key);

                                setActiveTab(
                                    activeTab === tab.key
                                        ? null
                                        : tab.key
                                );
                            }}
                            style={[
                                styles.tabBtn,
                                isSelected && styles.activeTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isSelected && styles.activeTabText,
                                ]}
                                numberOfLines={1}
                            >
                                {getTabLabel?.(tab) ?? tab.label}
                            </Text>

                            <View style={{ flexDirection: "row", alignItems: "center" }}>

                                {/* CLEAR */}
                                {isSelected && (
                                    <TouchableOpacity

                                        onPress={(e) => {
                                            e.stopPropagation?.();
                                            clearFilter(tab.key);
                                        }}
                                        style={{ marginRight: 6 }}
                                    >
                                        <Ionicons name="close" size={14} color={isSelected ? "#fff" : "#0F172A"} />
                                    </TouchableOpacity>
                                )}

                                {/* ARROW */}
                                <Ionicons
                                    name={isOpen ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={isSelected ? "#fff" : "#0F172A"}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* DROPDOWN */}
                        {isOpen && (
                            <View style={styles.dropdown}>
                                <FlatList
                                    data={dropdownOptions}
                                    keyExtractor={(item, index) => String(index)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.option}
                                            onPress={() => {

                                                // CUSTOM DATE
                                                if (tab.key === "availability" && item.value === "custom_date") {

                                                    setShowCalendar(true);
                                                    setTempFromDate(null);
                                                    setTempToDate(null);
                                                    setCalendarStep("from");
                                                    setActiveTab(null);
                                                    return;
                                                }

                                                // PRESET DATE
                                                if (tab.key === "availability") {
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

                                                // SPECIALITY / EXPERIENCE
                                                // setSelectedFilters(prev => ({
                                                //     ...prev,
                                                //     [tab.key === "speciality"
                                                //         ? "specialization"
                                                //         : "experience"
                                                //     ]: item.value,
                                                // }));


                                                setSelectedFilters((prev: any) => ({
                                                    ...prev,
                                                    [tab.key === "speciality"
                                                        ? "specialization"
                                                        : "experience"
                                                    ]: item.value,
                                                }));

                                                setActiveTab(null);
                                            }}
                                        >
                                            <Text style={styles.optionText}>{item.label}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}

                    </View>
                );
            })}
        </View>
    );
});

export default FilterTabs;


export const styles = StyleSheet.create({
    tabsRow: {
        flexDirection: "row",
        paddingHorizontal: 4,
        paddingVertical: 10,
        backgroundColor: "#FFFFFF",
        // borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        gap: 10,
    },

    tabWrapper: {
        position: "relative",
        flex: 1,
    },

    tabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        minHeight: 42,
        paddingHorizontal: FILTER_CHIP_PADDING_H,
        paddingVertical: FILTER_CHIP_PADDING_V,

        borderRadius: FILTER_CHIP_RADIUS,
        borderWidth: 1,
        borderColor: '#E2E8F0',

        backgroundColor: '#fff',
    },

    activeTab: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },

    tabText: {
        flex: 1,
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0F172A',
        marginRight: 6,
    },

    activeTabText: {
        color: '#fff',
    },
    dropdown: {
        position: "absolute",
        top: 48,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        maxHeight: 200,

        // shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,

        // shadow (Android)
        elevation: 6,

        zIndex: 999,
        overflow: "hidden",
    },


    option: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        backgroundColor: "#fff",
    },

    optionText: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "500",
    },

    optionActive: {
        backgroundColor: "#EFF6FF",
    },

    clearIconWrap: {
        marginRight: 6,
        padding: 2,
    },
});