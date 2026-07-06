import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import { RoleBadge } from '@/components/RoleBadge';
import type { Dog } from '@/context/RegistryContext';

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={irStyles.row}>
      <Text style={[irStyles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
      <Text style={[irStyles.value, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const irStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  label: { fontSize: 12, letterSpacing: 0.4, flex: 1 },
  value: { fontSize: 13, flex: 2, textAlign: 'right' },
});

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { findDogByMicrochip } = useRegistry();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Dog | null | undefined>(undefined);
  const [searched, setSearched] = useState(false);
  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const handleVerify = async () => {
    if (!input.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dog = findDogByMicrochip(input.trim());
    setResult(dog ?? null);
    setSearched(true);
  };

  const handleClear = () => {
    setInput('');
    setResult(undefined);
    setSearched(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPt + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Verify Dog</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Enter an ISO microchip ID to look up any registered dog on the ZCR ledger.
      </Text>

      {/* Input */}
      <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
          <MaterialCommunityIcons name="barcode-scan" size={28} color={colors.primary} />
        </View>

        <Text style={[styles.inputLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>ISO MICROCHIP ID</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
          <TextInput
            value={input}
            onChangeText={t => { setInput(t); setSearched(false); }}
            placeholder="e.g. ZWE000001234567"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleVerify}
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <GoldButton title="Verify on ZCR Ledger" onPress={handleVerify} size="lg" />
      </View>

      {/* Results */}
      {searched && result === null && (
        <View style={[styles.notFound, { backgroundColor: colors.card, borderColor: '#EF444430', borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="close-circle-outline" size={48} color={colors.destructive} />
          <Text style={[styles.notFoundTitle, { color: colors.destructive, fontFamily: 'Inter_700Bold' }]}>Not Found</Text>
          <Text style={[styles.notFoundSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            No dog registered with microchip ID
          </Text>
          <Text style={[styles.chipDisplay, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{input}</Text>
          <Text style={[styles.notFoundSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 }]}>
            This dog may not be registered or the chip ID is incorrect.
          </Text>
        </View>
      )}

      {searched && result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.primary + '40', borderRadius: colors.radius }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '18', borderColor: colors.success + '40', borderRadius: colors.radius - 4 }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.verifiedText, { color: colors.success, fontFamily: 'Inter_700Bold' }]}>VERIFIED ON ZCR</Text>
            </View>
            {result.isStolen && (
              <View style={[styles.stolenBadge, { backgroundColor: '#EF444420', borderColor: '#EF444440', borderRadius: colors.radius - 4 }]}>
                <Ionicons name="warning" size={16} color={colors.destructive} />
                <Text style={[styles.stolenText, { color: colors.destructive, fontFamily: 'Inter_700Bold' }]}>STOLEN</Text>
              </View>
            )}
          </View>

          <Text style={[styles.dogName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{result.name}</Text>
          <Text style={[styles.dogBreed, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{result.breed}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <InfoRow label="Microchip ID" value={result.microchipId} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          <InfoRow label="Gender" value={result.gender === 'male' ? 'Male' : 'Female'} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          <InfoRow label="Color" value={result.color} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          <InfoRow label="Date of Birth" value={result.birthDate} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          {result.weight && <><InfoRow label="Weight" value={result.weight} /><View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} /></>}
          <InfoRow label="Registered Owner" value={result.ownerName} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          <InfoRow label="Registered Breeder" value={result.breederName} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          <InfoRow label="Registration Date" value={result.registrationDate} />
          <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
          <InfoRow label="Sterilization" value={result.sterilizationStatus} />
          {result.vaccineHistory && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
              <InfoRow label="Vaccines" value={result.vaccineHistory} />
            </>
          )}
          {result.lastCheckup && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
              <InfoRow label="Last Checkup" value={result.lastCheckup} />
            </>
          )}
          {result.dnaHash && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.4 }]} />
              <InfoRow label="DNA Hash" value={result.dnaHash} />
            </>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            onPress={() => router.push(`/dog/${result.id}`)}
            style={[styles.viewBtn, { borderColor: colors.primary, borderRadius: colors.radius - 2 }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>View Full Profile</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 16 },
  title: { fontSize: 26 },
  sub: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  inputCard: { padding: 20, borderWidth: 1, gap: 14, alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  inputLabel: { fontSize: 11, letterSpacing: 0.8, alignSelf: 'flex-start' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10, width: '100%' },
  textInput: { flex: 1, fontSize: 16, letterSpacing: 1, padding: 0 },
  notFound: { padding: 28, borderWidth: 1, alignItems: 'center', gap: 8 },
  notFoundTitle: { fontSize: 20 },
  notFoundSub: { fontSize: 13, textAlign: 'center' },
  chipDisplay: { fontSize: 16, letterSpacing: 1 },
  resultCard: { padding: 20, borderWidth: 1.5, gap: 0 },
  resultHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  verifiedText: { fontSize: 11, letterSpacing: 0.8 },
  stolenBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  stolenText: { fontSize: 11, letterSpacing: 0.8 },
  dogName: { fontSize: 26 },
  dogBreed: { fontSize: 15, marginBottom: 6 },
  divider: { height: 1, marginVertical: 4 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1.5, gap: 8, marginTop: 8 },
  viewBtnText: { fontSize: 14 },
});
