import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IDEAS } from '../data/ideas';
import { RootStackParamList } from '../types';
import { IdeaCard } from '../components/IdeaCard';
import { EmptyState } from '../components/EmptyState';
import { getSaved } from '../storage/storage';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SavedScreen() {
  const navigation = useNavigation<Nav>();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSaved().then(setSavedIds);
    }, []),
  );

  const ideas = IDEAS.filter((i) => savedIds.includes(i.id));

  if (ideas.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Saved</Text>
        </View>
        <EmptyState
          emoji="❤"
          title="No saved ideas yet"
          body="Tap the heart on any idea to keep it here for later."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Saved</Text>
        <Text style={styles.subheading}>{ideas.length} ideas saved</Text>
      </View>
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            saved
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
});
