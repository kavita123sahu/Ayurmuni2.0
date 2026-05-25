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

        /*
        YES IMAGE
        */

        if (
            isYesNoQuestion &&
            item?.value === 'Yes'
        ) {

            return Images.yesHuman;
        }

        /*
        NO IMAGE
        */

        if (
            isYesNoQuestion &&
            item?.value === 'No'
        ) {

            return Images.noHuman;
        }

        /*
        API IMAGE
        */

        if (item?.image_path) {

            return {
                uri: item?.image_path,
            };
        }

        /*
        FALLBACK
        */

        return Images.HairImage;
    };

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

                {medical ?
                    <View style={styles.medicalavatar}>
                        <Image
                            source={getImageSource()}
                            style={{ height: 40, width: 40, alignContent:'center', resizeMode: 'contain' }}
                        />
                    </View>
                    :
                    <Image
                        source={getImageSource()}
                        style={styles.avatar}
                    />}




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
                        <Image
                            source={
                                Images.tick
                            }
                            style={{
                                height: 15,
                                width: 15,
                                resizeMode:
                                    'contain',
                                tintColor:
                                    '#FFFFFF',
                            }}
                        />
                    )
                }
            </View>
        </TouchableOpacity>
    );
};

export default memo(OptionCard);