import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getIdea } from '../data/ideas';
import { RootStackParamList, ScheduledDate } from '../types';
import { Button } from '../components/Button';
import { addScheduled, getSaved, toggleSaved } from '../storage/storage';
import { openMapsSearch } from '../maps/maps';
import { scheduleReminder } from '../notifications/notifications';
import { colors, gradients, radius, shadow, spacing } from '../theme';

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
    Haptics.selectionAsync().catch(() => {});
    const next = await toggleSaved(idea.id);
    setSaved(next);
  }, [idea]);

  const onSchedulePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert(
      '✨ Date scheduled',
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
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroEmojiCircle}>
          <Text style={styles.heroEmoji}>{idea.emoji}</Text>
        </View>
        <Text style={styles.title}>{idea.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>{idea.category}</Text>
          </View>
          <Text style={styles.heroMeta}>
            {formatDuration(idea.durationMinutes)} · {idea.estimatedCost}
          </Text>
        </View>
        <Pressable onPress={onToggleSave} hitSlop={16} style={styles.saveBtn}>
          <Text style={styles.saveIcon}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>The vibe</Text>
        <Text style={styles.description}>{idea.description}</Text>

        <View style={styles.actions}>
          <Button
            label="Find nearby on Google Maps"
            onPress={() => openMapsSearch(idea.mapsQuery)}
          />
          <Button label="Schedule a date" variant="secondary" onPress={onSchedulePress} />
        </View>
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

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroEmojiCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffffff33',
    borderWidth: 2,
    borderColor: '#ffffff66',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: { fontSize: 56 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  heroChip: {
    backgroundColor: '#ffffff33',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  heroChipText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  heroMeta: {
    color: '#fff8fc',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff33',
    alignItems: 'center',
    justifyContent: 'center',
    ...(shadow.card as object),
  },
  saveIcon: { fontSize: 22, color: '#ffffff' },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionLabel: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  description: { color: colors.text, fontSize: 15, lineHeight: 23 },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
