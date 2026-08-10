import React from 'react';
import {
    Modal,
    View,
    Image,
    TouchableOpacity,
    Text,
    Linking,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
const PreviewModal = ({
    visible,
    imageUrl,
    record,
    onClose,
}: any) => {

    console.log(imageUrl, 'imageUrlimageUrlimageUrlimageUrl-->')
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide">

            <View style={styles.previewContainer}>

                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}>
                    <Ionicons
                        name="close"
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>

                {/* {/* {record?.file_type === 'image' ? ( */}
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.previewImage}
                    resizeMode="contain"
                />

                <View style={{ alignItems: 'center' }}>
                    <Ionicons
                        name="document-text"
                        size={80}
                        color="#fff"
                    />
                    <Text
                        style={{
                            color: '#fff',
                            marginTop: 10,
                        }}>
                        PDF Preview
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL(imageUrl)
                        }>
                        <Text
                            style={{
                                color: '#10B981',
                                marginTop: 15,
                            }}>
                            Open PDF
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>
    );
};

export default PreviewModal;

const styles = StyleSheet.create({
    previewContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    previewImage: {
        width: '100%',
        height: '80%',
    },

    closeBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
    },
})