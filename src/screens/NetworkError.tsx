import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    ImageBackground,
    Image,
} from 'react-native';
import { Images } from '../common/Images';

interface NetworkErrorProps {
    onGoBack?: () => void;
}

const NetworkError: React.FC<NetworkErrorProps> = ({ onGoBack }) => {
   
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#ffffff" />

            <View style={styles.topSection}>
                <Image source={Images.networkissue} resizeMode='cover' style={{ height: 150, width: 150 }} />
            </View>
            
            <ImageBackground
                source={Images.ellipsebackground}
                style={styles.bottomSection}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>No Internet Connection</Text>
                    <Text style={styles.description}>
                        We are unable to service your network request as{'\n'}you are currently offline.
                    </Text>
                </View>


                    <View style={styles.buttonStyle} >
                        <View style={[styles.goBackButton]}>
                            <Text style={styles.buttonText}>Go back </Text>
                        </View>
                    </View>
                

            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  topSection: {flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', paddingTop: 50},
  bottomSection: {minHeight: 400},
  contentContainer: {paddingTop: 70, paddingHorizontal: 20, alignItems: 'center'},
  title: {fontSize: 22, fontWeight: '600', color: '#ffffff', marginBottom: 16, textAlign: 'center'},
  description: {fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 18, marginBottom: 40, maxWidth: 400},
  buttonStyle: {borderRadius: 10, top: 50, bottom: 50, paddingHorizontal: 20},
  goBackButton: {backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, top: 12, bottom: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowRadius: 6, elevation: 5},
  buttonText: {fontSize: 14, fontWeight: '500', color: '#689f38'}
});

export default NetworkError;