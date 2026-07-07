import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatContainer } from '../../chatSystem/components/chat/chatContainer';
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
    // ✅ Your appointment details
    // const params = {
    //     appointmentId: 'a059b339-296b-42c0-8e4c-7cba0b62e4c5',
    //     role: 'patient' as const,
    //     doctorName: 'Dr. Mohit Beniwal',
    //     patientName: 'Sonam Wangchu',
    //     doctorAvatar: undefined,
    //     patientAvatar: undefined,
    // };

   const {
     appointmentId = '',
     role = 'patient' as const,
     doctorName = '',
     patientName = '',
     doctorAvatar,
     patientAvatar,
   } = route?.params || {};

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ChatContainer
                appointmentId={appointmentId}
                role={role}
                doctorName={doctorName}
                patientName={patientName}
                doctorAvatar={doctorAvatar}
                patientAvatar={patientAvatar}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
});