import React from 'react';
import { View, StyleSheet } from 'react-native';
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
            appointmentDate?: string;
        };
    };
}

export default function ChatScreen({ route }: ChatScreenProps) {
    const {
        appointmentId = '',
        role = 'patient' as const,
        doctorName = '',
        patientName = '',
        doctorAvatar,
        patientAvatar,
        appointmentDate,
    } = route?.params || {};

    return (
        <View style={styles.container}>
            <ChatContainer
                appointmentId={appointmentId}
                role={role}
                doctorName={doctorName}
                patientName={patientName}
                doctorAvatar={doctorAvatar}
                patientAvatar={patientAvatar}
                appointmentDate={appointmentDate}
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
