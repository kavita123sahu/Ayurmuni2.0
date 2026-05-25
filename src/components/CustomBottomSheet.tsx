
import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    Modal,
    PanResponder,
} from 'react-native';

import { Feather } from '../common/Vector';
import { Fonts } from '../common/Fonts';

const { height } = Dimensions.get('window');

interface CustomBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const CustomBottomSheet = ({
    visible,
    onClose,
    children,
}: CustomBottomSheetProps) => {
    const translateY = useRef(new Animated.Value(height)).current;
    // OPEN ANIMATION
    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: height * 0.25,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    // DRAG DOWN CLOSE
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                gesture.dy > 5,

            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(height * 0.25 + gesture.dy);
                }
            },

            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120) {
                    onClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: height * 0.25,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
        >

            {/* BACKDROP */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* SHEET */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                    },
                ]}
                {...panResponder.panHandlers}
            >

                {/* HANDLE */}
                <View style={styles.handle} />

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Select Location
                    </Text>

                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={22} />
                    </TouchableOpacity>
                </View>

                {children}

            </Animated.View>

        </Modal>
    );
};

export default CustomBottomSheet;

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    sheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: height * 0.75,

        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,

        paddingHorizontal: 16,
        paddingTop: 10,
    },

    handle: {
        alignSelf: 'center',
        width: 50,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#D0D5DD',
        // marginBottom: 5,
    },

    
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        marginBottom: 16,
    },

    title: {
        fontSize: 20,
        fontFamily : Fonts.PoppinsSemiBold,
        color: '#111827',
    },
});