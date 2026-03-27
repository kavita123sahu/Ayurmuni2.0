import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Fonts } from "../common/Fonts";
import { Colors } from "../common/Colors";



const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_COUNT = 3; // 👈 dynamic bhi kar sakta hai
const SPACING = 12;
const CONTAINER_PADDING = 32; // marginHorizontal 16 + 16

const ITEM_WIDTH =
  (SCREEN_WIDTH - CONTAINER_PADDING - SPACING * (ITEM_COUNT - 1)) /
  ITEM_COUNT;

const DashboardCard = (value: any, label: string) => (
  <View style={styles.statBox}>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default DashboardCard


const styles = StyleSheet.create({
    
 statBox: {
  width: ITEM_WIDTH,
  height: ITEM_WIDTH * 0.8, // 👈 ratio maintain (Figma jaisa)
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: '#DDEBE8',
  backgroundColor: '#F4FAF8',
  justifyContent: 'center',
  alignItems: 'center',
},


statsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},

  statNumber: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsBold,
    color: Colors.questionGreen,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.questionGreen,
    marginTop: 2,
    fontFamily : Fonts.PoppinsMedium
  },
})