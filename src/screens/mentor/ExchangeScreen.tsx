import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';

const reasons = [
  'Wrong size/variant',
  'Damaged on arrival',
  'Ordered by mistake',
  'Other',
];

const ExchangeScreen = (props: any) => {
  const [selectedReason, setSelectedReason] = useState<string>('Wrong size/variant');
  const [note, setNote] = useState('');

  const Section = ({ number, title, children }: any) => (
    <View style={{ marginTop: 25 }}>
      <View style={styles.sectionHeader}>
        {number && (
          <View style={styles.circle}>
            <Text style={styles.circleText}>{number}</Text>
          </View>
        )}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={{ marginTop: 20 }}>{children}</View>
    </View>
  );
  const RadioItem = ({ label, selected, onPress }: any) => (
    <TouchableOpacity
      style={[
        styles.radio,
        selected && styles.radioActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >

      <Text style={styles.radioText}>{label}</Text>
      <View style={[styles.radiocircle, selected && styles.activeCircle]}>
        {selected && <Image source={Images.tick} style={{ height: 15, width: 15, tintColor: '#FFFF' }} />}
      </View>
      {/* <View style={[styles.dot, selected && styles.dotActive]} /> */}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.
      container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader
        title="Order Details "
        leftIcon={Images.backIcon}
        onLeftPress={() => props.navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: '#FDFDFB', paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        <View style={styles.productCard}>
          <Image
            source={require('../../assets/images/doctor.png')}
            style={styles.productImg}
          />
          <View>

            <Text style={styles.orderTitle}>ORDER ID #ORD-98231</Text>
            <Text style={styles.productTitle}>Medicines Order</Text>
          </View>
        </View>


        <Section number={1} title="Why are you exchanging this item?">
          {reasons.map((item) => (
            <RadioItem
              key={item}
              label={item}
              selected={selectedReason === item}
              onPress={() => setSelectedReason(item)}
            />
          ))}
        </Section>

        {/* SECTION 2 */}
        <Section number={2} title="Select replacement item">
          <View style={styles.replaceCard}>
            <View style={{ flexDirection: 'row', }}>
              <Image source={Images.doctorImage} style={{ height: 80, width: 80, borderRadius: 16 }} />

              <View style={{ marginLeft: 20 }}>
                <Text style={styles.replaceTitle}>Medicines Order</Text>
                <Text style={styles.replaceSub}>Original: 500mg - 30 Pack</Text>
                <Text style={styles.available}>Available for Exchange</Text>

              </View>

            </View>



            <TouchableOpacity
              style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' }}
            >
              <Text style={styles.variantText}>NEW VARIENT</Text>
              <Image source={require('../../assets/images/dropdowncenter.png')} style={{ height: 18, width: 9 }} />

            </TouchableOpacity>


            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>
                500mg - 30 Pack (Even Exchange)
              </Text>
              <Image source={Images.dropdown} style={{ height: 20, width: 20 }} />
            </TouchableOpacity>

          </View>
        </Section>

        {/* SECTION 3 */}
        <Section title="Tell us more (Optional)">
          <TextInput
            style={styles.input}
            placeholder="Share any additional details..."
            multiline
            value={note}
            onChangeText={setNote}


          />


        </Section>

        {/* BUTTON */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Confirm Exchange</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExchangeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',

  },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F3',
    padding: 20,
    height: 100,
    borderRadius: 20,
    marginTop: 15,
  },

  productImg: {
    width: 64,
    height: 64,
    marginRight: 10,
  },


  orderTitle: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B'
  },

  productTitle: {
    fontSize: 20,
    marginTop: 4,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    marginRight: 8,
  },

  circleText: {
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
  },

  sectionTitle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: 55,
    justifyContent: 'space-between',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },

  radioActive: {
    borderWidth: 1.5,
    padding: 16,
    height: 55,
    borderRadius: 20,
    borderColor: '#0D614E',
    // backgroundColor: '#F0FDF9',
  },

  radiocircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activeCircle: {
    backgroundColor: '#0D614E',
    borderColor: '#0D614E',
  },

  tick: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.PoppinsBold,
  },

  radioText: {
    fontSize: 14,   
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.black,
  },
  
  replaceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BEC9C51A',
    padding: 25,
    // gap:25,

  },

  replaceTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 16,
    color: Colors.black
  },

  replaceSub: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Fonts.PoppinsMedium,
  },

  available: {
    color: Colors.primaryColor,
    backgroundColor: '#0D614E1A',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    marginTop: 4,
  },

  dropdown: {
    marginTop: 8,
    padding: 16,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D614E1A',
    borderRadius: 16,
  },

  variantText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },

  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 20,
    fontSize: 14,
    marginBottom: 40,
    fontFamily: Fonts.PoppinsMedium,
    textAlignVertical: 'top',
  },

  button: {
    marginTop: 25,
    backgroundColor: '#0D614E',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});