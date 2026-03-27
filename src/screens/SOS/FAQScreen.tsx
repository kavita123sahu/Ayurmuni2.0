import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FAQ } from "../../common/DataInterface";


const faqData: FAQ = {
  question: "How do I reschedule my appointment?",
  description:
    "We understand that plans can change. You can reschedule your medical appointments directly through our mobile app up to 24 hours before your scheduled time.",
  steps: [
    { id: 1, text: "Open the My Appointments tab from the bottom navigation." },
    { id: 2, text: "Select the appointment you wish to change." },
    { id: 3, text: "Tap the Reschedule button." },
    { id: 4, text: "Choose a new date and time from available slots." },
    { id: 5, text: "Confirm your changes to update the appointment." },
  ],
};

const FAQScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>FAQ</Text>

      {/* Question */}
      <Text style={styles.question}>{faqData.question}</Text>

      {/* Description */}
      <Text style={styles.description}>{faqData.description}</Text>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Step-by-Step Instructions</Text>

        {/* {faqData.steps.map((step, index) => (
          <StepItem
            key={step.id}
            index={index + 1}
            text={step.text}
          />
        ))} */}
      </View>

      {/* Note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Note: If you need to reschedule within 24 hours, please contact support directly.
        </Text>
      </View>

      {/* Feedback */}
      <Text style={styles.feedbackTitle}>Was this article helpful?</Text>

      <View style={styles.feedBackButtons}>
        <TouchableOpacity style={styles.yesBtn}>
          <Text style={styles.yesText}>👍 Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.noBtn}>
          <Text style={styles.noText}>👎 No</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.support}>Still need help? Contact Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 16,
  },
  stepsContainer: {
    backgroundColor: "#F3F7F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  stepsTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },
  noteBox: {
    backgroundColor: "#EAF4F2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 12,
    color: "#333",
  },
  feedbackTitle: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
  feedBackButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  yesBtn: {
    backgroundColor: "#E6F4EA",
    padding: 10,
    borderRadius: 8,
  },
  noBtn: {
    backgroundColor: "#FDECEA",
    padding: 10,
    borderRadius: 8,
  },
  yesText: {
    color: "#2E7D32",
  },
  noText: {
    color: "#C62828",
  },
  support: {
    textAlign: "center",
    color: "#0F7A6C",
    fontWeight: "500",
  },
});