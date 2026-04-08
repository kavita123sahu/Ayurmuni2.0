import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';

type CardType = {
    id: string;
    title: string;
    subtitle: string;
    icon: ImageSourcePropType;
    bgIcon: ImageSourcePropType;
    onPress?: () => void;
};

type Props = {
    data: CardType[];
    onpress: (item: any) => void;
};

const ActionCards: React.FC<Props> = ({ data, onpress }) => {
    return (
        <View style={styles.row}>
            {data.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.8}
                     onPress={() => onpress(item)} 
                >

                    <Image source={item.bgIcon} style={styles.bgIcon} />

                    <View style={styles.iconBox}>
                        <Image source={item.icon} style={styles.icon} />
                    </View>

                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default ActionCards;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 14
    },

    card: {
        flex: 1,
        backgroundColor: '#0F724E0D',
        borderRadius: 24,
        padding: 15,
        borderWidth: 1,
        borderColor: '#0F724E33',
        overflow: 'hidden',

    },

    bgIcon: {
        position: 'absolute',
        right: 2,
        height: 70,
        width: 70,
        resizeMode: 'contain',
    },

    iconBox: {
        height: 50,
        width: 50,
        borderRadius: 12,
        backgroundColor: '#006B591A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    icon: {
        height: 30,
        width: 30,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginTop: 6,
    },

    subtitle: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#0D614E',
    },
});