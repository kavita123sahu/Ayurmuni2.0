import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  image: string;
}
const doctorsData: Doctor[] = [
  {
    id: 1,
    name: "Dr. Elena Rossi",
    specialty: "Cardiologist",
    rating: 4.9,
    image: "https://via.placeholder.com/100",
  },
  {
    id: 2,
    name: "Dr. John Smith",
    specialty: "Neurologist",
    rating: 4.7,
    image: "https://via.placeholder.com/100",
  },
];

const EmergencySOS: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [description, setDescription] = useState("");


  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Emergency SOS</Text>

      {/* Alert */}
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>Immediate Assistance</Text>
        <Text style={styles.alertText}>
          Please provide details or select a doctor for priority response.
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.label}>Describe Concern</Text>
      <TextInput
        style={styles.textArea}
        multiline
        placeholder="Describe symptoms, location..."
        value={description}
        onChangeText={setDescription}
      />

      {/* Doctors */}
      <Text style={styles.label}>Available Doctors</Text>

      {/* <FlatList
        horizontal
        data={doctorsData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SOSDoctorCard
            doctor={item}
            selected={selectedDoctor === item.id}
            onPress={() => setSelectedDoctor(item.id)}
          />
        )}
        showsHorizontalScrollIndicator={false}
      /> */}

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>📞 Send SOS Now</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Dispatching help within 60 seconds to your location.
      </Text>
    </View>
  );
};

export default EmergencySOS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  alertBox: {
    backgroundColor: "#FDECEA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  alertTitle: {
    color: "#D32F2F",
    fontWeight: "600",
  },
  alertText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 4,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    height: 80,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#EF5350",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginTop: 8,
  },
});