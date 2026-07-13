import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const { findDogByMicrochip, dogs } = useRegistry();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Dog | null | undefined>(undefined);
  const [searched, setSearched] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const handleVerify = async (chipId: string) => {
    if (!chipId.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dog = findDogByMicrochip(chipId.trim());
    setResult(dog ?? null);
    setSearched(true);
    setInput(chipId);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);
    // Expected format zcr://dog/CHIP_ID
    if (data.startsWith('zcr://dog/')) {
      const chipId = data.split('/').pop();
      if (chipId) handleVerify(chipId);
    } else {
      // Try direct chip ID if it doesn't match our protocol
      handleVerify(data);
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera access is needed to scan QR codes.');
        return;
      }
    }
    setShowScanner(true);
  };

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View style={[styles.scannerOverlay, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeScanner}>
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Position the dog's QR code inside the frame</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPt + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Verify Dog</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Scan a QR code or enter a microchip ID to verify a dog's registration on the ZCR ledger.
      </Text>

      {/* Actions */}
      <View style={styles.verifyActions}>
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={openScanner}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={28} color={colors.primaryForeground} />
          <Text style={[styles.scanBtnText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>Scan QR Passport</Text>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.mutedForeground }]}>OR ENTER ID</Text>
          <View style={[styles.orLine, { backgroundColor: colors.border }]} />
        </View>
      </View>

      {/* Input */}
      <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={[styles.inputWrap, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
          <TextInput
            value={input}
            onChangeText={t => { setInput(t); setSearched(false); }}
            placeholder="ISO Microchip ID"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={() => handleVerify(input)}
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={() => { setInput(''); setSearched(false); setResult(undefined); }}>
              <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <GoldButton title="Verify Manually" onPress={() => handleVerify(input)} />
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
        </View>
      )}

      {searched && result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.primary + '40', borderRadius: colors.radius }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '18', borderColor: colors.success + '40', borderRadius: colors.radius - 4 }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.verifiedText, { color: colors.success, fontFamily: 'Inter_700Bold' }]}>VERIFIED ON ZCR</Text>
            </View>
          </View>

          <Text style={[styles.dogName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{result.name}</Text>
          <Text style={[styles.dogBreed, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{result.breed}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <InfoRow label="Microchip ID" value={result.microchipId} />
          <InfoRow label="Registered Owner" value={result.ownerName} />
          <InfoRow label="Registered Breeder" value={result.breederName} />
          <InfoRow label="Sterilization" value={result.sterilizationStatus} />
          <InfoRow label="Last Checkup" value={result.lastCheckup || 'None'} />

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
  verifyActions: { gap: 16 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
  scanBtnText: { fontSize: 16 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 10, letterSpacing: 1 },
  inputCard: { padding: 16, borderWidth: 1, gap: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  textInput: { flex: 1, fontSize: 16, letterSpacing: 1 },
  notFound: { padding: 28, borderWidth: 1, alignItems: 'center', gap: 8 },
  notFoundTitle: { fontSize: 20 },
  notFoundSub: { fontSize: 13, textAlign: 'center' },
  chipDisplay: { fontSize: 16, letterSpacing: 1 },
  resultCard: { padding: 20, borderWidth: 1.5 },
  resultHeader: { marginBottom: 14 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 11, letterSpacing: 0.8 },
  dogName: { fontSize: 24 },
  dogBreed: { fontSize: 15, marginBottom: 6 },
  divider: { height: 1, marginVertical: 8 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1.5, gap: 8, marginTop: 12 },
  viewBtnText: { fontSize: 14 },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 40 },
  closeScanner: { alignSelf: 'flex-end', marginRight: 20 },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#C9A84C', backgroundColor: 'transparent' },
  scanText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
});
