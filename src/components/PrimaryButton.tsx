import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../common/Fonts";
import TablerIcon, { TablerIconName } from "./TablerIcon";

type Props = {
  title: string;
  onPress?: () => void;
  iconName?: TablerIconName;
  backgroundColor?: string;
  textColor?: string;
  TextFont : string;
  borderColor?: string;
};

const PrimaryButton = ({
  title,
  onPress,
  iconName,
  backgroundColor = "#0D614E",
  textColor = "#FFFFFF",
  TextFont,
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
        {iconName && (
          <TablerIcon name={iconName} size={18} color={textColor} />
        )}

        <Text style={[styles.primaryText, { color: textColor ,  fontFamily: TextFont,}]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryText: {
    fontSize: 16,
  },
});
