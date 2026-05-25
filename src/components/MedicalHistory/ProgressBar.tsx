import React from 'react';

import {
    View,
    StyleSheet,
    Image,
} from 'react-native';

import {
    Colors,
    COLORS,
    scale,
} from '../../common/Colors';

const ProgressBar = ({
    progress = 0,
}: any) => {

    return (
        <View style={styles.wrapper}>

            {/* PROGRESS BG */}

            <View style={styles.container}>

                {/* FILL */}

                <View
                    style={[
                        styles.progress,
                        {
                            width: `${progress}%`,
                        },
                    ]}
                />
            </View>

            {/* FLOWER ICON */}

            <View
                style={[
                    styles.thumbWrapper,
                    {
                        left: `${Math.max(
                            progress - 4,
                            0,
                        )}%`,
                    },
                ]}
            >
                <Image
                    source={require('../../assets/images/BackgroundBorder.png')}
                    style={styles.thumbImage}
                />
            </View>
        </View>
    );
};

export default React.memo(ProgressBar);

const styles = StyleSheet.create({

    wrapper: {
        marginTop: scale(20),
        marginBottom: scale(10),
        justifyContent: 'center',
    },

    container: {
        width: '100%',
        height: scale(7),

        backgroundColor: '#E5EBDD',

        borderRadius: scale(999),

        overflow: 'hidden',
    },

    progress: {
        height: '100%',

        backgroundColor:
            Colors.primaryColor,

        borderRadius: scale(999),
    },

    thumbWrapper: {

        position: 'absolute',

        width: scale(28),
        height: scale(28),

        borderRadius: scale(999),

        backgroundColor: '#F6F7EE',

        justifyContent: 'center',
        alignItems: 'center',

        borderWidth: 2,
        borderColor: '#E4E8DA',
    },

    thumbImage: {
        width: scale(22),
        height: scale(22),
        resizeMode: 'contain',
    },
});