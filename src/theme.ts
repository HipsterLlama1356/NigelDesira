import { Platform } from 'react-native';

export const colors = {
  bg: '#fff5f8',
  bgDeep: '#ffe1ec',
  card: '#ffffff',
  cardElevated: '#fffafc',
  border: '#f1d3df',
  text: '#1f1626',
  textMuted: '#7a6a72',
  accent: '#e85a8b',
  accentDark: '#b8336a',
  accentSoft: '#ffe1ec',
  plum: '#7a3a8c',
  chip: '#fde7ee',
  chipActive: '#e85a8b',
  chipText: '#7a3a52',
  chipActiveText: '#ffffff',
  danger: '#d04545',
  gold: '#f5b94a',
};

export const gradients = {
  hero: ['#ff8fb1', '#e85a8b', '#7a3a8c'] as const,
  card: ['#ffffff', '#fff0f6'] as const,
  fab: ['#ff8fb1', '#7a3a8c'] as const,
  countdown: ['#fde7ee', '#ffd6e6'] as const,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: '#b8336a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  fab: Platform.select({
    ios: {
      shadowColor: '#7a3a8c',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),
};
