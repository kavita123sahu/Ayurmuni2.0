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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../common/Fonts';
import AppHeader from '../components/AppHeader';
import { useNotifications, NotificationItem } from '../hooks/useNotification';

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
/*  SECTION HEADER                                                     */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

/* ------------------------------------------------------------------ */
/*  SUMMARY / HEADER CARD                                              */
/* ------------------------------------------------------------------ */

const SummaryCard = ({
    total,
    unread,
    onMarkAllRead,
    onClearAll,
    isSmallDevice,
}: {
    total: number;
    unread: number;
    onMarkAllRead: () => void;
    onClearAll: () => void;
    isSmallDevice: boolean;
}) => (
    <View style={[styles.summaryCard, isSmallDevice && styles.summaryCardCompact]}>
        <View style={styles.summaryLeft}>
            <View style={styles.summaryIconBox}>
                <Text style={styles.summaryIconGlyph}>🔔</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
                <Text style={styles.summaryTitle} numberOfLines={1}>Notifications</Text>
                <Text style={styles.summarySubtitle} numberOfLines={1}>
                    You have {total} notification{total === 1 ? '' : 's'}
                </Text>
            </View>
            {unread > 0 && (
                <View style={styles.unreadPill}>
                    <Text style={styles.unreadPillText}>{unread} unread</Text>
                </View>
            )}
        </View>

        <View style={[styles.summaryRight, isSmallDevice && styles.summaryRightCompact]}>
            <TouchableOpacity
                style={[styles.markAllBtn, isSmallDevice && styles.actionBtnFull]}
                onPress={onMarkAllRead}
            >
                <Text style={styles.markAllBtnText} numberOfLines={1}>✓  Mark all as read</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.clearAllBtn, isSmallDevice && styles.actionBtnFull]}
                onPress={onClearAll}
            >
                <Text style={styles.clearAllBtnText} numberOfLines={1}>✕  Clear all</Text>
            </TouchableOpacity>
        </View>
    </View>
);

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
    { key: 'follow_up', label: 'Follow-ups' },
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
/*  NOTIFICATION CARD                                                  */
/* ------------------------------------------------------------------ */

const NotificationCard = ({
    item,
    onPress,
    onQuickMarkRead,
}: {
    item: NotificationItem;
    onPress: (item: NotificationItem) => void;
    onQuickMarkRead: (item: NotificationItem) => void;
}) => {
    const status = item.appointmentStatus ?? item?.rawData?.data?.appointment_status;
    const isUnread = !item.isRead;

    const appointmentDate = item?.rawData?.data?.appointment_date ?? item?.rawData?.data?.date;
    const consultationType = item?.rawData?.data?.consultation_type ?? item?.rawData?.data?.mode;

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item)}>
            <View style={[styles.card, isUnread && styles.cardUnread]}>
                {isUnread && <View style={styles.unreadStrip} />}

                <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: item.iconBg + '20' }]}>
                        {item.icon}
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={styles.cardTopRow}>
                            <View style={styles.cardTopLeft}>
                                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                                <View style={styles.badgeRow}>
                                    {item.isNew && isUnread && (
                                        <View style={styles.newBadge}>
                                            <Text style={styles.newBadgeText}>New</Text>
                                        </View>
                                    )}
                                    {item.notificationType ? (
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeBadgeText} numberOfLines={1}>
                                                {item.notificationType}
                                            </Text>
                                        </View>
                                    ) : null}
                                    <View style={[styles.statusBadge, isUnread ? styles.statusUnread : styles.statusRead]}>
                                        <View style={[styles.statusDot, isUnread ? styles.dotUnread : styles.dotRead]} />
                                        <Text style={[styles.statusBadgeText, isUnread ? styles.statusUnreadText : styles.statusReadText]}>
                                            {isUnread ? 'Unread' : 'Read'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardTopRight}>
                                <View style={styles.timeRow}>
                                    <Text style={styles.clockIcon}>🕐</Text>
                                    <Text style={styles.time}>{item.time}</Text>
                                </View>
                                {isUnread ? (
                                    <TouchableOpacity
                                        style={styles.quickReadBtn}
                                        onPress={() => onQuickMarkRead(item)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Text style={styles.quickReadIcon}>✓</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        {renderStyledText(item.description)}

                        {item.eventType ? (
                            <View style={styles.eventTypeBadge}>
                                <Text style={styles.eventTypeText}>{item.eventType}</Text>
                            </View>
                        ) : null}

                        {/* Meta row: patient, appointment date, consultation type */}
                        {(item.patientName || appointmentDate || consultationType) && (
                            <View style={styles.metaRow}>
                                {item.patientName && (
                                    <Text style={styles.metaText} numberOfLines={1}>👤  {item.patientName}</Text>
                                )}
                                {appointmentDate && (
                                    <Text style={styles.metaText} numberOfLines={1}>📅  {appointmentDate}</Text>
                                )}
                                {consultationType && (
                                    <Text style={styles.metaText} numberOfLines={1}>🎥  {consultationType}</Text>
                                )}
                            </View>
                        )}

                        {item.doctorName && (
                            <Text style={styles.infoText}>🩺  {item.doctorName}</Text>
                        )}

                        {item?.rawData?.image ? (
                            <Image source={item.rawData.image} style={styles.image} />
                        ) : null}

                        {status && (
                            <View style={styles.buttonRow}>
                                {status === 'completed' && (
                                    <TouchableOpacity style={styles.joinBtn}>
                                        <Text numberOfLines={1} style={styles.joinText}>Join Call</Text>
                                    </TouchableOpacity>
                                )}
                                {status === 'cancelled' && (
                                    <TouchableOpacity style={styles.detailBtn}>
                                        <Text numberOfLines={1} style={styles.detailText}>Details</Text>
                                    </TouchableOpacity>
                                )}
                                {status === 'pending' && (
                                    <View style={styles.statusChip}>
                                        <Text style={styles.statusChipText}>Pending</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
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
    const { width, height } = useWindowDimensions();
    const isSmallDevice = width < 360;

    if (!item) return null;

    const isUnread = !item.isRead;
    const patient = item.patientName ?? item?.rawData?.data?.patient_name;
    const doctor = item.doctorName ?? item?.rawData?.data?.doctor_name;
    const reason = item.reason ?? item?.rawData?.data?.reason;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable
                    style={[styles.modalCard, { maxHeight: height * 0.85 }]}
                    onPress={() => { }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={styles.modalScrollContent}
                    >
                        <View style={styles.modalHeaderRow}>
                            <View style={styles.modalHeaderLeft}>
                                <View style={styles.modalIconBox}>
                                    <Text style={styles.summaryIconGlyph}>🔔</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>{item.title}</Text>
                                    <View style={styles.modalMetaRow}>
                                        <Text style={styles.modalMetaText}>{item.time}</Text>
                                        <View style={[styles.statusBadge, isUnread ? styles.statusUnread : styles.statusRead]}>
                                            <View style={[styles.statusDot, isUnread ? styles.dotUnread : styles.dotRead]} />
                                            <Text style={[styles.statusBadgeText, isUnread ? styles.statusUnreadText : styles.statusReadText]}>
                                                {isUnread ? 'Unread' : 'Read'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={styles.modalCloseIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalDivider} />

                        {isUnread ? (
                            <View style={styles.modalUnreadBanner}>
                                <Text style={styles.modalUnreadTitle}>🔔  This notification is unread</Text>
                                <Text style={styles.modalUnreadSubtitle}>Mark as read to update its status</Text>
                            </View>
                        ) : null}

                        <Text style={styles.modalSectionLabel}>💬  Message</Text>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalBoxText}>{item.description}</Text>
                        </View>

                        {item.eventType ? (
                            <>
                                <Text style={styles.modalSectionLabel}>ⓘ  Event</Text>
                                <View style={styles.modalTag}>
                                    <Text style={styles.modalTagText}>{item.eventType}</Text>
                                </View>
                            </>
                        ) : null}

                        {(patient || doctor || reason) ? (
                            <>
                                <Text style={styles.modalSectionLabel}>📄  Details</Text>
                                <View style={styles.modalDetailsBox}>
                                    {patient ? (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>👤  Patient</Text>
                                            <Text style={[styles.modalDetailValue, styles.modalDetailValueWrap]}>{patient}</Text>
                                        </View>
                                    ) : null}
                                    {doctor ? (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>🩺  Doctor</Text>
                                            <Text style={[styles.modalDetailValue, styles.modalDetailValueWrap]}>{doctor}</Text>
                                        </View>
                                    ) : null}
                                    {reason ? (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailLabel}>⚠️  Reason</Text>
                                            <Text style={[styles.modalDetailValue, styles.modalDetailValueWrap]}>{reason}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </>
                        ) : null}

                        <View style={[styles.modalButtonRow, isSmallDevice && styles.modalButtonRowCompact]}>
                            {item.appointmentId ? (
                                <TouchableOpacity
                                    style={[styles.modalViewBtn, isSmallDevice && styles.actionBtnFull]}
                                    onPress={() => onViewAppointment(item)}
                                >
                                    <Text style={styles.modalViewBtnText} numberOfLines={1}>⤴  View Appointment</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                style={[
                                    styles.modalMarkBtn,
                                    !isUnread && styles.modalMarkBtnDisabled,
                                    isSmallDevice && styles.actionBtnFull,
                                ]}
                                disabled={!isUnread}
                                onPress={() => onMarkRead(item)}
                            >
                                <Text
                                    style={[styles.modalMarkBtnText, !isUnread && styles.modalMarkBtnTextDisabled]}
                                    numberOfLines={1}
                                >
                                    ✓  {isUnread ? 'Mark as Read' : 'Already Read'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
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
        unreadCount,
        filter,
        typeFilter,
        setFilter,
        setTypeFilter,
        markAsRead,
        markAllRead,
        clearNotifications,
        refreshNotifications,
    } = useNotifications();

    const { width } = useWindowDimensions();
    const isSmallDevice = width < 360;

    const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openDetail = (item: NotificationItem) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const closeDetail = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const handleMarkRead = async (item: NotificationItem) => {
        setSelectedItem(prev =>
            prev && prev.id === item.id
                ? { ...prev, isRead: true, isNew: false, rawData: { ...prev.rawData, is_read: true } }
                : prev,
        );

        await markAsRead?.(item.id);

        if (filter === 'unread') {
            closeDetail();
        }
    };

    const handleMarkAllRead = () => {
        markAllRead?.();
    };

    const handleClearAll = () => {
        clearNotifications?.();
    };

    const handleViewAppointment = (item: NotificationItem) => {
        closeDetail();
        props.navigation?.navigate?.('AppointmentDetail', {
            appointmentId: item.appointmentId,
        });
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

    const total = notifications?.length ?? 0;
    const unread = unreadCount ?? 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={'#FFFFFFCC'} />

            <AppHeader title="Notifications" onLeftPress={() => props.navigation.goBack()} />

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <NotificationCard
                        item={item}
                        onPress={openDetail}
                        onQuickMarkRead={handleMarkRead}
                    />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <SectionHeader title={title} />
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{
                    paddingHorizontal: isSmallDevice ? 12 : 16,
                    paddingBottom: 24,
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
                    <>
                        <SummaryCard
                            total={total}
                            unread={unread}
                            onMarkAllRead={handleMarkAllRead}
                            onClearAll={handleClearAll}
                            isSmallDevice={isSmallDevice}
                        />
                        <FilterTabs
                            activeFilter={filter}
                            onChangeFilter={setFilter}
                            activeType={typeFilter}
                            onChangeType={setTypeFilter}
                        />
                    </>
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
        marginTop: 20,
        marginBottom: 12,
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------- Summary Card ---------- */
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    summaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryIconBox: {
        height: 44,
        width: 44,
        borderRadius: 14,
        backgroundColor: '#0D614E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    summaryIconGlyph: {
        fontSize: 18,
    },
    summaryTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    summarySubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        marginTop: 2,
    },
    summaryCardCompact: {
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 14,
    },
    summaryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    summaryRightCompact: {
        flexDirection: 'column',
        alignItems: 'stretch',
        marginTop: 14,
    },
    actionBtnFull: {
        width: '100%',
        marginRight: 0,
        marginBottom: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    unreadPill: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: '#0D614E14',
        marginRight: 8,
    },
    unreadPillText: {
        fontSize: 11,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    markAllBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#0D614E',
        marginRight: 8,
    },
    markAllBtnText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    clearAllBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    clearAllBtnText: {
        color: '#334155',
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------- Filters ---------- */
    filtersWrap: {
        marginTop: 16,
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

    /* ---------- Notification Card ---------- */
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        marginTop: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    cardUnread: {
        backgroundColor: '#FBFEFD',
        borderWidth: 1,
        borderColor: '#0D614E1F',
    },
    unreadStrip: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#0D614E',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    iconBox: {
        height: 48,
        width: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    newBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    newBadgeText: {
        fontSize: 10,
        color: '#334155',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    typeBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#0D614E14',
    },
    typeBadgeText: {
        fontSize: 10,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
        gap: 4,
    },
    statusUnread: {
        backgroundColor: '#0D614E14',
    },
    statusRead: {
        backgroundColor: '#F1F5F9',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    dotUnread: {
        backgroundColor: '#0D614E',
    },
    dotRead: {
        backgroundColor: '#94A3B8',
    },
    statusBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    statusUnreadText: {
        color: '#0D614E',
    },
    statusReadText: {
        color: '#64748B',
    },

    title: {
        fontSize: 16,
        marginRight: 6,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    time: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },

    desc: {
        fontSize: 14,
        color: '#475569',
        marginTop: 4,
        fontFamily: Fonts.PoppinsRegular,
    },

    boldText: {
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#000',
    },

    hashText: {
        color: 'black',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    offerText: {
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    eventTypeBadge: {
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    eventTypeText: {
        fontSize: 10,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
    },

    infoText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },

    image: {
        width: '100%',
        height: 140,
        borderRadius: 10,
        marginTop: 10,
    },

    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },

    joinBtn: {
        flex: 1,
        backgroundColor: '#0D614E',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    detailBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },

    statusChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#FEF3C7',
    },
    statusChipText: {
        fontSize: 11,
        color: '#92400E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------- Card top row (title/badges left, time/quick-read right) ---------- */
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    cardTopLeft: {
        flex: 1,
        minWidth: 0,
    },
    cardTopRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    clockIcon: {
        fontSize: 10,
    },
    quickReadBtn: {
        height: 22,
        width: 22,
        borderRadius: 11,
        backgroundColor: '#0D614E14',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickReadIcon: {
        fontSize: 12,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------- Meta row (patient / date / consultation type) ---------- */
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    metaText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },

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
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 420,
        overflow: 'hidden',
    },
    modalScrollContent: {
        padding: 20,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 12,
    },
    modalIconBox: {
        height: 40,
        width: 40,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
    },
    modalMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    modalMetaText: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },
    modalCloseIcon: {
        fontSize: 16,
        color: '#94A3B8',
        padding: 4,
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    modalUnreadBanner: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    modalUnreadTitle: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    modalUnreadSubtitle: {
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        marginTop: 2,
    },
    modalSectionLabel: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 8,
    },
    modalBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    modalBoxText: {
        fontSize: 14,
        color: '#334155',
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 20,
    },
    modalTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    modalTagText: {
        fontSize: 12,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
    },
    modalDetailsBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        gap: 12,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    modalDetailLabel: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
        flexShrink: 0,
    },
    modalDetailValue: {
        fontSize: 13,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        flex: 1,
        textAlign: 'right',
    },
    modalDetailValueWrap: {
        flexWrap: 'wrap',
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    modalButtonRowCompact: {
        flexDirection: 'column',
    },
    modalViewBtn: {
        flex: 1,
        backgroundColor: '#0D614E',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalViewBtnText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    modalMarkBtn: {
        flex: 1,
        backgroundColor: '#0D614E14',
        paddingVertical: 12,
        borderRadius: 10,
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