import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Dog } from '@/context/RegistryContext';

interface Props {
  dog: Dog;
  onPress: () => void;
  compact?: boolean;
}

export function DogCard({ dog, onPress, compact = false }: Props) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + '18', borderRadius: colors.radius - 2 }]}>
        <MaterialCommunityIcons name="paw" size={compact ? 22 : 28} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: compact ? 14 : 16 }]} numberOfLines={1}>
            {dog.name}
          </Text>
          {dog.isStolen && (
            <View style={[styles.badge, { backgroundColor: '#EF444420', borderColor: '#EF444440' }]}>
              <Text style={[styles.badgeText, { color: colors.destructive, fontFamily: 'Inter_700Bold' }]}>STOLEN</Text>
            </View>
          )}
        </View>
        <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {dog.breed} · {dog.gender === 'male' ? 'Male' : 'Female'} · {dog.color}
        </Text>
        {!compact && (
          <Text style={[styles.chip, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {dog.microchipId}
          </Text>
        )}
        <View style={styles.badgeRow}>
          <View style={[
            styles.badge,
            {
              backgroundColor: dog.sterilizationStatus === 'Sterilized' ? colors.success + '20' : colors.muted,
              borderColor: dog.sterilizationStatus === 'Sterilized' ? colors.success + '40' : colors.border,
            },
          ]}>
            <Text style={[styles.badgeText, {
              color: dog.sterilizationStatus === 'Sterilized' ? colors.success : colors.mutedForeground,
              fontFamily: 'Inter_500Medium',
            }]}>
              {dog.sterilizationStatus}
            </Text>
          </View>
          {dog.vaccineHistory && (
            <View style={[styles.badge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.badgeText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Vaccinated</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {},
  sub: {
    fontSize: 12,
  },
  chip: {
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
