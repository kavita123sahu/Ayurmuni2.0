import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Fonts } from "../common/Fonts";

const { width } = Dimensions.get("window");

const PromoScreen = () => {
  const data = [
    {
      id: "1",
      title: "SAVE20",
      subtitle: "20% off on all wellness products",
    },
    {
      id: "2",
      title: "FREESHIP",
      subtitle: "Free delivery for orders above $50",
    },
  ];

  const renderItem = ({ item } : any) => (
    <View style={styles.card}>
      <View style={styles.leftIcon}>
        <Text style={{ fontSize: 18 }}>%</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>

        <Text
          style={styles.subtitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.subtitle}
        </Text>
      </View>

      <TouchableOpacity style={styles.applyBtn}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Input */}
      <View style={styles.inputWrapper}>
        <TextInput
        placeholderTextColor="#9CA3AF"
          placeholder="Enter promo code"
          style={styles.input}
        />
        <TouchableOpacity style={styles.mainApplyBtn}>
          <Text style={styles.mainApplyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Available Promo Codes</Text>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default PromoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F1",
    padding: 16,
    borderRadius: 16,
  },

  inputWrapper: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
    alignItems: "center",
    marginBottom: 20,
  },

  input: {
    flex: 1,
     color: '#0F172A',
    fontFamily : Fonts.PoppinsRegular,
    paddingHorizontal: 15,
    fontSize: 14,
  },

  mainApplyBtn: {
    backgroundColor: "#0B6B57",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },

  mainApplyText: {
    color: "#fff",
    fontFamily : Fonts.PoppinsSemiBold
  },

  heading: {
    fontSize: 16,
   fontFamily : Fonts.PoppinsSemiBold,
    color: "#0B6B57",
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
      minHeight: 70, 
  },

  leftIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#E6F2EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
    overflow:'hidden',
     marginRight: 10, 
  },

  title: {
    fontSize: 14,
  fontFamily : Fonts.PoppinsSemiBold,
    color: "#000",
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
    fontFamily : Fonts.PoppinsRegular,
    lineHeight: 16,
    // 🔥 fixed for 2 lines
  },

  applyBtn: {
    borderWidth: 1,
    height:27,
    borderColor: "#00514733",
    paddingHorizontal: 14,
    // paddingVertical: 6,
    justifyContent:'center',
    borderRadius: 24,
     flexShrink: 0
  },

  applyText: {
    color: "#0B6B57",
    fontSize:10,
    fontFamily : Fonts.PoppinsSemiBold
  },
});