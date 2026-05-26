# Live Call Co-Pilot Take-Home

## The brief

A sales rep is on a live call with a prospect while an AI streams typed events into your component tree. Build the rep-facing surface for that live moment. You decide what they see, what waits, and what disappears.

## Setup

`npm install && npm run dev`

## What's provided

- Event types: [`src/types/events.ts`](src/types/events.ts)
- Three scenarios: [`scenarios/happy.json`](scenarios/happy.json), [`scenarios/messy.json`](scenarios/messy.json), [`scenarios/degraded.json`](scenarios/degraded.json)
- Scenario player: [`src/lib/scenarioPlayer.ts`](src/lib/scenarioPlayer.ts)
- Dev control bar: [`src/components/DevControlBar.tsx`](src/components/DevControlBar.tsx)
- `CallHeader` stub: [`src/components/CallHeader.tsx`](src/components/CallHeader.tsx)

The app starts with only the header and dev controls visible. The control bar can be hidden for presentation, but should not be deleted.

## What you build

Everything else. Component decomposition, state shape, visual design, what's inside a battle card, how to handle collisions and stale suggestions, the empty state, what's persistent vs. reactive — all your call.

## Prompts to answer in `NOTES.md`

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
- 20-minute walkthrough at debrief. Be ready to defend every choice.
