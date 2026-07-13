import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Role } from '@/context/RegistryContext';

const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
  owner: { label: 'Owner', color: '#60A5FA' },
  breeder: { label: 'Breeder', color: '#C9A84C' },
  vet: { label: 'Veterinarian', color: '#34D399' },
  regulator: { label: 'Regulator', color: '#A78BFA' },
};

interface Props {
  role: Role;
  size?: 'sm' | 'md';
}

export function RoleBadge({ role, size = 'md' }: Props) {
  const colors = useColors();
  const config = ROLE_CONFIG[role];
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: config.color + '20',
        borderColor: config.color + '50',
        borderRadius: colors.radius - 4,
        paddingHorizontal: size === 'sm' ? 8 : 12,
        paddingVertical: size === 'sm' ? 3 : 5,
      },
    ]}>
      <Text style={[styles.text, { color: config.color, fontSize, fontFamily: 'Inter_600SemiBold' }]}>
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    letterSpacing: 0.8,
  },
});
