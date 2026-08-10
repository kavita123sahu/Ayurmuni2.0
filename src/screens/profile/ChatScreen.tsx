import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatContainer } from '../../chatSystem/components/chat/chatContainer';
import { AppointmentChatLike } from '../../chatSystem/utils/chatAccessUtils';

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
            chatContext?: AppointmentChatLike;
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
        chatContext,
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
                appointmentContext={chatContext}
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
