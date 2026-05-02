import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DateIdea } from '../types';
import { colors, gradients, radius, shadow, spacing } from '../theme';

interface Props {
  idea: DateIdea;
  saved?: boolean;
  onPress: () => void;
}

export function IdeaCard({ idea, saved, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={gradients.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.emojiBadge}>
          <Text style={styles.emoji}>{idea.emoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {idea.title}
            </Text>
            {saved && <Text style={styles.heart}>♥</Text>}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{idea.category}</Text>
            </View>
            <Text style={styles.meta}>
              {formatDuration(idea.durationMinutes)} · {idea.estimatedCost}
            </Text>
          </View>
          <Text style={styles.desc} numberOfLines={2}>
            {idea.description}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.xl,
    ...(shadow.card as object),
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  card: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: { fontSize: 36 },
  content: { flex: 1, justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1, letterSpacing: 0.2 },
  heart: { color: colors.accent, fontSize: 18, marginLeft: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  chipText: { color: colors.chipText, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  meta: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  desc: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13, lineHeight: 18 },
});
