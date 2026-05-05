import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Fonts } from "../common/Fonts";

const ReviewSection = ({ reviews = [], navigation } : { reviews?: any[], navigation: any }) => {
  const renderStars = (count: number) => {
    return "⭐".repeat(count); // simple star render
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <View>
      {/* Header */}
      <TouchableOpacity
        style={styles.reviewHeader}
        onPress={() => navigation.navigate("ReviewPage")}
      >
        <Text style={styles.sectionTitle}>Customer Reviews</Text>

        <Text style={styles.viewAll}>View All</Text>
      </TouchableOpacity>

      {/* Reviews List */}
      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.reviewTop}>
            
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(item.name)}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.stars}>
                  {renderStars(item.rating)}
                </Text>
              </View>
            </View>
          </View>

          {/* Review Text */}
          <Text style={styles.reviewText}>{item.review}</Text>
        </View>
      ))}
    </View>
  );
};

export default ReviewSection;

const styles = StyleSheet.create({
    reviewHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
//   marginHorizontal: 2,
  marginTop: 16,
},

sectionTitle: {
  fontSize: 18,
  fontFamily: Fonts.PoppinsSemiBold,
  color: "#111",
},

viewAll: {
  fontSize: 13,
  color: "#0B6B57",
  fontFamily: Fonts.PoppinsMedium,
},

reviewCard: {
  backgroundColor: "#fff",
//   marginHorizontal: 20,
  marginTop: 10,
  borderRadius: 16,
  padding: 14,
},

reviewTop: {
  flexDirection: "row",
  alignItems: "center",
},

avatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#E6F2EF",
  justifyContent: "center",
  alignItems: "center",
},

avatarText: {
  fontSize: 14,
  fontFamily: Fonts.PoppinsSemiBold,
  color: "#0B6B57",
},

nameRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

name: {
  fontSize: 14,
  fontFamily: Fonts.PoppinsSemiBold,
  color: "#111",
},

stars: {
  fontSize: 12,
},

reviewText: {
  marginTop: 10,
  fontSize: 13,
  color: "#4B5563",
  fontFamily: Fonts.PoppinsMedium,
  lineHeight: 18,
},
})