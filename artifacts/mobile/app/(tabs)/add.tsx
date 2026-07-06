import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import type { Gender, SterilizationStatus } from '@/context/RegistryContext';

type Mode = 'dog' | 'litter';

function Field({ label, value, onChangeText, placeholder, multiline }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={fStyles.wrap}>
      <Text style={[fStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={[
          fStyles.input,
          multiline && fStyles.multiline,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
            color: colors.foreground,
            fontFamily: 'Inter_400Regular',
          },
        ]}
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  label: { fontSize: 12, letterSpacing: 0.5 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});

export default function AddScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addDog, addLitter } = useRegistry();
  const [mode, setMode] = useState<Mode>('dog');
  const [saving, setSaving] = useState(false);
  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  // Dog form state
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [color, setColor] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [weight, setWeight] = useState('');
  const [dameMicrochip, setDameMicrochip] = useState('');
  const [sireMicrochip, setSireMicrochip] = useState('');
  const [litterId, setLitterId] = useState('');
  const [vaccineHistory, setVaccineHistory] = useState('');
  const [sterilization, setSterilization] = useState<SterilizationStatus>('Not Sterilized');
  const [dnaHash, setDnaHash] = useState('');

  // Litter form state
  const [lDame, setLDame] = useState('');
  const [lSire, setLSire] = useState('');
  const [lExpectedDate, setLExpectedDate] = useState('');

  const resetDogForm = () => {
    setName(''); setBreed(''); setGender('male'); setColor(''); setBirthDate('');
    setMicrochipId(''); setWeight(''); setDameMicrochip(''); setSireMicrochip('');
    setLitterId(''); setVaccineHistory(''); setSterilization('Not Sterilized'); setDnaHash('');
  };

  const handleRegisterDog = async () => {
    if (!name.trim() || !breed.trim() || !microchipId.trim() || !birthDate.trim()) {
      Alert.alert('Missing Fields', 'Name, breed, microchip ID, and birth date are required.');
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addDog({
        name: name.trim(),
        breed: breed.trim(),
        gender,
        color: color.trim() || 'Unknown',
        birthDate: birthDate.trim(),
        microchipId: microchipId.trim(),
        weight: weight.trim() || undefined,
        dameMicrochip: dameMicrochip.trim() || undefined,
        sireMicrochip: sireMicrochip.trim() || undefined,
        litterId: litterId.trim() || undefined,
        vaccineHistory: vaccineHistory.trim(),
        sterilizationStatus: sterilization,
        dnaHash: dnaHash.trim() || undefined,
        isStolen: false,
      });
      resetDogForm();
      Alert.alert('Registered', 'Dog successfully registered on the ZCR.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterLitter = async () => {
    if (!lDame.trim() || !lSire.trim() || !lExpectedDate.trim()) {
      Alert.alert('Missing Fields', 'Both parent microchips and expected birth date are required.');
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addLitter({ dameMicrochip: lDame.trim(), sireMicrochip: lSire.trim(), expectedBirthDate: lExpectedDate.trim() });
      setLDame(''); setLSire(''); setLExpectedDate('');
      Alert.alert('Registered', 'Litter pre-registered successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPt + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>New Registration</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Immutable blockchain record on ZCR
      </Text>

      {/* Mode toggle */}
      <View style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        {(['dog', 'litter'] as Mode[]).map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[
              styles.toggleOption,
              {
                backgroundColor: mode === m ? colors.primary : 'transparent',
                borderRadius: colors.radius - 2,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={m === 'dog' ? 'paw' : 'dog-side'}
              size={16}
              color={mode === m ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text style={[styles.toggleText, {
              color: mode === m ? colors.primaryForeground : colors.mutedForeground,
              fontFamily: mode === m ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }]}>
              {m === 'dog' ? 'Register Dog' : 'Register Litter'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'dog' ? (
        <>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Identity</Text>
            <Field label="DOG NAME *" value={name} onChangeText={setName} placeholder="e.g. Rex" />
            <Field label="BREED *" value={breed} onChangeText={setBreed} placeholder="e.g. German Shepherd" />

            {/* Gender toggle */}
            <View style={fStyles.wrap}>
              <Text style={[fStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>GENDER *</Text>
              <View style={styles.genderRow}>
                {(['male', 'female'] as Gender[]).map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={[styles.genderBtn, {
                      backgroundColor: gender === g ? colors.primary : colors.surfaceRaised,
                      borderColor: gender === g ? colors.primary : colors.border,
                      borderRadius: colors.radius - 2,
                    }]}
                  >
                    <Ionicons
                      name={g === 'male' ? 'male' : 'female'}
                      size={16}
                      color={gender === g ? colors.primaryForeground : colors.mutedForeground}
                    />
                    <Text style={[styles.genderText, {
                      color: gender === g ? colors.primaryForeground : colors.mutedForeground,
                      fontFamily: 'Inter_500Medium',
                    }]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Field label="COLOR / COAT *" value={color} onChangeText={setColor} placeholder="e.g. Black & Tan" />
            <Field label="DATE OF BIRTH *" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
            <Field label="WEIGHT" value={weight} onChangeText={setWeight} placeholder="e.g. 32 kg" />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Microchip</Text>
            <Field label="ISO MICROCHIP ID *" value={microchipId} onChangeText={setMicrochipId} placeholder="ZWE000001234567" />
            <Field label="DNA HASH (optional)" value={dnaHash} onChangeText={setDnaHash} placeholder="SHA256:..." />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Lineage</Text>
            <Field label="DAME MICROCHIP" value={dameMicrochip} onChangeText={setDameMicrochip} placeholder="Mother's chip ID" />
            <Field label="SIRE MICROCHIP" value={sireMicrochip} onChangeText={setSireMicrochip} placeholder="Father's chip ID" />
            <Field label="LITTER ID" value={litterId} onChangeText={setLitterId} placeholder="e.g. LIT-2024-001" />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Health</Text>
            <Field label="VACCINE HISTORY" value={vaccineHistory} onChangeText={setVaccineHistory} placeholder="e.g. Rabies (2024-01-01), DHPP..." multiline />
            <View style={fStyles.wrap}>
              <Text style={[fStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>STERILIZATION STATUS</Text>
              <View style={styles.genderRow}>
                {(['Not Sterilized', 'Sterilized'] as SterilizationStatus[]).map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSterilization(s)}
                    style={[styles.genderBtn, {
                      backgroundColor: sterilization === s ? (s === 'Sterilized' ? colors.success : colors.surfaceRaised) : colors.surfaceRaised,
                      borderColor: sterilization === s ? (s === 'Sterilized' ? colors.success : colors.primary) : colors.border,
                      borderRadius: colors.radius - 2,
                    }]}
                  >
                    <Text style={[styles.genderText, {
                      color: sterilization === s ? (s === 'Sterilized' ? colors.primaryForeground : colors.primary) : colors.mutedForeground,
                      fontFamily: 'Inter_500Medium',
                      fontSize: 12,
                    }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <GoldButton title="Register Dog on ZCR" onPress={handleRegisterDog} loading={saving} size="lg" />
        </>
      ) : (
        <>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Litter Details</Text>
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Both parent dogs must already be registered on the ZCR before litter registration.
              </Text>
            </View>
            <Field label="DAME MICROCHIP *" value={lDame} onChangeText={setLDame} placeholder="Mother's ZCR chip ID" />
            <Field label="SIRE MICROCHIP *" value={lSire} onChangeText={setLSire} placeholder="Father's ZCR chip ID" />
            <Field label="EXPECTED BIRTH DATE *" value={lExpectedDate} onChangeText={setLExpectedDate} placeholder="YYYY-MM-DD" />
          </View>
          <GoldButton title="Pre-Register Litter" onPress={handleRegisterLitter} loading={saving} size="lg" />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 0 },
  title: { fontSize: 26, marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 20 },
  toggle: { flexDirection: 'row', padding: 4, borderWidth: 1, marginBottom: 20, gap: 4 },
  toggleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
  toggleText: { fontSize: 13 },
  section: { padding: 16, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 14 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, gap: 6 },
  genderText: { fontSize: 14 },
  infoBox: { flexDirection: 'row', padding: 12, borderWidth: 1, gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
