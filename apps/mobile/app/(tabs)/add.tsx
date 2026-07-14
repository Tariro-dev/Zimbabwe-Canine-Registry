import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useIdentifyBreed } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import type { Dog, Gender, SterilizationStatus } from '@/context/RegistryContext';

type Mode = 'dog' | 'litter';

function Field({ label, value, onChangeText, placeholder, multiline, type = 'text', helper }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: 'text' | 'microchip' | 'date' | 'weight';
  helper?: string;
}) {
  const colors = useColors();

  const handleTextChange = (text: string) => {
    if (type === 'microchip') {
      // ISO Microchip format: 15 digits or ZWE prefix + digits
      const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
      onChangeText(cleaned);
    } else if (type === 'date') {
      // Auto-formatting YYYY-MM-DD
      let cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

      let formatted = cleaned;
      if (cleaned.length > 4) {
        formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
      }
      if (cleaned.length > 6) {
        formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
      }
      onChangeText(formatted);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={fStyles.wrap}>
      <View style={fStyles.labelRow}>
        <Text style={[fStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{label}</Text>
        {type === 'microchip' && <MaterialCommunityIcons name="chip" size={14} color={colors.primary} />}
      </View>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground + '80'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={type === 'microchip' || type === 'weight' || type === 'date' ? 'numeric' : 'default'}
        style={[
          fStyles.input,
          multiline && fStyles.multiline,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
            color: colors.foreground,
            fontFamily: 'Inter_500Medium',
          },
        ]}
      />
      {helper && <Text style={[fStyles.helper, { color: colors.mutedForeground }]}>{helper}</Text>}
    </View>
  );
}

const fStyles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, letterSpacing: 1 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  helper: { fontSize: 10, marginTop: 2, opacity: 0.8 },
});

/** Confirmation card shown after a successful blockchain submission */
function BlockchainConfirmCard({ dog, onDismiss }: { dog: Dog; onDismiss: () => void }) {
  const colors = useColors();
  const cert = dog.breederCertification;

  return (
    <View style={[confStyles.overlay]}>
      <View style={[confStyles.card, { backgroundColor: colors.card, borderColor: colors.primary + '50', borderRadius: colors.radius }]}>
        {/* Header */}
        <View style={[confStyles.header, { borderBottomColor: colors.border }]}>
          <View style={[confStyles.iconWrap, { backgroundColor: colors.primary + '18' }]}>
            <MaterialCommunityIcons name="check-decagram" size={32} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[confStyles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Registered on ZCR
            </Text>
            <Text style={[confStyles.subtitle, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              Blockchain confirmed
            </Text>
          </View>
        </View>

        {/* Workflow steps */}
        <View style={confStyles.chain}>
          {[
            { icon: 'chip', label: 'Microchip Data', value: dog.microchipId, done: true },
            { icon: 'link-variant', label: 'Blockchain Ledger', value: dog.blockchainTxHash ? dog.blockchainTxHash.slice(0, 18) + '…' : '—', done: true },
            { icon: 'dog-side', label: 'Breed History', value: (dog.dameMicrochip || dog.sireMicrochip) ? 'Lineage recorded' : 'No parents linked', done: true },
            { icon: 'heart-pulse', label: 'Health Records', value: dog.vaccineHistory ? 'Vaccines on file' : 'Pending', done: !!dog.vaccineHistory },
            { icon: 'certificate', label: 'Breeder Certification', value: cert ? cert.certNumber : '—', done: !!cert },
          ].map((step, idx, arr) => (
            <View key={idx} style={confStyles.stepRow}>
              <View style={confStyles.stepLeft}>
                <View style={[confStyles.stepDot, { backgroundColor: step.done ? colors.primary : colors.border }]}>
                  <MaterialCommunityIcons name={step.icon as any} size={13} color={step.done ? colors.primaryForeground : colors.mutedForeground} />
                </View>
                {idx < arr.length - 1 && (
                  <View style={[confStyles.stepLine, { backgroundColor: step.done ? colors.primary + '50' : colors.border }]} />
                )}
              </View>
              <View style={confStyles.stepText}>
                <Text style={[confStyles.stepLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{step.label}</Text>
                <Text style={[confStyles.stepValue, { color: step.done ? colors.foreground : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
                  {step.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* TX Hash */}
        {dog.blockchainTxHash && (
          <View style={[confStyles.txBox, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
            <Text style={[confStyles.txLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>TX HASH</Text>
            <Text style={[confStyles.txHash, { color: colors.primary, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
              {dog.blockchainTxHash}
            </Text>
          </View>
        )}

        <GoldButton title="Done" onPress={onDismiss} size="lg" style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const confStyles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: 18 },
  card: { width: '100%', borderWidth: 1.5, padding: 20, gap: 18, shadowColor: '#C9A84C', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottomWidth: 1 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18 },
  subtitle: { fontSize: 13, marginTop: 2 },
  chain: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 12, minHeight: 44 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepLine: { flex: 1, width: 2, marginVertical: 2 },
  stepText: { flex: 1, justifyContent: 'center', paddingBottom: 8 },
  stepLabel: { fontSize: 11, letterSpacing: 0.4 },
  stepValue: { fontSize: 13, marginTop: 1 },
  txBox: { padding: 12, borderWidth: 1, gap: 4 },
  txLabel: { fontSize: 10, letterSpacing: 1 },
  txHash: { fontSize: 11, letterSpacing: 0.5 },
});

export default function AddScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addDog, addLitter, user } = useRegistry();
  const [mode, setMode] = useState<Mode>('dog');
  const [saving, setSaving] = useState(false);
  const [confirmedDog, setConfirmedDog] = useState<Dog | null>(null);

  // AI Breed state
  const identifyBreedMutation = useIdentifyBreed();
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ breed: string; confidence: number }[] | null>(null);

  if (user?.role !== 'breeder' && user?.role !== 'regulator') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <MaterialCommunityIcons name="shield-lock" size={64} color={colors.primary} />
        <Text style={{ color: colors.foreground, fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 20 }}>Breeder Access Only</Text>
        <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 10 }}>
          Only registered Breeders can add new dogs to the registry.
        </Text>
        <GoldButton title="Go to Dashboard" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 24 }} />
      </View>
    );
  }
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

  const handleIdentifyBreed = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsIdentifying(true);
        setAiSuggestions(null);

        const response = await identifyBreedMutation.mutateAsync({
          data: { image: result.assets[0].base64 }
        });

        setAiSuggestions(response.predictions);
      }
    } catch (error) {
      Alert.alert('AI Error', 'Failed to identify breed. Please try again.');
    } finally {
      setIsIdentifying(false);
    }
  };

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
      const newDog = await addDog({
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
      setConfirmedDog(newDog);
    } catch (err: any) {
      const msg = err.data?.error || 'Failed to register dog. Please try again.';
      Alert.alert('Registration Error', msg);
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
      await addLitter({ dameMicrochip: lDame.trim(), sireMicrochip: lSire.trim(), expectedBirthDate: lExpectedDate.trim() });
      setLDame(''); setLSire(''); setLExpectedDate('');
      Alert.alert('Registered', 'Litter pre-registered successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
            {/* Workflow banner */}
            <LinearGradient
              colors={[colors.primary + '15', colors.primary + '05']}
              style={[styles.workflowBanner, { borderColor: colors.primary + '30', borderRadius: colors.radius }]}
            >
              <Text style={[styles.workflowTitle, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>BLOCKCHAIN WORKFLOW</Text>
              <View style={styles.workflowSteps}>
                {['Microchip', 'Ledger', 'Lineage', 'Health', 'Certify'].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <Text style={[styles.workflowStep, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{step}</Text>
                    {i < arr.length - 1 && (
                      <MaterialCommunityIcons name="chevron-right" size={14} color={colors.primary} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </LinearGradient>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>① IDENTITY</Text>
              <Field label="DOG NAME *" value={name} onChangeText={setName} placeholder="e.g. Rex" />

              <View style={{ marginBottom: 16 }}>
                <Field label="BREED *" value={breed} onChangeText={setBreed} placeholder="e.g. Boerboel" />
                <TouchableOpacity
                  onPress={handleIdentifyBreed}
                  disabled={isIdentifying}
                  style={[styles.aiBtn, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '08' }]}
                >
                  <MaterialCommunityIcons name="auto-fix" size={16} color={colors.primary} />
                  <Text style={[styles.aiBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    {isIdentifying ? 'AI ANALYZING...' : 'AI BREED IDENTIFIER'}
                  </Text>
                </TouchableOpacity>
              </View>

              {aiSuggestions && (
                <View style={[styles.aiSuggestions, { backgroundColor: colors.surfaceRaised, borderColor: colors.primary + '30' }]}>
                  <Text style={[styles.aiSuggestionsTitle, { color: colors.mutedForeground }]}>AI SUGGESTIONS:</Text>
                  <View style={styles.aiSuggestionsRow}>
                    {aiSuggestions.map((s, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => { setBreed(s.breed); setAiSuggestions(null); }}
                        style={[styles.aiTag, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                      >
                        <Text style={[styles.aiTagText, { color: colors.primary }]}>{s.breed} {Math.round(s.confidence * 100)}%</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Gender toggle */}
              <View style={fStyles.wrap}>
                <Text style={[fStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>GENDER *</Text>
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
                        fontFamily: 'Inter_600SemiBold',
                      }]}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Field label="COLOR / COAT *" value={color} onChangeText={setColor} placeholder="e.g. Black & Tan" />
              <Field label="DATE OF BIRTH *" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" type="date" helper="Auto-formats: YYYY-MM-DD" />
              <Field label="WEIGHT" value={weight} onChangeText={setWeight} placeholder="e.g. 32" type="weight" helper="In kilograms (kg)" />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>② MICROCHIP DATA</Text>
              <View style={[styles.infoBox, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
                <MaterialCommunityIcons name="chip" size={18} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  The ISO microchip ID is the primary key linked to the blockchain record.
                </Text>
              </View>
              <Field label="ISO MICROCHIP ID *" value={microchipId} onChangeText={setMicrochipId} placeholder="15-digit ID" type="microchip" helper="Maximum 15 characters" />
              <Field label="DNA HASH (optional)" value={dnaHash} onChangeText={setDnaHash} placeholder="SHA256:..." />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>③ BREED HISTORY</Text>
              <Field label="DAME MICROCHIP (Mother)" value={dameMicrochip} onChangeText={setDameMicrochip} placeholder="Mother's chip ID" type="microchip" />
              <Field label="SIRE MICROCHIP (Father)" value={sireMicrochip} onChangeText={setSireMicrochip} placeholder="Father's chip ID" type="microchip" />
              <Field label="LITTER ID" value={litterId} onChangeText={setLitterId} placeholder="e.g. LIT-2024-001" />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>④ Health Records</Text>
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

            {/* Blockchain submit section */}
            <View style={[styles.section, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30', borderRadius: colors.radius }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>⑤ Blockchain Submission</Text>
              <Text style={[styles.blockchainNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Submitting will write an immutable record to the ZCR blockchain ledger and generate a Breeder Certification automatically.
              </Text>
              <View style={styles.blockchainFlow}>
                {[
                  { icon: 'chip', label: 'Microchip' },
                  { icon: 'link-variant', label: 'Blockchain' },
                  { icon: 'dog-side', label: 'Breed Hist.' },
                  { icon: 'heart-pulse', label: 'Health' },
                  { icon: 'certificate', label: 'Cert.' },
                ].map((step, i, arr) => (
                  <React.Fragment key={step.label}>
                    <View style={styles.blockchainStepWrap}>
                      <View style={[styles.blockchainStepIcon, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
                        <MaterialCommunityIcons name={step.icon as any} size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.blockchainStepLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{step.label}</Text>
                    </View>
                    {i < arr.length - 1 && (
                      <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary + '60'} style={{ marginBottom: 16 }} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            <GoldButton title="Submit to Blockchain & Register" onPress={handleRegisterDog} loading={saving} size="lg" />
          </>
        ) : (
          <>
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>LITTER DETAILS</Text>
              <View style={[styles.infoBox, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  Both parent dogs must already be registered on the ZCR before litter registration.
                </Text>
              </View>
              <Field label="DAME MICROCHIP *" value={lDame} onChangeText={setLDame} placeholder="Mother's ZCR chip ID" type="microchip" />
              <Field label="SIRE MICROCHIP *" value={lSire} onChangeText={setLSire} placeholder="Father's ZCR chip ID" type="microchip" />
              <Field label="EXPECTED BIRTH DATE *" value={lExpectedDate} onChangeText={setLExpectedDate} placeholder="YYYY-MM-DD" type="date" />
            </View>
            <GoldButton title="Pre-Register Litter" onPress={handleRegisterLitter} loading={saving} size="lg" />
          </>
        )}
      </ScrollView>

      {/* Blockchain confirmation overlay */}
      {confirmedDog && (
        <BlockchainConfirmCard dog={confirmedDog} onDismiss={() => setConfirmedDog(null)} />
      )}
    </View>
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
  workflowBanner: { borderWidth: 1, padding: 12, marginBottom: 16, gap: 8 },
  workflowTitle: { fontSize: 11, letterSpacing: 1 },
  workflowSteps: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  workflowStep: { fontSize: 11 },
  section: { padding: 16, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 14 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, gap: 6 },
  genderText: { fontSize: 14 },
  infoBox: { flexDirection: 'row', padding: 12, borderWidth: 1, gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  blockchainNote: { fontSize: 12, lineHeight: 18, marginBottom: 14 },
  blockchainFlow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 },
  blockchainStepWrap: { alignItems: 'center', gap: 4 },
  blockchainStepIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  blockchainStepLabel: { fontSize: 9, letterSpacing: 0.3 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, gap: 8, marginTop: -8 },
  aiBtnText: { fontSize: 11, letterSpacing: 0.5 },
  aiSuggestions: { padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 16, gap: 8 },
  aiSuggestionsTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  aiSuggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  aiTag: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 20 },
  aiTagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
});
