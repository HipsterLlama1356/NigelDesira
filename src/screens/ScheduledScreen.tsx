import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getIdea } from '../data/ideas';
import { ScheduledDate } from '../types';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { getScheduled, removeScheduled } from '../storage/storage';
import { cancelReminder } from '../notifications/notifications';
import { exportIcs } from '../calendar/ics';
import { colors, radius, spacing } from '../theme';

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
    try {
      await exportIcs(entry, idea);
    } catch (err) {
      Alert.alert('Could not export', String(err));
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Scheduled</Text>
        </View>
        <EmptyState
          emoji="📅"
          title="Nothing scheduled"
          body="Pick an idea and tap 'Schedule a date' to plan something."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Scheduled</Text>
        <Text style={styles.subheading}>
          {items.length} date{items.length === 1 ? '' : 's'} planned
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => {
          const idea = getIdea(item.ideaId);
          if (!idea) return null;
          const elapsed = item.scheduledAt - now;
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.emoji}>{idea.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{idea.title}</Text>
                  <Text style={styles.when}>
                    {new Date(item.scheduledAt).toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.countdown,
                      elapsed <= 0 && { color: colors.accent },
                    ]}
                  >
                    {formatCountdown(elapsed)}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Button
                  label="Export .ics"
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

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Happening now';
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text },
  subheading: { color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 36 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  when: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  countdown: { color: colors.text, fontWeight: '600', marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
