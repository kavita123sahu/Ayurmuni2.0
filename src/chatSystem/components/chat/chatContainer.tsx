import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Keyboard,
} from 'react-native';
import { useChat } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatContainerProps {
    appointmentId: string;
    role: 'doctor' | 'patient';
    doctorName?: string;
    patientName?: string;
    doctorAvatar?: string;
    patientAvatar?: string;
    // onBack?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    appointmentId,
    role,
    doctorName = 'Doctor',
    patientName = 'Patient',
    doctorAvatar,
    patientAvatar,
    // onBack,
}) => {
    console.log('📝 ChatContainer:', { appointmentId, role });

    const {
        messages,
        isLoading,
        isConnected,
        error,
        participantRole,
        sendMessage,
        markAsRead,
        chatAccess,
        loadMessages,
    } = useChat(appointmentId, role);

    const flatListRef = useRef<FlatList>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // ✅ Mark messages as read
    useEffect(() => {
        if (messages.length > 0) {
            const unreadMessages = messages.filter(
                (msg) => msg.sender_role !== participantRole && !msg.is_seen
            );
            if (unreadMessages.length > 0) {
                console.log('📖 Marking unread messages:', unreadMessages.length);
                markAsRead(unreadMessages.map((m) => m.id));
            }
        }
    }, [messages, participantRole, markAsRead]);

    // ✅ Scroll to bottom
    useEffect(() => {
        if (isAtBottom && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isAtBottom]);

    // ✅ Initial scroll
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 200);
        }
    }, [isLoading, messages.length]);

    // ✅ Handle send message
    const handleSend = (text: string, attachments?: any[]) => {
        console.log('📤 Sending message:', text, attachments);
        if (text?.trim() || (attachments && attachments.length > 0)) {
            sendMessage(text, attachments);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isOwn = item.sender_role === participantRole;
        const senderName = item.sender_name || (isOwn
            ? participantRole === 'doctor'
                ? doctorName
                : patientName
            : participantRole === 'doctor'
                ? patientName
                : doctorName);

        return (
            <MessageBubble
                message={item}
                isOwn={isOwn}
                senderName={senderName || 'Unknown'}
            />
        );
    };

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
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
        );
    }

    const isDoctor = participantRole === 'doctor';
    const canSend = chatAccess?.can_send ?? true;

    return (
        <SafeAreaView style={styles.container} >
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* ✅ Header */}
            <ChatHeader
                title={isDoctor ? patientName : doctorName}
                avatar={isDoctor ? patientAvatar : doctorAvatar}
                isOnline={isConnected}
                role={participantRole}
            // onBack={onBack}
            />

            {/* ✅ Messages + Input */}
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                enabled={true}
            >
                {/* ✅ Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.messageList}
                    ListEmptyComponent={renderEmpty}
                    onContentSizeChange={() => {
                        if (isAtBottom) {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }
                    }}
                    onLayout={() => {
                        if (isAtBottom) {
                            flatListRef.current?.scrollToEnd({ animated: false });
                        }
                    }}
                    onScrollBeginDrag={() => setIsAtBottom(false)}
                    onMomentumScrollEnd={(e) => {
                        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
                        const isBottom =
                            contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
                        setIsAtBottom(isBottom);
                    }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={20}
                    maxToRenderPerBatch={30}
                    windowSize={10}
                    keyboardDismissMode="on-drag"
                />

                {/* ✅ Input - Fixed at bottom */}
                <View style={styles.inputWrapper}>
                    <MessageInput
                        onSend={handleSend}
                        isConnected={isConnected}
                        isDisabled={!canSend}
                    />
                </View>

                {/* ✅ Error toast */}
                {error && (
                    <View style={styles.errorToast}>
                        <Text style={styles.errorText}>❌ {error}</Text>
                        <TouchableOpacity onPress={() => loadMessages()}>
                            <Text style={styles.errorRetry}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ✅ Connection status */}
                {!isConnected && !isLoading && (
                    <View style={styles.connectionStatus}>
                        <ActivityIndicator size="small" color="#D97706" />
                        <Text style={styles.connectionText}>🔄 Reconnecting...</Text>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    keyboardView: {
        flex: 1,
        marginBottom: Platform.OS === 'ios' ? 0 : 100,
    },
    messageList: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#D1D5DB',
        marginTop: 4,
    },
    errorToast: {
        position: 'absolute',
        bottom: 80,
        left: 16,
        right: 16,
        backgroundColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 13,
        flex: 1,
    },
    errorRetry: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 12,
    },
    connectionStatus: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#FEF3C7',
        paddingVertical: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    connectionText: {
        fontSize: 12,
        color: '#D97706',
        marginLeft: 8,
    },
});