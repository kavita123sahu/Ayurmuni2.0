import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextStyle,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';
import AppHeader from '../components/AppHeader';
import { useNotifications } from '../hooks/useNotification';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: any;
    iconBg: string;
    image?: any;
    type: string;
    section: string;
    is_read?: boolean;
    rawData?: any;
}

const renderStyledText = (text: string) => {
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
                    if (word.includes('%')) {
                        return (
                            <Text key={index} style={styles.offerText}>
                                {word + ' '}
                            </Text>
                        );
                    }

                    if (index > 0 && words[index - 1].includes('%')) {
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

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const NotificationCard = ({ item }: { item: NotificationItem }) => {
    const status = item?.rawData?.data?.appointment_status;

    if (item.type === "appointment") {
        return (
            <View style={styles.appointmentCard}>
                <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                        {item.icon}
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.title}>{item.title}</Text>
                            <View style={styles.timeBadge}>
                                <Text style={styles.timeGreen}>{item.time}</Text>
                            </View>
                        </View>

                        <Text style={styles.desc}>
                            {renderStyledText(item.description)}
                        </Text>

                        <View style={styles.buttonRow}>
                            {status === "completed" && (
                                <TouchableOpacity style={styles.joinBtn}>
                                    <Text numberOfLines={1} style={styles.joinText}>Join Call</Text>
                                </TouchableOpacity>
                            )}

                            {status === "cancelled" && (
                                <TouchableOpacity style={styles.detailBtn}>
                                    <Text numberOfLines={1} style={styles.detailText}>Details</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg + '20' }]}>
                    {item.icon}
                </View>

                <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>

                    
                    <Text style={styles.desc}>
                        {renderStyledText(item.description)}
                    </Text>

                    {item?.image && (
                        <Image source={item.image} style={styles.image} />
                    )}
                </View>
            </View>
        </View>

    );
};

const NotificationsScreen = (props: any) => {

    const {
        notifications,
        loading,
        loadingMore,
        loadMore,
        // refreshNotifications,
    } = useNotifications();

    console.log("notificationsnotifications", notifications)

    const renderSection = (section: string, title: string) => {
        const data = notifications?.filter(n => n.section === section);
        console.log("data", data)

        if (data?.length === 0) return null;

        return (
            <>
                <SectionHeader title={title} />
                {data?.map(item => (

                    <NotificationCard key={item.id} item={item} />
                ))}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFFCC'} />

            <AppHeader
                title="Notifications"
                onLeftPress={() => props.navigation.goBack()}
                rightLabel="Clear All"
            // ✅ FIX
            />


            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (

                    <NotificationCard item={item} />
                )}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 20
                }}
                // onRefresh={refreshNotifications}
                refreshing={loading}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={{ paddingVertical: 10 }}>
                            <ActivityIndicator size="small" color="#0D614E" />
                        </View>
                    ) : null
                }
                ListHeaderComponent={
                    <>
                        {renderSection('upcoming', 'UPCOMING')}
                        {renderSection('today', 'TODAY')}
                        {renderSection('yesterday', 'YESTERDAY')}
                    </>
                }
            />

        </SafeAreaView>
    );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // marginBottom: 50,
        backgroundColor: '#FDFDFB',

    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },

    backIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'center',
        color: "#0F172A",
        fontFamily: Fonts.PoppinsSemiBold
    },

    clear: {
        color: '#0D614E',
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold
    },

    sectionHeader: {
        marginTop: 20,
        marginBottom: 20,
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Fonts.PoppinsSemiBold
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        shadowColor: '#ffff',
        marginBottom: 12,
    },

    appointmentCard: {
        backgroundColor: '#0D614E0D',
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#0D614E33"
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    iconBox: {
        height: 48,
        width: 48,
        borderRadius: 16,
        tintColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    icon: {
        height: 24,
        width: 24,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 16,
        marginRight: 6,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    time: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,

    },

    timeBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: "#0D614E1A",
        borderRadius: 6,
        marginLeft: 8,
        flexShrink: 0, // 👈 VERY IMPORTANT
    },
    timeGreen: {
        fontSize: 10,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    desc: {
        fontSize: 14,
        color: '#475569',
        marginTop: 4,
        fontFamily: Fonts.PoppinsRegular
    },

    boldText: {
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#000',
    },

    hashText: {
        color: "black",
        fontFamily: Fonts.PoppinsSemiBold,
    },

    offerText: {
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
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
        flex: 1, // 👈 equal width
        backgroundColor: '#0D614E',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    joinText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },

    detailBtn: {

        flex: 1, // 👈 equal width
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
    },

    detailText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },
});