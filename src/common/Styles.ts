import { Dimensions } from "react-native";
import { Colors } from "./Colors";
import { Fonts } from "./Fonts";


export const Styles = {
   name: {
    fontSize: 16,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  specialty: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsMedium,
  },
  

   label: {
    fontSize: 12,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium,
  },

  value: {
    fontSize: 12,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },

     subtitle: {
    fontSize: 14,
    color: '#0D614E',
    fontFamily : Fonts.PoppinsMedium
  },

  
  sectionTitle: {
    marginTop: 15,
    marginHorizontal: 5,
    marginBottom: 6,
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.headercolor,
  },

  outlineText: {
    color: '#0A8F5A',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  cancelText: {
    color: '#EF4444',
     fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },

   iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    
    marginRight: 8,
  },

 addBtn: {
    color: '#0F766E',
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold
  },
 IconSize: {
    height: 22,
    width: 22,
  },

};