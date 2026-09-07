import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';

type Props = {
  content?: any[] | null;
};

const PolicyContentRenderer = ({ content }: Props) => {
  const blocks = Array.isArray(content) ? content : [];

  if (!blocks.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Policy content is not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {blocks.map((block, index) => {
        const type = String(block?.type || 'paragraph');
        const text = String(block?.text || '').trim();
        const number = block?.number ? String(block.number).trim() : '';

        if (type === 'list') {
          const items = Array.isArray(block?.items) ? block.items : [];
          return (
            <View key={`list-${index}`} style={styles.listBlock}>
              {items.map((item: any, itemIndex: number) => {
                const marker = String(item?.marker || '•').trim() || '•';
                const itemText = String(item?.text || '').trim();
                if (!itemText) return null;
                return (
                  <View key={`li-${index}-${itemIndex}`} style={styles.listRow}>
                    <Text style={styles.listMarker}>{marker}</Text>
                    <Text style={styles.listText}>{itemText}</Text>
                  </View>
                );
              })}
            </View>
          );
        }

        if (!text) return null;

        if (type === 'title') {
          return (
            <Text key={`title-${index}`} style={styles.title}>
              {text}
            </Text>
          );
        }

        if (type === 'heading') {
          return (
            <Text key={`heading-${index}`} style={styles.heading}>
              {number ? `${number}. ` : ''}
              {text}
            </Text>
          );
        }

        if (type === 'note') {
          return (
            <View key={`note-${index}`} style={styles.noteCard}>
              <Text style={styles.noteText}>{text}</Text>
            </View>
          );
        }

        return (
          <Text key={`p-${index}`} style={styles.paragraph}>
            {number ? (
              <Text style={styles.paragraphNumber}>{number} </Text>
            ) : null}
            {text}
          </Text>
        );
      })}
    </View>
  );
};

export default PolicyContentRenderer;

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDF2',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 4,
  },
  heading: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 10,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 21,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
  },
  paragraphNumber: {
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#334155',
  },
  listBlock: { gap: 8, paddingLeft: 2 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listMarker: {
    minWidth: 22,
    fontSize: 13,
    lineHeight: 21,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
    color: '#475569',
    fontFamily: Fonts.PoppinsRegular,
  },
  noteCard: {
    marginTop: 8,
    backgroundColor: '#EAF8F4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CFE8DF',
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
});
