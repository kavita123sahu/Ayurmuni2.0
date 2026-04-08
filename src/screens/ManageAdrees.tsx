import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';

type ScreenType = 'LIST' | 'FORM';

interface AddressItem {
    id: string;
    title: string;
    icon: any;
}

const ManageAdrees: React.FC = (props : any) => {
    const [screen, setScreen] = useState<ScreenType>('LIST');
    const [selectedId, setSelectedId] = useState('current');

    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [stateValue, setStateValue] = useState('');

    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const isFormValid =
        address1.trim() !== '' &&
        city.trim() !== '' &&
        zip.trim() !== '' &&
        stateValue.trim() !== '';

    const addressData: AddressItem[] = [
        { id: '1', title: 'Home', icon: Images.home },
        { id: '2', title: 'Office', icon: Images.office },
    ];

    const renderItem = ({ item }: { item: AddressItem }) => {
        const isSelected = selectedId === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.addressCard,
                    isSelected && styles.selectedCard,
                ]}
                onPress={() => setSelectedId(item.id)}
            >
                <View style={styles.iconContainer}>
                    <Image source={item.icon} style={styles.iconInner} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.addressText}>
                        123 Organic Lane, Green 902
                    </Text>
                    <Text style={styles.addressSub}>
                        Gurgaon, HR 122001
                    </Text>

                    <View style={styles.actionRow}>
                        <Text
                            style={styles.actionText}
                            onPress={() => setScreen('FORM')}
                        >
                            Edit
                        </Text>
                        <Text style={styles.actionText}>Delete</Text>
                    </View>
                </View>

                {isSelected && (
                    <Image source={Images.tickIcon} style={styles.tickIcon} />
                )}
            </TouchableOpacity>
        );
    };

    const renderList = () => {
        const isSelected = selectedId === 'current';

        return (
            <>
                <TouchableOpacity
                    style={[
                        styles.currentBox,
                        isSelected && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedId('current')}
                >
                    <View style={styles.iconContainer}>
                        <Image source={Images.currentLocation} style={styles.locationInnerIcon} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.currentTitle}>Current Location</Text>
                        <Text style={styles.addressText}>
                            123 Organic Lane, Green 902
                        </Text>
                        <Text style={styles.addressSub}>
                            Gurgaon, HR 122001
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Image source={Images.gps} style={{ height: 14, width: 14, marginTop: 7.5 }} />
                            <Text style={styles.useLocation}>
                                Use precise location
                            </Text>
                        </View>
                    </View>

                    {isSelected && (
                        <Image source={Images.tickIcon} style={styles.tickIcon} />
                    )}
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Saved Address</Text>

                <FlatList
                    data={addressData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    scrollEnabled={false}
                />
            </>
        );
    };

    const renderForm = () => (
        <>
            <View style={styles.currentBadge}>
                <Image source={Images.currentLocation} style={styles.smallIcon} />
                <Text style={styles.currentBadgeText}>Current Location</Text>
            </View>

            <Text style={styles.inputLabel}>Address Line 1</Text>
            <TextInput
                value={address1}
                onChangeText={setAddress1}
                style={[
                    styles.input,
                    focusedInput === 'address1' && styles.inputActive,
                ]}
                placeholder="123 Organic Lane, Green 902"
                placeholderTextColor="#98A2B3"
                onFocus={() => setFocusedInput('address1')}
                onBlur={() => setFocusedInput(null)}
            />

            <Text style={styles.inputLabel}>
                Address Line 2 <Text style={{ color: '#98A2B3' }}>(optional)</Text>
            </Text>
            <TextInput
                value={address2}
                onChangeText={setAddress2}
                style={[
                    styles.input,
                    focusedInput === 'address2' && styles.inputActive,
                ]}
                placeholder="123 Organic Lane, Green 902"
                placeholderTextColor="#98A2B3"
                onFocus={() => setFocusedInput('address2')}
                onBlur={() => setFocusedInput(null)}
            />

            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                        value={city}
                        onChangeText={setCity}
                        style={[
                            styles.input,
                            focusedInput === 'city' && styles.inputActive,
                        ]}
                        placeholder="Gurgaon"
                        placeholderTextColor="#98A2B3"
                        onFocus={() => setFocusedInput('city')}
                        onBlur={() => setFocusedInput(null)}
                    />
                </View>

                <View style={{ width: 10 }} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Zip Code</Text>
                    <TextInput
                        value={zip}
                        onChangeText={setZip}
                        style={[
                            styles.input,
                            focusedInput === 'zip' && styles.inputActive,
                        ]}
                        placeholder="122001"
                        placeholderTextColor="#98A2B3"
                        onFocus={() => setFocusedInput('zip')}
                        onBlur={() => setFocusedInput(null)}
                    />
                </View>
            </View>

            <Text style={styles.inputLabel}>State</Text>
            <TextInput
                value={stateValue}
                onChangeText={setStateValue}
                style={[
                    styles.input,
                    focusedInput === 'state' && styles.inputActive,
                ]}
                placeholder="Haryana"
                placeholderTextColor="#98A2B3"
                onFocus={() => setFocusedInput('state')}
                onBlur={() => setFocusedInput(null)}
            />

            <TouchableOpacity
                style={[
                    styles.saveBtn,
                    !isFormValid && styles.disabledBtn,
                ]}
                disabled={!isFormValid}
            >
                <Text
                    style={[
                        styles.saveText,
                        !isFormValid && styles.disabledText,
                    ]}
                >
                    Save & Continue
                </Text>
            </TouchableOpacity>
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Manage Address"
                leftIcon={Images.backIcon}
                onLeftPress={() =>
                    screen === 'FORM' ? setScreen('LIST') : props.navigation.goBack()
                }
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                {screen === 'LIST' ? renderList() : renderForm()}
            </ScrollView>

            {screen === 'LIST' && (
                <TouchableOpacity
                    style={styles.checkout}
                    onPress={() => setScreen('FORM')}
                >
                    <Text style={styles.checkoutText}>
                        Add new address
                    </Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

export default ManageAdrees;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFDFB' },
    scroll: { padding: 20, paddingBottom: 40 },

    currentBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#0D614E1A',
    },

    selectedCard: {
        borderColor: '#0D614E',
        backgroundColor: '#F0FDF9',
    },

    currentTitle: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
        color: '#0F172A',
    },

    locationInnerIcon: {
        height: 18,
        width: 18,
        resizeMode: 'contain',
    },

    addressText: {
        fontSize: 12,
        color: '#191C1E',
        fontFamily: Fonts.PoppinsMedium,
    },

    addressSub: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    useLocation: {
        color: '#0D614E',
        fontSize: 12,
        marginTop: 6,
        fontFamily: Fonts.PoppinsMedium,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 10,
    },

    addressCard: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },

    iconContainer: {
        height: 32,
        width: 32,
        borderRadius: 8,
        backgroundColor: '#0D614E0D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    iconInner: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },

    cardTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
    },

    actionText: {
        fontSize: 12,
        color: '#0D614E',
    },

    tickIcon: {
        width: 18,
        height: 18,
    },

    checkout: {
        backgroundColor: '#0D614E',
        margin: 20,
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
    },

    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    currentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D614E1A',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },

    currentBadgeText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    smallIcon: {
        width: 22,
        height: 22,
    },

    inputLabel: {
        fontSize: 14,
        marginBottom: 6,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    input: {
        borderWidth: 1,
        borderColor: '#0D614E33',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 14,
        fontSize: 13,
        color: '#0D614E',
    },

    inputActive: {
        borderColor: '#0D614E80',
    },

    row: { flexDirection: 'row' },

    saveBtn: {
        backgroundColor: '#0D614E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 40,
    },

    disabledBtn: {
        backgroundColor: '#E5E7EB',
    },

    saveText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },

    disabledText: {
        color: '#64748B',
    },
});