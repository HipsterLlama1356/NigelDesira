import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CATEGORIES, IDEAS } from '../data/ideas';
import { Category, RootStackParamList } from '../types';
import { IdeaCard } from '../components/IdeaCard';
import { SurpriseButton } from '../components/SurpriseButton';
import { getSaved } from '../storage/storage';
import { colors, gradients, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function BrowseScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSaved().then(setSavedIds);
    }, []),
  );

  const filtered =
    filter === 'All' ? IDEAS : IDEAS.filter((i) => i.category === filter);

  const onSurprise = () => {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    navigation.navigate('IdeaDetail', { ideaId: pick.id });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.kicker}>duo · dates</Text>
        <Text style={styles.heading}>Plan your next one</Text>
        <Text style={styles.subheading}>
          {filtered.length} hand-picked ideas to pull you out of the
          what-do-you-wanna-do loop.
        </Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {(['All', ...CATEGORIES] as const).map((cat) => {
          const active = filter === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setFilter(cat)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            saved={savedIds.includes(item.id)}
            onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
          />
        )}
      />

      <SurpriseButton onPress={onSurprise} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
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
    lineHeight: 20,
    fontWeight: '500',
  },
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.chipActive, borderColor: colors.chipActive },
  chipText: { color: colors.chipText, fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: colors.chipActiveText },
  list: { paddingTop: spacing.sm, paddingBottom: 96 },
});
