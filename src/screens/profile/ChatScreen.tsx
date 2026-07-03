import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ Use route params from navigation
interface ChatScreenProps {
  route?: {
    params: {
      appointmentId: string;
      role: 'doctor' | 'patient';
      doctorName: string;
      patientName: string;
      doctorAvatar?: string;
      patientAvatar?: string;
    };
  };
}

export default function ChatScreen({ route }: ChatScreenProps) {
  // Default values — replace with your actual data
  const params = route?.params || {
    appointmentId: '44a923b5-2c6d-4fed-ae53-e2e9f201f66a',
    role: 'patient' as const,
    doctorName: 'Dr. Priya Sharma',
    patientName: 'Rahul Sharma',
    doctorAvatar: 'https://example.com/doctor.jpg',
    patientAvatar: 'https://example.com/patient.jpg',
  };

  return (
    <View style={styles.container}>
      <ChatContainer
        appointmentId={params.appointmentId}
        role={params.role}
        doctorName={params.doctorName}
        patientName={params.patientName}
        doctorAvatar={params.doctorAvatar}
        patientAvatar={params.patientAvatar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});