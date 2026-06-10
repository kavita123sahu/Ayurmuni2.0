// DoctorCard.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Ionicons } from '../common/Vector';
import { Images } from '../common/Images';
import *as _CONSULT_SERVICES from '../services/ConsultServce';
import FavouriteButton from './FavouriteButton';
import { showSuccessToast } from '../config/Key';

interface DoctorItem {
    id: string;
    is_favorite: boolean;
    image: any;
    name: string
    full_name: string;
    specialized_therapies: [];
    profile_image: string;
    experience_years: string;
    rating: number;
    reviewCount: number;
    total_reviews: number;
    has_availability: boolean;
    ranking_score: number;
    availableInMinutes: number;
}

interface Props {
    item: DoctorItem;
    onPress?: (item: DoctorItem) => void;
    onChatPress?: (item: DoctorItem) => void;
}

const AllDoctorCard: React.FC<Props> = ({ item, onPress, onChatPress }) => {


    console.log("itemitem", item)
    const isAvailable = item.has_availability === true

    const [isWishlisted, setIsWishlisted] =
        useState(false);

    useEffect(() => {
        setIsWishlisted(
            item?.is_favorite ?? false,
        );
    }, [item]);
    const handleWishlist = async () => {
        const prev = isWishlisted;

        setIsWishlisted(!prev);

        try {
            const response =
                await _CONSULT_SERVICES.ToggleFavDoctor(
                    item?.id,
                    'POST',
                );

            console.log(
                'WISHLIST RESPONSE =>',
                response,
            );
            showSuccessToast(response?.message, 'success')

            if (!response?.success) {
                setIsWishlisted(prev);
            }

        } catch (error) {
            setIsWishlisted(prev);
            showSuccessToast(error?.message, 'error')
            console.log(
                'WISHLIST ERROR =>',
                error,
            );
        }
    };
    return (

        <Pressable style={[styles.card, isAvailable ? styles.activeCard : styles.disabledCard]} onPress={() => onPress?.(item)}>

            <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={
                            item?.profile_image?.trim()
                                ? {
                                    uri: item.profile_image,
                                }
                                : Images.doctorImage
                        }
                        style={[
                            styles.image,
                            !isAvailable &&
                            styles.imageGrayscale,
                        ]}
                    />
                    {/* Grayscale overlay for unavailable */}
                    {!isAvailable && <View style={styles.grayscaleOverlay} />}
                </View>

                <View style={styles.right}>

                    {/* TOP ROW: Tag + Wishlist */}
                    <View style={styles.topRow}>
                        <View style={[styles.tag, !isAvailable && styles.disabledTag]}>
                            <Text style={[styles.tagText, !isAvailable && styles.disabledTagText]}>
                                {/* {availabilityText} */}
                                {isAvailable ? 'Available' : 'Unavailable'}
                            </Text>
                        </View>

                        {/* <TouchableOpacity
                            onPress={handleWishlist}>
                            <Ionicons
                                name={
                                    isWishlisted
                                        ? 'heart'
                                        : 'heart-outline'
                                }
                                size={22}
                                color={Colors.primaryColor}
                            />
                        </TouchableOpacity> */}


                        <FavouriteButton
                            isFavourite={isWishlisted}
                            onPress={handleWishlist}
                            style={styles.iconBtn}
                        />

                    </View>

                    {/* NAME */}
                    <Text style={[styles.name, !isAvailable && styles.disabledText]} numberOfLines={1}>
                        {item?.name || item?.full_name}
                    </Text>

                    {/* SPECIALITY */}
                    <Text
                        style={[
                            styles.speciality,
                            !isAvailable &&
                            styles.disabledSpeciality,
                        ]}
                    >
                        {
                            Array.isArray(
                                item?.specialized_therapies,
                            )
                                ? item?.specialized_therapies.join(
                                    ' • ',
                                )
                                : ''
                        }
                    </Text>

                    {/* INFO ROW */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons
                                name="time-outline"
                                size={14}
                                color={isAvailable ? '#64748B' : '#CBD5E1'}
                            />
                            <Text style={[styles.infoText, !isAvailable && styles.disabledinfoText]}>
                                {' '}{item?.experience_years ?? '' + 'Yrs. Exp'}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons
                                name="star"
                                size={12}
                                color={isAvailable ? '#F59E0B' : '#A1A1AA'}
                            />
                            <Text style={[styles.infoText, !isAvailable && styles.disabledinfoText]}>
                                {' '}{item.ranking_score}{' '}
                                <Text style={styles.reviewCount}>({item?.total_reviews})</Text>
                            </Text>
                        </View>
                    </View>

                    {/* BOTTOM ROW: Chat + Consult */}

                </View>

            </View>


            <View style={styles.bottomRow}>

                {/* Chat Button */}
                <TouchableOpacity
                    style={[styles.chatBtn, !isAvailable && styles.chatBtnDisabled]}
                    disabled={!isAvailable}
                    onPress={() => onChatPress?.(item)}
                >
                    <Image source={Images.ChatSupport} style={{ tintColor: '#64748B', height: 24, width: 24, resizeMode: 'contain' }} />
                </TouchableOpacity>

                {/* Consult Button */}
                <TouchableOpacity
                    style={[styles.consultBtn, !isAvailable && styles.consultBtnDisabled]}
                    // disabled={!isAvailable}
                    onPress={() => onPress?.(item)}
                    activeOpacity={0.8}
                >
                    <Image source={Images.consult} style={{ height: 24, width: 24, resizeMode: 'contain', tintColor: isAvailable ? Colors.white : '#64748B' }} />
                    <Text style={[styles.consultText, !isAvailable && styles.consultTextDisabled]}>
                        Consult Now
                    </Text>
                </TouchableOpacity>

            </View>

        </Pressable>
    );
};


export default AllDoctorCard;


const styles = StyleSheet.create({

    // ── CARD ──────────────────────────────
    card: {
        borderRadius: 24,
        padding: 15,
        borderColor: '#F1F5F9',
        backgroundColor: Colors.white,
        borderWidth: 1,
    },

    activeCard: {
        backgroundColor: '#FFFFFF',
        // borderColor: Colors.primaryColor,   // teal border when available
        // shadowColor: Colors.primaryColor,
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.12,
        // shadowRadius: 8,
        // elevation: 4,
    },

    disabledCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',             // grey border when unavailable
    },

    // ── IMAGE ─────────────────────────────
    imageWrapper: {
        position: 'relative',
        marginRight: 20,
        height: 86,
        width: 86,
        borderRadius: 16,
        backgroundColor: Colors.bgborderColor,
    },

    image: {
        width: 86,
        height: 86,
        borderRadius: 16,
        resizeMode: 'cover',
    },

    imageGrayscale: {
        // opacity: 0.4,   
        backgroundColor: '#F1F5F9'                    // simulates grayscale in RN
    },

    grayscaleOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: 'rgba(200,200,200,0.35)',
    },

    // ── RIGHT SECTION ─────────────────────
    right: {
        flex: 1,
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    // ── AVAILABILITY TAG ──────────────────
    tag: {
        backgroundColor: '#E6F4F1',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },

    disabledTag: {
        backgroundColor: '#F1F5F9',
    },

    tagText: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    disabledTagText: {
        color: '#94A3B8',
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── TEXT ──────────────────────────────
    name: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        minHeight: 30,
        flexShrink: 1,
    },

    speciality: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 4,
    },

    disabledSpeciality: {
        color: '#A1A1AA',

        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
    },

    disabledText: {
        color: '#A1A1AA',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    // ── INFO ROW ──────────────────────────
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    disabledinfoText: {
        fontSize: 12,
        color: '#A1A1AA',
        fontFamily: Fonts.PoppinsMedium,
    },

    reviewCount: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },

    // ── BOTTOM ROW ────────────────────────
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 5,
    },

    chatBtn: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#E6F4F1',
        justifyContent: 'center',
        alignItems: 'center',
    },

    chatBtnDisabled: {
        backgroundColor: '#F1F5F9',
    },

    consultBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        gap: 10,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    consultBtnDisabled: {
        backgroundColor: '#E5E7EB',
    },

    consultText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    consultTextDisabled: {
        color: '#64748B',

    },
});