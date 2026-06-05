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
    ImageBackground,
    Image,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';
import * as  _PROFILE_SERVICES from '../../services/ProfileServices';

import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { showSuccessToast } from '../../config/Key';
import { Fonts } from '../../common/Fonts';
import { Feather } from '../../common/Vector';
import { CameraOptions, ImageLibraryOptions, ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { showImagePicker } from '../../hooks/ImagePickerUtils';
import { uploadImage } from '../../hooks/usePatientData';


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

                    setFormData({
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        email: user?.email || '',
                        profile_picture: user?.profile_picture || '',
                        secondary_number: user?.secondary_number || '',
                        gender: user?.gender || '',
                        date_of_birth: user?.date_of_birth || '',
                    });
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
                last_name: formData.last_name,
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
                'STATUS',
                res?.status,
            );

            console.log(
                'UPDATE_PROFILE_RESPONSE',
                res
            );

            if (res?.success) {

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
    USE EFFECT
    ---------------------------------
    */

    useEffect(() => {

        fetchProfile();

    }, []);

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
                leftIcon={
                    Images.backIcon
                }
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


                            <View style={styles.avatarBgWrapper}>

                                <ImageBackground
                                    source={Images.BackgroundImage}
                                    style={styles.avatarBg}
                                    imageStyle={{
                                        borderRadius: 100,
                                    }}
                                >

                                    <View
                                        style={styles.avatarWrapper}
                                    >

                                        {/* IMAGE */}

                                        {/* {formData?.profile_picture ? ( */}
                                        <Image
                                            source={{
                                                uri: formData.profile_picture,
                                            }}
                                            style={styles.avatar}
                                            onLoad={() =>
                                                console.log('IMAGE LOADED')
                                            }
                                            onError={(e) =>
                                                console.log(
                                                    'IMAGE ERROR',
                                                    e.nativeEvent,
                                                )
                                            }
                                        />
                                        {/* ) : (
                                        //     <View style={styles.initialWrapper}>
                                        //         <Text style={styles.initialText}>
                                        //             {formData.first_name
                                        //                 ?.charAt(0)
                                        //                 ?.toUpperCase()}
                                        //         </Text>
                                        //     </View>
                                        )} */}

                                        {/* LOADER */}

                                        {loadingImage && (
                                            <View
                                                style={
                                                    styles.loaderOverlay
                                                }
                                            >
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#fff"
                                                />
                                            </View>
                                        )}

                                        {/* EDIT */}

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.editIcon}
                                            onPress={
                                                handleAddImage
                                            }
                                        >
                                            <Image
                                                source={
                                                    Images.profileEdit
                                                }
                                                style={
                                                    styles.IconSize
                                                }
                                            />

                                        </TouchableOpacity>

                                    </View>

                                </ImageBackground>
                            </View>


                            {/* FIRST NAME */}

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
                            </Text>

                            <View
                                style={
                                    styles.inputContainer
                                }
                            >

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

                                <TextInput

                                    value={
                                        formData.email
                                    }
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
                                        'other',
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

                                <Feather
                                    name="calendar"
                                    size={18}
                                    color="#98A2B3"
                                />

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

                            {/* BUTTON */}

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
        backgroundColor:
            '#F8FAFC',
    },

    avatarBgWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -10,
    },

    avatarBg: {
        padding: 30,
        height: 150,
        width: 200,
        borderRadius: 100,
        overflow: 'hidden',

        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarWrapper: {
        width: 105,
        height: 105,

        borderRadius: 24,

        borderWidth: 1,
        borderColor: '#DDEBE8',

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 12,

        overflow: 'hidden',

        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 6,
        elevation: 5,
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 16,
    },


    /*
   =====================================================
       FIRST LETTER UI
   =====================================================
   */

    initialWrapper: {
        width: 90,
        height: 90,

        borderRadius: 18,

        backgroundColor:
            Colors.primaryColor,

        justifyContent: 'center',
        alignItems: 'center',
    },

    initialText: {
        fontSize: 34,

        color: '#fff',

        fontFamily:
            Fonts.PoppinsBold,
    },

    /*
    =====================================================
        LOADER
    =====================================================
    */

    loaderOverlay: {
        position: 'absolute',

        width: '100%',
        height: '100%',

        backgroundColor:
            'rgba(0,0,0,0.45)',

        justifyContent: 'center',
        alignItems: 'center',
    },

    editIcon: {
        position: 'absolute',
        bottom: -2,
        right: 1,

        justifyContent: 'center',
        alignItems: 'center',
    },

    IconSize: {
        width: 30,
        height: 30,
    },


    loaderContainer: {
        flex: 1,
        justifyContent:
            'center',
        alignItems:
            'center',
    },

    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    label: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 8,
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    inputContainer: {
        height: 56,
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        backgroundColor:
            '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 16,
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    input: {
        flex: 1,
        color: '#111827',
        fontSize: 14,
        fontFamily:
            Fonts.PoppinsMedium,
    },

    genderRow: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        marginBottom: 20,
    },

    genderButton: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor:
            '#E5E7EB',
        backgroundColor:
            '#FFFFFF',
        justifyContent:
            'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },

    activeGenderButton: {
        backgroundColor:
            Colors.BGIcon,
        borderColor:
            Colors.primaryColor,
    },

    genderText: {
        fontSize: 14,
        color: '#6B7280',
        textTransform:
            'capitalize',
        fontFamily:
            Fonts.PoppinsMedium,
    },

    activeGenderText: {
        color:
            Colors.primaryColor,
    },

    dateText: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        fontFamily:
            Fonts.PoppinsMedium,
    },

    button: {
        height: 56,
        borderRadius: 18,
        backgroundColor:
            Colors.primaryColor,
        justifyContent:
            'center',
        alignItems: 'center',
        marginTop: 20,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily:
            Fonts.PoppinsSemiBold,
    },
});