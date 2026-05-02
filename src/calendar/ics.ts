import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DateIdea, ScheduledDate } from '../types';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toIcsDate(ms: number): string {
  const d = new Date(ms);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildIcs(scheduled: ScheduledDate, idea: DateIdea): string {
  const start = scheduled.scheduledAt;
  const end = start + idea.durationMinutes * 60 * 1000;
  const now = Date.now();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//duo-dates//Date Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${scheduled.id}@duo-dates`,
    `DTSTAMP:${toIcsDate(now)}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(`${idea.emoji} ${idea.title}`)}`,
    `DESCRIPTION:${escapeIcs(
      idea.description + (scheduled.notes ? `\n\nNotes: ${scheduled.notes}` : ''),
    )}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(`Reminder: ${idea.title}`)}`,
    'TRIGGER:-PT30M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export async function exportIcs(
  scheduled: ScheduledDate,
  idea: DateIdea,
): Promise<void> {
  const content = buildIcs(scheduled, idea);
  const safeTitle = idea.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const path = `${FileSystem.cacheDirectory}${safeTitle}-${scheduled.id}.ics`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/calendar',
      dialogTitle: 'Add to calendar',
      UTI: 'com.apple.ical.ics',
    });
  }
}
