import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CATEGORIES, IDEAS } from '../data/ideas';
import { Category, RootStackParamList } from '../types';
import { IdeaCard } from '../components/IdeaCard';
import { getSaved } from '../storage/storage';
import { colors, radius, spacing } from '../theme';

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Date Ideas</Text>
        <Text style={styles.subheading}>
          {filtered.length} ideas to plan your next one
        </Text>
      </View>
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
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            saved={savedIds.includes(item.id)}
            onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text },
  subheading: { color: colors.textMuted, marginTop: 2 },
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.chipActive },
  chipText: { color: colors.chipText, fontWeight: '600' },
  chipTextActive: { color: colors.chipActiveText },
});
