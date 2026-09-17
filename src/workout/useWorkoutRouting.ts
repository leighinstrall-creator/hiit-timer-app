import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';

import type { Phase } from '@/machine/types';

/** The routes this hook governs. Anything else is left alone. */
function isWorkoutRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/workout' || pathname === '/complete';
}

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
    // Settings and the pickers are pushed on top of the workout and are not
    // phase-driven. Redirecting from them would eject the user the instant they
    // opened one, so this only ever moves between the phase-driven routes.
    if (!isWorkoutRoute(pathname)) return;

    const target = routeFor(phase);
    if (pathname !== target) router.replace(target);
  }, [phase, pathname, router]);
}
