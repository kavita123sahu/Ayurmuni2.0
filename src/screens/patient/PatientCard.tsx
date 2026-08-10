import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Styles } from '../../common/Styles';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { Feather, Ionicons } from '../../common/Vector';
import { Images } from '../../common/Images';
import TablerIcon from '../../components/TablerIcon';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  relation: string;
  image: string;

  profile_picture: string;
  selected?: boolean;
}

interface Props {
  patient: Patient;
  navigation: any,
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

const PatientCard: React.FC<Props> = ({ patient, onSelect, navigation, onDelete }) => {

  const full_name = patient?.first_name + " " + patient?.last_name;


  console.log('patient_card_patient', patient);

  const isSelf = String(patient?.relation ?? '').toLowerCase() === 'self';

  return (
    <TouchableOpacity
      style={[styles.item, patient.selected && styles.itemSelected]}
      onPress={() => onSelect(patient.id)}
      activeOpacity={0.8}
    >

      {patient?.profile_picture ? (
        <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.bgcolor }]}>
          <Image source={{ uri: patient?.profile_picture }} style={styles.avatar} />
        </View>
      ) : <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarLetter}>
          {full_name.charAt(0).toUpperCase()}
        </Text>
      </View>}

      <View style={styles.info}>
        <Text style={[styles.name, { marginBottom: -4 }]}>{full_name}</Text>
        <Text style={Styles.specialty}>Relation: <Text style={styles.subtitle}> {patient.relation}</Text></Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          disabled={isSelf}
          onPress={() => {
            if (isSelf) {
              return;
            }

            navigation.navigate('AddEditPatientDetail', {
              mode: 'edit',
              patientId: patient?.id,
            });
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSelf ? <TablerIcon
            name="edit"
            size={20}
            color={

              Colors.primaryColor
            }
          /> : null}
          {/* <TablerIcon
            name="edit"
            size={20}
            color={
             
                 Colors.primaryColor
            }
          /> */}
        </TouchableOpacity>

        {!isSelf && onDelete ? (
          <TouchableOpacity
            onPress={() => onDelete(patient.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <TablerIcon name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        ) : null}

        {patient.selected ? (
          <TablerIcon name="verify" size={22} color={Colors.primaryColor} />
        ) : (
          <TablerIcon name="unverify" size={22} color="#94A3B8" />
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
    padding: 15,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.borderColor
  },
  itemSelected: {
    borderColor: Colors.primaryColor,
    // backgroundColor: '#F0FDFA',
    borderWidth: 0.5,

  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    // height: 50,
    borderRadius: 10,
    // marginRight: 12,
    backgroundColor: Colors.bgcolor
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor, // Any color
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarLetter: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: Fonts.PoppinsMedium
  },

  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
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
  subtitle: {
    fontSize: 14,
    color: '#0D614E',
    fontFamily: Fonts.PoppinsMedium
  },
  IconSize: {
    height: 22,
    width: 22
  }
});