import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRegistry, SterilizationStatus } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';

export default function UpdateHealthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const { dogs, user, updateHealthRecord } = useRegistry();

  const dog = dogs.find(d => d.id === dogId);

  // Permission check
  const isVet = user?.role === 'vet' || user?.role === 'regulator';

  const [vaccines, setVaccines] = useState(dog?.vaccineHistory ?? '');
  const [status, setStatus] = useState<SterilizationStatus>(dog?.sterilizationStatus ?? 'Not Sterilized');
  const [lastCheckup, setLastCheckup] = useState(dog?.lastCheckup ?? new Date().toISOString().split('T')[0]);

  if (!dog) return null;

  if (!isVet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <MaterialCommunityIcons name="shield-lock" size={64} color={colors.destructive} />
        <Text style={[styles.errorTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Access Denied</Text>
        <Text style={[styles.errorSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Only registered Veterinarians or Regulators can update health records.
        </Text>
        <GoldButton title="Go Back" onPress={() => router.back()} style={{ marginTop: 24 }} />
      </View>
    );
  }

  const handleUpdate = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateHealthRecord(dog.id, vaccines, status, lastCheckup);
    Alert.alert('Success', 'Health record updated and synced to blockchain.');
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Update Health</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.dogCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.dogName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{dog.name}</Text>
        <Text style={[styles.dogMeta, { color: colors.mutedForeground }]}>{dog.microchipId}</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>VACCINATION HISTORY</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
          multiline
          numberOfLines={4}
          value={vaccines}
          onChangeText={setVaccines}
          placeholder="Enter vaccines and dates..."
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>STERILIZATION STATUS</Text>
        <View style={styles.statusRow}>
          {(['Not Sterilized', 'Sterilized'] as SterilizationStatus[]).map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[
                styles.statusBtn,
                {
                  backgroundColor: status === s ? colors.primary : colors.card,
                  borderColor: status === s ? colors.primary : colors.border,
                  borderRadius: colors.radius
                }
              ]}
            >
              <Text style={{ color: status === s ? colors.primaryForeground : colors.foreground }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>CHECKUP DATE</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
          value={lastCheckup}
          onChangeText={setLastCheckup}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
        />

        <View style={{ marginTop: 40 }}>
          <GoldButton title="Save Health Record" onPress={handleUpdate} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 20 },
  dogCard: { padding: 16, borderWidth: 1, marginBottom: 24 },
  dogName: { fontSize: 18 },
  dogMeta: { fontSize: 12, marginTop: 4 },
  form: { flex: 1 },
  label: { fontSize: 11, letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, padding: 14, fontSize: 16 },
  textArea: { borderWidth: 1, padding: 14, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusBtn: { flex: 1, padding: 14, borderWidth: 1, alignItems: 'center' },
  errorTitle: { fontSize: 24, marginTop: 20 },
  errorSub: { fontSize: 16, textAlign: 'center', marginTop: 10 },
});
