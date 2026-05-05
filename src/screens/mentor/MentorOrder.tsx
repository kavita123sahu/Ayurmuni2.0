import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const MentorOrder = ({ props }: any) => {

    // 👉 API se aane wala data (abhi dummy)
    const orderData = {
        status: "DELIVERED",
        message: "Your order was successfully delivered on Oct 14.",
        orderId: "#ORD-98231",
        date: "12 Oct 2023",
        items: {
            title: "Medicines Order",
            subtitle: "Prescription Bundle · 1 Unit",
            price: "₹1240.00",
            qty: 1,
            image: Images.Breakfast
        },
        address: "42-B, Sanctuary Heights, Green Valley, Near Wellness Plaza, Mumbai - 400012",
        timeline: [
            { title: "Ordered", time: "12 Oct, 10:30 AM", completed: true },
            { title: "Packed", time: "12 Oct, 02:15 PM", completed: true },
            { title: "Shipped", time: "13 Oct, 09:00 AM", completed: true },
            { title: "Delivered", time: "14 Oct, 11:20 AM", completed: true },
        ]
    };

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle='dark-content' backgroundColor={'#FFFFFFCC'} />

            <AppHeader
                title="Order Details "
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
            />


            <ScrollView style={styles.scrollview} contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}>

                <View style={styles.statusCard}>
                    <View style={{ flexDirection: 'row', gap: 5, margin: 2 }}>
                        <Image source={Images.tickk} style={{ height: 20, width: 20, tintColor: Colors.primaryColor, borderRadius: 20 }} />
                        <Text style={styles.statusTitle}>{orderData.status}</Text>
                    </View>
                    <Text style={styles.statusMsg}>{orderData.message}</Text>
                </View>

                <View style={styles.cardRow}>
                    <View>
                        <Text style={styles.label}>ORDER IDENTIFICATION</Text>
                        <Text style={styles.orderId}>{orderData.orderId}</Text>
                    </View>

                    <View>
                        <Text style={styles.label}>DATE</Text>
                        <Text style={styles.date}>{orderData.date}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Items in this order</Text>

                    <View style={styles.itemRow}>
                        <Image source={orderData.items?.image} style={styles.image} />

                        <View style={{ flex: 1, gap: 5, marginLeft: 5, }}>
                            <Text style={styles.itemTitle}>{orderData.items.title}</Text>
                            <Text style={styles.itemSub}>{orderData.items.subtitle}</Text>
                            <Text style={styles.price}>{orderData.items.price}</Text>
                        </View>

                        <Text style={styles.qty}>QTY: {orderData.items.qty}</Text>
                    </View>
                </View>

                <View style={[styles.itemRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Image source={Images.location} style={{ height: 20, width: 20 }} />
                        <View>
                            <Text style={[styles.sectionTitle, { marginBottom: -15 }]}>Delivery Address</Text>
                            <Text style={styles.dafultAddress}>Home • Default Address</Text>
                        </View>
                    </View>

                    <Text style={styles.address}>{orderData.address}</Text>
                </View>

                <View style={[styles.itemRow, { flexDirection: 'column', marginTop: 15, alignItems: 'flex-start' }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Order Timeline</Text>

                    {orderData.timeline.map((item, index) => (
                        <View key={index} style={styles.timelineRow}>
                            <View style={styles.timelineLeft}>
                                <View style={{ flex: 1, alignItems: "center" }}>

                                    <Image
                                        source={Images.tickk}
                                        style={[
                                            styles.circle,
                                            { tintColor: item.completed ? "#0B6E4F" : "#ccc" }
                                        ]}
                                    />

                                    {index !== orderData.timeline.length - 1 && (
                                        <View style={styles.line} />
                                    )}

                                </View>
                            </View>

                            <View>
                                <Text style={styles.timelineTitle}>{item.title}</Text>
                                <Text style={styles.timelineTime}>{item.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.outlineBtn}>
                    <Image source={Images.Refund} style={{ height: 9, width: 13 }} />
                    <Text style={styles.outlineText}>Return & Refund</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryBtn}>
                    <Image source={Images.exchange} style={{ height: 12, width: 16 }} />
                    <Text style={styles.primaryText}>Exchange</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MentorOrder;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",

    },

    scrollview: {

        paddingHorizontal: 20,
        backgroundColor: "#FDFDFB",
    },

    statusCard: {
        backgroundColor: "#0D614E0D",
        padding: 16,
        borderWidth: 1,
        borderColor: '#0D614E1A',
        borderRadius: 24,
        marginBottom: 12,
    },
    statusTitle: {

        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold
    },
    statusMsg: {
        color: "#3E4946",
        marginTop: 5,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium
    },

    cardRow: {
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginTop: 5,
        borderColor: "#94A3B833",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 25,
    },

    label: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: "#475569",
    },

    orderId: {
        color: "#0B6E4F",
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold
    },

    date: {
        color: Colors.black,
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold
    },

    card: {
        backgroundColor: "#fff",
        // padding: 16,
        // paddingHorizontal:10,
        marginTop: 10,
        borderRadius: 12,
        marginBottom: 12,
    },

    sectionTitle: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
        marginBottom: 10,
    },

    itemRow: {
        flexDirection: "row",
        backgroundColor: "#ffff",
        borderWidth: 1,
        paddingHorizontal: 16, paddingVertical: 16,
        borderRadius: 24,
        borderColor: '#94A3B833',
        alignItems: "center",
    },

    image: {
        width: 80,
        height: 80,
        backgroundColor: Colors.bgcolor,
        borderRadius: 10,
        marginRight: 10,
    },

    itemTitle: {
        color: Colors.black,
        marginBottom: -5,
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold
    },

    itemSub: {
        color: "#777",
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium
    },

    price: {
        color: "#0B6E4F",
        marginTop: 4,
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold
    },

    qty: {
        fontSize: 12,
        color: "#3E4946",
        padding: 5,
        fontFamily: Fonts.PoppinsMedium,
        paddingHorizontal: 10,
        right: 10,
        bottom: 20,
        position: 'absolute',
        borderRadius: 12,
        backgroundColor: '#EBEEED'
    },
    dafultAddress: {
        color: "#555",
        marginTop: 10,
        fontSize: 12,

        marginBottom: -5,
        fontFamily: Fonts.PoppinsMedium
    },

    address: {
        color: "#555",
        fontSize: 14,
        marginTop: 10,
        fontFamily: Fonts.PoppinsMedium
    },

    timelineRow: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-start",
    },

    timelineLeft: {
        alignItems: "center",
        marginRight: 10,
        width: 30,


    },

    circle: {
        width: 20,
        height: 20,
        marginBottom: 2,
        borderRadius: 11,
    },

    line: {
        width: 3,
        flex: 1,
        height: 40,
        backgroundColor: Colors.primaryColor,
    },

    timelineTitle: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
        color: Colors.black,
        marginBottom: -5

    },




    timelineTime: {
        fontSize: 12,
        color: "#777",
        fontFamily: Fonts.PoppinsMedium,

    },

    outlineBtn: {
        borderWidth: 1,
        flexDirection: 'row',
        borderColor: "#0B6E4F",
        padding: 16,
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,

        borderRadius: 16,
        alignItems: "center",
        marginBottom: 10,
    },

    outlineText: {
        color: "#0B6E4F",
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14
    },

    primaryBtn: {
        backgroundColor: "#0B6E4F",
        padding: 16,

        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 16,
        alignItems: "center",
    },
    primaryText: {
        color: "#fff",
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14
    },
});