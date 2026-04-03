import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: any;
    iconBg: string;
    image?: any;
    type: 'appointment' | 'normal';
    section: 'upcoming' | 'today' | 'yesterday';
}

const notifications: NotificationItem[] = [
    {
        id: '1',
        title: 'Doctor Appointment',
        description:
            'Your consultation with Dr. Arjun R Nair starts soon. Please be ready.',
        time: 'In 30 Mins',
        icon: require('../assets/images/calendarNot.png'),
        iconBg: '#0D614E',
        type: 'appointment',
        section: 'upcoming',
    },
    {
        id: '2',
        title: 'Order Out for Delivery',
        description:
            'Your medicine order #MD-9821 is arriving today by 6:00 PM.',
        time: '2h ago',
        icon: require('../assets/images/truckNot.png'),
        iconBg: '#4A90E2',
        type: 'normal',
        section: 'today',
    },
    {
        id: '3',
        title: 'Health Sale is Live!',
        description:
            'Get up to 25% OFF on all skincare products including Elixir Face Cream.',
        time: '5h ago',
        icon: require('../assets/images/tagNot.png'),
        iconBg: '#F5A623',
        image: require('../assets/images/productNot.png'),
        type: 'normal',
        section: 'today',
    },
    {
        id: '4',
        title: 'Refill Reminder',
        description:
            'Your prescription for Vitamin D3 is running low. Tap to refill your order.',
        time: '8h ago',
        icon: require('../assets/images/listNot.png'),
        iconBg: '#FF5A5F',
        type: 'normal',
        section: 'today',
    },
    {
        id: '5',
        title: 'Lab Reports Ready',
        description:
            'Your Annual Health Checkup reports are now available to view and download.',
        time: '1d ago',
        icon: require('../assets/images/labNot.png'),
        iconBg: '#4CD7A5',
        type: 'normal',
        section: 'yesterday',
    },
];

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
    if (item.type === 'appointment') {
        return (
            <View style={styles.appointmentCard}>
                <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                        <Image source={item.icon} style={styles.icon} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={styles.title}>{item.title}</Text>
                            </View>
                            <View style={{ paddingVertical: 4, backgroundColor: "#0D614E1A", borderRadius: 6, paddingHorizontal: 12 }}>
                                <Text style={styles.timeGreen}>{item.time}</Text>
                            </View>
                        </View>

                        <Text style={styles.desc}>
                            {renderStyledText(item.description)}
                        </Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.joinBtn}>
                                <Text style={styles.joinText}>Join Call</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.detailBtn}>
                                <Text style={styles.detailText}>Details</Text>
                            </TouchableOpacity>
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
                    <Image source={item.icon} style={styles.icon} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>

                    <Text style={styles.desc}>
                        {renderStyledText(item.description)}
                    </Text>

                    {item.image && (
                        <Image source={item.image} style={styles.image} />
                    )}
                </View>
            </View>
        </View>
    );
};

const NotificationsScreen = () => {
    const renderSection = (section: string, title: string) => {
        const data = notifications.filter(n => n.section === section);

        if (data.length === 0) return null;

        return (
            <>
                <SectionHeader title={title} />
                {data.map(item => (
                    <NotificationCard key={item.id} item={item} />
                ))}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { }}>
                    <Image
                        source={Images.backIcon}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Notifications</Text>

                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.clear}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={[]}
                renderItem={null}
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
        backgroundColor: '#F6F7FB',
        paddingHorizontal: 20,
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
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    iconBox: {
        height: 48,
        width: 48,
        borderRadius: 16,
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
        fontFamily: Fonts.PoppinsSemiBold,
    },

    time: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,

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
    },

    joinBtn: {
        backgroundColor: '#0D614E',
        paddingVertical: 6,
        paddingHorizontal: 36,
        borderRadius: 10,
        marginRight: 10,
    },

    joinText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },

    detailBtn: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 6,
        paddingHorizontal: 36,
        borderRadius: 10,
        backgroundColor: "#fff"
    },

    detailText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold
    },
});