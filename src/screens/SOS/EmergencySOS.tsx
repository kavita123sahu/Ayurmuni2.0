import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import SOSHeader from "../../components/SOSHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { Images } from "../../common/Images";
import { Image } from "react-native-animatable";
import { Fonts } from "../../common/Fonts";

const EmergencySOS: React.FC = (props: any) => {

  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [concern, setConcern] = useState("");

  const categories = ["Option 1", "Option 2"];

  const doctors = [
    { id: "1", name: "Dr. Elena Rossi", specialty: "Cardiologist", rating: 4.9 },
    { id: "2", name: "Dr. Elena Rossi", specialty: "Cardiologist", rating: 4.9 },
    { id: "3", name: "Dr. Elena Rossi", specialty: "Cardiologist", rating: 4.9 },
    { id: "4", name: "Dr. Elena Rossi", specialty: "Cardiologist", rating: 4.9 },
  ];

  const renderDoctor = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Image source={Images.doctorSOS} style={styles.avatar} />
        <View style={styles.onlineDot} />
      </View>

      <Text style={styles.docName}>{item.name}</Text>
      <Text style={styles.specialty}>{item.specialty}</Text>

      <View style={styles.ratingBox}>
        <Image source={Images.starFilled} style={{height:12,width:12,marginRight:4,bottom:2 }} />
        <Text style={styles.rating}>{item.rating}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFB" }}>
      <SOSHeader
        title="Emergency SOS"
        onBackPress={() => console.log("Back")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
      >

        {/* Immediate Assistance */}
        <View style={styles.alertBox}>
          <View style={styles.alertRow}>
            <View style={styles.iconBox}>
              <Image source={Images.sosIcon} style={{ width: 18, height: 18 }} />
            </View>
            <View style={{ flex: 1,paddingLeft:10 }}>
              <Text style={styles.alertTitle}>Immediate Assistance</Text>
              <Text style={styles.alertDesc}>
                Please provide details or select a doctor for a priority live response.
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Specialty */}
        <Text style={styles.label}>Medical Speciality</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.dropdownText}>{selectedCategory}</Text>
           <Image source={Images.downArrow} style={{height:6,width:11,marginRight:10 }} />
        </TouchableOpacity>

        {dropdownOpen &&
          categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedCategory(item);
                setDropdownOpen(false);
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}

        {/* Describe Concern */}
        <Text style={styles.label2}>Describe Concern</Text>

        <View style={styles.textArea}>
          <TextInput
            placeholder="Describe symptoms, location details, or specific needs..."
            placeholderTextColor="#94A3B8"
            multiline
            value={concern}
            onChangeText={setConcern}
            style={{ flex: 1, textAlignVertical: "top",fontSize:16,paddingRight:10,lineHeight:24,fontFamily:Fonts.PoppinsRegular}}
          />
          <Text style={styles.minText}>Min. 10 words for better triage</Text>
        </View>

        {/* Doctors */}
        <Text style={styles.label2}>Available Doctors</Text>

        <FlatList
          data={doctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
        />

      </ScrollView>

      <TouchableOpacity
        style={styles.checkout}
        onPress={() => props.navigation.navigate("Checkout")}
      >
        <Text style={styles.checkoutText}>Send SOS Now</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Dispatching help within 60 seconds
      </Text>
    </SafeAreaView>
  );
};

export default EmergencySOS;

const styles = StyleSheet.create({

  alertBox: {
    borderLeftWidth: 2,
    borderColor: "#F43F5E",
    backgroundColor: "#F43F5E1A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    marginTop:10
  },

  alertRow: {
    flexDirection: "row",
    gap: 10,
  },

  iconBox: {
    height: 34,
    width: 34,
    borderRadius: 8,
    backgroundColor: "#F43F5E",
    alignItems: "center",
    justifyContent: "center",
  },

  alertTitle: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 16,
    color: "#F43F5E",
  },

  alertDesc: {
    fontSize: 14,
    color: "#F43F5ECC",
    marginTop: 4,
    lineHeight:20,
    paddingRight:30,
    fontFamily:Fonts.PoppinsMedium
  },

  label: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
    marginTop: 10,
  },

  label2: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
    marginTop: 10,
    color:'#1E293B'
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  dropdownText: {
    color: "#94A3B8",
    fontSize:16,fontFamily:Fonts.PoppinsMedium
  },

  dropdownItem: {
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 5,
  },

  /* TEXT AREA */
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  minText: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "right",
    marginTop: 4,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
    borderWidth:2,
    borderColor:"#F1F5F9"
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 12,
    marginTop:10
  },

  avatar: {
    height: 80,
    width: 80,
    borderRadius: 30,
  },

  onlineDot: {
    position: "absolute",
    bottom: 8,
    right: 4,
    height: 16,
    width: 16,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },

  docName: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  specialty: {
    fontSize: 12,
    color: "#0D614E",
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 6,
  },

  ratingBox: {
    flexDirection: "row",
    backgroundColor: "#0D614E1A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
  },

  star: {
    color: "#FBBF24",
    marginRight: 4,
    bottom:3
  },

  rating: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
  },

  checkout: {
    backgroundColor: "#F43F5E",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop:10
  },

  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.PoppinsMedium,
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6E7975",
    marginTop: 6,
    marginBottom: 10,
    fontFamily:Fonts.PoppinsMedium
  },
});