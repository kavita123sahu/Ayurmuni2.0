import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";
import { Ionicons } from "../common/Vector";
import { Images } from "../common/Images";
import { Styles } from "../common/Styles";

const PrimaryButton = ({
  title,
  onPress,
  page
}: {
  title: string;
  page: string
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={[styles.primaryBtn,{backgroundColor: page=='appoint' ?  Colors.primaryColor: '#FEF2F2' }]} onPress={onPress}>
      <View style={styles.content}>
        <Image source={page =='appoint'? Images.video: Images.logout}  style={Styles.IconSize}  />
        {/* <Ionicons name= {page=='appoint'? "videocam":""} size={18} color= {page=='appoint'?"#fff" : Colors.errorColor} /> */}
        <Text style={[styles.primaryText,{color:page=='appoint'? Colors.white : Colors.errorColor}]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};


export default PrimaryButton;
const styles = StyleSheet.create({
      primaryBtn: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 12,
        paddingVertical: 18,
        borderWidth:1,
        borderColor:'#FFCECE',
        alignItems: 'center',
        justifyContent: 'center',
      },
    
      content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
    
      primaryText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
      },
})

