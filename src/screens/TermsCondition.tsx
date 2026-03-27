import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '../common/Vector';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { showSuccessToast } from '../config/Key';


const TermsCondition = (props: any) => {

  const { agreed } = props?.route?.params;

  console.log("agreeeeeeeeeee", agreed);

  const handleAgree = () => {
    showSuccessToast('Accepted Terms and Condition! Welcome aboard.', 'success')
    props.navigation.replace('HomeStack', { screen: 'Onboarding' })

  };


  const handleDisagree = () => {
    showSuccessToast('You need to accept terms to continue', 'error')
  };


  const handleBack = () => {
    props.navigation.goBack()
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ===== HEADER (STICKY) ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.BackButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ===== CONGRATULATIONS / TERMS BANNER (STICKY) ===== */}
      <LinearGradient
        style={styles.notificationBanner}
        colors={[Colors.secondaryColor, Colors.questionGreen]}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>Hello,</Text>
          <Text style={styles.notificationText}>
            {!agreed
              ? 'Before you create an account, please read and accept our '
              : 'Congratulations, You have Successfully Accepted! '}
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </Text>
        </View>

        <Image
          source={require('../assets/images/HelloIcon.png')}
          style={{ height: 15, width: 15 }}
        />
      </LinearGradient>

      {/* ===== SCROLLABLE CONTENT ONLY ===== */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.lastUpdated}>Last Updated: <Text style={styles.updateDate}>Yesterday</Text></Text>
        </View>


        <Text style={styles.termsText}>
          Lorem ipsum dolor sit amet consectetur. Proin diam nunc, tortor in bibendum odio. Consectetur venenatis in massa gravida sed faucibus eget in. Dui necque congue elementum vehicula consectetur. Bibendum vitae habitant diam sollicitudin vulputate enim sed nulla nulla. Cras pulvinar lectus mauris elementum. Mauris est tempus aliquam eu tellus sed magna id. Accumsan pellentesque massa nunc quis. Faucibus leo nam ultrices consequat sit praesent. Amet tincidunt viverra euismod habitasse congue posuere tristique. Amet sagittis dolor massa tempus turpis. Magna elit vel aliquam at nec vel adipiscing vestibulum.
          {'\n\n'}
          Hendrerit lectus lacuis arcu vestibulum justo. In consequat platea adipiscing ultrices lacinia. Euismod massa lorem est eget feugiat sed sagittis enim vestibulum. Elementum sed turpis sit tortor mauris sagittis nec. Ut ante libero facilisis enim consectetur facilisi. Neque ac pulvinar turpis integer aliquam augue eros diam. Quis in dictum tempus ut iaculis amet tempor iaculis adipiscing. Condimentum ullamcorper integer id nulla at. Eu elementum nibh nibh ornare bibendum. Cursus elementum diam amet integer viverra. Vitae habitant sagittis vulputate massa suscipit et id neque accumsan. Cras fames condimentum platea sed nibh suspendisse in turpis. Tincidunt nisl id quisque quam ultrices risus. Eqan risus sit amet aliquam ac. Arcu urna.
          {'\n\n'}
          Hendrerit lectus lacuis arcu vestibulum justo. In consequat platea adipiscing ultrices lacinia. Euismod massa lorem est eget feugiat sed sagittis enim vestibulum. Elementum sed turpis sit tortor mauris sagittis nec. Ut ante libero facilisis enim consectetur facilisi. Neque ac pulvinar turpis integer aliquam augue eros diam. Quis in dictum tempus ut iaculis amet tempor iaculis adipiscing.
          {'\n\n'}
          Condimentum ullamcorper integer id nulla at. Eu elementum nibh nibh ornare bibendum. Cursus elementum diam amet integer viverra. Vitae habitant sagittis vulputate massa suscipit et id neque accumsan. Cras fames condimentum platea sed nibh suspendisse in turpis.
        </Text>
      </ScrollView>

      {!agreed && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleAgree} activeOpacity={0.8} style={styles.buttonWrapper}>
            <LinearGradient
              colors={[Colors.secondaryColor, Colors.questionGreen]}
              style={styles.agreeButton}>
              <Text style={styles.agreeButtonText}>Agree</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.disagreeButton} onPress={handleDisagree}>
            <Text style={styles.disagreeButtonText}>Disagree</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  BackButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  notificationBanner: { marginHorizontal: 15, marginBottom: 15, borderRadius: 10, padding: 15, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  notificationContent: { flex: 1, paddingRight: 10 },
  notificationTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  notificationText: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
  linkText: { fontSize: 14, fontFamily: Fonts.PoppinsMedium },
  scrollView: {
    flex: 1, // IMPORTANT
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120, // space for sticky buttons
  },
  closeButton: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 24, fontFamily: Fonts.PoppinsMedium, color: Colors.textColor, marginBottom: 8 },
  lastUpdated: { fontSize: 14, fontFamily: Fonts.PoppinsRegular, color: Colors.subTextColor },
  updateDate: { fontFamily: Fonts.PoppinsMedium, color: Colors.textColor },
  termsContainer: { flex: 1, marginBottom: 20, },
  termsText: { fontSize: 14, fontFamily: Fonts.PoppinsRegular, color: Colors.black, lineHeight: 20, textAlign: 'justify' },
  buttonContainer: { flexDirection: 'row', gap: 15, paddingBottom: 50, paddingHorizontal: 20, paddingVertical: 20 },

  buttonWrapper: { flex: 1 },
  agreeButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  disagreeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primaryColor },
  agreeButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: Fonts.PoppinsMedium },
  disagreeButtonText: { color: Colors.primaryColor, fontSize: 16, fontFamily: Fonts.PoppinsMedium }
});

export default TermsCondition;



