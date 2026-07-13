import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { GoldButton } from '@/components/GoldButton';

export default function TransferOwnershipScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dogId } = useLocalSearchParams<{ dogId: string }>();
  const { dogs, user, transferOwnership } = useRegistry();
  const dog = dogs.find(d => d.id === dogId);
  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  const [saving, setSaving] = useState(false);

  const canTransfer = dog && (dog.ownerId === user.id || user.role === 'regulator');

  if (!dog) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Dog not found</Text>
      </View>
    );
  }

  const handleTransfer = () => {
    if (!newOwnerName.trim()) { Alert.alert('Missing', 'Please enter the new owner name.'); return; }
    if (!newOwnerId.trim()) { Alert.alert('Missing', 'Please enter the new owner ID.'); return; }

    Alert.alert(
      'Confirm Ownership Transfer',
      `Transfer ${dog.name} from "${dog.ownerName}" to "${newOwnerName}"?\n\nThis action is recorded on the ZCR blockchain and cannot be reversed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              transferOwnership(dog.id, newOwnerName.trim(), newOwnerId.trim());
              Alert.alert('Transfer Complete', `${dog.name} has been transferred to ${newOwnerName}. The ledger has been updated.`, [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
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

      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Transfer Ownership</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Permanently transfer {dog.name} on the ZCR ledger
      </Text>

      {/* Current ownership */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>CURRENT OWNER</Text>
        <View style={styles.ownerRow}>
          <View style={[styles.ownerIcon, { backgroundColor: colors.primary + '18' }]}>
            <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ownerName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{dog.ownerName}</Text>
            <Text style={[styles.ownerId, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{dog.ownerId}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.arrowRow]}>
        <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
        <View style={[styles.arrowCircle, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
          <Ionicons name="arrow-down" size={18} color={colors.primary} />
        </View>
        <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
      </View>

      {/* New owner */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>NEW OWNER</Text>

        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>FULL NAME *</Text>
          <TextInput
            value={newOwnerName}
            onChangeText={setNewOwnerName}
            placeholder="Enter new owner's full name"
            placeholderTextColor={colors.mutedForeground}
            editable={!!canTransfer}
            style={[styles.input, {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: colors.radius - 4,
              color: colors.foreground,
              fontFamily: 'Inter_400Regular',
            }]}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>OWNER ID / ZCR ID *</Text>
          <TextInput
            value={newOwnerId}
            onChangeText={setNewOwnerId}
            placeholder="e.g. user-002 or ZCR-OWN-2024-002"
            placeholderTextColor={colors.mutedForeground}
            editable={!!canTransfer}
            style={[styles.input, {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.border,
              borderRadius: colors.radius - 4,
              color: colors.foreground,
              fontFamily: 'Inter_400Regular',
            }]}
          />
        </View>
      </View>

      {/* Warning */}
      <View style={[styles.warning, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30', borderRadius: colors.radius }]}>
        <Ionicons name="warning-outline" size={18} color={colors.warning} />
        <Text style={[styles.warningText, { color: colors.warning, fontFamily: 'Inter_500Medium' }]}>
          Ownership transfer is permanent and immutably recorded on the ZCR blockchain. Ensure the new owner details are correct.
        </Text>
      </View>

      {!canTransfer && (
        <View style={[styles.warning, { backgroundColor: '#EF444415', borderColor: '#EF444430', borderRadius: colors.radius }]}>
          <Ionicons name="lock-closed" size={18} color={colors.destructive} />
          <Text style={[styles.warningText, { color: colors.destructive, fontFamily: 'Inter_500Medium' }]}>
            You must be the registered owner or a regulator to transfer this dog.
          </Text>
        </View>
      )}

      <GoldButton
        title="Transfer on ZCR Ledger"
        onPress={handleTransfer}
        loading={saving}
        disabled={!canTransfer}
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
  card: { padding: 16, borderWidth: 1, gap: 12 },
  cardLabel: { fontSize: 11, letterSpacing: 0.8 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  ownerName: { fontSize: 15 },
  ownerId: { fontSize: 12, marginTop: 2 },
  arrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  arrowLine: { flex: 1, height: 1 },
  arrowCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 11, letterSpacing: 0.5 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  warning: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderWidth: 1, gap: 10 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
