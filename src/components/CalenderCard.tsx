import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Fonts } from "../common/Fonts";

type Props = {
  label: string;
  value: number;
  isActive: boolean;
  onPress: () => void;
};

export const CalenderCard: React.FC<Props> = ({
  label,
  value,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, isActive && styles.activeContainer]}
    >
      <Text style={[styles.label, isActive && styles.activeText]}>
        {label}
      </Text>

      <Text style={[styles.value, isActive && styles.activeText]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 80,
    borderRadius: 18,
    backgroundColor: "#F1F5F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    // 👇 subtle shadow (iOS + Android)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  activeContainer: {
    backgroundColor: "#0D614E",
    shadowOpacity: 0.2,
    elevation: 6,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 4,
  },

  value: {
    fontSize: 18,
    color: "#0F172A",
    fontFamily: Fonts.PoppinsBold,
  },

  activeText: {
    color: "#fff",
  },
});