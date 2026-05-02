import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IDEAS } from '../data/ideas';
import { RootStackParamList } from '../types';
import { IdeaCard } from '../components/IdeaCard';
import { EmptyState } from '../components/EmptyState';
import { getSaved } from '../storage/storage';
import { colors, gradients, radius, spacing } from '../theme';

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

  const Header = (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <Text style={styles.kicker}>your shortlist</Text>
      <Text style={styles.heading}>Saved</Text>
      <Text style={styles.subheading}>
        {ideas.length === 0
          ? 'Tap the heart on any idea to keep it here.'
          : `${ideas.length} idea${ideas.length === 1 ? '' : 's'} on standby.`}
      </Text>
    </LinearGradient>
  );

  if (ideas.length === 0) {
    return (
      <View style={styles.container}>
        {Header}
        <EmptyState
          emoji="♥"
          title="No saved ideas yet"
          body="Tap the heart on any idea to keep it here for later."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Header}
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xl }}
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
});
