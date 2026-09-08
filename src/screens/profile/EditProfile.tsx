import React, {
    useEffect,
    useState,
} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as  _PROFILE_SERVICES from '../../services/ProfileServices';

import TablerIcon from '../../components/TablerIcon';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { Feather } from '../../common/Vector';
import { showImagePicker } from '../../hooks/ImagePickerUtils';
import { uploadImage } from '../../hooks/usePatientData';
import { Utils } from '../../common/Utils';

const toText = (value: unknown): string => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (typeof obj.url === 'string') return obj.url;
        if (typeof obj.uri === 'string') return obj.uri;
        if (typeof obj.label === 'string') return obj.label;
        if (typeof obj.value === 'string') return obj.value;
    }
    return '';
};

const normalizeProfileForm = (user: any) => ({
    first_name: toText(user?.first_name),
    last_name: toText(user?.last_name),
    email: toText(user?.email),
    profile_picture: toText(user?.profile_picture),
    secondary_number: toText(user?.secondary_number),
    gender: toText(user?.gender).toLowerCase(),
    date_of_birth: toText(user?.date_of_birth),
});


const EditProfile = ({
    navigation,
}: any) => {


    const [loading, setLoading] =
        useState(false);
    const [loadingImage, setImageLoading] =
        useState(false);

    const [profileLoading,
        setProfileLoading,
    ] = useState(false);

    const [showDatePicker,
        setShowDatePicker,
    ] = useState(false);

    const [formData, setFormData] =
        useState({

            first_name: "",

            last_name: "",

            email: "",

            secondary_number: "",

            gender: "",

            profile_picture: "",

            date_of_birth: "",
        });


    const imageUri =
        formData?.profile_picture?.trim();

    useEffect(() => {
        const loadUser = async () => {
            const CustomerInfo = await Utils.getData('_USER_INFO');

            if (CustomerInfo) {
                setFormData(normalizeProfileForm(CustomerInfo));
            }

            fetchProfile();
        };

        loadUser();
    }, []);

    useEffect(() => {
        console.log(
            'FORMDATA IMAGE =>',
            formData.profile_picture
        );
    }, [formData.profile_picture]);




    const updateField = (
        key: string,
        value: string,
    ) => {

        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /*
    ---------------------------------
    GET PROFILE
    ---------------------------------
    */

    const fetchProfile =
        async () => {

            try {

                setProfileLoading(
                    true,
                );

                const res: any =
                    await _PROFILE_SERVICES.user_profile();

                console.log(
                    'Updated_PROFILE_RESPONSE',
                    res,
                );

                if (
                    res?.success
                ) {

                    const user =
                        res?.data;

                    console.log("userrr", user);

                    setFormData(normalizeProfileForm(user));
                }

            } catch (error) {

                console.log(
                    'PROFILE_ERROR',
                    error,
                );

            } finally {

                setProfileLoading(
                    false,
                );
            }
        };



    const handleAddImage = () => {
        showImagePicker(
            handleUploadImage,
        );
    };

    const handleUploadImage = async (
        image: any,
    ) => {
        try {
            setImageLoading(true);

            const res =
                await uploadImage(image);

            if (res?.success) {

                const imageUrl =
                    res?.data?.url ||
                    res?.url ||
                    '';

                console.log(
                    'IMAGE URL =>',
                    imageUrl
                );

                setFormData(prev => ({
                    ...prev,
                    profile_picture: imageUrl,
                }));

                showSuccessToast(
                    'Profile updated successfully',
                    'success',
                );
            }
        } catch (error) {
            console.log(error);
        } finally {
            setImageLoading(false);
        }
    };



    const handleUpdateProfile = async () => {

        try {

            setLoading(true);


            console.log(
                'PROFILE PICTURE PAYLOAD =>',
                formData.profile_picture
            );

            const payload = {
                first_name: formData.first_name,
                last_name: String(formData.last_name || '').trim(),
                email: formData.email,
                secondary_number: formData.secondary_number,
                gender: formData.gender,
                profile_picture: formData.profile_picture,
                date_of_birth: formData.date_of_birth,
            };

            console.log(
                'UPDATE_PROFILE_PAYLOAD',
                JSON.stringify(payload, null, 2),
            );

            const res: any =
                await _PROFILE_SERVICES.update_Profile(payload);

            console.log(
                'update profileeeSTATUS',
                res,
            );

            console.log(
                'UPDATE_PROFILE_RESPONSE',
                res
            );

            if (res?.success) {
                Utils.storeData('_USER_INFO', res?.data || {});

                showSuccessToast(
                    'Profile updated successfully',
                    'success',
                );

                navigation.goBack()
            }

        } catch (error) {

            console.log(
                'UPDATE_PROFILE_ERROR',
                error,
            );

        } finally {

            setLoading(false);
        }
    };



    /*
    ---------------------------------
    RENDER
    ---------------------------------
    */

    return (

        <SafeAreaView
            style={styles.container}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <AppHeader
                title="Edit Profile"
                // leftIcon={ }
                onLeftPress={() =>
                    navigation.goBack()
                }
            />






            {
                profileLoading
                    ? (
                        <View
                            style={
                                styles.loaderContainer
                            }
                        >

                            <ActivityIndicator
                                size="large"
                                color={
                                    Colors.primaryColor
                                }
                            />

                        </View>
                    )
                    : (
                        <ScrollView
                            showsVerticalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.scrollContent
                            }
                        >
                            <LinearGradient
                                colors={['#0D614E', '#12856A', '#abcbc2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.hero}
                            >
                                <View style={styles.avatarWrapper}>
                                    {formData?.profile_picture ? (
                                        <Image
                                            source={{
                                                uri: formData.profile_picture,
                                            }}
                                            style={styles.avatar}
                                        />
                                    ) : (
                                        <View style={styles.initialWrapper}>
                                            <Text style={styles.initialText}>
                                                {formData.first_name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'U'}
                                            </Text>
                                        </View>
                                    )}

                                    {loadingImage && (
                                        <View style={styles.loaderOverlay}>
                                            <ActivityIndicator
                                                size="small"
                                                color="#fff"
                                            />
                                        </View>
                                    )}
                                    <View style={styles.profileContainer}>
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            style={styles.editIcon}
                                            onPress={handleAddImage}
                                        >
                                            <TablerIcon
                                                name="camera"
                                                size={16}
                                                color={Colors.primaryColor}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.heroName}>
                                    {[formData.first_name, formData.last_name]
                                        .filter(Boolean)
                                        .join(' ') || 'Your Profile'}
                                </Text>
                                <Text style={styles.heroHint}>
                                    Update your personal details below
                                </Text>
                            </LinearGradient>

                            <View style={styles.formCard}>

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    First Name
                                </Text>

                                <View
                                    style={
                                        styles.inputContainer
                                    }
                                >
                                    <TablerIcon name="user" size={16} color="#94A3B8" />
                                    <TextInput
                                        value={
                                            formData.first_name
                                        }
                                        onChangeText={(
                                            text,
                                        ) =>
                                            updateField(
                                                'first_name',
                                                text,
                                            )
                                        }
                                        placeholder="Enter first name"
                                        placeholderTextColor="#98A2B3"
                                        style={
                                            styles.input
                                        }
                                    />

                                </View>

                                {/* LAST NAME */}

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Last Name
                                    <Text style={styles.optionalLabel}>
                                        {' '}
                                        (optional)
                                    </Text>
                                </Text>

                                <View
                                    style={
                                        styles.inputContainer
                                    }
                                >
                                    <TablerIcon name="user" size={16} color="#94A3B8" />
                                    <TextInput
                                        value={
                                            formData.last_name
                                        }
                                        onChangeText={(
                                            text,
                                        ) =>
                                            updateField(
                                                'last_name',
                                                text,
                                            )
                                        }
                                        placeholder="Enter last name"
                                        placeholderTextColor="#98A2B3"
                                        style={
                                            styles.input
                                        }
                                    />

                                </View>

                                {/* EMAIL */}

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Email
                                </Text>

                                <View
                                    style={
                                        styles.inputContainer
                                    }
                                >
                                    <TablerIcon name="mail" size={16} color="#94A3B8" />
                                    <TextInput
                                        value={formData.email}
                                        onChangeText={(
                                            text,
                                        ) =>
                                            updateField(
                                                'email',
                                                text,
                                            )
                                        }
                                        placeholder="Enter email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#98A2B3"
                                        style={
                                            styles.input
                                        }
                                    />

                                </View>

                                {/* PHONE */}

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Secondary Number
                                </Text>

                                <View
                                    style={
                                        styles.inputContainer
                                    }
                                >
                                    <TablerIcon name="phone" size={16} color="#94A3B8" />
                                    <TextInput
                                        value={
                                            formData.secondary_number
                                        }
                                        onChangeText={(
                                            text,
                                        ) =>
                                            updateField(
                                                'secondary_number',
                                                text,
                                            )
                                        }
                                        placeholder="Enter number"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        placeholderTextColor="#98A2B3"
                                        style={
                                            styles.input
                                        }
                                    />

                                </View>

                                {/* GENDER */}

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Gender
                                </Text>

                                <View
                                    style={
                                        styles.genderRow
                                    }
                                >

                                    {
                                        [
                                            'male',
                                            'female',
                                            'others',
                                        ].map(
                                            (
                                                item,
                                            ) => {

                                                const active =
                                                    formData.gender ===
                                                    item;

                                                return (

                                                    <TouchableOpacity
                                                        key={
                                                            item
                                                        }
                                                        activeOpacity={
                                                            0.8
                                                        }
                                                        onPress={() =>
                                                            updateField(
                                                                'gender',
                                                                item,
                                                            )
                                                        }
                                                        style={[
                                                            styles.genderButton,

                                                            active &&
                                                            styles.activeGenderButton,
                                                        ]}
                                                    >

                                                        <Text
                                                            style={[
                                                                styles.genderText,

                                                                active &&
                                                                styles.activeGenderText,
                                                            ]}
                                                        >
                                                            {
                                                                item
                                                            }
                                                        </Text>

                                                    </TouchableOpacity>
                                                );
                                            },
                                        )
                                    }

                                </View>

                                {/* DOB */}

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Date of Birth
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={
                                        0.8
                                    }
                                    onPress={() =>
                                        setShowDatePicker(
                                            true,
                                        )
                                    }
                                    style={
                                        styles.inputContainer
                                    }
                                >
                                    <Feather
                                        name="calendar"
                                        size={16}
                                        color="#94A3B8"
                                    />

                                    <Text
                                        style={[
                                            styles.dateText,

                                            !formData.date_of_birth && {
                                                color:
                                                    '#98A2B3',
                                            },
                                        ]}
                                    >

                                        {
                                            formData.date_of_birth ||
                                            'Select DOB'
                                        }

                                    </Text>
                                </TouchableOpacity>

                                {
                                    showDatePicker && (
                                        <DateTimePicker
                                            value={
                                                formData.date_of_birth
                                                    ? new Date(
                                                        formData.date_of_birth,
                                                    )
                                                    : new Date()
                                            }
                                            mode="date"
                                            display="default"
                                            maximumDate={
                                                new Date()
                                            }
                                            onChange={(
                                                event,
                                                selectedDate,
                                            ) => {

                                                setShowDatePicker(
                                                    false,
                                                );

                                                if (
                                                    selectedDate
                                                ) {

                                                    const formattedDate =
                                                        selectedDate
                                                            .toISOString()
                                                            .split(
                                                                'T',
                                                            )[0];

                                                    updateField(
                                                        'date_of_birth',
                                                        formattedDate,
                                                    );
                                                }
                                            }}
                                        />
                                    )
                                }

                            </View>

                            <TouchableOpacity
                                activeOpacity={
                                    0.8
                                }
                                onPress={
                                    handleUpdateProfile
                                }
                                disabled={
                                    loading
                                }
                                style={
                                    styles.button
                                }
                            >

                                {
                                    loading
                                        ? (
                                            <ActivityIndicator
                                                color="#FFFFFF"
                                            />
                                        )
                                        : (
                                            <Text
                                                style={
                                                    styles.buttonText
                                                }
                                            >
                                                Update Profile
                                            </Text>
                                        )
                                }

                            </TouchableOpacity>

                        </ScrollView>
                    )
            }

        </SafeAreaView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },

    scrollContent: {
        paddingBottom: 28,
    },

    hero: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 18,
        paddingVertical: 22,
        paddingHorizontal: 16,
        alignItems: 'center',
    },

    heroName: {
        marginTop: 12,
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    heroHint: {
        marginTop: 4,
        fontSize: 12,
        color: 'rgba(255,255,255,0.88)',
        fontFamily: Fonts.PoppinsRegular,
    },

    formCard: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8EDF2',
    },

    avatarWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.65)',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },

    initialWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },

    initialText: {
        fontSize: 34,
        color: '#fff',
        fontFamily: Fonts.PoppinsBold,
    },

    loaderOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileContainer: {
        //   width: 110,
        //   height: 110,
        alignSelf: 'center',
        position: 'relative',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        left: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDEBE8',
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    label: {
        fontSize: 13,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 8,
        marginTop: 4,
    },

    optionalLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 48,
        marginBottom: 12,
    },

    input: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
        paddingVertical: 10,
    },

    genderRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    genderButton: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
    },

    activeGenderButton: {
        backgroundColor: '#EAF8F4',
        borderColor: Colors.primaryColor,
    },

    genderText: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        textTransform: 'capitalize',
    },

    activeGenderText: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    dateText: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsMedium,
    },

    button: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: Colors.primaryColor,
        borderRadius: 14,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});