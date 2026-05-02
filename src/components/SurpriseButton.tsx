import React from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients, radius, shadow, spacing } from '../theme';

interface Props {
  onPress: () => void;
  label?: string;
}

export function SurpriseButton({ onPress, label = 'Surprise me' }: Props) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View style={[styles.shadow, { transform: [{ scale }] }]}>
        <Pressable onPress={handlePress} style={styles.pressable}>
          <LinearGradient
            colors={gradients.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.label}>{label}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  shadow: {
    borderRadius: radius.pill,
    ...(shadow.fab as object),
  },
  pressable: { borderRadius: radius.pill, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    gap: spacing.sm,
  },
  sparkle: { fontSize: 18 },
  label: { color: '#ffffff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
});
