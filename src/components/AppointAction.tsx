import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Styles } from "../common/Styles";
import { Colors } from "../common/Colors";
import { Fonts } from "../common/Fonts";

type Props = {
    status: string;
    onReschedule?: () => void;
    onCancel?: () => void;
    onJoinCall?: () => void;
    onViewDetails?: () => void;
};
const AppointmentActions = ({
    status,
    onReschedule,
    onCancel,
    onJoinCall,
    onViewDetails,
}: Props) => {
    const activeStatuses = [
        "pending",
        "confirmed",
        "reschedule",
        "rescheduled",
    ];

    const closedStatuses = [
        "completed",
        "cancelled",
        "missed",
    ];

    const showJoinCall = false; // dynamic logic later

    if (activeStatuses.includes(status)) {
        return (
            <View style={styles.btnRow}>
                {status !== "pending" && (
                    <TouchableOpacity
                        style={styles.outlineBtn}
                        onPress={onReschedule}
                    >
                        <Text style={Styles.outlineText}>
                            Reschedule
                        </Text>
                    </TouchableOpacity>
                )}

                {showJoinCall ? (
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={onJoinCall}
                    >
                        <Text style={styles.primaryText}>
                            Join Call
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.cancelBtn,
                            status !== "pending" && {
                                flex: 1,
                                marginTop: 0,
                            },
                        ]}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelText}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (closedStatuses.includes(status)) {
        return (
            <TouchableOpacity
                style={styles.primaryBtn}
                onPress={onViewDetails}
            >
                <Text style={styles.primaryText}>
                    View Details
                </Text>
            </TouchableOpacity>
        );
    }

    return null;
};
export default React.memo(AppointmentActions);

const styles = StyleSheet.create({


    btnRow: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },

    outlineBtn: {
        flex: 1,
        height: 47,
        borderWidth: 1,
        borderColor: '#0F5B4D4D',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    outlineText: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 12,
    },

    primaryBtn: {
        flex: 1,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 47,
        marginTop: 14,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    primaryText: {
        color: '#fff',
        textAlign: 'center',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },

    cancelBtn: {

        backgroundColor: '#F43F5E0D',
        flex: 1,
        borderRadius: 10,
        height: 47,
        marginTop: 14,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',

    },

    cancelText: {
        color: '#EF4444',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    bookBtn: {
        position: 'absolute',

        backgroundColor: Colors.primaryColor,
        bottom: 20,
        left: 20,
        right: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    bookText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 16,
    },
})