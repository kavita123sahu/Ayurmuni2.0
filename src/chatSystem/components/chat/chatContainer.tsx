import React, { useState, useRef, useEffect } from 'react';
import {
    View, FlatList, Text, StyleSheet, KeyboardAvoidingView,
    Platform, TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { useChat } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '../../types/chat';
import { getChatDisabledReason } from '../../utils/chatAccessUtils';
import { Colors } from '../../../common/Colors';

const THEME = '#0D614E';

interface ChatContainerProps {
    appointmentId: string;
    role: 'doctor' | 'patient';
    doctorName?: string;
    patientName?: string;
    doctorAvatar?: string;
    patientAvatar?: string;
    appointmentDate?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    appointmentId, role, doctorName = 'Doctor', patientName = 'Patient',
    doctorAvatar, patientAvatar, appointmentDate,
}) => {
    const insets = useSafeAreaInsets();
    const {
        messages, isLoading, isConnected, error, participantRole,
        sendMessage, markAsRead, chatAccess, loadMessages, isChatEnabled,
    } = useChat(appointmentId, role, appointmentDate);

    const flatListRef = useRef<FlatList>(null);
    const [isAtBottom] = useState(true);
    const markedReadRef = useRef<Set<string>>(new Set());

    const inputPlaceholder = isChatEnabled
        ? 'Type a message...'
        : getChatDisabledReason(chatAccess, appointmentDate) || 'Chat is closed';

    useFocusEffect(
        React.useCallback(() => {
            loadMessages();
        }, [loadMessages])
    );

    useEffect(() => {
        const unread = messages.filter(
            (msg) => msg.sender_role !== participantRole && !msg.is_seen && !markedReadRef.current.has(msg.id)
        );
        if (unread.length > 0) {
            unread.forEach((m) => markedReadRef.current.add(m.id));
            markAsRead(unread.map((m) => m.id));
        }
    }, [messages, participantRole, markAsRead]);

    useEffect(() => {
        if (isAtBottom && messages.length > 0) {
            const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            return () => clearTimeout(t);
        }
    }, [messages, isAtBottom]);

    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
            return () => clearTimeout(t);
        }
    }, [isLoading, messages.length]);

    const handleSend = (text: string, attachments?: any[]) => {
        if (!isChatEnabled) {
            return;
        }
        if (text?.trim() || (attachments && attachments.length > 0)) {
            sendMessage(text, attachments);
        }
    };

    const formatDate = (date: string) => new Date(date).toDateString();

    const renderMessage = ({
        item,
        index,
    }: {
        item: Message;
        index: number;
    }) => {
        const prev = index > 0 ? messages[index - 1] : undefined;
        const showDate =
            !prev ||
            formatDate(item.created_at) !== formatDate(prev.created_at);

        return (
            <>
                {showDate && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                )}

                <MessageBubble
                    message={item}
                    isOwn={item.sender_role === participantRole}
                    senderName={item.sender_name || 'Unknown'}
                />
            </>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME} />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isDoctor = participantRole === 'doctor';
    const keyboardOffset = Platform.OS === 'ios' ? insets.top : 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.headerWrap}>
                <ChatHeader
                    title={isDoctor ? patientName : doctorName}
                    avatar={isDoctor ? patientAvatar : doctorAvatar}
                    isOnline={isConnected}
                    role={participantRole}
                />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={keyboardOffset}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    onContentSizeChange={() => {
                        if (messages.length > 0) {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }
                    }}
                />

                {!isChatEnabled && (
                    <View style={styles.disabledBanner}>
                        <Text style={styles.disabledBannerText}>
                            {inputPlaceholder}
                        </Text>
                    </View>
                )}

                <View style={styles.inputWrap}>
                    <MessageInput
                        onSend={handleSend}
                        isConnected={isConnected}
                        isDisabled={!isChatEnabled}
                        placeholder={inputPlaceholder}
                    />
                </View>

                {error && (
                    <View style={styles.errorToast}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => loadMessages()}>
                            <Text style={styles.errorRetry}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    headerWrap: {
        zIndex: 10,
        // backgroundColor: '',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
    keyboardView: { flex: 1, backgroundColor: Colors.background },
    messageList: { flex: 1 },
    messageListContent: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 10,
    },
    dateText: {
        backgroundColor: '#E5E7EB',
        color: '#374151',
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    disabledBanner: {
        backgroundColor: '#FEF3C7',
        borderTopWidth: 1,
        borderTopColor: '#FDE68A',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    disabledBannerText: {
        color: '#92400E',
        fontSize: 12,
        textAlign: 'center',
    },
    inputWrap: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    errorToast: {
        position: 'absolute', bottom: 80, left: 16, right: 16,
        backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 12,
        borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    errorText: { color: '#FFFFFF', fontSize: 13, flex: 1 },
    errorRetry: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginLeft: 12 },
});
