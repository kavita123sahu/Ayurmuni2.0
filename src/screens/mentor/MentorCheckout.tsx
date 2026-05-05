import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView, Animated, Dimensions, BackHandler } from "react-native";
import AppHeader from "../../components/AppHeader";
import { Images } from "../../common/Images";
import DoctorCard from "../../components/DoctorCard";
import SectionHeader from "../../components/SectionHeader";
import { Fonts } from "../../common/Fonts";
import { Colors } from "../../common/Colors";
import PaymentMethodCard from "../../components/PaymentCard";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentPlan from "./PaymentPlan";




export default function CheckoutScreen(props: any) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEMI, setShowEMI] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  const screenHeight = Dimensions.get("window").height;

  const openEMI = () => {
    setShowEMI(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeEMI = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowEMI(false));
  };


  const insets = useSafeAreaInsets();

  const doctor = {
    name: "Dr. Arjun R Nair",
    speciality: "Panchakarma Specialists",
    exp: 12,
    rating: 4.4,
    image: "https://via.placeholder.com/100",
  };

  const paymentMethods = [
    {
      id: "1",
      title: "Credit Card",
      subtitle: "**** **** **** 4290",
      icon: Images.DebitCard,
      isActive: true,
    },
    {
      id: "2",
      title: "UPI ID",
      subtitle: "PhonePe, Google Pay, Paytm...",
      icon: Images.card,
      isActive: false,
    },
    {
      id: "3",
      title: "EMI",
      subtitle: "Flexible monthly installments",
      icon: Images.card,
      isActive: false,
    },

  ];

  const patients = ["John Deo", "Jane Doe"];

  const [selectedPatient, setSelectedPatient] = useState(patients[0]);

  const [activeId, setActiveId] = useState("1");



  useEffect(() => {
    const backAction = () => {
      if (showEMI) {
        closeEMI();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showEMI]);


  const SummaryCard = () => {
    return (
      <View style={styles.summarycontainer}>
        <View style={styles.row}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: Colors.subTextColor }}>CONSULTATION FEE</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, color: Colors.black }}>Rs. 1999</Text>
        </View>

        <View style={styles.row}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: Colors.primaryColor }}>Promo Applied</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, color: Colors.primaryColor }}>rS. -199.00</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View>
            <Text style={styles.total}>Grand Total</Text>
            <Text style={styles.totalValue}>Rs. 1699</Text>

          </View>

          <TouchableOpacity style={styles.button} onPress={openEMI}>
            <Text style={{ color: '#fff', fontSize: 14, fontFamily: Fonts.PoppinsSemiBold }}>
              Choose Plan
            </Text>
            <Image source={Images.arrowRight} style={{ tintColor: Colors.white, marginTop: 5, marginLeft: 5, height: 20, width: 20 }} />
          </TouchableOpacity>
        </View>
      </View>
    );

  };


  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader title="Checkout" leftIcon={Images.backIcon} onLeftPress={() => props.navigation.goBack()} />


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
        paddingHorizontal: 20, backgroundColor: Colors.background, paddingBottom: insets.bottom + 20, // 👈 dynamic padding
        flexGrow: 1,
      }}  >

        <View style={styles.section}>
          <DoctorCard data={doctor} />

          <SectionHeader title="Patient Details" actionText="+ Add Patient" />

          <Text style={styles.TextHeader}>FULL NAME</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.SelectedText}>{selectedPatient}</Text>
            <Image source={Images.arrow} style={{ tintColor: '#000000', width: 20, height: 20, transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>

          {dropdownOpen &&
            patients.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedPatient(p);
                  setDropdownOpen(false);
                }}
              >
                <Text style={{ fontSize: 14, paddingHorizontal: 8, fontFamily: Fonts.PoppinsMedium, color: Colors.black }}>{p}</Text>
              </TouchableOpacity>
            ))}
        </View>


        <View style={styles.section}>

          <SectionHeader title="Payment Method" actionText="+ Add New" />
          {paymentMethods.map((item) => (
            <PaymentMethodCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              isActive={activeId === item.id}
              onPress={() => setActiveId(item.id)}
            />
          ))}
        </View>


        <SummaryCard />

      </ScrollView>

      {showEMI && (
        <Animated.View
          style={[
            styles.fullOverlay,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0], // 👈 bottom se full screen slide
                  }),
                },
              ],
            },
          ]}
        >
          <PaymentPlan onClose={closeEMI}  navigation ={props.navigation}/>
        </Animated.View>
      )}
    </SafeAreaView>

  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",

  },

  header: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  section: {
    marginTop: 16,

  },

  title: {
    fontWeight: "600",
    marginBottom: 8,
  },
  TextHeader: {
    fontSize: 14,
    paddingHorizontal: 8,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  dropdown: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  SelectedText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  dropdownItem: {
    padding: 12,
    borderColor: Colors.borderColor,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderRadius: 10,
  },

  paymentBox: {
    backgroundColor: "#f7f9fb",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  active: {
    borderWidth: 2,
    borderColor: "#0f6d5c",
    backgroundColor: "#eef7f5",
  },

  summary: {
    marginTop: 20,
    backgroundColor: "#eef3f1",
    padding: 14,
    borderRadius: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  btn: {
    backgroundColor: "#0f6d5c",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  summarycontainer: {
    padding: 30,
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    backgroundColor: '#0D614E1A',
    marginTop: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
  },

  total: {
    fontSize: 12,
    color: Colors.subTextColor,
    fontFamily: Fonts.PoppinsMedium
  },
  totalValue: {
    fontSize: 22,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold
  },

  button: {
    justifyContent: 'center',
    backgroundColor: '#0B6E4F',
    padding: 16,
    height: 50,
    flexDirection: 'row',

    borderRadius: 16,
    alignItems: 'center',
  },
  fullOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F4F6F8",
    zIndex: 999,
  },

});