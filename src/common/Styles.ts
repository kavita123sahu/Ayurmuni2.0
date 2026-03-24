import { Dimensions } from "react-native";
import { Colors } from "./Colors";
import { Fonts } from "./Fonts";


const { width, height } = Dimensions.get('window');

export const Styles = {
    star: {
        color: '#FFC107',
        fontSize: 16,
    },
    formContainer: {
        marginTop: 20,
    },
    labelContainer: {
        marginLeft: 4,
    },
    labelText: {
        color: Colors.textColor,
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        lineHeight: 24,
        marginBottom: 4,
        letterSpacing: 0.5,
    },

    input: {
        height: 50,
        borderColor: Colors.bgGrayColor,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        // backgroundColor: Colors.bgcolor,
        letterSpacing: 0.88,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.textColor,
    },
    otpButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    otpButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
    },
    advisorCard: {
        padding: 15,
        paddingHorizontal: 20,
        width: '100%',
        flexDirection: 'row',
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#333'
    },
    viewAll: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    advisorIcon: {
        width: '40%',
        alignItems: 'center',

    },
    advisorContent: {

        width: '60%',
        marginLeft: 30
    },

    advisorTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 5,
    },
    advisorSubtitle: {
        marginTop: 5,
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.9,
        marginBottom: 10,
        lineHeight: 16,
    },


    askNowContainer: {
        position: 'absolute',
        bottom: -20,
        left: width / 2 - 80,
        zIndex: 10,
    },
    askNowButton: {

        paddingHorizontal: 25,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },


};