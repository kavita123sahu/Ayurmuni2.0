import { StyleSheet, Text, View, Image, useWindowDimensions, Dimensions } from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";

const ITEM_COUNT = 3;
const SPACING = 5;
const CONTAINER_PADDING = 10

type Item = {
  value?: string | number;
  label: string;
  image?: any;
};

type Props = {
  data: Item[];
  itemCount?: number;
};

const DashboardCard = ({ data, itemCount = ITEM_COUNT }: Props) => {
  const { width } = Dimensions.get('screen');

  const itemWidth =
    (width - CONTAINER_PADDING - SPACING * (itemCount - 1)) / itemCount;

  const itemHeight = itemWidth * 0.660;
  const iconSize = itemWidth * 0.22;
  const fontSize = itemWidth * 0.12;
  const labelSize = Math.max(10, itemWidth * 0.1);

  return (
    <View style={styles.row}>
      {data.map((item, index) => (
        <View
          key={index}
          style={[
            styles.statBox,
            {
              width: itemWidth,
              height: itemHeight,
              borderRadius: itemWidth * 0.12,
            },
          ]}
        >
          {item.image ? (
            <Image
              source={item.image}
              style={{ width: iconSize, height: iconSize, marginBottom: 4 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={[styles.statNumber, { fontSize }]}>
              {item.value}
            </Text>
          )}

          <Text
            style={[styles.statLabel, { fontSize: labelSize }]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {item.label}
          </Text>
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
    gap: SPACING,
    marginBottom: 10,
  },
  statBox: {
    borderWidth: 1.5,
    borderColor: "#0D614E1A",
    backgroundColor: "#0D614E0D",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  statNumber: {
    fontFamily: Fonts.PoppinsBold,
    color: Colors.questionGreen,
  },
  statLabel: {
    color: Colors.questionGreen,
    marginTop: 3,
    fontFamily: Fonts.PoppinsMedium,
    textAlign: "center",
  },
});