# HIIT Timer

A high-intensity interval training timer, built from the Figma design at
`EPaud18kec9EhlTM2euWjr` on Expo SDK 57 / React Native 0.86 with TypeScript strict mode.

```bash
npm install
npm start          # Expo dev server
npm test           # state machine unit tests
npm run typecheck  # tsc --noEmit
```

---

## What it does

A workout runs as `getReady → (warmup → [exercise ⇄ rest] × sets → recovery) × cycles → cooldown →
complete`. Warmup and recovery default to zero and are skipped entirely when so, which reduces the
sequence to the plain five-phase workout most people will use.

Every timer screen shows the phase, a countdown, the set and cycle position, and the time left in
the whole workout.

## Architecture

```
src/
  theme/tokens.ts       every style value in the app
  theme/typography.ts   composite text styles
  machine/
    types.ts            Phase, WorkoutConfig, WorkoutState, WorkoutEvent
    machine.ts          pure reducer + configuration bounds
    selectors.ts        derived values — remaining time, totals, upcoming boundaries
    machine.test.ts     47 unit tests, fake clock
  components/           presentational components
  workout/              React bindings: provider, cues, notifications, routing
app/                    expo-router routes
```

### The state machine is the only source of truth

`reduce(state, event, config, now)` is pure: it takes the clock as an argument and never reads it.
Tests drive it with a fake clock, and nothing about it depends on React. Screens read machine state
and render it; none of them owns timing logic. Navigation follows the machine's phase rather than
driving it (`useWorkoutRouting`).

### Timing

Remaining time is **never** accumulated from ticks. A phase stores when it started and how long it
lasts, and everything else is derived:

```
remaining = phaseStartedAt + phaseDurationMs - now
```

The 100ms tick exists only to repaint. A late, early or dropped tick changes what is on screen for a
moment and nothing else.

When a phase ends, the next one begins **at the boundary**, not at the tick that noticed it. That one
detail is what makes backgrounding work: returning to the foreground runs exactly the same `TICK`,
which consumes every phase that elapsed and lands on the correct current phase — whether that is one
boundary later or a hundred. A test asserts that ticking continuously for 47 seconds and sleeping for
47 seconds produce identical state.

Pausing freezes the remaining time; resuming rebases `phaseStartedAt` so the phase continues instead
of restarting.

## Design tokens

`src/theme/tokens.ts` is the only permitted source of style values. No component contains a hex
colour, font size, weight, spacing value, radius or shadow.

The Figma variable collection has **one mode**, so there is no light/dark split to wire up — phase
colour comes from `color.state.*`, not from the system colour scheme.

**The design has no radii and no effects.** The style-guide swatches are drawn rounded, but every
real component renders square-cornered, so nothing is missing.

### Values not in the Figma variables

Some values appear in the screens but have no variable. They are collected in a block in `tokens.ts`
marked `DERIVED FROM DESIGN — NOT IN FIGMA VARIABLES`, each recording the node it came from, so the
gap stays auditable and they can be promoted into Figma later:

- **`size.*`** — button height 58, nav header 64, icon container 42, icon sizes 32/24/20/16, picker
  active row 72, stat column 99, success mark 64, plus a 44 minimum touch target.
- **`opacity.*`** — drum rows 0.15 and 0.45, the hidden settings title 0, plus pressed and disabled
  steps (the design specifies neither state, so both are opacity rather than invented colours).
- **`borderWidth.pickerActiveRow`** — 2.
- **`flexRatio.*`** — the timer screen's three vertical gaps as ratios rather than the fixed 75/123/48
  point offsets of the 390×844 artboard, so the layout survives other screen sizes.

### Audit

`grep` over `src/` and `app/` for hex colours, and for numeric literals in `fontSize`, `fontWeight`,
`lineHeight`, `letterSpacing`, `padding*`, `margin*`, `gap`, `border*`, and layout properties:

- Hex colours outside `tokens.ts`: **none**.
- Numeric literals in style properties outside `tokens.ts`: **none**.
- Colour keywords (`'white'`, `'black'`, …) in styles: **none**.

Two files legitimately contain bare numbers and are excluded above: `tokens.ts`, which defines the
values, and `iconSources.ts`, whose numbers are the exported SVGs' intrinsic dimensions — asset
metadata used to preserve aspect ratio, not style values.

## Icons

Exported from Figma as SVG through the plugin bridge, verbatim except that their baked-in
`fill`/`stroke` colours are routed through `currentColor`, so one export serves every screen and
takes its colour from a token at the call site. The settings-header glyph turned out to be the filter
vector reused — verified by comparing path geometry — so it is not duplicated.

## Audio and haptics

The design specifies only "short beep" for a phase's final three seconds (annotations on nodes 0:4
and 0:195). The cues are therefore synthesised tones, generated by `tools/generate-cues.py`, which
documents why each has its shape. They are deliberately distinguishable: work rises, rest falls to a
low tone, cooldown descends, completion is a rising arpeggio, and the countdown tick is a brief blip.

Every transition plays a cue with a paired haptic — heavier for a phase change, light for a countdown
tick. **Audio and haptics mute independently**, which is the point: silencing sound in a quiet gym
should not cost the vibration. Both toggles are in the long-press sheet.

Every audio and haptic call is individually guarded. Silent mode, lost audio focus, or a device with
no haptic motor degrades to silence rather than taking the workout down.

## Background behaviour — what actually works

**None of this was verified on a physical iOS or Android device.** It was developed and rendered
against the web target in this environment, which has no real audio session, no haptics and no OS
notification scheduler. What follows is what the configuration is intended to do and what the
platforms actually permit — not observed behaviour. Treat it as needing a device pass before release.

What is configured:

- `shouldPlayInBackground: true` and `playsInSilentMode: true` on the audio session, with
  `UIBackgroundModes: ["audio"]` declared for iOS.
- Local notifications scheduled at each upcoming phase boundary when the app leaves the foreground,
  cancelled on return.
- `expo-keep-awake` held for the duration of a workout, including while paused.

The real platform limits:

- **iOS.** The audio background mode keeps the session alive while audio is actually playing. Short
  cues separated by long silences are not a continuous stream, so the session can be suspended
  between them; audio-only cueing is not reliable across a long backgrounded workout. Local
  notifications are the dependable path there. iOS also caps pending local notifications at 64.
- **Android.** Background execution is throttled by Doze and by per-manufacturer battery management,
  which varies widely between vendors. Sustained background playback beyond roughly three minutes
  needs a foreground service (`setActiveForLockScreen`), which this build does not set up. Notification
  delivery is generally reliable; exact timing under Doze is not.
- **Both.** Notifications are a *fallback*, never the timer. The machine recomputes from timestamps
  on return, so a notification that is delayed, suppressed or never delivered cannot desynchronise
  the workout. The worst case is a missed announcement, not a wrong clock.

Only the next 30 boundaries are scheduled, since both platforms cap pending notifications; they are
rescheduled from scratch each time the app is backgrounded.

## Accessibility

- Every control has a label; terse ones (`SKIP`, `SET`) carry a fuller spoken label.
- The countdown is a polite live region and is announced as a duration — "1 minute 30 seconds
  remaining" — rather than as "01:30", which screen readers read as a time of day.
- Info rows merge label and value into one node, so it reads "Sets, 3 of 10".
- Picker drums are accessibility **adjustables**, so they respond to increment and decrement instead
  of requiring a scroll gesture to be imitated.
- Skip, restart and exit are exposed as accessibility actions on the pause bar, so they are reachable
  without the long-press gesture.
- Controls meet the 44pt minimum touch target.
- Icons are decorative and hidden from assistive technology, since each sits inside a labelled
  control.
- Text scales with the system setting. The timer screens scroll rather than clip when large font
  sizes outgrow the screen. The 120pt countdown and the picker drum are the two exceptions that do
  not scale: the countdown would overflow any screen, and the drum is a fixed-pitch control whose
  rows must stay aligned with the selection highlight.

## Decisions taken during the build

| Question | Decision |
|---|---|
| Figma lists 8 settings, the brief 5 | Build all 8; the machine models cycles, sets, warmup and recovery. |
| Timer screens show only PAUSE | Keep the design exactly; skip/restart/exit/mute live in a long-press sheet. |
| Values with no Figma variable | Extend `tokens.ts` in a separately marked block, recording source nodes. |
| Single-mode variable collection | No dark-mode wiring. |
| Warmup and recovery have no frames | Render the neutral treatment until they are designed. |

Two sequencing rules were chosen rather than asked about, and are one-line changes if either should
be the other way:

- Rest runs after **every** exercise, including a cycle's final set.
- Recovery runs **between** cycles only, never after the last, which goes straight to cooldown.

## Known gaps

- **Warmup and recovery have no design.** They currently render the neutral treatment. They need
  frames before release.
- **No device verification.** See the background section above.
- **Settings are in-memory**, as the brief specified. They reset on relaunch.
- The intro's "Workouts completed" counter is per-session for the same reason.
- The design's `Total time` reads `10:27` on every frame, which does not reconcile with the other
  mock values on those screens. It is treated as illustrative; the real total is computed from the
  configuration.
