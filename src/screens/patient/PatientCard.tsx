import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export interface Patient {
  id: string;
  name: string;
  relation: string;
  image: string;
  selected?: boolean;
}

interface Props {
  patient: Patient;
  onSelect: (id: string) => void;
}

const PatientCard: React.FC<Props> = ({ patient, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.item, patient.selected && styles.itemSelected]}
      onPress={() => onSelect(patient.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: patient.image }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.relation}>Relation: {patient.relation}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {}}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>

        {patient.selected && (
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PatientCard;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  relation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIcon: {
    fontSize: 14,
    opacity: 0.5,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});