import React, { memo, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from "react-native";

import { Images } from "../common/Images";
import { Styles } from "../common/Styles";
import { Appointment, getStatusStyle } from "../common/DataInterface";
import { Colors } from "../common/Colors";
import { Fonts } from "../common/Fonts";
import AppointAction from "./AppointAction";
import TablerIcon from "./TablerIcon";
export const DateTimeCard = ({
    item,
    isHorizontal = false,
}: any) => {

    if (isHorizontal) {
        return (
            <View style={styles.horizontalDateCard}>
                <View style={styles.horizontalDateItem}>
                    <TablerIcon name="calendar" size={16} color={Colors.primaryColor} />
                    <Text style={styles.horizontalText}>
                        {item.date}
                    </Text>
                </View>

                <View style={styles.horizontalDivider} />

                <View style={styles.horizontalDateItem}>
                    <TablerIcon name="clock" size={16} color={Colors.primaryColor} />
                    <Text style={styles.horizontalText}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                    <TablerIcon name="calendar" size={18} color={Colors.primaryColor} />
                </View>

                <View>
                    <Text>Date</Text>
                    <Text>{item.date}</Text>
                </View>
            </View>

            <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                    <TablerIcon name="clock" size={18} color={Colors.primaryColor} />
                </View>

                <View>
                    <Text>Time</Text>
                    <Text>{item.time}</Text>
                </View>
            </View>
        </View>
    );
};

const RenderAppoint = ({
    item,
    navigation,
    onReschedule,
    isHorizontal = false,
    onCancel,
}: any) => {
    const statusStyle = useMemo(
        () => getStatusStyle(item.status),
        [item.status]


    );

    console.log("navigationrender", item);

    const therapies = Array.isArray(item?.rawData?.doctor?.health_diseases)
        ? item.rawData.doctor.health_diseases
            .map((disease: any) => disease.name)
            .join(", ")
        : "";

    console.log("therapiestherapies", therapies)
    return isHorizontal ? (
        <TouchableOpacity
            style={[styles.card, styles.horizontalCard]}
            onPress={() =>
                navigation.navigate("AppointmentDetails", {
                    consultation_id: item?.consultation_id,
                })
            }
        >
            <View style={styles.horizontalTop}>
                <View
                    style={[
                        styles.status,
                        {
                            backgroundColor:
                                statusStyle.backgroundColor,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            { color: statusStyle.color },
                        ]}
                    >
                        <Text>
                            {item.status === "cancellation_requested"
                                ? "CONFIRMED"
                                : item.status?.toUpperCase()}
                        </Text>

                        {/* {item.status?.toUpperCase()} */}
                    </Text>
                </View>
            </View>

            <View style={styles.horizontalDoctorRow}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.horizontalAvatar} />
                ) : (
                    <View style={[styles.horizontalAvatar, styles.avatarFallback]}>
                        <TablerIcon name="user" size={20} color={Colors.primaryColor} />
                    </View>
                )}

                <View style={{ flex: 1 }}>
                    <Text
                        style={styles.horizontalDoctorName}
                        numberOfLines={1}
                    >
                        {item.doctorName}
                    </Text>

                    <Text
                        style={styles.horizontalSpeciality}
                        numberOfLines={1}
                    >

                        {therapies?.split(',').slice(0, 2).join(', ')}


                        {/* {item.specialty}
                         */}
                    </Text>
                </View>
            </View>

            {item?.rawData?.follow_up?.date && (
                <View
                    style={{
                        alignSelf: 'flex-end',
                        marginBottom: 8,
                    }}>
                    <View
                        style={[
                            styles.followUP,
                            { backgroundColor: '#E8F5E9' },
                        ]}>
                        <Text style={styles.followUPText}>
                            Follow Up • {item.rawData.follow_up.date}
                        </Text>
                    </View>
                </View>
            )}
            <DateTimeCard
                item={item}
                isHorizontal
            />
        </TouchableOpacity>
    ) : (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate("AppointmentDetails", {
                    consultation_id: item?.consultation_id,
                })
            }
        >
            {/* Existing Full Card */}
            <View style={styles.contentContainer}>
                <View style={{ flexDirection: 'row' }}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarFallback]}>
                            <TablerIcon name="user" size={22} color={Colors.primaryColor} />
                        </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}>
                            <Text style={{
                                flex: 1,
                                marginRight: 10,
                            }}>
                                {item.name}
                            </Text>

                            {item?.rawData?.follow_up?.date && (
                                <View
                                    style={[
                                        styles.followUP,
                                        { backgroundColor: '#E8F5E9' },
                                    ]}>
                                    <Text style={styles.followUPText}>
                                        Follow Up • {item.rawData.follow_up.date}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>


                <View style={{ flex: 1 }}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={Styles.name}>
                                {item.doctorName}
                            </Text>

                            <Text style={Styles.specialty}>
                                {/* {item.specialty} */}
                                {therapies?.split(',').slice(0, 2).join(', ')}

                            </Text>
                        </View>

                        <View
                            style={[
                                styles.status,
                                {
                                    backgroundColor:
                                        statusStyle.backgroundColor,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    {
                                        color: statusStyle.color,
                                    },
                                ]}
                            >
                                {item.status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <DateTimeCard item={item} navigation={navigation} />
                </View>
            </View>

            <AppointAction
                status={item.status}
                call_status={item.call_status}
                onReschedule={onReschedule}
                onCancel={onCancel}
                onJoinCall={() =>
                    navigation.navigate("PatientVideoCallScreen", {
                        appointmentId: item?.consultation_id,
                        // call_status: item?.call_status,
                        role: "patient",
                        otherPartyName: item?.doctorName,
                        otherPartyImage: item?.image,
                    })
                }

                onViewDetails={() =>
                    navigation.navigate("DoctorSlipScreen", {
                        doctorID:
                            item?.rawData?.doctor?.doctor_id,
                    })
                }
            />
        </TouchableOpacity>
    );
};

export default memo(RenderAppoint);

const styles = StyleSheet.create({

    /* Card */
    card: {
        backgroundColor: Colors.white,
        borderRadius: 18,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        overflow: 'hidden',
        shadowColor: '#0D614E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 0,
    },


    contentContainer: {
        flexDirection: "column",
    },

    horizontalContent: {
        flexDirection: "row",
    },



    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },


    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 14,
        marginRight: 10,
    },

    followUP: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        alignSelf: 'flex-start',
    },

    followUPText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0D614E',
    },

    status: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
        alignSelf: 'flex-start', // 👈 fix
        flexShrink: 0, // 👈 no compression
    },

    confirmed: {
        backgroundColor: "#10B9811A",
    },

    cancelled: {
        backgroundColor: '#FEE2E2',
    },
    pending: {
        backgroundColor: '#FFF7ED',
    },


    statusText: {
        fontSize: 10,

        fontFamily: Fonts.PoppinsSemiBold,
    },


    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Colors.bgcolor,
        padding: 12,
        borderRadius: 12,
        height: 68,
        marginTop: 12,
    },

    infoItem: {
        // flex:1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    horizontalInfoRow: {
        marginTop: 10,
        height: "auto",
        paddingVertical: 10,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 8,
    },

    horizontalCard: {
        width: 248,
        padding: 12,
        marginRight: 12,
        marginBottom: 0,
    },

    horizontalTop: {
        alignItems: "flex-end",
        marginBottom: 6,
    },

    horizontalDoctorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    horizontalAvatar: {
        width: 42,
        height: 42,
        borderRadius: 12,
        marginRight: 8,
    },

    horizontalDoctorName: {
        fontSize: 13,
        color: Colors.black,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    horizontalSpeciality: {
        fontSize: 11,
        color: Colors.grey1,
        fontFamily: Fonts.PoppinsRegular,
    },

    horizontalDateCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.bgcolor,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },

    horizontalDateItem: {
        flexDirection: "row",
        alignItems: "center",
    },

    horizontalText: {
        fontSize: 11,
        marginLeft: 6,
        fontFamily: Fonts.PoppinsMedium,
    },

    horizontalDivider: {
        width: 1,
        height: 16,
        backgroundColor: Colors.borderColor,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0FAF7',
    },
})