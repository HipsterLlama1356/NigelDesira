import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getIdea } from '../data/ideas';
import { RootStackParamList, ScheduledDate } from '../types';
import { Button } from '../components/Button';
import { addScheduled, getSaved, toggleSaved } from '../storage/storage';
import { openMapsSearch } from '../maps/maps';
import { scheduleReminder } from '../notifications/notifications';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'IdeaDetail'>;
type Rt = RouteProp<RootStackParamList, 'IdeaDetail'>;

export function IdeaDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const idea = getIdea(route.params.ideaId);

  const [saved, setSaved] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [draftDate, setDraftDate] = useState(() => defaultStart());

  useEffect(() => {
    navigation.setOptions({ title: idea?.title ?? 'Idea' });
  }, [idea, navigation]);

  useEffect(() => {
    if (!idea) return;
    getSaved().then((ids) => setSaved(ids.includes(idea.id)));
  }, [idea]);

  const onToggleSave = useCallback(async () => {
    if (!idea) return;
    const next = await toggleSaved(idea.id);
    setSaved(next);
  }, [idea]);

  const onSchedulePress = () => {
    setPickerMode('date');
    setDraftDate(defaultStart());
    setPickerVisible(true);
  };

  const handlePickerChange = async (
    _event: unknown,
    value: Date | undefined,
  ) => {
    if (Platform.OS !== 'ios') {
      setPickerVisible(false);
    }
    if (!value || !idea) return;
    if (pickerMode === 'date') {
      const merged = new Date(draftDate);
      merged.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
      setDraftDate(merged);
      setPickerMode('time');
      if (Platform.OS !== 'ios') setPickerVisible(true);
      return;
    }
    const finalDate = new Date(draftDate);
    finalDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
    setPickerVisible(false);
    if (finalDate.getTime() <= Date.now()) {
      Alert.alert('Pick a future time', 'That time is already in the past.');
      return;
    }
    const entry: ScheduledDate = {
      id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ideaId: idea.id,
      scheduledAt: finalDate.getTime(),
    };
    const notifId = await scheduleReminder(
      `${idea.emoji} ${idea.title}`,
      'Your date starts now — have fun!',
      finalDate.getTime(),
    );
    entry.notificationId = notifId;
    await addScheduled(entry);
    Alert.alert(
      'Date scheduled',
      `Saved for ${finalDate.toLocaleString()}.${
        notifId ? ' We will remind you.' : ''
      }`,
    );
  };

  if (!idea) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Idea not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroRow}>
        <Text style={styles.heroEmoji}>{idea.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{idea.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{idea.category}</Text>
            </View>
            <Text style={styles.meta}>
              ~{Math.round(idea.durationMinutes / 60)}h · {idea.estimatedCost}
            </Text>
          </View>
        </View>
        <Pressable onPress={onToggleSave} hitSlop={12}>
          <Text style={[styles.saveIcon, saved && styles.saveIconActive]}>
            {saved ? '❤' : '♡'}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.description}>{idea.description}</Text>
      <View style={styles.actions}>
        <Button
          label="Find nearby on Google Maps"
          onPress={() => openMapsSearch(idea.mapsQuery)}
        />
        <Button label="Schedule a date" variant="secondary" onPress={onSchedulePress} />
      </View>
      {pickerVisible && (
        <DateTimePicker
          value={draftDate}
          mode={pickerMode}
          minimumDate={pickerMode === 'date' ? new Date() : undefined}
          onChange={handlePickerChange}
        />
      )}
    </ScrollView>
  );
}

function defaultStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(19, 0, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroEmoji: { fontSize: 56 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  chipText: { color: colors.chipText, fontSize: 12, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 13 },
  description: { color: colors.text, fontSize: 15, lineHeight: 22 },
  actions: { gap: spacing.md },
  saveIcon: { fontSize: 30, color: colors.accent, paddingHorizontal: spacing.sm },
  saveIconActive: { color: colors.accent },
});
