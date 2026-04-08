import { View } from "react-native";

export const ScreenWrapper = ({ children }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor : "#FDFDFB", paddingBottom: 30 }}>
      {children}
    </View>
  );
};