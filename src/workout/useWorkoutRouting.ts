import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { isTimedPhase } from '@/machine/selectors';
import type { Phase } from '@/machine/types';

/** Where each phase lives. Navigation follows machine state, never the reverse. */
function routeFor(phase: Phase): '/' | '/workout' | '/complete' {
  if (phase === 'idle') return '/';
  if (phase === 'complete') return '/complete';
  return '/workout';
}

/**
 * Keeps the visible route in step with the machine.
 *
 * Screens never decide where to go next; they render whatever phase the machine
 * reports, and this moves the router when that phase implies a different route.
 * Settings and the pickers sit outside this scheme — they are pushed on top and
 * are not phase-driven.
 */
export function useWorkoutRouting(phase: Phase): void {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const target = routeFor(phase);

    // Leave modal-ish routes (settings, pickers) alone while they are open,
    // unless the workout itself has moved on to a different phase group.
    const onWorkoutRoute =
      pathname === '/' || pathname === '/workout' || pathname === '/complete';
    if (!onWorkoutRoute && isTimedPhase(phase)) return;

    if (pathname !== target) router.replace(target);
  }, [phase, pathname, router]);
}
