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
        <Text style={[styles.name,{marginBottom:-4}]}>{patient.name}</Text>
        <Text style={Styles.specialty}>Relation: <Text style={styles.subtitle}> {patient.relation}</Text></Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {}}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
           <Image source={Images.editButton}  style={styles.IconSize} />
          {/* <Feather  name='edit' color={Colors.primaryColor} /> */}
        </TouchableOpacity>

        {patient.selected ? (
          // <View style={styles.checkCircle}>
             <Image source={Images.verify}  style={styles.IconSize} />
          // </View>
        ) :  <Image source={Images.unverify} style={styles.IconSize} /> }
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
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F0FDFA',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    marginRight: 12,
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
    fontFamily : Fonts.PoppinsMedium
  },
  IconSize:{
    height : 22,
    width:22
  }
});