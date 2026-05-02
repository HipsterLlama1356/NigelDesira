import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduledDate } from '../types';

const SAVED_KEY = 'duo-dates:saved';
const SCHEDULED_KEY = 'duo-dates:scheduled';

export async function getSaved(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SAVED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setSaved(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

export async function toggleSaved(id: string): Promise<boolean> {
  const ids = await getSaved();
  const isSaved = ids.includes(id);
  const next = isSaved ? ids.filter((x) => x !== id) : [...ids, id];
  await setSaved(next);
  return !isSaved;
}

export async function getScheduled(): Promise<ScheduledDate[]> {
  const raw = await AsyncStorage.getItem(SCHEDULED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addScheduled(entry: ScheduledDate): Promise<void> {
  const list = await getScheduled();
  list.push(entry);
  list.sort((a, b) => a.scheduledAt - b.scheduledAt);
  await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(list));
}

export async function removeScheduled(id: string): Promise<ScheduledDate | undefined> {
  const list = await getScheduled();
  const removed = list.find((d) => d.id === id);
  const next = list.filter((d) => d.id !== id);
  await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(next));
  return removed;
}
