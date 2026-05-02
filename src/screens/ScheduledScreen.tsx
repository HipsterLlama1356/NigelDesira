import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { getIdea } from '../data/ideas';
import { ScheduledDate } from '../types';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { getScheduled, removeScheduled } from '../storage/storage';
import { cancelReminder } from '../notifications/notifications';
import { exportIcs } from '../calendar/ics';
import { colors, gradients, radius, shadow, spacing } from '../theme';

export function ScheduledScreen() {
  const [items, setItems] = useState<ScheduledDate[]>([]);
  const [now, setNow] = useState<number>(Date.now());

  const reload = useCallback(() => {
    getScheduled().then(setItems);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleCancel = (entry: ScheduledDate) => {
    Alert.alert('Cancel this date?', 'This removes it from your schedule.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel date',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          await cancelReminder(entry.notificationId);
          await removeScheduled(entry.id);
          reload();
        },
      },
    ]);
  };

  const handleExport = async (entry: ScheduledDate) => {
    const idea = getIdea(entry.ideaId);
    if (!idea) return;
    Haptics.selectionAsync().catch(() => {});
    try {
      await exportIcs(entry, idea);
    } catch (err) {
      Alert.alert('Could not export', String(err));
    }
  };

  const renderHeader = (count: number) => (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <Text style={styles.kicker}>upcoming</Text>
      <Text style={styles.heading}>Scheduled</Text>
      <Text style={styles.subheading}>
        {count === 0
          ? 'Pick something special and lock it in.'
          : `${count} date${count === 1 ? '' : 's'} on the calendar.`}
      </Text>
    </LinearGradient>
  );

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader(0)}
        <EmptyState
          emoji="📅"
          title="Nothing scheduled yet"
          body="Pick an idea and tap 'Schedule a date' — we'll remind you."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader(items.length)}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => {
          const idea = getIdea(item.ideaId);
          if (!idea) return null;
          const elapsed = item.scheduledAt - now;
          const live = elapsed <= 0;
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.emojiBadge}>
                  <Text style={styles.emoji}>{idea.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{idea.title}</Text>
                  <Text style={styles.when}>{formatWhen(item.scheduledAt)}</Text>
                </View>
              </View>
              <LinearGradient
                colors={live ? gradients.fab : gradients.countdown}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.countdownPill}
              >
                <Text
                  style={[
                    styles.countdownText,
                    live && { color: '#ffffff' },
                  ]}
                >
                  {formatCountdown(elapsed)}
                </Text>
              </LinearGradient>
              <View style={styles.actions}>
                <Button
                  label="Add to calendar"
                  variant="secondary"
                  onPress={() => handleExport(item)}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Cancel"
                  variant="danger"
                  onPress={() => handleCancel(item)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function formatWhen(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date} · ${time}`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Happening now ✨';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `in ${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  if (mins > 0) return `in ${mins}m ${secs}s`;
  return `in ${secs}s`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  kicker: {
    color: '#ffffffcc',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: spacing.sm,
    letterSpacing: -0.5,
  },
  subheading: {
    color: '#fff8fc',
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...(shadow.card as object),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emojiBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 32 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: 0.2 },
  when: { color: colors.textMuted, fontSize: 13, marginTop: 2, fontWeight: '600' },
  countdownPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  countdownText: {
    color: colors.accentDark,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
