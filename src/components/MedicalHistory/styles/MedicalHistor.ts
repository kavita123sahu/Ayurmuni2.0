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
        paddingHorizontal: scale(16),
        paddingTop: 0,
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
        // backgroundColor: Colors.background,
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

    skipBtn: {
  paddingHorizontal: 12,
  paddingVertical: 6,
},

skipText: {
  fontSize: scale(14),
  color: COLORS.primary,
  fontWeight: '600',
},

    /* ================= PROGRESS ================= */

    progressWrapper: {
        marginTop: scale(6),
        marginBottom: scale(6),
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
        fontSize: scale(18),
        lineHeight: scale(24),
        marginTop: scale(4),
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsBold,
        marginBottom: scale(8),
    },

    description: {
        fontSize: scale(13),
        lineHeight: scale(20),
        color: '#7A7F86',
        textAlign: 'center',
        paddingHorizontal: scale(8),
        fontFamily: Fonts.PoppinsMedium,
    },



    /* =========================================
       MULTI SELECT TAG
    ========================================= */

    multiSelectWrapper: {
        marginTop: scale(10),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF7EF',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
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
        minHeight: scale(64),
        borderRadius: scale(16),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EEF0EA',
        paddingHorizontal: scale(8),
        paddingVertical: scale(8),
        marginBottom: scale(6),
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
        marginLeft: scale(10),
        justifyContent: 'center',
    },
    avatar: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        resizeMode: 'contain',
        backgroundColor: '#F8FAFC',
        flexShrink: 0,
    },
    compactAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
    },
    medicalavatar: {
        width: scale(48),
        height: scale(48),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        justifyContent: 'center',
        borderRadius: scale(24),
        alignItems: 'center',
        resizeMode: 'contain',
        backgroundColor: '#F8FAFC',
        flexShrink: 0,
    },


    cardSubtitle: {
        marginTop: scale(2),
        fontSize: scale(11),
        lineHeight: scale(16),
        color: COLORS.subText,
        fontFamily: Fonts.PoppinsMedium,
        flexWrap: 'wrap',
    },


    activeSubtitle: {
        color: '#5B6B63',
    },

    cardTitle: {
        fontSize: scale(13),
        lineHeight: scale(18),
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
        minHeight: scale(96),
        borderRadius: scale(16),
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: scale(14),
        paddingVertical: scale(12),
        fontSize: scale(14),
        color: COLORS.text,
        textAlignVertical: 'top',
        fontFamily: Fonts.PoppinsMedium,
        marginTop: scale(12),
    },


    /* ================= BASIC INFO ================= */

    basicInfoWrapper: {
        marginTop: scale(10),
    },

    basicCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(12),
        marginBottom: scale(10),
        borderWidth: 1,
        borderColor: '#EEF1EC',
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconCircle: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        borderWidth: 1,
        borderColor: '#F1F5F9',
        resizeMode: 'contain',
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },

    basicIcon: {
        width: scale(32),
        height: scale(32),
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
        marginTop: scale(12),
        justifyContent: 'space-between',
    },

    genderBtn: {
        flex: 1,
        height: scale(42),
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
        marginTop: scale(10),
        backgroundColor: '#E7F0E2',
        borderRadius: scale(14),
        paddingVertical: scale(10),
        paddingHorizontal: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoLeft: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },

    infoText: {
        flex: 1,
        color: Colors.primaryColor,
        fontSize: scale(10),
        lineHeight: scale(16),
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ================= BUTTON ================= */


    bottomFixed: {
        backgroundColor: COLORS.screen,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
    },

    nextBtn: {
        width: '100%',
        height: 52,
        borderRadius: 14,
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