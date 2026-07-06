import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';
import { RoleBadge } from '@/components/RoleBadge';

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const colors = useColors();
  return (
    <View style={ir.row}>
      <Text style={[ir.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
      <Text style={[ir.value, { color: highlight ? colors.primary : colors.foreground, fontFamily: highlight ? 'Inter_600SemiBold' : 'Inter_400Regular' }]} numberOfLines={3}>
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

type Tab = 'info' | 'health' | 'lineage';

export default function DogDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dogs, user, toggleStolen } = useRegistry();
  const [activeTab, setActiveTab] = useState<Tab>('info');
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

  const isOwner = dog.ownerId === user.id;
  const isBreeder = dog.breederId === user.id;
  const canTransfer = isOwner || user.role === 'regulator';
  const canUpdateHealth = user.role === 'vet' || user.role === 'regulator';
  const canFlagStolen = isOwner || user.role === 'regulator';

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
            toggleStolen(dog.id);
          },
        },
      ]
    );
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Identity' },
    { key: 'health', label: 'Health' },
    { key: 'lineage', label: 'Lineage' },
  ];

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
        <View style={{ width: 40 }} />
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
            </View>
          </View>
        </View>

        {/* Chip display */}
        <View style={[styles.chipCard, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30', borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="chip" size={20} color={colors.primary} />
          <Text style={[styles.chipText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{dog.microchipId}</Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tab, { backgroundColor: activeTab === t.key ? colors.primary : 'transparent', borderRadius: colors.radius - 4 }]}
            >
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
              <InfoRow label="Date of Birth" value={dog.birthDate} />
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
              {dog.dnaHash ? <><InfoRow label="DNA Hash" value={dog.dnaHash} /><View style={[styles.divider, { backgroundColor: colors.border }]} /></> : null}
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
  chipText: { fontSize: 15, letterSpacing: 1 },
  tabBar: { flexDirection: 'row', padding: 4, borderWidth: 1, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabText: { fontSize: 13 },
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
});
