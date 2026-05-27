# Live Call Co-Pilot Take-Home

## The brief

A sales rep is on a live call with a prospect while an AI streams typed events into your component tree. The rep's attention belongs to the conversation, not your UI — every pixel has to earn its place. Build the rep-facing surface: what they see, what waits, what disappears.

## Setup

`npm install && npm run dev`

## Quick context

If you're new to sales tooling:

- **Co-pilot** — a real-time assistant running alongside the rep during the call, surfacing prompts and references in the moment.
- **Battle card** — a short competitive reference the rep glances at when a competitor's name comes up.
- **Call phases** — a sales call typically moves through `intro → discovery → demo → objection → close`. The AI tags the current phase as the conversation shifts.

## What's provided

- Event types: [`src/types/events.ts`](src/types/events.ts)
- Three scenarios: [`scenarios/happy.json`](scenarios/happy.json), [`scenarios/messy.json`](scenarios/messy.json), [`scenarios/degraded.json`](scenarios/degraded.json)
- Scenario player: [`src/lib/scenarioPlayer.ts`](src/lib/scenarioPlayer.ts)
- Dev control bar: [`src/components/DevControlBar.tsx`](src/components/DevControlBar.tsx)
- `CallHeader` stub: [`src/components/CallHeader.tsx`](src/components/CallHeader.tsx)

The app starts with only the header and dev controls visible. The control bar can be hidden for presentation, but should not be deleted.

## Where to start

`useScenarioPlayer()` returns the scenario player from the MobX root store. Subscribe with `onEvent` to receive events in arrival order:

```tsx
import { useEffect } from 'react';
import { useScenarioPlayer } from '../stores/RootStoreContext';

const player = useScenarioPlayer();

useEffect(() => {
  return player.onEvent((event) => {
    // event.type === 'transcript' | 'phase_change' | 'talk_ratio' | 'suggestion'
  });
}, [player]);
```

If you'd rather observe a reactive cumulative log, `player.emittedEvents` holds the same data, also arrival-ordered.

Two stubs are scaffolded as starting points — restructure, rename, or split them however makes sense:

- [`src/components/CallSurface.tsx`](src/components/CallSurface.tsx) — entry point for your UI, already wired into `App.tsx` with the subscription pattern.
- [`src/components/BattleCard.tsx`](src/components/BattleCard.tsx) — typed prop shape for the battle-card widget.

## What you build

The rep-facing surface and whatever components, hooks, or stores you compose into it. Visual design, what's inside a battle card, how to handle collisions and stale suggestions, the empty state, what's persistent vs. reactive — all your call. We've stubbed `CallSurface` and `BattleCard` as a starting point, but if a different UI setup works better for you, use that — restructure, replace, or delete them as needed.

## NOTES.md

Answer each prompt in [`NOTES.md`](NOTES.md) at the repo root (the file is stubbed with the prompts already):

- What states does your UI handle and what does each look like? (loading, empty, partial, stale, error, collision)
- What does it do when two suggestions fire at once? When a battle card goes stale? When the stream is silent for 30 seconds?
- If you added a manager view (watching a rep's call live), how would you approach it? Describe — don't build.
- What accessibility, responsiveness, or performance tradeoffs did you make, and why?
- What would you cut, change, or add with another day?

## Rules

- Stack is locked. Design is free.
- **Clean working beats ambitious half-done.**
- No requirement for tests, Storybook, or specific patterns. What you invest in is part of the signal.
- Time budget: 4–6 hours.
