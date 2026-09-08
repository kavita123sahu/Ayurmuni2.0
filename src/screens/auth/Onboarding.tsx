
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    Image,
    Platform,
    ScrollView,
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Animated,
    findNodeHandle,
    UIManager,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import * as _AUTH_SERVICES from '../../services/AuthService';
import { showSuccessToast } from '../../config/Key';
import { Utils } from '../../common/Utils';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse, ImageLibraryOptions, CameraOptions, Asset } from 'react-native-image-picker';
import { EmailValidator } from '../../common/Validator';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { genderOptions } from '../../common/DataInterface';
import { persistProfileAndSyncAccess } from '../../services/guestAuth';
import CommonButton from '../../components/CommonButton';
import { Images } from '../../common/Images';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as _PROFILE_SERVICE from '../../services/ProfileServices';
import { showImagePicker } from '../../hooks/ImagePickerUtils';
import TablerIcon from '../../components/TablerIcon';


interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string;

    gender: string;
    profileImage: Asset | null;
    user: string;
}

interface FormErrors {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dob: string;
    terms: string;
}


const Onboarding = (props: any) => {

    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<
        'day' | 'month' | 'year' | null
    >(null);
    const [isLoadingImage, setImageloding] = useState(false);
    const [Isloading, setUSERID] = useState('');
    const scrollRef = useRef<ScrollView>(null);
    const dayRef = useRef<TextInput>(null);
    const monthRef = useRef<TextInput>(null);
    const yearRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    /** Scroll focused field into view above keyboard + sticky Proceed button */
    const scrollFieldIntoView = useCallback((target: TextInput | View | null) => {
        if (!target || !scrollRef.current) return;

        const scrollNode = findNodeHandle(scrollRef.current);
        const fieldNode = findNodeHandle(target);
        if (!scrollNode || !fieldNode) return;

        requestAnimationFrame(() => {
            UIManager.measureLayout(
                fieldNode,
                scrollNode,
                () => { },
                (_x, y, _w, h) => {
                    const offset = Math.max(0, y - 24);
                    scrollRef.current?.scrollTo({
                        y: offset,
                        animated: true,
                    });
                },
            );
        });
    }, []);

    const onFieldFocus = useCallback(
        (ref: React.RefObject<TextInput | null>) => {
            // Wait for keyboard animation, then scroll so field stays visible
            setTimeout(() => scrollFieldIntoView(ref.current), Platform.OS === 'ios' ? 280 : 120);
        },
        [scrollFieldIntoView],
    );

    useEffect(() => {
        const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvt, e => {
            setKeyboardHeight(e.endCoordinates?.height ?? 0);
        });
        const hideSub = Keyboard.addListener(hideEvt, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        profileImageUrl: '',
        profileImage: null,
        user: ''
    });


    const [agreedToPolicies, setAgreedToPolicies] = useState(false);

    const [dob, setDob] = useState({ day: '', month: '', year: '' });
    const [errors, setErrors] = useState<FormErrors>({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        dob: '',
        terms: '',
    });

    const openPolicy = (policyType: 'terms_of_service' | 'privacy_policy') => {
        props.navigation.navigate('PolicyDetail', {
            policyType,
            title:
                policyType === 'terms_of_service'
                    ? 'Terms of Use'
                    : 'Privacy Policy',
        });
    };

    const onToggleAgree = () => {
        const next = !agreedToPolicies;
        setAgreedToPolicies(next);
        if (next && errors.terms) {
            setErrors(prev => ({ ...prev, terms: '' }));
        }
    };

    const isFocused = useIsFocused();

    useEffect(() => {
        getUser();
    }, [isFocused]);


    const getUser = async () => {
        try {
            const user_id = await Utils.getData('_USER_ID');
            setFormData(prev => ({ ...prev, user: user_id }));
        } catch (error) {
            console.log(error);
        }
    };

    const handleBack = () => {
        if (props.navigation.canGoBack()) {
            props.navigation.goBack();
            return;
        }
        // Return to Guest vs Complete ask page instead of remounting Home
        props.navigation.navigate('AccessMode');
    };
    const avatarAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const uploadProfileImage = async (
        image: Asset
    ) => {

        setImageloding(true)
        try {

            const formDataImage =
                new FormData();

            formDataImage.append(
                'image',
                {
                    uri: image?.uri,
                    type:
                        image?.type ||
                        'image/jpeg',
                    name:
                        image?.fileName ||
                        `profile_${Date.now()}.jpg`,
                } as any
            );
            formDataImage.append('dir', 'customer_avatar')

            const hasExistingImage =
                !!formData?.profileImageUrl;

            const res: any =
                await _PROFILE_SERVICE.UploadProfilePhoto(
                    formDataImage,
                    // hasExistingImage
                    //     ? 'PUT'
                    //     : 'POST'
                );

            console.log(
                'PROFILE IMAGE RESPONSE ===>',
                res
            );


            /*
            ===================================
            SUCCESS
            ===================================
            */

            if (res?.success) {

                /*
                API IMAGE URL
                */

                const uploadedImageUrl =
                    res?.data?.profile_picture ||
                    res?.data?.image ||
                    res?.data?.url ||
                    '';

                setImageloding(false)
                setFormData(prev => ({
                    ...prev,

                    // LOCAL IMAGE
                    profileImage: image,

                    // SERVER IMAGE URL
                    profileImageUrl:
                        uploadedImageUrl,
                }));

                console.log(
                    'UPLOADED IMAGE URL ===>',
                    uploadedImageUrl
                );

                showSuccessToast(
                    res?.message ||
                    'Profile image uploaded',
                    'success'
                );

                return;
            }

            /*
            ERROR
            */

            setImageloding(false)
            showSuccessToast(
                res?.message ||
                'Upload failed',
                'error'
            );

        } catch (error) {

            console.log(
                'PROFILE IMAGE ERROR ===>',
                error
            );
            setImageloding(false)
            showSuccessToast(
                'Something went wrong',
                'error'
            );
        }
    };
    const clearDobError = () => {
        if (errors.dob) {
            setErrors((prev: any) => ({
                ...prev,
                dob: '',
            }));
        }
    };


    const handleAddImage = () => {
        showImagePicker(
            uploadProfileImage,
        );
    };




    const handleFieldChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };


    const validateForm = () => {

        let isValid = true;

        const newErrors: FormErrors = {
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            dob: '',
            terms: '',
        };

        // FIRST NAME
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        // LAST NAME
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        // EMAIL
        if (
            formData.email.trim() &&
            !EmailValidator(formData.email.trim())
        ) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // GENDER
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
            isValid = false;
        }

        // DOB VALIDATION
        const day = Number(dob.day);
        const month = Number(dob.month);
        const year = Number(dob.year);

        // EMPTY CHECK
        if (!day || !month || !year) {

            newErrors.dob = 'Date of birth is required';
            isValid = false;

        } else {

            // CREATE DATE
            const enteredDate = new Date(year, month - 1, day);
            const today = new Date();

            // VALID DATE CHECK
            const isRealDate =
                enteredDate.getFullYear() === year &&
                enteredDate.getMonth() === month - 1 &&
                enteredDate.getDate() === day;

            if (!isRealDate) {

                newErrors.dob = 'Please enter a valid date';
                isValid = false;

            } else if (enteredDate > today) {

                // FUTURE DATE BLOCK
                newErrors.dob = 'Future date is not allowed';
                isValid = false;

            } else {

                // AGE CHECK
                let age = today.getFullYear() - year;

                const monthDiff = today.getMonth() - (month - 1);

                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < day)
                ) {
                    age--;
                }

                if (age < 1) {

                    newErrors.dob = 'Please enter a valid age';
                    isValid = false;
                }
            }
        }

        if (!agreedToPolicies) {
            newErrors.terms = 'Agreeing to Terms and Privacy Policy is mandatory';
            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    const isFormValid = () => {
        // Required fields
        if (!formData.firstName.trim()) return false;
        if (!formData.lastName.trim()) return false;
        if (!formData.gender) return false;

        // DOB required
        const day = Number(dob.day);
        const month = Number(dob.month);
        const year = Number(dob.year);

        if (!day || !month || !year) return false;

        // Validate actual date
        const enteredDate = new Date(year, month - 1, day);
        const today = new Date();

        const isRealDate =
            enteredDate.getFullYear() === year &&
            enteredDate.getMonth() === month - 1 &&
            enteredDate.getDate() === day;

        if (!isRealDate) return false;

        // Future DOB
        if (enteredDate > today) return false;

        // Age validation
        let age = today.getFullYear() - year;

        const monthDiff =
            today.getMonth() - (month - 1);

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < day)
        ) {
            age--;
        }

        if (age < 1) return false;

        // Email is optional
        // But if entered, it must be valid
        if (
            formData.email.trim() &&
            !EmailValidator(formData.email.trim())
        ) {
            return false;
        }

        // Terms mandatory
        if (!agreedToPolicies) return false;

        return true;
    };

    const canProceed = useMemo(() => {
        return isFormValid();
    }, [
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.gender,
        dob.day,
        agreedToPolicies,
    ]);

    const handleProcees = async () => {

        // ✅ VALIDATION
        if (!validateForm()) {
            return;
        }

        try {

            setIsLoading(true);

            const send_data: Record<string, any> = {
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                email: formData.email.trim(),
                profile_picture:
                    formData.profileImageUrl,
                gender: formData.gender,
                date_of_birth: `${dob.year}-${dob.month}-${dob.day}`,
            };

            if (agreedToPolicies) {
                send_data.type = 'all';
            }

            console.log(
                'IMAGE URL ===>',
                formData.profileImageUrl
            );

            console.log('OnboardingData:', send_data);

            // ✅ API CALL
            const response: any =
                await _AUTH_SERVICES.onBoarding(send_data);

            console.log('Onboarding Response:', response);


            // ===================================================
            // ✅ SUCCESS
            // ===================================================

            if (response?.success) {

                // STORE USER + clear guest immediately (don't wait for ProfileScreen)
                const profilePayload = {
                    ...(response?.data || {}),
                    first_name:
                        response?.data?.first_name || send_data.first_name,
                    last_name:
                        response?.data?.last_name || send_data.last_name,
                    email: response?.data?.email || send_data.email,
                    gender: response?.data?.gender || send_data.gender,
                    is_customer_profile_created:
                        response?.data?.is_customer_profile_created ??
                        response?.data?.customer_created ??
                        true,
                    customer_created:
                        response?.data?.customer_created ??
                        response?.data?.is_customer_profile_created ??
                        true,
                };
                await persistProfileAndSyncAccess(profilePayload);

                showSuccessToast(
                    response?.message || 'Welcome to Ayurmuni',
                    'success'
                );

                props.navigation.replace('AssessmentType', {
                    form: 'all',
                });
                setIsLoading(false);
                return;
            }

            // ===================================================
            // ✅ API ERROR
            // ===================================================

            showSuccessToast(
                response?.message ||
                'Something went wrong',
                'error'
            );

        } catch (error: any) {
            setIsLoading(false);
            console.log('Network Error:', error);

            showSuccessToast(
                'Network error, please try again',
                'error'
            );

        } finally {

            setIsLoading(false);
        }
    };



    return (

        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            // Extra space so email/DOB clear keyboard + Proceed bar
                            paddingBottom: 24 + (keyboardHeight > 0 ? Math.min(keyboardHeight * 0.35, 160) : 0),
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#0D614E', '#14876A', '#1FA37D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroBanner}
                    >
                        <View style={styles.stepPill}>
                            <Text style={styles.stepPillText}>Step 1 of 2</Text>
                        </View>
                        <Text style={styles.heroTitle}>Welcome to Ayurmuni</Text>
                        <Text style={styles.heroSubtitle}>
                            Create your profile to unlock personalized Ayurvedic care, orders, and consultations.
                        </Text>
                    </LinearGradient>

                    <View style={styles.formCard}>
                        <View style={styles.content}>

                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>
                                Add your details below. This helps us tailor recommendations for you.
                            </Text>

                            {/* PROFILE IMAGE */}
                            <View style={styles.imageWrapper}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleAddImage}
                                    style={styles.profileContainer}
                                >
                                    <View style={styles.ringOuter}>
                                        <View style={styles.bigCircle}>
                                            {isLoadingImage ? (
                                                <ActivityIndicator size="small" color="#2E7D32" />
                                            ) : formData?.profileImage?.uri ? (
                                                <Image
                                                    source={{ uri: formData.profileImage.uri }}
                                                    style={styles.profileImage}
                                                />
                                            ) : formData?.firstName ? (
                                                <View style={styles.placeholderContainer}>
                                                    <Text style={styles.placeholderText}>
                                                        {formData.firstName.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={styles.uploadOverlay}>
                                                    <Text style={styles.uploadText}>Upload Photo</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <Animated.View
                                        style={[
                                            styles.smallCircle,
                                            { transform: [{ scale: pulseAnim }] },
                                        ]}
                                    >
                                        <TablerIcon name="camera" size={20} color="#FFFFFF" />
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.row}>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>First Name{' '}<Text style={[styles.optionalText, { color: '#EF4444' }]}>*</Text></Text>
                                    <TextInput
                                        ref={firstNameRef}
                                        placeholder="ABC"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.firstName}
                                        onChangeText={(t) => handleFieldChange('firstName', t)}
                                        onFocus={() => onFieldFocus(firstNameRef)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => lastNameRef.current?.focus()}
                                        style={[
                                            styles.inputHalf,
                                            formData.firstName && styles.inputFilled
                                        ]}
                                    />

                                    <Text style={styles.errorText}>{errors.firstName}</Text>

                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Last Name{' '}<Text style={[styles.optionalText, { color: '#EF4444' }]}>*</Text> </Text>
                                    <TextInput
                                        ref={lastNameRef}
                                        placeholder="XYZ"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.lastName}
                                        onChangeText={(t) => handleFieldChange('lastName', t)}
                                        onFocus={() => onFieldFocus(lastNameRef)}
                                        returnKeyType="next"
                                        onSubmitEditing={() => emailRef.current?.focus()}
                                        style={[
                                            styles.inputHalf,
                                            formData.lastName && styles.inputFilled
                                        ]}
                                    />
                                    <Text style={styles.errorText}>{errors.lastName}</Text>

                                </View>

                            </View>

                            {/* EMAIL — placed under name so it stays near top section & visible with keyboard */}
                            <View style={styles.emailBlock}>
                                <Text style={styles.label}>
                                    Email Address{' '}
                                    <Text style={styles.optionalText}>(optional)</Text>
                                </Text>
                                {/* <Text style={styles.label}>Email Address (optional)</Text> */}
                                <TextInput
                                    ref={emailRef}
                                    placeholder="email@gmail.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.email}
                                    onChangeText={(t) => handleFieldChange('email', t)}
                                    onFocus={() => onFieldFocus(emailRef)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    style={[
                                        styles.inputFull,
                                        formData.email && styles.inputFilled
                                    ]}
                                />
                                <Text style={styles.errorText}>{errors.email}</Text>
                            </View>

                            {/* GENDER */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>
                                    Gender{' '}
                                    <Text style={[styles.optionalText, { color: '#EF4444' }]}>*</Text>
                                </Text>

                                <View style={styles.genderRow}>
                                    {genderOptions.map((item: any) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => handleFieldChange('gender', item.value)}
                                            style={[
                                                styles.genderBtn,
                                                formData.gender === item.value && styles.genderActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.genderText,
                                                    formData.gender === item.value && styles.genderTextActive,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {!!errors.gender && (
                                    <Text style={[styles.errorText, { top: -15 }]}>
                                        {errors.gender}
                                    </Text>
                                )}
                            </View>
                            {/* DOB */}
                            <Text style={[styles.label,]}>Date of Birth{' '}<Text style={[styles.optionalText, { color: '#EF4444' }]}>*</Text></Text>

                            <View style={styles.dobContainer}>

                                <TextInput
                                    ref={dayRef}
                                    placeholder={
                                        focusedField === 'day' || dob.year === '' ? 'DD' : ''
                                    }
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.day}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    textAlign="center"
                                    style={[
                                        styles.dobInput,
                                        dob.day && styles.inputFilled,
                                    ]}
                                    onFocus={() => {
                                        setFocusedField('day');
                                        clearDobError();
                                        onFieldFocus(dayRef);
                                    }}
                                    onChangeText={(t) => {
                                        clearDobError();

                                        const value = t.replace(/[^0-9]/g, '');

                                        setDob({
                                            ...dob,
                                            day: value,
                                        });

                                        if (value.length === 2) {
                                            monthRef.current?.focus();
                                        }
                                    }}
                                    onBlur={() => setFocusedField(null)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (
                                            nativeEvent.key === 'Backspace' &&
                                            dob.day.length === 0
                                        ) {
                                            dayRef.current?.blur();
                                        }
                                    }}
                                />

                                <TextInput
                                    ref={monthRef}
                                    placeholder={
                                        focusedField === 'month' || dob.year === '' ? 'MM' : ''
                                    }
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.month}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    textAlign="center"
                                    style={[
                                        styles.dobInput,
                                        dob.month && styles.inputFilled,
                                    ]}
                                    onFocus={() => {
                                        setFocusedField('month');
                                        clearDobError();
                                        onFieldFocus(monthRef);
                                    }}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(t) => {
                                        clearDobError();

                                        const value = t.replace(/[^0-9]/g, '');

                                        setDob({
                                            ...dob,
                                            month: value,
                                        });

                                        if (value.length === 2) {
                                            yearRef.current?.focus();
                                        }
                                    }}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (
                                            nativeEvent.key === 'Backspace' &&
                                            dob.month.length === 0
                                        ) {
                                            dayRef.current?.focus();
                                        }
                                    }}
                                />

                                <TextInput
                                    ref={yearRef}
                                    value={dob.year}
                                    placeholder={
                                        focusedField === 'year' || dob.year === '' ? 'YYYY' : ''
                                    }
                                    placeholderTextColor="#9CA3AF"
                                    onFocus={() => {
                                        setFocusedField('year');
                                        clearDobError();
                                        onFieldFocus(yearRef);
                                    }}
                                    onBlur={() => setFocusedField(null)}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    textAlign="center"
                                    style={[
                                        styles.dobInput,
                                        styles.dobYearInput,
                                        dob.year && styles.inputFilled,
                                    ]}
                                    onChangeText={(t) => {
                                        clearDobError();

                                        const value = t.replace(/[^0-9]/g, '');

                                        setDob({
                                            ...dob,
                                            year: value,
                                        });
                                    }}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (
                                            nativeEvent.key === 'Backspace' &&
                                            dob.year.length === 0
                                        ) {
                                            monthRef.current?.focus();
                                        }
                                    }}
                                />

                            </View>

                            {errors.dob ? (
                                <Text style={[styles.errorText, { top: -15 }]}>
                                    {errors.dob}
                                </Text>
                            ) : null}

                            <View style={styles.termsBlock}>
                                <View style={styles.termsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={onToggleAgree}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <View
                                            style={[
                                                styles.checkbox,
                                                agreedToPolicies && styles.checkboxOn,
                                                !!errors.terms && !agreedToPolicies && styles.checkboxError,
                                            ]}
                                        >
                                            {agreedToPolicies ? (
                                                <TablerIcon name="check" size={14} color="#FFFFFF" />
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.termsText} onPress={onToggleAgree}>
                                        I agree to the{' '}
                                        <Text
                                            style={styles.termsLink}
                                            onPress={() => openPolicy('terms_of_service')}
                                        >
                                            Terms of Use
                                        </Text>
                                        {' '}and{' '}
                                        <Text
                                            style={styles.termsLink}
                                            onPress={() => openPolicy('privacy_policy')}
                                        >
                                            Privacy Policy
                                        </Text>
                                        {' '}
                                        <Text style={[styles.optionalText, { color: '#EF4444' }]}>*</Text>
                                    </Text>
                                </View>
                                {!!errors.terms && (
                                    <Text style={styles.errorText}>{errors.terms}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View
                    style={[
                        styles.bottom,
                        !canProceed && styles.ctaDisabled,
                        {
                            paddingBottom: Math.max(insets.bottom, 12),
                        },
                    ]}
                >
                    <CommonButton
                        title="Proceed"
                        onPress={handleProcees}
                        loading={isLoading}
                        disabled={!canProceed || isLoading}
                    />
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Onboarding;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEF4F2',
    },

    keyboardContainer: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    heroBanner: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 22,
    },

    stepPill: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 12,
    },

    stepPillText: {
        color: '#E8FFF8',
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.3,
    },

    heroTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 32,
    },

    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        lineHeight: 20,
        fontFamily: Fonts.PoppinsMedium,
        paddingRight: 8,
    },

    formCard: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 8,
        borderWidth: 1,
        borderColor: '#E4ECE8',
        // shadowColor: '#0D614E',
        // shadowOpacity: 0.06,
        // shadowRadius: 12,
        // shadowOffset: { width: 0, height: 4 },
        // elevation: 2,
    },

    content: {
    },

    /* ---------------- HEADER ---------------- */

    backBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 18 : 10,
        marginBottom: 18,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    backIcon: {
        width: 46,
        height: 46,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 22,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 30,
    },

    subtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 6,
        lineHeight: 20,
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 22,
        paddingRight: 10,
    },

    /* ---------------- PROFILE IMAGE ---------------- */

    imageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },

    profileContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },

    ringOuter: {
        width: 145,
        height: 145,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: '#0D614E35',
        borderStyle: 'dashed',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    bigCircle: {
        width: 145,
        height: 145,
        borderRadius: 999,
        backgroundColor: '#0D614E12',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#0D614E15',
    },

    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    placeholderContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D614E15',
    },

    placeholderText: {
        fontSize: 42,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    smallCircle: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 42,
        height: 42,
        borderRadius: 999,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    cameraImage: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
    },
    uploadOverlay: {
        position: "absolute",
        // bottom: 12,
        alignSelf: "center",
        // backgroundColor: "rgba(0,0,0,0.45)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    uploadText: {
        marginTop: 14,
        fontSize: 15,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ---------------- FORM ---------------- */

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        // marginBottom: 1,
    },

    inputWrapper: {
        flex: 1,
    },

    emailBlock: {
        marginBottom: 10,
    },

    label: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 8,
        fontFamily: Fonts.PoppinsMedium,
    },

    fieldContainer: {
        width: '100%',
        marginTop: -15
    },
    optionalText: {
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
        fontSize: 13,
    },
    inputHalf: {
        height: 54,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        color: '#111827',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    inputFull: {
        width: '100%',
        height: 54,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        color: '#111827',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    inputFilled: {
        backgroundColor: '#0D614E08',
        borderColor: '#0D614E55',
        color: '#0D614E',
    },

    /* ---------------- GENDER ---------------- */

    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },

    genderBtn: {
        flex: 1,
        minHeight: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    genderActive: {
        backgroundColor: '#0D614E10',
        borderColor: '#0D614E',
    },

    genderText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
        textAlign: 'center',
    },

    genderTextActive: {
        color: '#0D614E',
    },

    /* ---------------- DOB ---------------- */

    dobContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 18,
    },

    dobInput: {
        width: '30%',
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
        color: '#111827',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        writingDirection: 'ltr',
    },

    dobYearInput: {
        flex: 1.3,
        width: '34%',
        textAlign: 'center',
    },

    termsBlock: {
        marginTop: 4,
        marginBottom: 10,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    checkboxOn: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    checkboxError: {
        borderColor: '#EF4444',
    },
    termsText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
    },
    termsLink: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        textDecorationLine: 'underline',
    },

    /* ---------------- ERROR ---------------- */

    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 2,
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ---------------- BUTTON ---------------- */

    bottom: {
        paddingTop: 8,
        paddingHorizontal: 16,
        backgroundColor: '#EEF4F2',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    disabledBottom: {
        paddingTop: 8,
        paddingHorizontal: 16,
        backgroundColor: '#EEF4F2',
        opacity: 0.6,
        pointerEvents: 'none',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    ctaDisabled: {
        opacity: 0.6,
        pointerEvents: 'none',
    },

    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    gradientBtn: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------------- EXTRA ---------------- */

    loader: {
        marginTop: 5,
    },
});