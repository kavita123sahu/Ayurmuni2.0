import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Modal,
    Pressable,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../common/Fonts';
import AppHeader from '../components/AppHeader';
import { useNotifications, NotificationItem } from '../hooks/useNotification';
import TablerIcon from '../components/TablerIcon';
import {
    buildAppointmentDetailsParams,
    buildVideoCallNavParams,
} from '../utils/appointmentUtils';
import { navigateToStackScreen } from '../navigation/navigationUtils';
import { handleNotificationNavigation } from './notifications/notificationRouter';
import { normalizeNotificationPayload } from '../services/inAppNotificationService';
import { navigationRef } from '../navigation/navigationRef';
import { getDetailBottomPadding } from '../constants/layout';
import SectionHeader from '../components/SectionHeader';

const getNotificationImageSource = (image: unknown) => {
    if (!image) return null;
    if (typeof image === 'string') return { uri: image };
    if (typeof image === 'object' && image !== null) {
        const obj = image as { uri?: string; url?: string };
        if (obj.uri) return { uri: obj.uri };
        if (obj.url) return { uri: obj.url };
    }
    return null;
};

/* ------------------------------------------------------------------ */
/*  TEXT HIGHLIGHTING HELPER (unchanged behaviour)                     */
/* ------------------------------------------------------------------ */

const renderStyledText = (text: string) => {
    if (!text) return null;

    if (text.includes('Dr.') && text.includes('starts')) {
        const beforeDr = text.split('Dr.')[0];
        const afterDrPart = text.split('Dr.')[1];

        const doctorName = 'Dr.' + afterDrPart.split('starts')[0];
        const afterName = 'starts' + afterDrPart.split('starts')[1];

        return (
            <Text style={styles.desc}>
                <Text style={styles.desc}>{beforeDr}</Text>
                <Text style={styles.boldText}>{doctorName}</Text>
                <Text style={styles.desc}>{afterName}</Text>
            </Text>
        );
    }

    if (text.includes('%')) {
        const words = text.split(' ');
        return (
            <Text style={styles.desc}>
                {words.map((word, index) => {
                    if (word.includes('%') || (index > 0 && words[index - 1].includes('%'))) {
                        return (
                            <Text key={index} style={styles.offerText}>
                                {word + ' '}
                            </Text>
                        );
                    }
                    return (
                        <Text key={index} style={styles.desc}>
                            {word + ' '}
                        </Text>
                    );
                })}
            </Text>
        );
    }

    if (text.includes('#')) {
        const words = text.split(' ');
        return (
            <Text style={styles.desc}>
                {words.map((word, index) => {
                    if (word.startsWith('#')) {
                        return (
                            <Text key={index} style={styles.hashText}>
                                {word + ' '}
                            </Text>
                        );
                    }
                    return (
                        <Text key={index} style={styles.desc}>
                            {word + ' '}
                        </Text>
                    );
                })}
            </Text>
        );
    }

    return <Text style={styles.desc}>{text}</Text>;
};

/* ------------------------------------------------------------------ */
/*  FILTER TABS (All / Unread / Read + type chips)                     */
/* ------------------------------------------------------------------ */

const FILTERS: { key: 'all' | 'unread' | 'read'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
];

const TYPE_FILTERS: { key: string; label: string }[] = [
    { key: 'all', label: 'All types' },
    { key: 'appointment', label: 'Appointments' },
    { key: 'prescription', label: 'Follow-ups' },
];

const FilterTabs = ({
    activeFilter,
    onChangeFilter,
    activeType,
    onChangeType,
}: {
    activeFilter: string;
    onChangeFilter: (key: any) => void;
    activeType: string;
    onChangeType: (key: any) => void;
}) => (
    <View style={styles.filtersWrap}>
        <View style={styles.filterTabsRow}>
            {FILTERS.map(f => (
                <TouchableOpacity
                    key={f.key}
                    onPress={() => onChangeFilter(f.key)}
                    style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
                >
                    <Text
                        style={[
                            styles.filterTabText,
                            activeFilter === f.key && styles.filterTabTextActive,
                        ]}
                    >
                        {f.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeChipsRow}
        >
            {TYPE_FILTERS.map(t => (
                <TouchableOpacity
                    key={t.key}
                    onPress={() => onChangeType(t.key)}
                    style={[styles.typeChip, activeType === t.key && styles.typeChipActive]}
                >
                    <Text
                        style={[
                            styles.typeChipText,
                            activeType === t.key && styles.typeChipTextActive,
                        ]}
                    >
                        {t.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

/* ------------------------------------------------------------------ */
/*  NOTIFICATION CARD  — ecommerce style                              */
/* ------------------------------------------------------------------ */

// Map notification types to accent colours
const TYPE_ACCENT: Record<string, { bg: string; text: string; dot: string }> = {
    appointment: { bg: '#EEF2FF', text: '#4338CA', dot: '#6366F1' },
    prescription: { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
    offer: { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
    order: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
    reminder: { bg: '#FDF4FF', text: '#7E22CE', dot: '#A855F7' },
    default: { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
};

const getTypeAccent = (type?: string) => {
    const key = String(type ?? '').toLowerCase();
    for (const k of Object.keys(TYPE_ACCENT)) {
        if (k !== 'default' && key.includes(k)) return TYPE_ACCENT[k];
    }
    return TYPE_ACCENT.default;
};

const NotificationCard = ({
    item,
    onPress,
    onQuickMarkRead,
    onJoinCall,
    onViewDetails,
}: {
    item: NotificationItem;
    onPress: (item: NotificationItem) => void;
    onQuickMarkRead: (item: NotificationItem) => void;
    onJoinCall: (item: NotificationItem) => void;
    onViewDetails: (item: NotificationItem) => void;
}) => {
    const callStatus = String(
        item?.rawData?.data?.call_status ?? item?.rawData?.call_status ?? '',
    ).toLowerCase();
    const apptStatus = String(
        item.appointmentStatus ?? item?.rawData?.data?.appointment_status ?? '',
    ).toLowerCase();
    const showJoinCall = callStatus === 'in_progress';
    const showDetails =
        !showJoinCall &&
        (apptStatus === 'cancelled' || apptStatus === 'completed' || !!item.appointmentId);
    const isUnread = !item.isRead;
    const accent = getTypeAccent(item.notificationType ?? item.eventType);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPress(item)}
            style={[styles.card, isUnread && styles.cardUnread]}
        >
            {/* Thin unread indicator on left edge */}
            {isUnread && (
                <View style={[styles.unreadBar, { backgroundColor: accent.dot }]} />
            )}

            <View style={styles.cardRow}>
                {/* Small icon circle */}
                <View style={[styles.iconCircle, { backgroundColor: item.iconBg ?? accent.bg }]}>
                    {item.icon}
                </View>

                {/* Text block */}
                <View style={styles.cardText}>
                    <View style={styles.cardTopRow}>
                        <Text
                            style={[styles.title, isUnread && styles.titleUnread]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <Text style={styles.desc} numberOfLines={2}>
                        {item.description}
                    </Text>

                    {/* Action links — inline, small */}
                    {/* {(showJoinCall || showDetails) ? (
                        <View style={styles.actionRow}>
                            {showJoinCall ? (
                                <TouchableOpacity
                                    style={styles.joinBtn}
                                    onPress={() => onJoinCall(item)}
                                    activeOpacity={0.8}
                                >
                                    <TablerIcon name="video" size={11} color="#fff" />
                                    <Text style={styles.joinText}>Join Call</Text>
                                </TouchableOpacity>
                            ) : null}
                            {showDetails ? (
                                <TouchableOpacity
                                    onPress={() => onViewDetails(item)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.detailText}>View Details →</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ) : null} */}
                </View>

                {/* Unread dot / tap to mark read */}
                {isUnread ? (
                    <TouchableOpacity
                        onPress={() => onQuickMarkRead(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                        style={styles.dotBtn}
                    >
                        <View style={[styles.unreadDot, { backgroundColor: accent.dot }]} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.dotPlaceholder} />
                )}
            </View>
        </TouchableOpacity>
    );
};

/* ------------------------------------------------------------------ */
/*  DETAIL MODAL                                                       */
/* ------------------------------------------------------------------ */

const NotificationDetailModal = ({
    visible,
    item,
    onClose,
    onMarkRead,
    onViewAppointment,
}: {
    visible: boolean;
    item: NotificationItem | null;
    onClose: () => void;
    onMarkRead: (item: NotificationItem) => void;
    onViewAppointment: (item: NotificationItem) => void;
}) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isSmallDevice = width < 360;

    if (!item) return null;

    const isUnread = !item.isRead;
    const patient = item.patientName ?? item?.rawData?.data?.patient_name;
    const doctor = item.doctorName ?? item?.rawData?.data?.doctor_name;
    const reason = item.reason ?? item?.rawData?.data?.reason;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={onClose} />
                <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <View style={styles.modalHandle} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={styles.modalScrollContent}
                    >
                        <View style={styles.modalHeaderRow}>
                            <View style={[styles.modalIconBox, { backgroundColor: item.iconBg }]}>
                                {item.icon}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle} numberOfLines={2}>{item.title}</Text>
                                <Text style={styles.modalMetaText}>{item.time}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <TablerIcon name="x" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {isUnread ? (
                            <View style={styles.modalUnreadBanner}>
                                <Text style={styles.modalUnreadTitle}>Unread</Text>
                            </View>
                        ) : null}

                        <Text style={styles.modalSectionLabel}>Message</Text>
                        <Text style={styles.modalBoxText}>{item.description}</Text>

                        {item.eventType ? (
                            <>
                                <Text style={styles.modalSectionLabel}>Event</Text>
                                <View style={styles.modalTag}>
                                    <Text style={styles.modalTagText}>{item.eventType}</Text>
                                </View>
                            </>
                        ) : null}

                        {(patient || doctor || reason) ? (
                            <>
                                <Text style={styles.modalSectionLabel}>Details</Text>
                                <View style={styles.modalDetailsBox}>
                                    {patient ? (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>Patient</Text>
                                            <Text style={styles.modalDetailValue}>{String(patient)}</Text>
                                        </View>
                                    ) : null}
                                    {doctor ? (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>Doctor</Text>
                                            <Text style={styles.modalDetailValue}>{String(doctor)}</Text>
                                        </View>
                                    ) : null}
                                    {reason ? (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>Reason</Text>
                                            <Text style={styles.modalDetailValue}>{String(reason)}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </>
                        ) : null}

                        <View style={[styles.modalButtonRow, isSmallDevice && styles.modalButtonRowCompact]}>
                            {item.appointmentId ? (
                                <TouchableOpacity
                                    style={[styles.modalViewBtn, isSmallDevice && styles.modalActionFull]}
                                    onPress={() => onViewAppointment(item)}
                                >
                                    <Text style={styles.modalViewBtnText} numberOfLines={1}>View Appointment</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                style={[
                                    styles.modalMarkBtn,
                                    !isUnread && styles.modalMarkBtnDisabled,
                                    isSmallDevice && styles.modalActionFull,
                                ]}
                                disabled={!isUnread}
                                onPress={() => onMarkRead(item)}
                            >
                                {isUnread ? <TablerIcon name="tick" size={14} color="#0D614E" /> : null}
                                <Text
                                    style={[styles.modalMarkBtnText, !isUnread && styles.modalMarkBtnTextDisabled]}
                                    numberOfLines={1}
                                >
                                    {isUnread ? 'Mark as Read' : 'Already Read'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

/* ------------------------------------------------------------------ */
/*  EMPTY STATE                                                        */
/* ------------------------------------------------------------------ */

const EmptyState = ({ filter }: { filter: 'all' | 'unread' | 'read' }) => {
    const copy =
        filter === 'unread'
            ? {
                title: 'No unread notifications',
                subtitle: 'You have read everything. New alerts will appear here.',
            }
            : filter === 'read'
                ? {
                    title: 'No read notifications',
                    subtitle: 'Notifications you mark as read will show up here.',
                }
                : {
                    title: 'No notifications yet',
                    subtitle: "You're all caught up. New updates will show up here.",
                };

    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIconGlyph}>🔔</Text>
            </View>
            <Text style={styles.emptyTitle}>{copy.title}</Text>
            <Text style={styles.emptySubtitle}>{copy.subtitle}</Text>
        </View>
    );
};

/* ------------------------------------------------------------------ */
/*  MAIN SCREEN                                                        */
/* ------------------------------------------------------------------ */

const NotificationsScreen = (props: any) => {
    const {
        notifications,
        loading,
        loadingMore,
        refreshing,
        loadMore,
        filter,
        typeFilter,
        setFilter,
        setTypeFilter,
        markAsRead,
        markAllRead,
        clearNotifications,
        refreshNotifications,
    } = useNotifications();

    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isSmallDevice = width < 360;
    const listBottomPad = getDetailBottomPadding(insets);
    const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openDetail = (item: NotificationItem) => {
        const raw = item.rawData ?? item;
        const nested =
            typeof raw?.data === 'object' && raw.data ? raw.data : {};
        const typeRaw = String(
            raw?.notification_type ??
            raw?.type ??
            nested?.notification_type ??
            nested?.type ??
            item.type ??
            '',
        ).toLowerCase();

        const callStatus = String(
            nested?.call_status ??
            raw?.call_status ??
            nested?.appointment?.call_status ??
            '',
        ).toLowerCase();
        const textBlob = `${item.title || ''} ${item.description || ''}`.toLowerCase();
        const isJoinCall =
            callStatus === 'in_progress' ||
            callStatus === 'started' ||
            callStatus === 'ongoing' ||
            typeRaw.includes('call') ||
            typeRaw.includes('video') ||
            textBlob.includes('join the call') ||
            textBlob.includes('join call') ||
            textBlob.includes('join now') ||
            textBlob.includes('doctor started') ||
            textBlob.includes('call started') ||
            textBlob.includes('call now');

        // Doctor started / join call → video call screen
        if (isJoinCall) {
            handleJoinCall(item);
            return;
        }

        // Prescription notification → respective Prescription History detail
        if (
            typeRaw.includes('prescription') ||
            textBlob.includes('prescription')
        ) {
            const appointmentId =
                nested?.appointment_id ??
                raw?.appointment_id ??
                item.appointmentId ??
                nested?.consultation_id ??
                raw?.consultation_id;
            const consultationId =
                nested?.consultation_id ??
                raw?.consultation_id ??
                appointmentId;
            const prescriptionId =
                nested?.prescription_id ?? raw?.prescription_id;

            navigateToStackScreen(props.navigation, 'PrescriptionDetail', {
                appointment_id: appointmentId,
                consultation_id: consultationId,
                prescription_id: prescriptionId,
                PrisData: {
                    appointment_id: appointmentId,
                    consultation_id: consultationId,
                    prescription_id: prescriptionId,
                    ...nested,
                },
            });
            return;
        }

        const payload = normalizeNotificationPayload({
            ...(typeof raw === 'object' ? raw : {}),
            ...nested,
            title: item.title,
            message: item.description,
            type: typeRaw || item.type,
            route: raw?.route ?? nested?.route ?? raw?.screen,
            order_id: raw?.order_id ?? nested?.order_id,
            appointment_id:
                raw?.appointment_id ??
                nested?.appointment_id ??
                item.appointmentId,
            product_id: raw?.product_id ?? nested?.product_id,
            prescription_id:
                raw?.prescription_id ?? nested?.prescription_id,
            diet_id: raw?.diet_id ?? nested?.diet_id,
            doctor_id: raw?.doctor_id ?? nested?.doctor_id,
            call_status: callStatus,
            doctor_name: item.doctorName ?? raw?.doctor_name ?? nested?.doctor_name,
        });

        if (
            payload.route ||
            payload.screen ||
            payload.order_id ||
            payload.appointment_id ||
            payload.product_id ||
            payload.prescription_id ||
            payload.diet_id ||
            payload.doctor_id ||
            payload.type
        ) {
            handleNotificationNavigation(
                props.navigation ?? navigationRef,
                payload,
            );
            return;
        }

        setSelectedItem(item);
        setModalVisible(true);
    };

    const closeDetail = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const handleMarkRead = async (item: NotificationItem) => {
        if (item.isRead) {
            return;
        }


        setSelectedItem(prev =>
            prev && prev.id === item.id
                ? { ...prev, isRead: true, isNew: false, rawData: { ...prev.rawData, is_read: true } }
                : prev,
        );
        setModalVisible(false);

        await markAsRead?.(item.id);
    };

    const handleMarkAllRead = () => {
        markAllRead?.();
    };

    const handleClearAll = () => {
        clearNotifications?.();
    };

    const handleViewAppointment = (item: NotificationItem) => {
        closeDetail();
        navigateToStackScreen(
            props.navigation,
            'AppointmentDetails',
            buildAppointmentDetailsParams(item.rawData ?? item),
        );
    };

    const handleJoinCall = (item: NotificationItem) => {
        navigateToStackScreen(
            props.navigation,
            'PatientVideoCallScreen',
            buildVideoCallNavParams(item.rawData ?? item, {
                role: 'patient',
                otherPartyName: item.doctorName,
            }),
        );
    };

    const handleViewDetails = (item: NotificationItem) => {
        const raw = item.rawData ?? item;
        const payload = normalizeNotificationPayload({
            ...(typeof raw === 'object' ? raw : {}),
            ...(typeof raw?.data === 'object' ? raw.data : {}),
            route: raw?.route ?? raw?.data?.route ?? 'AppointmentDetails',
            appointment_id:
                raw?.appointment_id ??
                raw?.data?.appointment_id ??
                item.appointmentId,
        });
        handleNotificationNavigation(
            props.navigation ?? navigationRef,
            payload,
        );
    };

    const sections = useMemo(() => {
        const sectionOrder = [
            { key: 'upcoming', title: 'UPCOMING' },
            { key: 'today', title: 'TODAY' },
            { key: 'yesterday', title: 'YESTERDAY' },
            { key: 'older', title: 'OLDER' },
        ];

        return sectionOrder
            .map(section => ({
                title: section.title,
                data: (notifications ?? []).filter(
                    (n: NotificationItem) =>
                        n.section === section.key && n.title && n.description,
                ),
            }))
            .filter(section => section.data.length > 0);
    }, [notifications]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={'#FFFFFFCC'} />

            <AppHeader
                title="Notifications"
                onLeftPress={() => props.navigation.goBack()}
                rightContent={
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={handleMarkAllRead}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            style={styles.headerActionBtn}
                        >
                            <Text style={styles.headerActionPrimary} numberOfLines={1}>
                                Mark all
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleClearAll}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            style={styles.headerActionBtn}
                        >
                            <Text style={styles.headerActionMuted} numberOfLines={1}>
                                Clear
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <NotificationCard
                        item={item}
                        onPress={openDetail}
                        onQuickMarkRead={handleMarkRead}
                        onJoinCall={handleJoinCall}
                        onViewDetails={handleViewDetails}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <SectionHeader title={title} />
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{
                    paddingHorizontal: isSmallDevice ? 12 : 16,
                    paddingBottom: listBottomPad,
                    flexGrow: 1,
                }}
                onRefresh={refreshNotifications}
                refreshing={refreshing}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading && !refreshing ? <EmptyState filter={filter} /> : null
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={{ paddingVertical: 10 }}>
                            <ActivityIndicator size="small" color="#0D614E" />
                        </View>
                    ) : loading && notifications.length === 0 ? (
                        <View style={{ paddingVertical: 40 }}>
                            <ActivityIndicator size="small" color="#0D614E" />
                        </View>
                    ) : null
                }
                ListHeaderComponent={
                    <FilterTabs
                        activeFilter={filter}
                        onChangeFilter={setFilter}
                        activeType={typeFilter}
                        onChangeType={setTypeFilter}
                    />
                }
            />

            <NotificationDetailModal
                visible={modalVisible}
                item={selectedItem}
                onClose={closeDetail}
                onMarkRead={handleMarkRead}
                onViewAppointment={handleViewAppointment}
            />
        </SafeAreaView>
    );
};

export default NotificationsScreen;

/* ------------------------------------------------------------------ */
/*  STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFDFB',
    },

    sectionHeader: {
        marginTop: 12,
        marginBottom: 8,
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------- Header actions ---------- */
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingRight: 4,
    },
    headerActionBtn: {
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    headerActionPrimary: {
        fontSize: 13,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    headerActionMuted: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ---------- Filters ---------- */
    filtersWrap: {
        marginTop: 8,
        marginBottom: 4,
    },
    filterTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    filterTabText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    filterTabTextActive: {
        color: '#0D614E',
    },
    typeChipsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
        paddingRight: 8,
    },
    typeChip: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    typeChipActive: {
        backgroundColor: '#0D614E',
        borderColor: '#0D614E',
    },
    typeChipText: {
        fontSize: 11,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
    },
    typeChipTextActive: {
        color: '#fff',
    },

    /* ---------- Notification Card — lean list row ---------- */
    card: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F4F2',
        overflow: 'hidden',
    },
    cardUnread: {
        backgroundColor: '#F9FDFB',
    },
    unreadBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 11,
        paddingLeft: 18,   // leaves room for the unread bar
        paddingRight: 12,
        gap: 10,
    },
    cardText: {
        flex: 1,
        minWidth: 0,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        marginBottom: 2,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
    },

    time: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
        flexShrink: 0,
    },

    title: {
        flex: 1,
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        lineHeight: 18,
    },
    titleUnread: {
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    desc: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 17,
        fontFamily: Fonts.PoppinsRegular,
    },

    boldText: {
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    hashText: {
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    offerText: {
        color: '#C2410C',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* Action row */
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },
    joinBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#0D614E',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    joinText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    detailText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },

    /* Unread dot */
    dotBtn: {
        paddingTop: 4,
        flexShrink: 0,
    },
    dotPlaceholder: {
        width: 8,
        flexShrink: 0,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    /* Legacy unused but kept to avoid breakage */
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statusUnread: { backgroundColor: '#0D614E14' },
    statusRead: { backgroundColor: '#F1F5F9' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    dotUnread: { backgroundColor: '#0D614E' },
    dotRead: { backgroundColor: '#94A3B8' },
    statusBadgeText: { fontSize: 10, fontFamily: Fonts.PoppinsSemiBold },
    statusUnreadText: { color: '#0D614E' },
    statusReadText: { color: '#64748B' },
    eventTypeBadge: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#F1F5F9' },
    eventTypeText: { fontSize: 10, color: '#475569', fontFamily: Fonts.PoppinsMedium },
    infoText: { fontSize: 12, color: '#64748B', fontFamily: Fonts.PoppinsRegular },
    buttonRow: { flexDirection: 'row', marginTop: 6, gap: 8 },
    statusChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FEF3C7' },
    statusChipText: { fontSize: 11, color: '#92400E', fontFamily: Fonts.PoppinsSemiBold },
    cardTopRowLegacy: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
    metaText: { fontSize: 12, color: '#64748B', fontFamily: Fonts.PoppinsRegular },
    typeBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#0D614E14' },
    typeBadgeText: { fontSize: 10, color: '#0D614E', fontFamily: Fonts.PoppinsSemiBold },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4, marginBottom: 2 },

    /* ---------- Empty State ---------- */
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        height: 72,
        width: 72,
        borderRadius: 36,
        backgroundColor: '#0D614E0D',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyIconGlyph: {
        fontSize: 28,
    },
    emptyTitle: {
        fontSize: 16,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        textAlign: 'center',
    },

    /* ---------- Modal ---------- */
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    modalCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        width: '100%',
        maxHeight: '78%',
    },
    modalHandle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        marginTop: 8,
        marginBottom: 4,
    },
    modalScrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    modalIconBox: {
        height: 34,
        width: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 20,
    },
    modalMetaText: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        marginTop: 2,
    },
    modalUnreadBanner: {
        alignSelf: 'flex-start',
        backgroundColor: '#EAF8F4',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 10,
    },
    modalUnreadTitle: {
        fontSize: 11,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    modalSectionLabel: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 4,
        marginTop: 8,
    },
    modalBoxText: {
        fontSize: 13,
        color: '#334155',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 19,
    },
    modalTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginBottom: 4,
    },
    modalTagText: {
        fontSize: 11,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
    },
    modalDetailsBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        gap: 8,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    modalDetailLabel: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        flexShrink: 0,
    },
    modalDetailValue: {
        fontSize: 12,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        flex: 1,
        textAlign: 'right',
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    modalButtonRowCompact: {
        flexDirection: 'column',
    },
    modalActionFull: {
        width: '100%',
        flex: 0,
    },
    modalViewBtn: {
        flex: 1,
        backgroundColor: '#0D614E',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalViewBtnText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    modalMarkBtn: {
        flex: 1,
        backgroundColor: '#0D614E14',
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalMarkBtnDisabled: {
        backgroundColor: '#F1F5F9',
    },
    modalMarkBtnText: {
        color: '#0D614E',
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    modalMarkBtnTextDisabled: {
        color: '#94A3B8',
    },
});