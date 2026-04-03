import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "../common/Vector";
import { Colors } from "../common/Colors";
import { Fonts } from "../common/Fonts";

const FAQItem = ({ question, answer, isOpen, onPress }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.header}>
        <Text style={styles.q}>{question}</Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isOpen && <Text style={styles.a}>{answer}</Text>}
    </View>
  );
};

export default FAQItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom:8
  },
  q: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor
  },
  a: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing:0,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.subTextColor,
    lineHeight: 18,
  },
});