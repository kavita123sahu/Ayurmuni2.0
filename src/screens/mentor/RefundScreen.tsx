import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    StatusBar,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../../components/PrimaryButton';
import AppHeader from '../../components/AppHeader';
import { Icons, Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';

const reasons = [
    'Product damaged',
    'Wrong item received',
    'Quality not as expected',
    'Other',
];

const refundMethods = [
    {
        id: 'original',
        title: 'Original Method',
        icon: require('../../assets/images/bank.png'),
        subtitle: 'Refund to Visa •••• 4242 (5–7 business days)',
    },
    {
        id: 'wallet',
        title: 'Wallet',
        icon: require('../../assets/images/wallet.png'),
        subtitle: 'Instant credit to your health fund wallet',
    },
];


type Props = {
    label: string;
    selected: boolean;
    onPress: () => void;
};


const RefundScreen = (props: any) => {
    const [selectedReason, setSelectedReason] = useState<string>('Product damaged');
    const [selectedMethod, setSelectedMethod] = useState<string>('original');
    const [description, setDescription] = useState('');

    const Section = ({ title, children, number }: any) => (
        <View style={{ marginTop: 30 }}>

            {/* Row: Avatar + Title */}
            <View style={styles.sectionHeader}>
                <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>{number}</Text>
                </View>

                <Text style={styles.sectionTitle}>{title}</Text>
            </View>

            {/* Children (column me) */}
            <View style={{ marginTop: 15 }}>
                {children}
            </View>

        </View>
    );

    const SelectableOption = ({ label, selected, onPress }: Props) => {
        return (
            <TouchableOpacity
                style={[
                    styles.Radiocontainer,
                    selected && styles.activeContainer,
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {/* Radio Circle */}
                <View style={[styles.circle, selected && styles.activeCircle]}>
                    {selected && <Image source={Images.tick} style={{ height: 15, width: 15, tintColor: '#FFFF' }} />}
                </View>

                {/* Label */}
                <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const RadioCard = ({ item, selected, onPress }: any) => {
        return (
            <View
                style={[
                    styles.radioCard,
                    selected && styles.radioCardSelected,
                ]}
                onTouchEnd={onPress}
            >

                <View style={{ justifyContent: 'space-between', marginBottom: 10, alignItems: 'center', flex: 1, flexDirection: 'row' }}>
                    <Image
                        source={item.icon}
                        style={{ height: 20, width: 20, marginRight: 10 }}
                        resizeMode="contain"
                    />

                    <View style={[styles.circle, selected && styles.activeCircle]}>
                        {selected && <Image source={Images.tick} style={{ height: 15, width: 15, tintColor: '#FFFF' }} />}
                    </View>
                </View>


                <Text style={styles.radioTitle}>{item?.title}</Text>
                <Text style={styles.radioSub}>{item?.subtitle}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

            <AppHeader
                title="Order Details "
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, backgroundColor: Colors.background }}
                    >

                        <View style={styles.orderBox}>
                            <Text style={styles.orderId}>#ORD-98231</Text>
                            <Text style={styles.delivered}>DELIVERED</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={{ marginRight: 16, backgroundColor: '#F3F4F6', borderRadius: 12, width: 80, height: 80 }} >
                                <Image source={Images.doctorImage} style={{ height: 80, width: 80, borderRadius: 12 }} />
                            </View>

                            <View>
                                <Text style={styles.cardType}>MEDICINES</Text>
                                <Text style={styles.cardTitle}>Prescription Bundle</Text>
                                <Text style={styles.cardSub}>Included: 3 items • Qty: 1</Text>
                                <Text style={styles.price}>Rs. 1240.00</Text>
                            </View>
                        </View>

                        {/* SECTION 1 */}
                        <Section title="Why are you requesting a refund?" number="1">
                            {reasons.map((item) => (
                                <SelectableOption
                                    key={item}
                                    label={item}
                                    selected={selectedReason === item}
                                    onPress={() => setSelectedReason(item)}
                                />
                            ))}
                        </Section>

                        {/* SECTION 2 */}
                        <Section title="Where should we send the refund?" number="2">
                            {refundMethods.map((item) => (
                                <RadioCard
                                    key={item.id}
                                    item={item}
                                    selected={selectedMethod === item.id}
                                    onPress={() => setSelectedMethod(item.id)}
                                />
                            ))}
                        </Section>

                        {/* SECTION 3 */}
                        <Section title="Tell us more (Optional)" number="3">
                            <TextInput
                                style={styles.input}
                                placeholder="Please describe the issue..."
                                multiline
                                placeholderTextColor={Colors.placeholderColor}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </Section>

                        <PrimaryButton
                            title="Submit Refund Request"
                            // icon={Images.shopCart}
                            onPress={() => props.navigation.navigate('ExchangeScreen')}
                            backgroundColor="#0D614E"
                            textColor="#FFFFFF"
                            TextFont={Fonts.PoppinsMedium}
                        />

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RefundScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    orderBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },

    orderId: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 32,
        color: Colors.primaryColor,
    },

    delivered: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#3E4946',
        backgroundColor: '#94A3B833',
        paddingHorizontal: 12,
        paddingVertical: 5,
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 20,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.borderColor,
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginTop: 15,
    },

    cardType: {
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 1.2,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        textTransform: 'uppercase',

    },
    cardTitle: {

        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0,
        marginTop: 5,
        fontFamily: Fonts.PoppinsSemiBold,

    },

    cardSub: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },

    price: {
        marginTop: 4,
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 20,
        color: Colors.primaryColor,
        fontSize: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    numberCircle: {
        width: 32,
        height: 30,
        borderRadius: 32,
        backgroundColor: '#0D614E1A',
        justifyContent: 'center',
        // alignItems: 'center',
        textAlign: 'center',
        marginRight: 10,
    },

    numberText: {
        fontSize: 12,
        color: Colors.primaryColor,
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
    },

    sectionTitle: {
        fontSize: 16,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    Radiocontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        marginBottom: 12,
    },

    activeContainer: {
        borderWidth: 1.5,
        borderColor: '#0D614E',
        // backgroundColor: '#F0FDF9',
    },

    circle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    activeCircle: {
        backgroundColor: '#0D614E',
        borderColor: '#0D614E',
    },

    tick: {
        color: '#fff',
        fontSize: 14,
        fontFamily: Fonts.PoppinsBold,
    },

    label: {
        fontSize: 16,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    radioCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },

    radioCardSelected: {
        borderColor: '#0F766E',
        backgroundColor: '#E6F4F1',
    },

    radioTitle: {
        fontSize: 16, fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.textColor,
        marginBottom: -4
    },

    radioSub: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#3E4946',
    },

    input: {
        height: 150,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        padding: 20,
        fontSize: 14,
        marginBottom: 40,
        fontFamily: Fonts.PoppinsMedium,
        textAlignVertical: 'top',
    },
});