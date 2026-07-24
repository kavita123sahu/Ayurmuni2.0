import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Styles } from "../common/Styles";
import { Colors } from "../common/Colors";
import { Fonts } from "../common/Fonts";
import { BUTTON, RADIUS, SPACING, TYPO } from "../constants/responsive";

type Props = {
    status: string;
    onReschedule?: () => void;
    onCancel?: () => void;
    onJoinCall?: () => void;
    onViewDetails?: () => void;
    call_status?: string;
};
const AppointmentActions = ({
    status,
    onReschedule,
    onCancel,
    onJoinCall,
    onViewDetails,
    call_status,
}: Props) => {

    const appointmentStatus = status?.toLowerCase();

    const showReschedule = [
        "pending",
        "confirmed",
        "reschedule",
    ].includes(appointmentStatus);

    const showCancel = [
        "pending",
        "confirmed",
        "reschedule",
        "rescheduled", // ✅ Added
    ].includes(appointmentStatus);

    const showViewDetails = [
        "completed",
        "cancelled",
        "missed",
        // "rescheduled", ❌ Remove
    ].includes(appointmentStatus);

    const showJoinCall =  call_status === "in_progress"; // future

    if (showReschedule || showCancel) {
        return (
            <View style={styles.btnRow}>
                {!showJoinCall  && showReschedule  && (
                    <TouchableOpacity
                        style={styles.outlineBtn}
                        onPress={onReschedule}
                    >
                        <Text style={styles.outlineText}>
                            {appointmentStatus === "reschedule"
                                ? "Request To Change"
                                : "Reschedule"}
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
                    showCancel && (
                        <TouchableOpacity
                            style={[
                                styles.cancelBtn,
                                showReschedule && {
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
                    )
                )}
            </View>
        );
    }

    if (showViewDetails) {
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
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },

    outlineBtn: {
        flex: 1,
        minHeight: BUTTON.height,
        borderWidth: 1,
        borderColor: '#0F5B4D4D',
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },

    outlineText: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: TYPO.sm,
    },

    primaryBtn: {
        flex: 1,
        backgroundColor: Colors.primaryColor,
        borderRadius: RADIUS.sm,
        minHeight: BUTTON.height,
        marginTop: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    primaryText: {
        color: '#fff',
        textAlign: 'center',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: TYPO.button,
    },

    cancelBtn: {
        backgroundColor: '#F43F5E0D',
        flex: 1,
        borderRadius: RADIUS.sm,
        minHeight: BUTTON.height,
        marginTop: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelText: {
        color: '#EF4444',
        textAlign: 'center',
        fontSize: TYPO.button,
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