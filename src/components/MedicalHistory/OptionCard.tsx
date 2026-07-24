import React, { memo } from 'react';

import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';

import {
    styles,
} from './styles/MedicalHistor';
import { Images } from '../../common/Images';
import TablerIcon from '../../components/TablerIcon';


const OptionCard = ({
    item,
    active,
    onPress,
    type,
    medical,
    questionKey,
}: any) => {

    /*
    =====================================
    TITLE + SUBTITLE
    =====================================
    */

    const fullText =
        item?.value || '';

    const splitText =
        fullText.split(' - ');

    const title =
        splitText?.[0] || '';

    const subtitle =
        splitText
            ?.slice(1)
            ?.join(' - ') || '';

    /*
    =====================================
    YES / NO IMAGE
    =====================================
    */

    const isYesNoQuestion =
        questionKey ===
        'knowPrakriti';

    const getImageSource = () => {
        if (isYesNoQuestion && item?.value === 'Yes') {
            return Images.yesHuman;
        }

        if (isYesNoQuestion && item?.value === 'No') {
            return Images.noHuman;
        }

        if (item?.image_path) {
            return { uri: item.image_path };
        }

        return null;
    };

    const imageSource = getImageSource();

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[
                styles.card,
                active &&
                styles.activeCard,
            ]}
        >

            {/* LEFT */}

            <View style={styles.leftContent}>

                {/* IMAGE */}

                {medical ? (
                    <View style={styles.medicalavatar}>
                        {imageSource ? (
                            <Image
                                source={imageSource}
                                style={{ height: 32, width: 32, resizeMode: 'contain' }}
                            />
                        ) : (
                            <View style={{ height: 32, width: 32 }} />
                        )}
                    </View>
                ) : imageSource ? (
                    <Image
                        source={imageSource}
                        style={[
                            styles.avatar,
                            isYesNoQuestion && styles.compactAvatar,
                        ]}
                    />
                ) : (
                    <View
                        style={[
                            styles.avatar,
                            isYesNoQuestion && styles.compactAvatar,
                        ]}
                    />
                )}




                {/* TEXT */}

                <View
                    style={
                        styles.textWrapper
                    }
                >

                    {/* TITLE */}

                    <Text
                        numberOfLines={2}
                        style={[
                            styles.cardTitle,
                            active &&
                            styles.activeTitle,
                        ]}
                    >
                        {title}
                    </Text>

                    {/* SUBTITLE */}

                    {
                        !!subtitle && (
                            <Text
                                numberOfLines={3}
                                style={[
                                    styles.cardSubtitle,
                                    active &&
                                    styles.activeSubtitle,
                                ]}
                            >
                                {subtitle}
                            </Text>
                        )
                    }

                </View>
            </View>

            {/* RIGHT */}

            <View
                style={[
                    type ===
                        'multi_choice'
                        ? styles.checkbox
                        : styles.radio,

                    active &&
                    styles.activeRadio,
                ]}
            >
                {
                    active && (
                        <TablerIcon name="check" size={15} color="#FFFFFF" />
                    )
                }
            </View>
        </TouchableOpacity>
    );
};

export default memo(OptionCard);