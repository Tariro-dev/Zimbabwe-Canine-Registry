import React, { useState, useRef } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

function InfoRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  const colors = useColors();
  return (
    <View style={ir.row}>
      <Text style={[ir.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
      <Text
        style={[ir.value, { color: highlight ? colors.primary : colors.foreground, fontFamily: mono ? 'Inter_400Regular' : (highlight ? 'Inter_600SemiBold' : 'Inter_400Regular') }]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, gap: 12 },
  label: { fontSize: 12, letterSpacing: 0.4, flex: 1.2 },
  value: { fontSize: 13, flex: 2, textAlign: 'right' },
});

type Tab = 'info' | 'health' | 'lineage' | 'chain';

/** Blockchain workflow diagram tab */
function ChainTab({ dog }: { dog: ReturnType<typeof useRegistry>['dogs'][number] }) {
  const colors = useColors();
  const cert = dog.breederCertification;

  const steps: {
    icon: string;
    label: string;
    sublabel: string;
    lines: { key: string; value: string; mono?: boolean }[];
    status: 'confirmed' | 'partial' | 'pending' | 'failed';
  }[] = [
    {
      icon: 'chip',
      label: 'Microchip Data',
      sublabel: 'ISO 11784/11785 Standard',
      lines: [
        { key: 'Chip ID', value: dog.microchipId },
        { key: 'DNA Hash', value: dog.dnaHash ?? 'Not provided', mono: true },
      ],
      status: 'confirmed',
    },
    {
      icon: 'link-variant',
      label: 'Blockchain Ledger',
      sublabel: 'ZCR Distributed Ledger',
      lines: [
        { key: 'Sync Status', value: dog.blockchainSyncStatus.toUpperCase() },
        { key: 'Confirmed', value: dog.blockchainConfirmedAt ?? dog.registrationDate },
        { key: 'TX Hash', value: dog.blockchainTxHash ? dog.blockchainTxHash.slice(0, 22) + '…' : 'Not available', mono: true },
      ],
      status: dog.blockchainSyncStatus === 'confirmed' ? 'confirmed' : dog.blockchainSyncStatus === 'failed' ? 'failed' : 'pending',
    },
    {
      icon: 'dog-side',
      label: 'Breed History',
      sublabel: 'Lineage & Litter Records',
      lines: [
        { key: 'Dame Chip', value: dog.dameMicrochip ?? 'Not recorded' },
        { key: 'Sire Chip', value: dog.sireMicrochip ?? 'Not recorded' },
        { key: 'Litter ID', value: dog.litterId ?? 'Not linked' },
      ],
      status: (dog.dameMicrochip || dog.sireMicrochip) ? 'confirmed' : 'partial',
    },
    {
      icon: 'heart-pulse',
      label: 'Health Records',
      sublabel: 'Vet-Gated Entries',
      lines: [
        { key: 'Vaccines', value: dog.vaccineHistory || 'None on file' },
        { key: 'Sterilization', value: dog.sterilizationStatus },
        { key: 'Last Checkup', value: dog.lastCheckup ?? 'Not recorded' },
      ],
      status: dog.vaccineHistory ? 'confirmed' : 'partial',
    },
    {
      icon: 'certificate',
      label: 'Breeder Certification',
      sublabel: 'ZCR Issued Certificate',
      lines: cert
        ? [
            { key: 'Cert Number', value: cert.certNumber },
            { key: 'Issued', value: cert.issuedDate },
            { key: 'Status', value: cert.status.toUpperCase() },
          ]
        : [{ key: 'Status', value: 'Not issued' }],
      status: cert ? (cert.status === 'active' ? 'confirmed' : 'partial') : 'pending',
    },
  ];

  const statusColor = (s: 'confirmed' | 'partial' | 'pending' | 'failed') => {
    if (s === 'confirmed') return colors.primary;
    if (s === 'partial') return colors.warning ?? '#F59E0B';
    if (s === 'failed') return colors.destructive ?? '#EF4444';
    return colors.mutedForeground;
  };

  const statusIcon = (s: 'confirmed' | 'partial' | 'pending' | 'failed') => {
    if (s === 'confirmed') return 'check-circle';
    if (s === 'partial') return 'alert-circle';
    if (s === 'failed') return 'close-circle';
    return 'clock-outline';
  };

  return (
    <View style={chainStyles.wrap}>
      {steps.map((step, idx) => (
        <View key={idx} style={chainStyles.stepOuter}>
          {/* Connector line */}
          {idx < steps.length - 1 && (
            <View style={[chainStyles.connector, { borderColor: colors.border }]} />
          )}
          {/* Node */}
          <View style={[chainStyles.node, { backgroundColor: colors.card, borderColor: statusColor(step.status) + '50' }]}>
            {/* Node header */}
            <View style={chainStyles.nodeHeader}>
              <View style={[chainStyles.nodeIcon, { backgroundColor: statusColor(step.status) + '18' }]}>
                <MaterialCommunityIcons name={step.icon as any} size={18} color={statusColor(step.status)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[chainStyles.nodeLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{step.label}</Text>
                <Text style={[chainStyles.nodeSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{step.sublabel}</Text>
              </View>
              <Ionicons name={statusIcon(step.status) as any} size={16} color={statusColor(step.status)} />
            </View>
            {/* Node data lines */}
            <View style={[chainStyles.nodeData, { borderTopColor: colors.border }]}>
              {step.lines.map((line, li) => (
                <View key={li} style={chainStyles.dataRow}>
                  <Text style={[chainStyles.dataKey, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{line.key}</Text>
                  <Text
                    style={[chainStyles.dataVal, { color: colors.foreground, fontFamily: line.mono ? 'Inter_400Regular' : 'Inter_400Regular' }]}
                    numberOfLines={2}
                  >
                    {line.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const chainStyles = StyleSheet.create({
  wrap: { gap: 0 },
  stepOuter: { position: 'relative' },
  connector: { position: 'absolute', left: 22, top: 70, bottom: -12, width: 2, borderLeftWidth: 2, borderStyle: 'dashed', zIndex: 0 },
  node: { borderWidth: 1, borderRadius: 12, marginBottom: 12, overflow: 'hidden', zIndex: 1 },
  nodeHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  nodeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nodeLabel: { fontSize: 14 },
  nodeSub: { fontSize: 11, marginTop: 1 },
  nodeData: { borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 0 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: 8 },
  dataKey: { fontSize: 11, letterSpacing: 0.3, flex: 1 },
  dataVal: { fontSize: 12, flex: 2, textAlign: 'right' },
});

export default function DogDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dogs, user, toggleStolen } = useRegistry();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<any>(null);
  const viewShotRef = useRef<any>(null);

  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const dog = dogs.find(d => d.id === id);

  if (!dog) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="paw-off" size={52} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Dog not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[{ color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = dog.ownerId === user?.id;
  const isBreeder = user?.role === 'breeder';
  const canTransfer = isOwner || user?.role === 'regulator';
  const canUpdateHealth = user?.role === 'vet' || user?.role === 'regulator';
  const canFlagStolen = isOwner || user?.role === 'regulator';

  const handleToggleStolen = async () => {
    Alert.alert(
      dog.isStolen ? 'Remove Stolen Flag' : 'Flag as Stolen',
      dog.isStolen
        ? 'This will remove the stolen report for this dog.'
        : 'This will report this dog as stolen on the ZCR ledger. This action is recorded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: dog.isStolen ? 'Remove Flag' : 'Report Stolen',
          style: dog.isStolen ? 'default' : 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await toggleStolen(dog.id);
          },
        },
      ]
    );
  };

  const handleExportQR = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `ZCR_${dog.name}_QR`,
        UTI: 'public.png',
      });
    } catch (e) {
      Alert.alert('Error', 'Could not export QR code image.');
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'info', label: 'Identity', icon: 'account-card-details' },
    { key: 'health', label: 'Health', icon: 'heart-pulse' },
    { key: 'lineage', label: 'Lineage', icon: 'dog-side' },
    { key: 'chain', label: 'Chain', icon: 'link-variant' },
  ];

  const syncColor = dog.blockchainSyncStatus === 'confirmed'
    ? colors.primary
    : dog.blockchainSyncStatus === 'pending'
    ? (colors.warning ?? '#F59E0B')
    : (colors.destructive ?? '#EF4444');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: topPt + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
          {dog.name}
        </Text>
        <TouchableOpacity onPress={() => setShowQR(true)} style={styles.backBtn}>
          <MaterialCommunityIcons name="qrcode" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={[styles.heroPaw, { backgroundColor: colors.primary + '18' }]}>
            <MaterialCommunityIcons name="paw" size={48} color={colors.primary} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{dog.name}</Text>
            <Text style={[styles.heroBreed, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{dog.breed}</Text>
            <Text style={[styles.heroGender, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {dog.gender === 'male' ? 'Male' : 'Female'} · {dog.color}
            </Text>
            <View style={styles.badgeRow}>
              {dog.isStolen && (
                <View style={[styles.badge, { backgroundColor: '#EF444420', borderColor: '#EF444440', borderRadius: 6 }]}>
                  <Ionicons name="warning" size={12} color={colors.destructive} />
                  <Text style={[styles.badgeText, { color: colors.destructive, fontFamily: 'Inter_700Bold' }]}>STOLEN</Text>
                </View>
              )}
              <View style={[styles.badge, {
                backgroundColor: dog.sterilizationStatus === 'Sterilized' ? colors.success + '20' : colors.muted,
                borderColor: dog.sterilizationStatus === 'Sterilized' ? colors.success + '40' : colors.border,
                borderRadius: 6,
              }]}>
                <Text style={[styles.badgeText, {
                  color: dog.sterilizationStatus === 'Sterilized' ? colors.success : colors.mutedForeground,
                  fontFamily: 'Inter_500Medium',
                }]}>
                  {dog.sterilizationStatus}
                </Text>
              </View>
              {/* Blockchain status badge */}
              <View style={[styles.badge, { backgroundColor: syncColor + '18', borderColor: syncColor + '40', borderRadius: 6 }]}>
                <MaterialCommunityIcons name="link-variant" size={11} color={syncColor} />
                <Text style={[styles.badgeText, { color: syncColor, fontFamily: 'Inter_600SemiBold' }]}>
                  {dog.blockchainSyncStatus.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chip display */}
        <View style={[styles.chipCard, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30', borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="chip" size={20} color={colors.primary} />
          <Text style={[styles.chipText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{dog.microchipId}</Text>
          {dog.blockchainSyncStatus === 'confirmed' && (
            <View style={{ marginLeft: 'auto' }}>
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tab, { backgroundColor: activeTab === t.key ? colors.primary : 'transparent', borderRadius: colors.radius - 4 }]}
            >
              <MaterialCommunityIcons
                name={t.icon as any}
                size={13}
                color={activeTab === t.key ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text style={[styles.tabText, {
                color: activeTab === t.key ? colors.primaryForeground : colors.mutedForeground,
                fontFamily: activeTab === t.key ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={[styles.tabContent, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {activeTab === 'info' && (
            <>
              <InfoRow label="Date of Birth" value={dog.birthDate || ''} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {dog.weight ? <><InfoRow label="Weight" value={dog.weight} /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
              <InfoRow label="Current Owner" value={dog.ownerName} highlight />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Registered Breeder" value={dog.breederName} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <InfoRow label="Registration Date" value={dog.registrationDate} />
            </>
          )}

          {activeTab === 'health' && (
            <>
              <InfoRow label="Sterilization" value={dog.sterilizationStatus} />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {dog.lastCheckup ? <><InfoRow label="Last Checkup" value={dog.lastCheckup} /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
              {dog.dnaHash ? <><InfoRow label="DNA Hash" value={dog.dnaHash || ''} mono /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
              <View style={styles.vaccineWrap}>
                <Text style={[styles.vaccineLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>VACCINE HISTORY</Text>
                <Text style={[styles.vaccineText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                  {dog.vaccineHistory || 'No vaccine records on file'}
                </Text>
              </View>
            </>
          )}

          {activeTab === 'lineage' && (
            <>
              {dog.litterId ? <><InfoRow label="Litter ID" value={dog.litterId} highlight /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
              {dog.dameMicrochip ? <><InfoRow label="Dame Microchip" value={dog.dameMicrochip} /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
              {dog.sireMicrochip ? <><InfoRow label="Sire Microchip" value={dog.sireMicrochip} /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
              {!dog.dameMicrochip && !dog.sireMicrochip && !dog.litterId && (
                <View style={styles.noLineage}>
                  <MaterialCommunityIcons name="dog-side" size={36} color={colors.mutedForeground} />
                  <Text style={[styles.noLineageText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>No lineage data recorded</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'chain' && <ChainTab dog={dog} />}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {canUpdateHealth && (
            <GoldButton
              title="Update Health Record"
              onPress={() => router.push(`/dog/health?dogId=${dog.id}`)}
              variant="filled"
            />
          )}
          {canTransfer && (
            <GoldButton
              title="Transfer Ownership"
              onPress={() => router.push(`/dog/transfer?dogId=${dog.id}`)}
              variant="outline"
            />
          )}
          {canFlagStolen && (
            <TouchableOpacity
              onPress={handleToggleStolen}
              style={[styles.stolenBtn, {
                backgroundColor: dog.isStolen ? colors.surfaceRaised : '#EF444415',
                borderColor: dog.isStolen ? colors.border : '#EF444440',
                borderRadius: colors.radius,
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name={dog.isStolen ? 'shield-checkmark' : 'warning'} size={18} color={dog.isStolen ? colors.success : colors.destructive} />
              <Text style={[styles.stolenText, {
                color: dog.isStolen ? colors.success : colors.destructive,
                fontFamily: 'Inter_600SemiBold',
              }]}>
                {dog.isStolen ? 'Remove Stolen Flag' : 'Report as Stolen'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Ownership row */}
        <View style={[styles.ownerRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="account-check" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.ownerLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Registered Owner</Text>
            <Text style={[styles.ownerName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{dog.ownerName}</Text>
          </View>
        </View>
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={showQR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderRadius: colors.radius }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Dog QR Passport</Text>
              <TouchableOpacity onPress={() => setShowQR(false)}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
              <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12 }]}>
                <QRCode
                  value={`zcr://dog/${dog.microchipId}`}
                  size={200}
                  color={colors.primary}
                  backgroundColor="#FFFFFF"
                  getRef={(c) => (qrRef.current = c)}
                />
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>{dog.name}</Text>
                  <Text style={{ color: '#666666', fontSize: 14 }}>{dog.microchipId}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                    <Image source={require('@/assets/images/icon.png')} style={{ width: 24, height: 24, borderRadius: 4 }} />
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>Zimbabwe Canine Registry</Text>
                  </View>
                </View>
              </View>
            </ViewShot>

            <View style={{ gap: 10, marginTop: 20 }}>
              <GoldButton title="Share QR Passport" onPress={handleExportQR} />
              <TouchableOpacity
                style={[styles.saveBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                onPress={() => setShowQR(false)}
              >
                <Text style={[styles.saveBtnText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 18 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, textAlign: 'center' },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 14 },
  hero: { flexDirection: 'row', padding: 16, borderWidth: 1, gap: 14, alignItems: 'flex-start' },
  heroPaw: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 22 },
  heroBreed: { fontSize: 14 },
  heroGender: { fontSize: 13 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, gap: 4 },
  badgeText: { fontSize: 10, letterSpacing: 0.4 },
  chipCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, gap: 10 },
  chipText: { fontSize: 15, letterSpacing: 1, flex: 1 },
  tabBar: { flexDirection: 'row', padding: 4, borderWidth: 1, gap: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, flexDirection: 'row', gap: 4 },
  tabText: { fontSize: 11 },
  tabContent: { padding: 16, borderWidth: 1 },
  divider: { height: 1 },
  vaccineWrap: { paddingTop: 10, gap: 8 },
  vaccineLabel: { fontSize: 11, letterSpacing: 0.5 },
  vaccineText: { fontSize: 13, lineHeight: 20 },
  noLineage: { alignItems: 'center', padding: 20, gap: 10 },
  noLineageText: { fontSize: 14 },
  actions: { gap: 10 },
  stolenBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, gap: 8 },
  stolenText: { fontSize: 14 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, gap: 12 },
  ownerLabel: { fontSize: 12 },
  ownerName: { fontSize: 15, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  qrContainer: { alignItems: 'center', alignSelf: 'center' },
  saveBtn: { padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  saveBtnText: { fontSize: 14 },
});
