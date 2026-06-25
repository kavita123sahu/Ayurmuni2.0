import React, { useCallback, useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,

} from "react-native";
import { getDoctorSlots } from "../services/ConsultServce";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Colors } from "../common/Colors";
import { Fonts } from "../common/Fonts";

interface Props {
    visible: boolean;
    onClose: () => void;

    onSubmit: (data: {
        availability: number;
        reschedule_reason: string;
    }) => void;
    // slots: {
    //     id: number;
    //     time: string;
    // }[];
    isRescheduleRequest: boolean;
    appointment: any
}

const RescheduleModal = ({
    visible,
    onClose,
    onSubmit,
    isRescheduleRequest,
    appointment,
    // slots,
}: Props) => {
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [reason, setReason] = useState("");
    const [slotsData, setSlotsData] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [loadingSlots, setLoadingSlots] =
        useState(false);
    const [selectedDate, setSelectedDate] = useState("");



    console.log("appointmentappointment-->", appointment)

    const doctorInfo = React.useMemo(
        () => ({
            id: appointment?.rawData?.doctor?.doctor_id,
            name: appointment?.doctorName,
            specialty: appointment?.specialty,
            image: appointment?.image,
            date: appointment?.date,
            time: appointment?.time,
        }),
        [appointment]
    );

    useEffect(() => {
        if (!visible || !appointment) return;

        setSelectedDate(appointment.date);
        setSelectedSlot(null);
        setReason("");
    }, [visible, appointment]);


    const handleSubmit = () => {
        onSubmit({
            action: isRescheduleRequest
                ? 'confirm_reschedule'
                : 'reschedule',

            availability: selectedSlot.id,

            ...(!isRescheduleRequest && {
                reschedule_reason: reason.trim(),
            }),
        });
    };

    const fetchSlotsForDate = useCallback(
        async (date: string) => {
            if (!doctorInfo?.id) return;

            setLoadingSlots(true);

            try {
                const resp = await getDoctorSlots({
                    id: doctorInfo.id,
                    date,
                });

                setSlotsData(resp?.data?.slots || []);
            } catch (error) {
                setSlotsData([]);
            } finally {
                setLoadingSlots(false);
            }
        },
        [doctorInfo?.id]
    );


    const handleDateChange = useCallback(
        (date: string) => {
            setSelectedDate(date);
            setSelectedSlot(null);
        },
        []
    );

    const slotList = React.useMemo(
        () => slotsData || [],
        [slotsData]
    );

    useEffect(() => {
        if (
            visible &&
            doctorInfo?.id &&
            selectedDate
        ) {
            fetchSlotsForDate(selectedDate);
        }
    }, [
        visible,
        selectedDate,
        doctorInfo?.id,
    ]);
    return (

        <Modal
            visible={visible}
            animationType="slide"
            transparent
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
            >
                <View style={styles.overlay}>
                    <View style={styles.container}>

                        <View style={styles.handle} />

                        <Text style={styles.title}>
                            Reschedule Appointment
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>

                            <View style={styles.doctorCard}>
                                <Text style={styles.doctorName}>
                                    {doctorInfo.name}
                                </Text>
                                <Text style={styles.doctorSpeciality}>
                                    {doctorInfo.specialty}
                                </Text>
                                <Text style={styles.doctorDate}>
                                    {doctorInfo.date} at{" "}
                                    {doctorInfo.time}
                                </Text>
                            </View>

                            <Text style={styles.subtitle}>
                                Select a new time slot
                            </Text>

                            <TouchableOpacity
                                style={styles.dateSelector}
                                onPress={() => setShowCalendar(true)}
                            >
                                <Text style={styles.dateText}>
                                    📅 {selectedDate}
                                </Text>
                            </TouchableOpacity>


                            <Text style={styles.sectionTitle}>
                                Available Slots
                            </Text>

                            {loadingSlots ? (
                                <Text style={styles.loadingText}>
                                    Fetching available slots...
                                </Text>
                            ) : slotList?.length > 0 ? (
                                <View style={styles.slotContainer}>
                                    {slotList.map((slot: any) => {
                                        const selected =
                                            selectedSlot?.id === slot.id;

                                        return (
                                            <TouchableOpacity
                                                key={slot.id}
                                                onPress={() => setSelectedSlot(slot)}
                                                style={[
                                                    styles.slotButton,
                                                    selected && styles.selectedSlot,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.slotText,
                                                        selected &&
                                                        styles.selectedSlotText,
                                                    ]}
                                                >
                                                    {slot.start_time}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.emptyText}>
                                    No slots available
                                </Text>
                            )}

                            <Text style={styles.sectionTitle}>
                                Reason
                            </Text>

                            <TextInput
                                value={reason}
                                onChangeText={setReason}
                                placeholder="Need a later time slot..."
                                multiline
                                style={styles.input}
                            />

                            <DateTimePicker
                                isVisible={showCalendar}
                                mode="date"
                                minimumDate={new Date()} // 👈 Past dates disabled
                                onConfirm={(date) => {
                                    setShowCalendar(false);

                                    handleDateChange(
                                        date.toISOString().split("T")[0]
                                    );
                                }}
                                onCancel={() => setShowCalendar(false)}
                            />

                        </ScrollView>

                        <TouchableOpacity
                            disabled={!selectedSlot || !reason.trim()}
                            style={[
                                styles.primaryBtn,
                                (!selectedSlot || !reason.trim()) && {
                                    opacity: 0.5,
                                },
                            ]}
                            onPress={() => {
                                handleSubmit()
                            }}
                        >
                            <Text style={styles.primaryText}>
                                Confirm Reschedule
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.secondaryText}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};


export default RescheduleModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },

    container: {
        height: "80%",
        backgroundColor: "#FFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
    },

    handle: {
        width: 60,
        height: 5,
        borderRadius: 20,
        backgroundColor: "#D1D5DB",
        alignSelf: "center",
        marginBottom: 20,
    },


    title: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111827",
    },

    subtitle: {
        marginTop: 4,
        color: "#6B7280",
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 12,
        marginTop: 20,
    },

    doctorCard: {
        backgroundColor: "#F8FFFE",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#D7F0EB",
        marginBottom: 16,
    },

    doctorName: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: "#111827",
    },

    doctorSpeciality: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 4,
    },

    doctorDate: {
        marginTop: 8,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    dateSelector: {
        height: 56,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#D7F0EB",
        backgroundColor: "#F8FFFE",
        justifyContent: "center",
        paddingHorizontal: 16,
        marginBottom: 20,
    },

    dateText: {
        color: "#111827",
        fontSize: 14,
    },

    loadingText: {
        textAlign: "center",
        marginVertical: 20,
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 12
    },

    emptyText: {
        textAlign: "center",
        color: "#6B7280",
        marginVertical: 20,
    },
    slotContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    slotButton: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginRight: 10,
        marginBottom: 10,
    },

    selectedSlot: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },

    slotText: {
        color: "#111827",
        fontFamily: Fonts.PoppinsMedium
    },

    selectedSlotText: {
        color: "#FFF",
    },

    input: {
        minHeight: 100,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        padding: 14,
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
        textAlignVertical: "top",
    },

    primaryBtn: {
        backgroundColor: Colors.primaryColor,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },

    primaryText: {
        color: "#FFF",
        fontFamily: Fonts.PoppinsMedium
    },

    secondaryBtn: {
        marginTop: 12,
        alignItems: "center",
    },

    secondaryText: {
        color: "#6B7280",
        fontFamily: Fonts.PoppinsMedium
    },
});