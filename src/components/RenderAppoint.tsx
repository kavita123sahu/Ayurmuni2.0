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



const DateTimeCard = ({ item }: { item: Appointment }) => {
    return (

        <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                    <Image source={Images.calender} style={Styles.IconSize} />
                </View>

                <View>
                    <Text style={Styles.label}>DATE</Text>
                    <Text style={Styles.value}>{item.date}</Text>
                </View>
            </View>

            <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                    <Image source={Images.clock} style={Styles.IconSize} />
                </View>
                <View>
                    <Text style={Styles.label}>TIME</Text>
                    <Text style={Styles.value}>{item.time}</Text>
                </View>
            </View>

        </View>
    )
}

const RenderAppoint = ({
    item,
    navigation,
    onReschedule,
    onCancel,
}: any) => {
    const statusStyle = useMemo(
        () => getStatusStyle(item.status),
        [item.status]


    );
    console.log("itemitemitemitem", item)

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate("AppointmentDetails", {
                    consultation_id: item?.consultation_id
                })
            }
        >
            <View style={styles.row}>
                <Image
                    source={
                        item.image
                            ? { uri: item.image }
                            : Images.doctorImage
                    }
                    style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                    <Text style={Styles.name}>
                        {item.doctorName}
                    </Text>

                    <Text style={Styles.specialty}>
                        {item.specialty}
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

            <DateTimeCard item={item} />

            <AppointAction
                status={item.status}
                onReschedule={onReschedule}
                onCancel={onCancel}

                onJoinCall={() => {
                    navigation.navigate("VideoCall", {
                        appointmentId: item.consultation_id,
                        doctorId: item.doctor_id,
                    });
                }}

                onViewDetails={() => {
                    navigation.navigate("DoctorSlipScreen", {
                        doctorID: item?.rawData?.doctor?.doctor_id
                        // appointmentId: item?.doctor?.doctor_id
                    });
                }}
            />
        </TouchableOpacity>
    );
};

export default memo(RenderAppoint);

const styles = StyleSheet.create({

    /* Card */
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        overflow: 'hidden',
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

    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 8,
    },

})