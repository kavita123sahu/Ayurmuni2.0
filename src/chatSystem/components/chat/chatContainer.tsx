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

import { getChatDisabledReason, AppointmentChatLike, shouldSuppressChatError } from '../../utils/chatAccessUtils';
import { dedupeMessages } from '../../utils/messageUtils';
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

    appointmentContext?: AppointmentChatLike;

}



export const ChatContainer: React.FC<ChatContainerProps> = ({

    appointmentId, role, doctorName = 'Doctor', patientName = 'Patient',

    doctorAvatar, patientAvatar, appointmentDate, appointmentContext,

}) => {

    const insets = useSafeAreaInsets();

    const {

        messages, isLoading, isConnected, error, participantRole,

        sendMessage, markAsRead, chatAccess, loadMessages, isChatEnabled,

    } = useChat(appointmentId, role, appointmentDate, appointmentContext);



    const flatListRef = useRef<FlatList>(null);

    const [isAtBottom] = useState(true);

    const markedReadRef = useRef<Set<string>>(new Set());



    const disabledReason = getChatDisabledReason(chatAccess, appointmentDate, appointmentContext);
    const visibleError =
        error && !shouldSuppressChatError(error, messages.length) ? error : null;

    const inputPlaceholder = isChatEnabled

        ? 'Type a message...'

        : 'Chat closed — read only';



    useFocusEffect(

        React.useCallback(() => {

            loadMessages();

        }, [loadMessages])

    );



    useEffect(() => {

        if (!isChatEnabled) return;



        const unread = messages.filter(

            (msg) => msg.sender_role !== participantRole && !msg.is_seen && !markedReadRef.current.has(msg.id)

        );

        if (unread.length > 0) {

            unread.forEach((m) => markedReadRef.current.add(m.id));

            markAsRead(unread.map((m) => m.id));

        }

    }, [messages, participantRole, markAsRead, isChatEnabled]);



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



    const handleSend = async (text: string, attachments?: any[]) => {
        if (!isChatEnabled) {
            return;
        }
        if (text?.trim() || (attachments && attachments.length > 0)) {
            await sendMessage(text, attachments);
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



    const isDoctor = participantRole === 'doctor';

    const keyboardOffset =
        Platform.OS === 'ios' ? Math.max(insets.top, 8) + 52 : 24;



    return (

        <SafeAreaView style={styles.container} edges={['top']}>

            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />



            <View style={styles.headerWrap}>

                <ChatHeader

                    title={isDoctor ? patientName : doctorName}

                    avatar={isDoctor ? patientAvatar : doctorAvatar}

                    isOnline={isConnected}

                    // readOnly={!isChatEnabled}

                    role={participantRole}

                />

            </View>



            <KeyboardAvoidingView

                style={styles.keyboardView}

                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}

                keyboardVerticalOffset={keyboardOffset}

            >

                {isLoading && messages.length === 0 ? (

                    <View style={styles.inlineLoader}>

                        <ActivityIndicator size="small" color={THEME} />

                        <Text style={styles.loadingText}>Loading messages...</Text>

                    </View>

                ) : null}



                <FlatList

                    ref={flatListRef}

                    data={dedupeMessages(messages)}

                    renderItem={renderMessage}

                    keyExtractor={(item, index) => `${item.id}-${index}`}

                    style={styles.messageList}

                    contentContainerStyle={[

                        styles.messageListContent,

                        messages.length === 0 && !isLoading && styles.emptyListContent,

                    ]}

                    keyboardShouldPersistTaps="handled"

                    keyboardDismissMode="interactive"

                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}

                    ListEmptyComponent={

                        !isLoading ? (

                            <View style={styles.emptyState}>

                                <Text style={styles.emptyTitle}>No messages yet</Text>

                                <Text style={styles.emptySubtitle}>

                                    Start a conversation when chat is open, or check back later for history.

                                </Text>

                            </View>

                        ) : null

                    }

                    onContentSizeChange={() => {

                        if (messages.length > 0) {

                            flatListRef.current?.scrollToEnd({ animated: true });

                        }

                    }}

                />



                {!isChatEnabled && disabledReason ? (

                    <View style={styles.disabledBanner}>

                        <Text style={styles.disabledBannerText}>

                            {disabledReason}

                        </Text>

                    </View>

                ) : null}



                <View style={styles.inputWrap}>

                    <MessageInput

                        onSend={handleSend}

                        isConnected={isConnected}

                        isDisabled={!isChatEnabled}

                        placeholder={inputPlaceholder}

                    />

                </View>



                {visibleError && (
                    <View style={styles.errorToast}>
                        <Text style={styles.errorText}>{visibleError}</Text>
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

    },

    inlineLoader: {

        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'center',

        paddingVertical: 10,

        gap: 8,

    },

    loadingText: { fontSize: 13, color: '#6B7280' },

    keyboardView: { flex: 1, backgroundColor: Colors.background },

    messageList: { flex: 1 },

    messageListContent: {

        flexGrow: 1,

        paddingHorizontal: 12,

        paddingTop: 8,

        paddingBottom: 8,

    },

    emptyListContent: {

        flexGrow: 1,

        justifyContent: 'center',

    },

    emptyState: {

        alignItems: 'center',

        paddingHorizontal: 24,

        paddingVertical: 40,

    },

    emptyTitle: {

        fontSize: 16,

        fontWeight: '600',

        color: '#374151',

        marginBottom: 6,

    },

    emptySubtitle: {

        fontSize: 13,

        color: '#6B7280',

        textAlign: 'center',

        lineHeight: 18,

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


