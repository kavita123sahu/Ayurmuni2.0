import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';

type Patient = {
  id: string;
  name: string;
  relation: string;
  image: string;
  selected?: boolean;
};

const dummyPatients: Patient[] = [
  {
    id: '1',
    name: 'Arjun Sharma',
    relation: 'Self',
    image: 'https://i.pravatar.cc/100?img=3',
    selected: true,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    relation: 'Spouse',
    image: 'https://i.pravatar.cc/100?img=5',
  },
  {
    id: '3',
    name: 'Aarav Sharma',
    relation: 'Child',
    image: 'https://i.pravatar.cc/100?img=6',
  },
];

const PatientDetails: React.FC = () => {
  const [patients, setPatients] = useState(dummyPatients);

  const handleSelect = (id: string) => {
    const updated = patients.map((p) => ({
      ...p,
      selected: p.id === id,
    }));
    setPatients(updated);
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[
        styles.patientItem,
        item.selected && styles.selectedPatient,
      ]}
      onPress={() => handleSelect(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.relation}>{item.relation}</Text>
      </View>

      {item.selected && <Text style={styles.check}>✔</Text>}
    </TouchableOpacity>
  );

  const selectedPatient = patients.find((p) => p.selected);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <Text style={styles.header}>Patient Details</Text>

      {/* CURRENT SELECTED */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Currently Selected</Text>

        {selectedPatient && (
          <View style={styles.selectedBox}>
            <Image
              source={{ uri: selectedPatient.image }}
              style={styles.avatarLarge}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{selectedPatient.name}</Text>
              <Text style={styles.phone}>+91 9876543210</Text>
            </View>

            <TouchableOpacity>
              <Text style={styles.link}>View Records →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* PATIENT LIST */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Patient List</Text>

          <TouchableOpacity>
            <Text style={styles.addBtn}>+ Add Patient</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={patients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* INFO BOX */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Switching Patients will update your dashboard and appointments for that profile.
        </Text>
      </View>

    </SafeAreaView>
  );
};

export default PatientDetails;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 16,
  },

  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarLarge: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 10,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
  },

  relation: {
    fontSize: 12,
    color: '#666',
  },

  phone: {
    fontSize: 12,
    color: '#888',
  },

  link: {
    color: '#0A8F5A',
    fontSize: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  addBtn: {
    color: '#0A8F5A',
    fontSize: 12,
    fontWeight: '600',
  },

  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  selectedPatient: {
    borderWidth: 1,
    borderColor: '#0A8F5A',
    borderRadius: 10,
    padding: 8,
  },

  check: {
    color: '#0A8F5A',
    fontWeight: 'bold',
  },

  infoBox: {
    backgroundColor: '#E8F5EF',
    padding: 12,
    borderRadius: 12,
  },

  infoText: {
    fontSize: 12,
    color: '#0A8F5A',
  },
});