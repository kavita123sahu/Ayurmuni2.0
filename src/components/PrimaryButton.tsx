import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../common/Fonts";

type Props = {
  title: string;
  onPress?: () => void;
  icon?: any; // image source
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
};

const PrimaryButton = ({
  title,
  onPress,
  icon,
  backgroundColor = "#0D614E",
  textColor = "#FFFFFF",
  borderColor = "transparent",
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.primaryBtn,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <Image source={icon} style={styles.icon} />
        )}

        <Text style={[styles.primaryText, { color: textColor }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  primaryBtn: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    marginLeft: 8,
    fontSize: 18,
    fontFamily: Fonts.PoppinsRegular,
    top:2
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
});