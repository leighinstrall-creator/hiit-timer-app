import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { phaseLabel, upcomingBoundaries } from '@/machine/selectors';
import type { WorkoutConfig, WorkoutState } from '@/machine/types';

/**
 * How many boundaries to schedule ahead.
 *
 * Both platforms cap pending local notifications (iOS at 64), and a long
 * workout has more transitions than that, so only the next stretch is
 * scheduled. They are rescheduled from scratch on every return to the
 * foreground, which keeps a long workout covered in rolling windows.
 */
const MAX_SCHEDULED = 30;

/**
 * Announces phase changes while the app is backgrounded.
 *
 * This is a fallback, not the timer. The machine remains the source of truth
 * and recomputes from timestamps on return, so a notification that is delayed,
 * suppressed or never delivered cannot desynchronise the workout.
 */
export function useBoundaryNotifications(
  state: WorkoutState,
  config: WorkoutConfig,
  enabled: boolean,
): void {
  // Read through refs: scheduling happens when the app is backgrounded, using
  // whatever the state was at that moment.
  const stateRef = useRef(state);
  stateRef.current = state;
  const configRef = useRef(config);
  configRef.current = config;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: false,
      }),
    });

    if (Platform.OS === 'android') {
      void Notifications.setNotificationChannelAsync('workout', {
        name: 'Workout phases',
        importance: Notifications.AndroidImportance.HIGH,
      }).catch(() => {
        // Without a channel the notification simply will not post.
      });
    }
  }, []);

  useEffect(() => {
    const cancelAll = () => {
      void Notifications.cancelAllScheduledNotificationsAsync().catch(() => {
        // Nothing scheduled, or notifications unavailable.
      });
    };

    const scheduleAhead = async () => {
      if (!enabledRef.current) return;

      const permission = await Notifications.getPermissionsAsync().catch(() => null);
      if (permission === null || !permission.granted) return;

      const now = Date.now();
      const boundaries = upcomingBoundaries(stateRef.current, configRef.current, now, MAX_SCHEDULED);

      for (const boundary of boundaries) {
        const seconds = Math.max(1, Math.round((boundary.at - now) / 1000));
        const complete = boundary.phase === 'complete';
        await Notifications.scheduleNotificationAsync({
          content: {
            title: complete ? 'Workout complete' : phaseLabel(boundary.phase),
            body: complete ? 'Nice work. You finished every interval.' : 'Next phase starting.',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            channelId: 'workout',
          },
        }).catch(() => {
          // Skip this one rather than abandoning the rest.
        });
      }
    };

    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        // Back in the foreground: the screen shows the truth, so pending
        // notifications would only duplicate it.
        cancelAll();
      } else {
        void scheduleAhead();
      }
    });

    return () => {
      subscription.remove();
      cancelAll();
    };
  }, []);
}

/**
 * Ask for notification permission.
 *
 * Called when a workout starts rather than at launch, so the prompt arrives
 * with a reason the user can see. Declining is fine: the in-app cues and the
 * background audio session are unaffected.
 */
export async function requestBoundaryNotificationPermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    if (!existing.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}
