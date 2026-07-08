import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import TablerIcon from "./TablerIcon";

type HeaderProps = {
  title: string;
  onBackPress: () => void;
};

const SOSHeader: React.FC<HeaderProps> = ({ title, onBackPress }) => {
  return (
    <View style={styles.container}>
      
      <TouchableOpacity style={styles.backBtn} onPress={onBackPress}>
        <TablerIcon name="arrow-left" size={22} color={Colors.primaryColor} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

    </View>
  );
};

export default SOSHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom:20
  },

  backBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontFamily:Fonts.PoppinsSemiBold,
    color: "#F43F5E", 
  },
});
