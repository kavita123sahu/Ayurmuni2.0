import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  columns?: number;
};

const DynamicGrid = ({ data, renderItem, columns = 2 }: Props) => {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View
          key={index}
          style={[
            styles.item,
            { flexBasis: `${100 / columns}%` }, // ✅ responsive magic
          ]}
        >
          <View style={styles.inner}>
            {renderItem(item, index)}
          </View>
        </View>
      ))}
    </View>
  );
};

export default DynamicGrid;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    padding: 6, // 👈 gap control
  },
  inner: {
    flex: 1,
  },
});