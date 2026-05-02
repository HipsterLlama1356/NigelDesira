import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateIdea } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  idea: DateIdea;
  saved?: boolean;
  onPress: () => void;
}

export function IdeaCard({ idea, saved, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{idea.emoji}</Text>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {idea.title}
          </Text>
          {saved && <Text style={styles.heart}>❤</Text>}
        </View>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{idea.category}</Text>
          </View>
          <Text style={styles.meta}>
            ~{Math.round(idea.durationMinutes / 60)}h · {idea.estimatedCost}
          </Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {idea.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  emoji: { fontSize: 36, marginRight: spacing.md },
  content: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  heart: { color: colors.accent, fontSize: 16, marginLeft: spacing.sm },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  chipText: { color: colors.chipText, fontSize: 12, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12 },
  desc: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13 },
});
