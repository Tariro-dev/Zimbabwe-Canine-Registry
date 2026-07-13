import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function GoldButton({ title, onPress, loading = false, disabled = false, variant = 'filled', size = 'md', style }: Props) {
  const colors = useColors();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;
  const height = size === 'sm' ? 38 : size === 'lg' ? 54 : 46;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;

  const bgColor =
    variant === 'filled'
      ? isDisabled
        ? colors.primary + '60'
        : colors.primary
      : 'transparent';

  const borderColor = variant === 'outline' ? colors.primary : 'transparent';
  const textColor =
    variant === 'filled'
      ? colors.primaryForeground
      : colors.primary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          height,
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize, fontFamily: 'Inter_600SemiBold' }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    letterSpacing: 0.3,
  },
});
