import {
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { Fonts } from '../../../common/Fonts';
import { Colors } from '../../../common/Colors';
const { width } =
    Dimensions.get('window');

const guidelineWidth = 375;

export const scale = (size: number) =>
    (width / guidelineWidth) * size;

export const COLORS = {
    primary: Colors.primaryColor,
    white: '#FFFFFF',
    text: '#1F2937',
    subText: '#4B5563',
    screen: '#FAF9F7',
    progressBg: '#E5EBDD',
};

export const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: COLORS.screen,
    },

    container: {
        flex: 1,
        paddingHorizontal: scale(20),
        paddingTop: scale(12),
        backgroundColor: COLORS.screen,
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ================= HEADER ================= */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    iconBtn: {
        width: scale(42),
        height: scale(42),
        borderRadius: scale(14),
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEF2F0',
    },

    headerCenter: {
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: scale(16),
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    headerStep: {
        marginTop: scale(2),
        fontSize: scale(11),
        color: COLORS.subText,
        fontFamily: Fonts.PoppinsMedium,
    },

    secureWrapper: {
        alignItems: 'center',
    },

    secureText: {
        marginTop: scale(2),
        fontSize: scale(10),
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ================= PROGRESS ================= */

    progressWrapper: {
        marginTop: scale(28),
        marginBottom: scale(24),
        justifyContent: 'center',
    },

    progressBg: {
        width: '100%',
        height: scale(6),
        borderRadius: 100,
        backgroundColor: COLORS.progressBg,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 100,
        backgroundColor: COLORS.primary,
    },

    progressThumb: {
        position: 'absolute',
        width: scale(26),
        height: scale(26),
        borderRadius: scale(13),
        backgroundColor: '#F6F7EE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E4E8DA',
    },

    progressImage: {
        width: scale(22),
        height: scale(22),
        resizeMode: 'contain',
    },

    /* ================= TITLE ================= */

    title: {
        textAlign: 'center',
        fontSize: scale(22),
        lineHeight: scale(30),
        marginTop: scale(20),
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsBold,
        marginBottom: scale(24),
    },

    description: {
        // marginTop: scale(10),

        fontSize: scale(14),

        lineHeight: scale(24),

        color: '#7A7F86',

        textAlign: 'center',

        paddingHorizontal: scale(10),

        fontFamily:
            Fonts.PoppinsMedium,
    },



    /* =========================================
       MULTI SELECT TAG
    ========================================= */

    multiSelectWrapper: {
        marginTop: scale(20),

        alignSelf: 'center',

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#EDF7EF',

        paddingHorizontal:
            scale(16),

        paddingVertical:
            scale(10),

        borderRadius: scale(30),

        borderWidth: 1,

        borderColor: '#DDEEDF',
    },

    multiSelectText: {
        fontSize: scale(13),

        color: Colors.primaryColor,

        fontFamily:
            Fonts.PoppinsSemiBold,
    },


    /* ================= CARD ================= */

    card: {
        width: '100%',

        minHeight: scale(88),

        borderRadius: scale(22),

        backgroundColor: '#FFFFFF',

        borderWidth: 1,

        borderColor: '#EEF0EA',

        paddingHorizontal: scale(16),

        paddingVertical: scale(14),

        marginBottom: scale(16),

        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',
    },

    activeCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#F3F7F3',
    },


    leftContent: {
        flex: 1,

        flexDirection: 'row',

        alignItems: 'center',

        paddingRight: scale(12),
    },

    textWrapper: {
        flex: 1,

        marginLeft: scale(14),

        justifyContent: 'center',
    },
    avatar: {
        width: scale(64),

        height: scale(64),

        borderRadius: scale(32),

        borderWidth: 1,
        borderColor: '#F1F5F9',
        resizeMode: 'contain',

        backgroundColor: '#F8FAFC',

        flexShrink: 0,
    },
    medicalavatar: {
        width: scale(64),

        height: scale(64),


        borderWidth: 1,
        borderColor: '#F1F5F9',
        justifyContent: 'center',
        borderRadius: scale(32),
        alignItems: 'center',
        resizeMode: 'contain',

        backgroundColor: '#F8FAFC',

        flexShrink: 0
    },


    cardSubtitle: {
        marginTop: scale(4),

        fontSize: scale(12),

        lineHeight: scale(18),

        color: COLORS.subText,

        fontFamily: Fonts.PoppinsMedium,

        flexWrap: 'wrap',
    },


    activeSubtitle: {
        color: '#5B6B63',
    },

    cardTitle: {
        fontSize: scale(14),

        lineHeight: scale(21),

        color: COLORS.text,

        fontFamily: Fonts.PoppinsSemiBold,

        flexWrap: 'wrap',
    },

    activeTitle: {
        color: COLORS.primary,
    },

    radio: {
        width: scale(20),

        height: scale(20),

        borderRadius: scale(20),

        borderWidth: 1.5,

        borderColor: '#D5D9D7',

        justifyContent: 'center',

        alignItems: 'center',

        marginLeft: scale(10),

        flexShrink: 0,
    },

    checkbox: {
        width: scale(20),

        height: scale(20),

        borderRadius: scale(8),

        borderWidth: 1.5,

        borderColor: '#D5D9D7',

        justifyContent: 'center',

        alignItems: 'center',

        marginLeft: scale(10),

        flexShrink: 0,
    },

    activeRadio: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },

    /* ================= INPUT ================= */

    input: {
        minHeight: scale(120),
        borderRadius: scale(20),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: scale(18),
        paddingVertical: scale(16),
        fontSize: scale(14),
        color: COLORS.text,
        textAlignVertical: 'top',
        fontFamily: Fonts.PoppinsMedium,
        marginTop: scale(20),
    },


    /* ================= BASIC INFO ================= */

    basicInfoWrapper: {
        marginTop: scale(20),
    },

    basicCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(22),
        padding: scale(16),
        marginBottom: scale(18),
        borderWidth: 1,
        borderColor: '#EEF1EC',
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconCircle: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),

        borderWidth: 1,
        borderColor: '#F1F5F9',

        resizeMode: 'contain',
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(14),
    },

    basicIcon: {
        width: scale(40),
        height: scale(40),
        resizeMode: 'contain',
    },

    label: {
        fontSize: scale(14),
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    singleInput: {
        height: scale(42),
        paddingVertical: 0,
        fontSize: scale(14),
        color: COLORS.text,
        includeFontPadding: false,
        textAlignVertical: 'center',
        fontFamily: Fonts.PoppinsMedium,
    },

    unitText: {
        fontSize: scale(15),
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    genderWrapper: {
        flexDirection: 'row',
        marginTop: scale(18),
        justifyContent: 'space-between',
    },

    genderBtn: {
        flex: 1,
        height: scale(48),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(4),
    },

    activeGenderBtn: {
        backgroundColor: '#EAF5EF',
        borderColor: COLORS.primary,
    },

    genderText: {
        fontSize: scale(13),
        color: COLORS.subText,
        fontFamily: Fonts.PoppinsMedium,
    },

    activeGenderText: {
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },


    /* ======================================LAST OPTION =============*/

    infoCard: {
        marginTop: 20,
        backgroundColor: '#E7F0E2',
        borderRadius: scale(18),
        paddingVertical: scale(18),
        paddingHorizontal: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoLeft: {
        width: scale(42),
        height: scale(42),
        borderRadius: scale(21),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(14),
    },

    infoText: {
        flex: 1,
        color: Colors.primaryColor,
        fontSize: scale(11),
        lineHeight: scale(20),
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ================= BUTTON ================= */


    bottomFixed: {
        backgroundColor: COLORS.screen,
        paddingTop: 12,
        paddingBottom: 10,
        paddingHorizontal: 20,
    },
    // nextBtn: {
    //     position: 'absolute',
    //     bottom: Platform.OS === 'ios'
    //         ? scale(28)
    //         : scale(20),

    //     left: scale(20),
    //     right: scale(20),

    //     height: scale(58),
    //     borderRadius: scale(16),
    //     backgroundColor: COLORS.primary,

    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },


    nextBtn: {
        width: '100%',
        height: 62,

        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',

        flexDirection: 'row',

        backgroundColor: COLORS.primary,

        alignSelf: 'center',
    },

    disabledButton: {
        backgroundColor: '#96beb6',
        borderWidth: 1,
        borderColor: Colors.borderColor,
        opacity: 1,
    },

    nextText: {
        fontSize: scale(16),
        color: COLORS.white,
        fontFamily: Fonts.PoppinsSemiBold,
        marginRight: scale(4),
    },
});