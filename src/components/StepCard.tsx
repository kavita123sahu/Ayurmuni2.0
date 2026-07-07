import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import TablerIcon from "./TablerIcon";

const highlightWords = ["My Appointments", "Reschedule"];

const renderHighlightedText = (text: string) => {
  let parts: any[] = [text];

  highlightWords.forEach(word => {
    parts = parts.flatMap(part => {
      if (typeof part !== "string") return [part];
      const split = part.split(new RegExp(`(${word})`, "gi"));
      return split.map((subPart, i) => {
        if (subPart.toLowerCase() === word.toLowerCase()) {
          return (
            <Text key={i} style={styles.highlightText}>
              {subPart}
            </Text>
          );
        }
        return subPart;
      });
    });
  });

  return parts;
};
const StepCard = ({ title, steps }: any) => {
  return (
    <View style={styles.container}>

      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <TablerIcon name="instruction" size={24} color={Colors.primaryColor} />
        </View>
        <Text style={styles.header}>{title}</Text>
      </View>

      {steps.map((item: any, index: any) => (
        <View key={index} style={styles.stepRow}>

          <View style={styles.circle}>
            <Text style={styles.circleText}>{index + 1}</Text>
          </View>

          <Text style={styles.stepText}>
            {renderHighlightedText(item)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default StepCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D614E0D",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryColor,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBox: {
    height: 28,
    width: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  header: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  circle: {
    height: 24,
    width: 24,
    borderRadius: 8,
    backgroundColor: Colors.primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },

  circleText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 18,
    fontFamily: Fonts.PoppinsMedium,
  },
  highlightText: {
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
