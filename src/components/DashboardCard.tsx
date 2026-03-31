import { Dimensions, StyleSheet, Text, View, Image } from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_COUNT = 3;
const SPACING = 12;
const CONTAINER_PADDING = 32;

const ITEM_WIDTH =
  (SCREEN_WIDTH - CONTAINER_PADDING - SPACING * (ITEM_COUNT - 1)) /
  ITEM_COUNT;

type Item = {
  value?: string | number;
  label: string;
  image?: any;
};

type Props = {
  data: Item[];
};

const DashboardCard = ({ data }: Props) => {
  return (
    <View style={styles.row}>
      {data.map((item, index) => (
        <View key={index} style={styles.statBox}>
          
          {item.image ? (
            <Image source={item.image} style={styles.icon} resizeMode="contain" />
          ) : (
            <Text style={styles.statNumber}>{item.value}</Text>
          )}

          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom:10
  },

  statBox: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 0.667,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#0D614E1A",
    backgroundColor: "#0D614E0D",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },

  statNumber: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsBold,
    color: Colors.questionGreen,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.questionGreen,
    marginTop: 3,
    fontFamily: Fonts.PoppinsMedium,
  },
});