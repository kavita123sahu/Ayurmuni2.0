import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Images } from "../common/Images";
import { Fonts } from "../common/Fonts";

type HeaderProps = {
  title: string;
  onBackPress: () => void;
};

const SOSHeader: React.FC<HeaderProps> = ({ title, onBackPress }) => {
  return (
    <View style={styles.container}>
      
      {/* Back Button (fixed icon inside) */}
      <TouchableOpacity style={styles.backBtn} onPress={onBackPress}>
        <Image
          source={Images.backIcon} 
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Dynamic Title */}
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

  icon: {
    height: 40,
    width: 40,
    resizeMode: "contain",
  },

  title: {
    fontSize: 18,
    fontFamily:Fonts.PoppinsSemiBold,
    color: "#F43F5E", 
  },
});