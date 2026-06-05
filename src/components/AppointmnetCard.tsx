import React, { memo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
export type AppointmentStatus =
    | 'confirmed'
    | 'cancelled'
    | 'upcoming';

export type ActionKey =
    | 'view_receipt'
    | 'book_again'
    | 'view_details'
    | 'reschedule';


export interface Appointment {
    consultation_id: string;
    appointment_status:
    AppointmentStatus;
    date: string;
    doctor: {
        doctor_id: string;
        doctor_name: string;
        doctor_specialization:
        string | null;
        doctor_image:
        string | null;
    };
}



interface AppointmentCardProps {
    item: Appointment;
    onAction?: (
        actionKey: ActionKey,
        item: Appointment,
    ) => void;
    style?: ViewStyle;
}

/* -------------------------------------------------------------------------- */
/*                               BADGE CONFIG                                 */
/* -------------------------------------------------------------------------- */

const BADGE_CONFIG: any = {

    confirmed: {
        bg: '#DCFCE7',
        color: '#16A34A',
    },

    cancelled: {
        bg: '#FEE2E2',
        color: '#DC2626',
    },

    upcoming: {
        bg: '#FEF3C7',
        color: '#D97706',
    },
};
/* -------------------------------------------------------------------------- */
/*                                   BADGE                                    */
/* -------------------------------------------------------------------------- */

const Badge = ({
    status,
}: {
    status: string;
}) => {

    const normalizedStatus =
        status?.toLowerCase?.();

    const config =
        BADGE_CONFIG[
        normalizedStatus
        ];

    if (!config) {
        return null;
    }

    return (

        <View
            style={[
                styles.badge,
                {
                    backgroundColor:
                        config.bg,
                },
            ]}
        >

            <Text
                style={[
                    styles.badgeText,
                    {
                        color:
                            config.color,
                    },
                ]}
            >
                {status}
            </Text>

        </View>
    );
};
/* -------------------------------------------------------------------------- */
/*                              APPOINTMENT CARD                              */
/* -------------------------------------------------------------------------- */

const AppointmentCard = ({
    item,
    onAction,
    style,
}: AppointmentCardProps) => {

    const {
        doctor,
        date,
        appointment_status,
    } = item;


    const doctorName =
        doctor?.doctor_name;

    const specialty =
        doctor?.doctor_specialization ||
        'General Physician';

    const avatarUrl =
        doctor?.doctor_image;

    const isCompleted =
        appointment_status ===
        'confirmed';

    const isCancelled =
        appointment_status ===
        'cancelled';

    const isUpcoming =
        appointment_status ===
        'upcoming';



    const handleAction = (
        action: ActionKey,
    ) => {
        onAction?.(action, item);
    };

    return (
        <View
            style={[
                styles.card,
                isCancelled &&
                styles.cancelledCard,
                style,
            ]}
        >
            {/* TOP SECTION */}

            <View style={styles.topRow}>
                <Image
                    source={
                        avatarUrl
                            ? { uri: avatarUrl }
                            : Images.doctorImage
                    }
                    style={styles.avatar}
                />

                <View style={styles.info}>
                    <Text
                        numberOfLines={2}
                        style={styles.doctorName}
                    >
                        {doctorName}
                    </Text>

                    <Text style={styles.meta}>
                        {specialty} • {date}
                    </Text>
                </View>

                <Badge
                    status={
                        appointment_status.toUpperCase() as AppointmentStatus
                    }
                />
            </View>

            {/* ACTIONS */}

            <View style={styles.actions}>
                {isCompleted && (
                    <>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.secondaryBtn}
                            onPress={() =>
                                handleAction(
                                    'view_receipt',
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.secondaryBtnText
                                }
                            >
                                View Receipt
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.primaryBtn}
                            onPress={() =>
                                handleAction(
                                    'book_again',
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.primaryBtnText
                                }
                            >
                                Book Again
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {isCancelled && (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                            styles.secondaryBtn,
                            styles.fullBtn,
                        ]}
                        onPress={() =>
                            handleAction(
                                'view_details',
                            )
                        }
                    >
                        <Text
                            style={
                                styles.secondaryBtnText
                            }
                        >
                            View Details
                        </Text>
                    </TouchableOpacity>
                )}

                {isUpcoming && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.primaryBtn,
                            styles.fullBtn,
                        ]}
                        onPress={() =>
                            handleAction(
                                'reschedule',
                            )
                        }
                    >
                        <Text
                            style={
                                styles.primaryBtnText
                            }
                        >
                            Reschedule
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default memo(AppointmentCard);

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },

    cancelledCard: {
        opacity: 0.9,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    avatar: {
        width: 78,
        height: 78,

        borderRadius: 18,

        resizeMode: 'cover',

        marginRight: 12,
    },

    info: {
        flex: 1,
        minWidth: 0,
        paddingRight: 10,
    },

    doctorName: {
        fontSize: 16,
        lineHeight: 22,

        color: '#1E293B',

        fontFamily:
            Fonts.PoppinsSemiBold,

        minHeight: 30,

        flexShrink: 1,
    },

    meta: {
        marginTop: 2,

        fontSize: 12,
        lineHeight: 18,

        color: '#64748B',

        fontFamily:
            Fonts.PoppinsMedium,
    },

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,

        borderRadius: 8,

        alignSelf: 'flex-start',
    },

    badgeText: {
        fontSize: 10,

        textTransform: 'uppercase',

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    actions: {
        flexDirection: 'row',

        marginTop: 18,

        gap: 10,
    },

    fullBtn: {
        flex: 1,
    },

    secondaryBtn: {
        flex: 1,

        height: 48,

        borderRadius: 14,

        backgroundColor: '#F8FAFC',

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 10,
    },

    secondaryBtnText: {
        fontSize: 14,

        color: '#475569',

        textAlign: 'center',

        fontFamily:
            Fonts.PoppinsMedium,
    },

    primaryBtn: {
        flex: 1,

        height: 48,

        borderRadius: 14,

        backgroundColor:
            Colors.primaryColor,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 10,
    },

    primaryBtnText: {
        fontSize: 14,

        color: '#FFFFFF',

        textAlign: 'center',

        fontFamily:
            Fonts.PoppinsMedium,
    },
});