import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Fonts } from '../../common/Fonts';
import { Ionicons } from '../../common/Vector';
import StepCard from '../../components/StepCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Styles } from '../../common/Styles';
import { Colors } from '../../common/Colors';

const width = Dimensions.get('screen').width;

const stepsData = [
  "Open My Appointments tab from bottom navigation.",
  "Select upcoming appointment.",
  "Tap on Reschedule button.",
  "Choose new date & time.",
  "Confirm changes.",
];

const FAQScreen = (props: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="FAQ"
        leftIcon={Images.backIcon}
        onLeftPress={() => props.navigation.goBack()}
        rightIcon="search"
        onRightPress={() => console.log('Search clicked')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* TITLE */}
          <Text style={styles.title}>
            How do I reschedule my appointment?
          </Text>

          {/* UPDATED */}
          <View style={styles.updatedBox}>
            <Image source={Images.clock} style={styles.clockIcon} />
            <Text style={styles.subText}>
              Updated 2 days ago • 3 min read
            </Text>
          </View>

          {/* IMAGE */}
          <Image
            source={Images.FAQImage}
            style={styles.banner}
            resizeMode="cover"
          />

          {/* DESCRIPTION */}
          <Text style={styles.description}>
            We understand that plans can change. You can reschedule your medical
            appointments directly through our mobile app up to 24 hours before your
            scheduled time.
          </Text>

          {/* STEP CARD */}
          <StepCard
            title="Step-by-Step Instructions"
            steps={stepsData}
          />

          {/* NOTE */}
          <View style={styles.noteBox}>
            <View style={styles.iconCircle}>
              <Image source={Images.notification} style={styles.iconSize} />
            </View>

            <Text style={styles.noteText}>
              <Text style={{ fontFamily: Fonts.PoppinsSemiBold }}>
                Note:
              </Text>{" "}
              If you need to reschedule within 24 hours of your appointment,
              please contact the clinic directly via the phone number provided
              in your initial booking confirmation.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,   // ✅ GLOBAL SPACING (important)
    paddingBottom: 20,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: "#0F172A",
    marginTop: 16,
  },

  updatedBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  clockIcon: {
    height: 16,
    width: 16,
    tintColor: "#6B7280",
    marginRight: 6,
  },

  subText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: Fonts.PoppinsMedium,
  },

  banner: {
    height: 180,
    width: "100%",   // ✅ RESPONSIVE FIX
    marginTop: 14,
    borderRadius: 12,
  },

  description: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginTop: 12,
    fontFamily: Fonts.PoppinsMedium,
  },

  noteBox: {
    flexDirection: "row",
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "flex-start",
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.BGIcon,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  iconSize: {
    height: 20,
    width: 20,
  },

  noteText: {
    flex: 1,
    fontSize: 12,
    color: "#0F172A",
    lineHeight: 18,
    fontFamily: Fonts.PoppinsMedium,
  },
});