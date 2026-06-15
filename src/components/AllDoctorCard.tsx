// DoctorCard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

    const [isWishlisted, setIsWishlisted] = useState(item?.is_favorite ?? false);

    const isAvailable =
        useMemo(
            () => item?.has_availability === true,
            [item?.has_availability],
        );

    useEffect(() => {
        setIsWishlisted(
            item?.is_favorite ?? false,
        );
    }, [item?.is_favorite]);

    const doctorName =
        item?.name || item?.full_name;

    const specialityText =
        Array.isArray(item?.specialized_therapies)
            ? item.specialized_therapies.join(' • ')
            : '';

    const handleWishlist = useCallback(async () => {
        const previous = isWishlisted;

        setIsWishlisted(!previous);

        try {
            const response =
                await _CONSULT_SERVICES.ToggleFavDoctor(
                    item?.id,
                    'POST',
                );

            if (!response?.success) {
                setIsWishlisted(previous);
            }
        } catch {
            setIsWishlisted(previous);
        }
    }, [isWishlisted, item?.id]);
    return (

        // /isAvailable ? styles.activeCard : styles.disabledCard
        <Pressable style={[styles.card,]} onPress={() => onPress?.(item)}>

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

                </View>

                <View style={styles.right}>

                    {/* TOP ROW: Tag + Wishlist */}
                    <View style={styles.topRow}>
                        <View style={[styles.tag,]}>

                            <Text style={[styles.tagText,]}>
                                {isAvailable ? '  Active' : 'Inactive'}
                            </Text>

                        </View>




                        <FavouriteButton
                            isFavourite={isWishlisted}
                            onPress={handleWishlist}
                            style={styles.iconBtn}
                        />

                    </View>

                    {/* NAME */}
                    <Text style={[styles.name]} numberOfLines={1}>
                        {item?.name || item?.full_name}
                    </Text>

                    {/* SPECIALITY */}
                    <Text
                        style={[
                            styles.speciality,

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
                                color={'#64748B'}
                            />
                            <Text style={[styles.infoText]}>
                                {`${item?.experience_years || 0} Yrs Exp`}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons
                                name="star"
                                size={12}
                                color={'#F59E0B'}
                            />
                            <Text style={styles.infoText}>
                                {item?.ranking_score || 0}
                                <Text style={styles.reviewCount}>
                                    {` (${item?.total_reviews || 0})`}
                                </Text>
                            </Text>
                        </View>
                    </View>

                    {/* BOTTOM ROW: Chat + Consult */}

                </View>

            </View>


            <View style={styles.bottomRow}>

                {/* Chat Button */}
                <TouchableOpacity
                    style={[styles.chatBtn,]}
                    disabled={!isAvailable}
                    onPress={() => onChatPress?.(item)}
                >
                    <Image source={Images.ChatSupport} style={{ tintColor: '#64748B', height: 24, width: 24, resizeMode: 'contain' }} />
                </TouchableOpacity>

                {/* Consult Button */}
                <TouchableOpacity
                    style={[styles.consultBtn,]}
                    // disabled={!isAvailable}
                    onPress={() => onPress?.(item)}
                    activeOpacity={0.8}
                >
                    <Image source={Images.consult} style={{ height: 24, width: 24, resizeMode: 'contain', tintColor: Colors.white }} />
                    <Text style={[styles.consultText,]}>
                        Consult Now
                    </Text>
                </TouchableOpacity>

            </View>

        </Pressable>
    );
};


export default React.memo(AllDoctorCard);


const styles = StyleSheet.create({

    card: {
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        backgroundColor: '#FFF',
    },

    imageWrapper: {
        width: 78,
        height: 78,
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 10,
        backgroundColor: Colors.bgborderColor,
    },

    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    right: {
        flex: 1,
        justifyContent: 'flex-start',
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 26,
    },

    tag: {
        backgroundColor: '#EAF8F4',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
    },

    tagText: {
        fontSize: 11,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    iconBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },

    name: {
        fontSize: 15,
        lineHeight: 20,
        color: '#1E293B',
        fontFamily: Fonts.PoppinsSemiBold,
        marginTop: 4,
    },

    speciality: {
        fontSize: 12,
        lineHeight: 17,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 2,
    },


    consultBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 14,
    },

    infoText: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },


    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },

    chatBtn: {
        width: 46,
        height: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F8F6',
        marginRight: 8,
    },


    consultText: {
        color: '#FFF',
        fontSize: 13,
        marginLeft: 8,
        fontFamily: Fonts.PoppinsMedium,
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



    imageGrayscale: {
        // opacity: 0.4,   
        backgroundColor: '#F1F5F9'                    // simulates grayscale in RN
    },

    grayscaleOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: 'rgba(200,200,200,0.35)',
    },





    disabledTag: {
        backgroundColor: '#F1F5F9',
    },


    disabledTagText: {
        color: '#94A3B8',
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




    chatBtnDisabled: {
        backgroundColor: '#F1F5F9',
    },



    consultBtnDisabled: {
        backgroundColor: '#E5E7EB',
    },


    consultTextDisabled: {
        color: '#64748B',

    },
});