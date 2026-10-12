import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Fonts } from '../../common/Fonts';
import AppInputField from '../../components/AppInputField';
import TablerIcon from '../../components/TablerIcon';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../common/Colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as _PATIENT_SERVICES from '../../services/PatientServices';
import { invalidateProfileThrottles } from '../../utils/fetchThrottle';
import { useAppDispatch } from '../../store/hooks';
import { fetchCustomerData } from '../../store/slices/homeSlice';
import { usePatientForm } from '../../hooks/usePatientData';
import { BUTTON, RADIUS, SPACING, TYPO } from '../../constants/responsive';

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' },
];

export const RELATION_OPTIONS = [
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Father', value: 'Father' },
  { label: 'Mother', value: 'Mother' },
  { label: 'Child', value: 'Child' },
  { label: 'Other', value: 'Others' },
];

const isSelfRelation = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase() === 'self';

const EDITABLE_RELATION_OPTIONS = RELATION_OPTIONS.filter(
  option => !isSelfRelation(option.value),
);

export const BLOOD_GROUP_OPTIONS = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
];

type FormData = {
  fullname: string;
  dob: string;
  gender: string;
  bloodG: string;
  height: string;
  weight: string;
  phonenumber: string;
  email: string;
  relation: string;
  profilePicture: string;
  contactName: string;
  emergencyRelation: string;
  EmergencyNO: string;
  insurance: string;
  policyNO: string;
  valid: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const EMPTY_FORM: FormData = {
  fullname: '',
  dob: '',
  gender: '',
  bloodG: '',
  height: '',
  weight: '',
  phonenumber: '',
  email: '',
  relation: '',
  profilePicture: '',
  contactName: '',
  emergencyRelation: '',
  EmergencyNO: '',
  insurance: '',
  policyNO: '',
  valid: '',
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

const formatToISODate = (date: string) => {
  if (ISO_DATE_RE.test(date)) return date;
  return null;
};

const API_FIELD_MAP: Record<string, keyof FormData> = {
  first_name: 'fullname',
  last_name: 'fullname',
  dob: 'dob',
  gender: 'gender',
  blood_group: 'bloodG',
  relation: 'relation',
  height: 'height',
  weight: 'weight',
  phone_number: 'phonenumber',
  email: 'email',
  emergency_contact_name: 'contactName',
  emergency_contact_relation: 'emergencyRelation',
  emergency_contact_phone: 'EmergencyNO',
  insurance_provider: 'insurance',
  insurance_policy_number: 'policyNO',
  insurance_valid_thru: 'valid',
  profile_picture: 'profilePicture',
};

const getFieldErrors = (
  data: FormData,
  mode?: string,
  existingRelation?: string | null,
): FieldErrors => {
  const errors: FieldErrors = {};

  if (!data.fullname.trim()) {
    errors.fullname = 'Full name is required';
  }

  if (!data.dob.trim()) {
    errors.dob = 'Date of birth is required';
  } else if (!formatToISODate(data.dob)) {
    errors.dob = 'Use YYYY-MM-DD format';
  }

  if (!data.gender.trim()) {
    errors.gender = 'Gender is required';
  }

  if (!data.bloodG.trim()) {
    errors.bloodG = 'Blood group is required';
  }

  if (!data.relation.trim()) {
    errors.relation = 'Relation is required';
  } else if (isSelfRelation(data.relation) && mode !== 'edit') {
    errors.relation = 'Self relation cannot be selected';
  } else if (
    mode === 'edit' &&
    !isSelfRelation(existingRelation) &&
    isSelfRelation(data.relation)
  ) {
    errors.relation = 'Self relation cannot be selected';
  }

  if (!data.phonenumber.trim()) {
    errors.phonenumber = 'Phone number is required';
  } else if (!PHONE_RE.test(data.phonenumber)) {
    errors.phonenumber = 'Phone number must be 10 digits';
  }

  if (data.email.trim() && !EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (data.height.trim()) {
    const h = Number(data.height);
    if (!Number.isFinite(h) || h <= 0) {
      errors.height = 'Enter a valid height';
    }
  }

  if (data.weight.trim()) {
    const w = Number(data.weight);
    if (!Number.isFinite(w) || w <= 0) {
      errors.weight = 'Enter a valid weight';
    }
  }

  if (data.EmergencyNO.trim() && !PHONE_RE.test(data.EmergencyNO)) {
    errors.EmergencyNO = 'Emergency phone must be 10 digits';
  }

  if (data.valid.trim() && !formatToISODate(data.valid)) {
    errors.valid = 'Use YYYY-MM-DD format';
  }

  return errors;
};

const areRequiredFieldsFilled = (data: FormData) =>
  Boolean(
    data.fullname.trim() &&
      data.dob.trim() &&
      data.gender.trim() &&
      data.bloodG.trim() &&
      data.relation.trim() &&
      PHONE_RE.test(data.phonenumber),
  );

const mapApiErrorsToFields = (apiError: Record<string, any>): FieldErrors => {
  const mapped: FieldErrors = {};

  Object.entries(apiError).forEach(([key, value]) => {
    const field = API_FIELD_MAP[key];
    if (!field) return;
    const message = Array.isArray(value)
      ? value.map(String).join(', ')
      : String(value || '').trim();
    if (!message) return;
    mapped[field] = mapped[field]
      ? `${mapped[field]} ${message}`
      : message;
  });

  return mapped;
};

export default function AddEditPatientDetail(props: any) {
  const { mode, patientId } = props.route.params || {};
  const dispatch = useAppDispatch();
  const { patientData } = usePatientForm(mode === 'edit' ? patientId : undefined);
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isSelf = isSelfRelation(formData.relation);

  const nameParts = formData.fullname.trim().split(/\s+/).filter(Boolean);
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  useEffect(() => {
    if (!patientData) return;

    setFormData({
      fullname: `${patientData?.first_name || ''} ${patientData?.last_name || ''}`.trim(),
      dob: patientData?.dob || '',
      gender: patientData?.gender || '',
      bloodG: patientData?.blood_group || '',
      height: String(patientData?.height || ''),
      weight: String(patientData?.weight || ''),
      phonenumber: patientData?.phone_number || '',
      email: patientData?.email || '',
      relation: patientData?.relation || '',
      profilePicture: patientData?.profile_picture || '',
      contactName: patientData?.emergency_contact_name || '',
      emergencyRelation: patientData?.emergency_contact_relation || '',
      EmergencyNO: patientData?.emergency_contact_phone || '',
      insurance: patientData?.insurance_provider || '',
      policyNO: patientData?.insurance_policy_number || '',
      valid: patientData?.insurance_valid_thru || '',
    });
    setErrors({});
    setSubmitted(false);
  }, [patientData]);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData(prev => ({ ...prev, [key]: value }));
      setErrors(prev => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const canSubmit = useMemo(() => {
    if (!areRequiredFieldsFilled(formData)) return false;
    if (isSelfRelation(formData.relation) && mode !== 'edit') return false;
    if (
      mode === 'edit' &&
      !isSelfRelation(patientData?.relation) &&
      isSelfRelation(formData.relation)
    ) {
      return false;
    }
    return true;
  }, [formData, mode, patientData?.relation]);

  const onSavePatient = async () => {
    setSubmitted(true);
    const fieldErrors = getFieldErrors(formData, mode, patientData?.relation);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const payload = {
      first_name,
      last_name,
      dob: formatToISODate(formData.dob),
      gender: formData.gender.toLowerCase(),
      blood_group: formData.bloodG,
      relation: isSelf ? 'self' : formData.relation.toLowerCase(),
      height: Number(formData.height) || 0,
      weight: Number(formData.weight) || 0,
      phone_number: formData.phonenumber,
      email: formData.email,
      profile_picture: formData.profilePicture,
      emergency_contact_name: formData.contactName,
      emergency_contact_relation: formData.emergencyRelation.toLowerCase(),
      emergency_contact_phone: formData.EmergencyNO,
      insurance_provider: formData.insurance,
      insurance_policy_number: formData.policyNO,
      insurance_valid_thru: formatToISODate(formData.valid),
    };

    try {
      setSaving(true);
      let response;

      if (mode === 'edit') {
        response = await _PATIENT_SERVICES.updatePatientById(patientId, payload);
      } else {
        response = await _PATIENT_SERVICES.AddNewPatient(payload);
      }

      const apiError = response?.data;
      if (apiError?.error || apiError?.detail || apiError?.message) {
        throw apiError;
      }

      invalidateProfileThrottles();
      dispatch(fetchCustomerData(true));
      props.navigation.goBack();
    } catch (error: any) {
      const apiError = error?.response?.data || error;

      if (apiError && typeof apiError === 'object' && !apiError.message) {
        const mapped = mapApiErrorsToFields(apiError);
        if (Object.keys(mapped).length > 0) {
          setErrors(prev => ({ ...prev, ...mapped }));
          return;
        }

        const formattedErrors = Object.entries(apiError)
          .map(([key, value]: any) => {
            const message = Array.isArray(value) ? value.join(', ') : value;
            return `${key}: ${message}`;
          })
          .join('\n');

        if (formattedErrors) {
          Alert.alert('Fix These Fields', formattedErrors);
          return;
        }
      }

      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const fieldGap = { marginBottom: SPACING.sm };
  const fieldBox = {
    borderColor: Colors.bgborderColor,
    borderRadius: RADIUS.md,
  };
  const showError = (key: keyof FormData) =>
    submitted || errors[key] ? errors[key] : undefined;

  const footerPad = Math.max(insets.bottom, SPACING.sm);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title={mode === 'edit' ? 'Edit Patient' : 'Add Patient'}
        onLeftPress={() => props.navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <AppInputField
            label="Full Name *"
            placeholder="John Doe"
            value={formData.fullname}
            onChangeText={(text: string) => updateField('fullname', text)}
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('fullname')}
            autoCapitalize="words"
          />

          <AppInputField
            label="Date of Birth *"
            placeholder="YYYY-MM-DD"
            value={formData.dob}
            onChangeText={(text: string) => updateField('dob', text)}
            rightIconName="calendar"
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('dob')}
          />

          <AppInputField
            label="Gender *"
            value={formData.gender}
            placeholder="Select Gender"
            rightIconName="chevron-down"
            options={GENDER_OPTIONS}
            onSelect={(value: string) => updateField('gender', value)}
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('gender')}
          />

          <View style={styles.row}>
            <AppInputField
              label="Blood Group *"
              value={formData.bloodG}
              placeholder="Blood Group"
              rightIconName="chevron-down"
              options={BLOOD_GROUP_OPTIONS}
              onSelect={(value: string) => updateField('bloodG', value)}
              containerStyle={[fieldGap, styles.rowHalfLeft]}
              inputContainerStyle={fieldBox}
              error={showError('bloodG')}
            />

            <AppInputField
              label="Relation *"
              value={formData.relation}
              placeholder="Select Relation"
              rightIconName={isSelf ? undefined : 'chevron-down'}
              containerStyle={[fieldGap, styles.rowHalfRight]}
              inputContainerStyle={fieldBox}
              options={EDITABLE_RELATION_OPTIONS}
              disabled={isSelf}
              onSelect={(value: string) => {
                if (isSelf || isSelfRelation(value)) return;
                updateField('relation', value);
              }}
              error={showError('relation')}
            />
          </View>

          <View style={styles.row}>
            <AppInputField
              label="Height (cm)"
              placeholder="180"
              value={formData.height}
              keyboardType="decimal-pad"
              onChangeText={(text: string) =>
                updateField('height', text.replace(/[^0-9.]/g, ''))
              }
              containerStyle={[fieldGap, styles.rowHalfLeft]}
              inputContainerStyle={fieldBox}
              error={showError('height')}
            />

            <AppInputField
              label="Weight (kg)"
              placeholder="75"
              value={formData.weight}
              keyboardType="decimal-pad"
              onChangeText={(text: string) =>
                updateField('weight', text.replace(/[^0-9.]/g, ''))
              }
              containerStyle={[fieldGap, styles.rowHalfRight]}
              inputContainerStyle={fieldBox}
              error={showError('weight')}
            />
          </View>

          <Text style={styles.sectionTitle}>Contact Information</Text>

          <AppInputField
            label="Phone Number *"
            placeholder="10-digit mobile number"
            value={formData.phonenumber}
            keyboardType="number-pad"
            maxLength={10}
            onChangeText={(text: string) =>
              updateField('phonenumber', text.replace(/[^0-9]/g, ''))
            }
            rightIconName="phone"
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('phonenumber')}
          />

          <AppInputField
            label="Email Address"
            placeholder="john.doe@example.com"
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text: string) => updateField('email', text)}
            rightIconName="mail"
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('email')}
          />

          <View style={styles.emergencyView}>
            <View style={styles.emergencyHeader}>
              <TablerIcon name="logout" size={18} color="#F43F5E" />
              <Text style={styles.emergencyTitle}>Emergency Contact</Text>
            </View>

            <AppInputField
              label="Contact Name"
              placeholder="Jane Doe"
              value={formData.contactName}
              onChangeText={(text: string) => updateField('contactName', text)}
              containerStyle={fieldGap}
              inputContainerStyle={fieldBox}
              error={showError('contactName')}
            />

            <AppInputField
              label="Emergency Relation"
              value={formData.emergencyRelation}
              placeholder="Select Relation"
              rightIconName="chevron-down"
              options={RELATION_OPTIONS}
              onSelect={(value: string) =>
                updateField('emergencyRelation', value)
              }
              containerStyle={fieldGap}
              inputContainerStyle={fieldBox}
              error={showError('emergencyRelation')}
            />

            <AppInputField
              label="Emergency Phone"
              keyboardType="number-pad"
              placeholder="10-digit mobile number"
              rightIconName="phone"
              maxLength={10}
              value={formData.EmergencyNO}
              onChangeText={(text: string) =>
                updateField('EmergencyNO', text.replace(/[^0-9]/g, ''))
              }
              containerStyle={{ marginBottom: 4 }}
              inputContainerStyle={fieldBox}
              error={showError('EmergencyNO')}
            />
          </View>

          <Text style={styles.sectionTitle}>Insurance Details</Text>

          <AppInputField
            value={formData.insurance}
            onChangeText={(text: string) => updateField('insurance', text)}
            label="Insurance Provider"
            placeholder="Blue Cross Shield"
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('insurance')}
          />

          <AppInputField
            label="Policy Number"
            placeholder="POL-987654321"
            value={formData.policyNO}
            onChangeText={(text: string) => updateField('policyNO', text)}
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('policyNO')}
          />

          <AppInputField
            label="Valid Thru"
            placeholder="YYYY-MM-DD"
            value={formData.valid}
            onChangeText={(text: string) => updateField('valid', text)}
            rightIconName="calendar"
            containerStyle={fieldGap}
            inputContainerStyle={fieldBox}
            error={showError('valid')}
          />
        </ScrollView>

        <View style={[styles.stickyBar, { paddingBottom: footerPad }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => props.navigation.goBack()}
            style={styles.cancelBtn}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={canSubmit && !saving ? 0.85 : 1}
            onPress={onSavePatient}
            disabled={!canSubmit || saving}
            style={[
              styles.submitBtn,
              (!canSubmit || saving) && styles.submitBtnDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText} numberOfLines={1}>
                {mode === 'edit' ? 'Update Patient' : 'Add Patient'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPO.md,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#111827',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowHalfLeft: {
    flex: 1,
    marginRight: 6,
  },
  rowHalfRight: {
    flex: 1,
    marginLeft: 6,
  },
  emergencyView: {
    marginTop: 2,
    marginBottom: SPACING.sm,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: '#F43F5E0D',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    borderColor: '#F43F5E33',
  },
  emergencyHeader: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyTitle: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 15,
    color: '#F43F5E',
  },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    height: BUTTON.height,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.subTextColor,
  },
  submitBtn: {
    flex: 1.2,
    height: BUTTON.height,
    borderRadius: RADIUS.md,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  submitBtnDisabled: {
    backgroundColor: '#94B8AE',
  },
  submitText: {
    fontSize: TYPO.button,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
  },
});
