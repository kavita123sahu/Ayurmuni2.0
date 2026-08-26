import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '../common/Vector';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';

const FAQItem = ({
  question,
  answer,
  isOpen,
  onPress,
  onOpenDetail,
}: {
  question: string;
  answer?: string;
  isOpen?: boolean;
  onPress?: () => void;
  onOpenDetail?: () => void;
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.header} activeOpacity={0.85}>
        <Text style={styles.q}>{question}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isOpen ? (
        <View>
          {!!answer && <Text style={styles.a}>{answer}</Text>}
          {onOpenDetail ? (
            <TouchableOpacity
              style={styles.detailLink}
              onPress={onOpenDetail}
              activeOpacity={0.85}
            >
              <Text style={styles.detailLinkText}>View full article</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primaryColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default FAQItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  q: {
    flex: 1,
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.textColor,
    paddingRight: 10,
    includeFontPadding: false,
  },
  a: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 0,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.subTextColor,
    lineHeight: 18,
  },
  detailLink: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
