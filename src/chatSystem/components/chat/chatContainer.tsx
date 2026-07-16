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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '../../types/chat';

const THEME = '#0D614E';

interface ChatContainerProps {
    appointmentId: string;
    role: 'doctor' | 'patient';
    doctorName?: string;
    patientName?: string;
    doctorAvatar?: string;
    patientAvatar?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    appointmentId, role, doctorName = 'Doctor', patientName = 'Patient',
    doctorAvatar, patientAvatar,
}) => {
    const {
        messages, isLoading, isConnected, error, participantRole,
        sendMessage, markAsRead, chatAccess, loadMessages,
    } = useChat(appointmentId, role);


    const flatListRef = useRef<FlatList>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const markedReadRef = useRef<Set<string>>(new Set()); // ✅ dedupe — dobara mark-read spam na ho


    useFocusEffect(
        React.useCallback(() => {
            loadMessages();
        }, [])
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
    }, [isLoading]);

    const handleSend = (text: string, attachments?: any[]) => {
        if (text?.trim() || (attachments && attachments.length > 0)) {
            sendMessage(text, attachments);
        }
    };


    const formatDate = (date: string) => {
        return new Date(date).toDateString();
    };
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
    // const renderMessage = ({ item }: { item: any }) => {
    //     const isOwn = item.sender_role === participantRole;
    //     const senderName = item.doctorName;
    //     return <MessageBubble message={item} isOwn={isOwn} senderName={senderName || 'Unknown'} />;
    // };

    const keyExtractor = (item: any) => item.id || `msg-${item.created_at}`;

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>💬 No messages yet</Text>
            <Text style={styles.emptySubText}>Start the conversation!</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME} />
                <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
        );
    }

    const isDoctor = participantRole === 'doctor';
    const canSend = chatAccess?.can_send ?? true;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <ChatHeader
                title={isDoctor ? patientName : doctorName}
                avatar={isDoctor ? patientAvatar : doctorAvatar}
                isOnline={isConnected}
                role={participantRole}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                {/* <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.messageList}
                    ListEmptyComponent={renderEmpty}
                    onContentSizeChange={() => isAtBottom && flatListRef.current?.scrollToEnd({ animated: true })}
                    onScrollBeginDrag={() => setIsAtBottom(false)}
                    onMomentumScrollEnd={(e) => {
                        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
                        setIsAtBottom(contentOffset.y + layoutMeasurement.height >= contentSize.height - 20);
                    }}
                    style={{flex:1}}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={20}
                    maxToRenderPerBatch={30}
                    windowSize={10}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                /> */}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                />


                <MessageInput onSend={handleSend} isConnected={isConnected} isDisabled={!canSend} />

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
    container: { flex: 1, backgroundColor: '#F5F1EA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
    keyboardView: { flex: 1 },
    messageList: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
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
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 18, color: '#9CA3AF', fontWeight: '500' },
    emptySubText: { fontSize: 14, color: '#D1D5DB', marginTop: 4 },
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