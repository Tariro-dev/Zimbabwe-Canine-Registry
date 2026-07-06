import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import type { SterilizationStatus } from '@/context/RegistryContext';

export default function HealthUpdateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const { dogs, user, updateHealthRecord } = useRegistry();
  const dog = dogs.find(d => d.id === dogId);
  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const [vaccines, setVaccines] = useState(dog?.vaccineHistory ?? '');
  const [sterilization, setSterilization] = useState<SterilizationStatus>(dog?.sterilizationStatus ?? 'Not Sterilized');
  const [lastCheckup, setLastCheckup] = useState(dog?.lastCheckup ?? '');
  const [saving, setSaving] = useState(false);

  const canUpdate = user.role === 'vet' || user.role === 'regulator';

  if (!dog) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Dog not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!canUpdate) {
      Alert.alert('Access Denied', 'Only veterinarians and regulators can update health records.');
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateHealthRecord(dog.id, vaccines, sterilization, lastCheckup || undefined);
      Alert.alert('Health Record Updated', `${dog.name}'s health record has been updated on the ZCR ledger.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Update Health Record</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {dog.name} · {dog.breed} · {dog.microchipId}
      </Text>

      {!canUpdate && (
        <View style={[styles.warning, { backgroundColor: '#EF444415', borderColor: '#EF444430', borderRadius: colors.radius }]}>
          <Ionicons name="warning" size={18} color={colors.destructive} />
          <Text style={[styles.warningText, { color: colors.destructive, fontFamily: 'Inter_500Medium' }]}>
            Your role ({user.role}) does not have permission to update health records. Switch to Veterinarian or Regulator role.
          </Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>VACCINE HISTORY</Text>
        <TextInput
          value={vaccines}
          onChangeText={setVaccines}
          placeholder="e.g. Rabies (2024-01-15), DHPP (2024-01-15)"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={4}
          editable={canUpdate}
          style={[styles.textarea, {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
            borderRadius: colors.radius - 4,
            color: colors.foreground,
            fontFamily: 'Inter_400Regular',
            opacity: canUpdate ? 1 : 0.5,
          }]}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>STERILIZATION STATUS</Text>
        <View style={styles.row}>
          {(['Not Sterilized', 'Sterilized'] as SterilizationStatus[]).map(s => (
            <TouchableOpacity
              key={s}
              disabled={!canUpdate}
              onPress={() => setSterilization(s)}
              style={[styles.statusBtn, {
                flex: 1,
                backgroundColor: sterilization === s
                  ? (s === 'Sterilized' ? colors.success : colors.surfaceRaised)
                  : colors.surfaceRaised,
                borderColor: sterilization === s
                  ? (s === 'Sterilized' ? colors.success : colors.primary)
                  : colors.border,
                borderRadius: colors.radius - 4,
                opacity: canUpdate ? 1 : 0.5,
              }]}
            >
              <Text style={[styles.statusText, {
                color: sterilization === s
                  ? (s === 'Sterilized' ? '#fff' : colors.primary)
                  : colors.mutedForeground,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 13,
              }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>LAST CHECKUP DATE</Text>
        <TextInput
          value={lastCheckup}
          onChangeText={setLastCheckup}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
          editable={canUpdate}
          style={[styles.input, {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
            borderRadius: colors.radius - 4,
            color: colors.foreground,
            fontFamily: 'Inter_400Regular',
            opacity: canUpdate ? 1 : 0.5,
          }]}
        />
      </View>

      <GoldButton
        title="Save Health Record"
        onPress={handleSave}
        loading={saving}
        disabled={!canUpdate}
        size="lg"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, gap: 14 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  backText: { fontSize: 15 },
  title: { fontSize: 24 },
  sub: { fontSize: 13, marginBottom: 4 },
  warning: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderWidth: 1, gap: 10 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 20 },
  section: { padding: 16, borderWidth: 1, gap: 10 },
  sectionLabel: { fontSize: 11, letterSpacing: 0.8 },
  textarea: { borderWidth: 1, padding: 12, fontSize: 13, minHeight: 100, textAlignVertical: 'top' },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  statusBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1 },
  statusText: {},
});
