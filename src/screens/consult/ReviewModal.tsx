import React, { memo, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Image,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';

type Props = {
    visible: boolean;
    doctorName: string;
    doctorSpeciality?: string;
    doctorImage?: string;
    onClose: () => void;
    onSubmit: (data: {
        rating: number;
        review: string;
        tags: string[];
    }) => Promise<void>;
};

const REVIEW_TAGS = [
    'Professional',
    'Friendly',
    'Helpful',
    'Experienced',
    'Good Listener',
    'Explained Well',
];

const ReviewModal = ({
    visible,
    doctorName,
    doctorSpeciality,
    doctorImage,
    onClose,
    onSubmit,
}: Props) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(item => item !== tag)
                : [...prev, tag],
        );
    };

    const handleSubmit = async () => {
        if (!rating) {
            return;
        }

        try {
            setLoading(true);

            await onSubmit({
                rating,
                review,
                tags: selectedTags,
            });

            setRating(0);
            setReview('');
            setSelectedTags([]);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={{ flex: 1 }}>

                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={
                                Platform.OS === 'ios'
                                    ? 'padding'
                                    : undefined
                            }
                        >
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingBottom: 150, // footer ki space
                                    flexGrow: 1,
                                }}
                            >

                                <View style={styles.dragger} />

                                <Text style={styles.emoji}>
                                    🎉
                                </Text>

                                <Text style={styles.title}>
                                    Consultation Completed
                                </Text>

                                <Text style={styles.subTitle}>
                                    How was your experience?
                                </Text>

                                <View style={styles.doctorCard}>
                                    {/* {doctorImage ? ( */}
                                    <Image
                                        source={Images.doctorImage}
                                        style={styles.doctorImage}
                                    />

                                    {/* // ) : (
                            //     <View style={styles.placeholder}>
                            //         <Text>👨‍⚕️</Text>
                            //     </View>
                            // )} */}

                                    <Text style={styles.doctorName}>
                                        {doctorName}
                                    </Text>

                                    {!!doctorSpeciality && (
                                        <Text style={styles.speciality}>
                                            {doctorSpeciality}
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.starContainer}>
                                    {[1, 2, 3, 4, 5].map(item => (
                                        <TouchableOpacity
                                            key={item}
                                            activeOpacity={0.8}
                                            onPress={() =>
                                                setRating(item)
                                            }>
                                            <Text style={styles.star}>
                                                {item <= rating
                                                    ? '⭐'
                                                    : '☆'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.tagsContainer}>
                                    {REVIEW_TAGS.map(tag => {
                                        const selected =
                                            selectedTags.includes(
                                                tag,
                                            );

                                        return (
                                            <TouchableOpacity
                                                key={tag}
                                                activeOpacity={0.8}
                                                style={[
                                                    styles.tag,
                                                    selected &&
                                                    styles.selectedTag,
                                                ]}
                                                onPress={() =>
                                                    toggleTag(tag)
                                                }>
                                                <Text
                                                    style={[
                                                        styles.tagText,
                                                        selected &&
                                                        styles.selectedTagText,
                                                    ]}>
                                                    {tag}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <TextInput
                                    placeholder="Write your review..."
                                    multiline
                                    maxLength={300}
                                    value={review}
                                    onChangeText={setReview}
                                    style={styles.reviewInput}
                                />

                                <Text style={styles.counter}>
                                    {review.length}/300
                                </Text>
                            </ScrollView>

                        </KeyboardAvoidingView>
                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={
                                    loading || !rating
                                }
                                style={styles.submitButton}
                                onPress={handleSubmit}>
                                {loading ? (
                                    <ActivityIndicator
                                        color="#fff"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.submitText
                                        }>
                                        Submit Review
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onClose}>
                                <Text style={styles.skip}>
                                    Skip For Now
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default memo(
    ReviewModal,
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor:
            'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        maxHeight: '85%',
        minHeight: '70%',
    },

    dragger: {
        width: 50,
        height: 5,
        backgroundColor: '#D1D5DB',
        alignSelf: 'center',
        marginTop: 10,
        borderRadius: 10,
    },

    emoji: {
        fontSize: 44,
        textAlign: 'center',
        marginTop: 10,
    },

    title: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
        color: '#111827',
    },

    subTitle: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 5,
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 20,
    },

    doctorCard: {
        alignItems: 'center',
    },

    doctorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },

    placeholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    doctorName: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 10,
    },

    speciality: {
        fontFamily: Fonts.PoppinsMedium,
        color: '#6B7280',
        marginTop: 4,
    },

    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 25,
    },

    star: {
        fontSize: 40,
        marginHorizontal: 4,
    },

    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },

    tag: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        marginBottom: 8,
    },

    selectedTag: {
        backgroundColor: '#0D614E',
    },

    tagText: {
        color: '#111827',
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
    },

    selectedTagText: {
        color: '#FFF',
        fontFamily: Fonts.PoppinsMedium,
    },

    reviewInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        minHeight: 100,
        padding: 12,
        textAlignVertical: 'top',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
        bottom: 50,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    counter: {
        alignSelf: 'flex-end',
        marginTop: 6,
        color: '#9CA3AF',
        fontSize: 12,
    },

    submitButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: '#0D614E',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    submitText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },

    skip: {
        textAlign: 'center',
        marginTop: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
});