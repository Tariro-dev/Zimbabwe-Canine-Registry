import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRegistry } from '@/context/RegistryContext';
import { RoleBadge } from '@/components/RoleBadge';
import { GoldButton } from '@/components/GoldButton';
import type { Role } from '@/context/RegistryContext';

const ROLES: { key: Role; label: string; description: string }[] = [
  { key: 'owner', label: 'Dog Owner', description: 'Transfer & flag dogs' },
  { key: 'breeder', label: 'Breeder', description: 'Register dogs & litters' },
  { key: 'vet', label: 'Veterinarian', description: 'Update health records' },
  { key: 'regulator', label: 'Regulator', description: 'Full system access' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, dogs, litters, updateUser } = useRegistry();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [kennelName, setKennelName] = useState(user.kennelName ?? '');
  const [licenseNumber, setLicenseNumber] = useState(user.licenseNumber ?? '');
  const topPt = Platform.OS === 'web' ? 67 : insets.top;

  const initials = user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const myDogs = dogs.filter(d => d.ownerId === user.id || d.breederId === user.id);
  const myLitters = litters.filter(l => l.breederId === user.id);
  const sterilized = dogs.filter(d => d.sterilizationStatus === 'Sterilized').length;

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateUser({ name: name.trim(), kennelName: kennelName.trim() || undefined, licenseNumber: licenseNumber.trim() || undefined });
    setEditing(false);
  };

  const handleRoleChange = async (role: Role) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateUser({ role });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPt + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & Identity */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '22', borderColor: colors.primary, borderRadius: 40 }]}>
          <Text style={[styles.initials, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{initials}</Text>
        </View>
        <View style={styles.identityInfo}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{user.name}</Text>
          {user.kennelName ? (
            <Text style={[styles.kennel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{user.kennelName}</Text>
          ) : null}
          <RoleBadge role={user.role} />
        </View>
        <TouchableOpacity onPress={() => { setEditing(!editing); setName(user.name); setKennelName(user.kennelName ?? ''); setLicenseNumber(user.licenseNumber ?? ''); }}>
          <Ionicons name={editing ? 'close' : 'pencil'} size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {user.licenseNumber ? (
        <View style={[styles.licenseRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
          <MaterialCommunityIcons name="license" size={16} color={colors.primary} />
          <Text style={[styles.licenseText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>License: {user.licenseNumber}</Text>
        </View>
      ) : null}

      {/* Edit Form */}
      {editing && (
        <View style={[styles.editCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.editTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Edit Profile</Text>

          {[
            { label: 'FULL NAME', value: name, setter: setName, placeholder: 'Your name' },
            { label: 'KENNEL NAME', value: kennelName, setter: setKennelName, placeholder: 'e.g. Zwana Kennels' },
            { label: 'LICENSE NUMBER', value: licenseNumber, setter: setLicenseNumber, placeholder: 'e.g. ZCR-BR-2024-001' },
          ].map(f => (
            <View key={f.label} style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{f.label}</Text>
              <TextInput
                value={f.value}
                onChangeText={f.setter}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                style={[styles.fieldInput, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 4, color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              />
            </View>
          ))}

          <GoldButton title="Save Changes" onPress={handleSave} />
        </View>
      )}

      {/* Stats */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>My Statistics</Text>
      <View style={styles.statsRow}>
        {[
          { label: 'Dogs', value: myDogs.length, icon: 'paw' as const },
          { label: 'Litters', value: myLitters.length, icon: 'dog-side' as const },
          { label: 'Sterilized', value: sterilized, icon: 'needle' as const },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <MaterialCommunityIcons name={s.icon} size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Role Selector */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Account Role</Text>
      <View style={[styles.roleInfo, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text style={[styles.roleInfoText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Your role determines what actions you can perform in the ZCR system.
        </Text>
      </View>
      {ROLES.map(r => (
        <TouchableOpacity
          key={r.key}
          onPress={() => handleRoleChange(r.key)}
          style={[
            styles.roleRow,
            {
              backgroundColor: user.role === r.key ? colors.primary + '18' : colors.card,
              borderColor: user.role === r.key ? colors.primary + '60' : colors.border,
              borderRadius: colors.radius,
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.roleLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{r.label}</Text>
            <Text style={[styles.roleSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{r.description}</Text>
          </View>
          {user.role === r.key && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
        </TouchableOpacity>
      ))}

      {/* Account info */}
      <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.accountTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Account</Text>
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Member Since</Text>
          <Text style={[styles.accountValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{user.registeredAt}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Platform</Text>
          <Text style={[styles.accountValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>ZCR · Polygon PoS</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Standard</Text>
          <Text style={[styles.accountValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>ISO 11784/85 · ERC-721</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  avatar: { width: 72, height: 72, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 28 },
  identityInfo: { flex: 1, gap: 4 },
  name: { fontSize: 20 },
  kennel: { fontSize: 13 },
  licenseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  licenseText: { fontSize: 13 },
  editCard: { padding: 16, borderWidth: 1, gap: 12 },
  editTitle: { fontSize: 12, letterSpacing: 0.8 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 11, letterSpacing: 0.5 },
  fieldInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  sectionTitle: { fontSize: 17, marginTop: 8, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 24 },
  statLabel: { fontSize: 11 },
  roleInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderWidth: 1, marginBottom: 6 },
  roleInfoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  roleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  roleLabel: { fontSize: 14 },
  roleSub: { fontSize: 12, marginTop: 2 },
  accountCard: { padding: 16, borderWidth: 1, gap: 0, marginTop: 4 },
  accountTitle: { fontSize: 11, letterSpacing: 0.8, marginBottom: 10 },
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  accountLabel: { fontSize: 13 },
  accountValue: { fontSize: 13 },
  divider: { height: 1 },
});
