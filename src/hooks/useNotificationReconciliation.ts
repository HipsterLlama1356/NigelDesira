import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { getIdea } from '../data/ideas';
import { getScheduled, addScheduled, removeScheduled } from '../storage/storage';
import { scheduleReminder } from '../notifications/notifications';

/**
 * On boot: walk every saved scheduled date and make sure its OS-level
 * notification still exists. Re-register any that are missing (e.g. after a
 * reinstall or notification cache clear). Drop entries whose time has passed.
 */
export function useNotificationReconciliation(): void {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const scheduled = await getScheduled();
      if (scheduled.length === 0) return;

      const liveNotifs = await Notifications.getAllScheduledNotificationsAsync();
      const liveIds = new Set(liveNotifs.map((n) => n.identifier));
      const now = Date.now();

      for (const entry of scheduled) {
        if (cancelled) return;

        if (entry.scheduledAt <= now) {
          await removeScheduled(entry.id);
          continue;
        }

        const stillRegistered =
          entry.notificationId && liveIds.has(entry.notificationId);
        if (stillRegistered) continue;

        const idea = getIdea(entry.ideaId);
        if (!idea) continue;
        const newId = await scheduleReminder(
          `${idea.emoji} ${idea.title}`,
          'Your date starts now — have fun!',
          entry.scheduledAt,
        );
        await removeScheduled(entry.id);
        await addScheduled({ ...entry, notificationId: newId });
      }
    })().catch(() => {
      // Reconciliation is best-effort; never crash the app on boot.
    });

    return () => {
      cancelled = true;
    };
  }, []);
}
