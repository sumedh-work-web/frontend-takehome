# NOTES

Answer each prompt below. Be brief — these exist to surface judgment, not to be exhaustive.

## 1. States your UI handles

What states does your UI handle and what does each look like? (loading, empty, partial, stale, error, collision)

Throughout the implementation, I optimized for reducing cognitive load rather than maximizing information density. During a live sales call, the representative's attention belongs to the customer, not the interface.

**Empty / idle** - before any events arrive, the surface stays calm. `Live coaching` and `Call transcript` use the same centered empty-state structure with distinct icons (`BulbOutlined` and `FileTextOutlined`), while `Talk ratio` explains that balance appears after a few exchanges.

**Partial** - phase, talk ratio, transcript, and coaching render independently as valid events arrive. A missing talk-ratio payload does not block the rest of the surface, and overflow stays inside the relevant cards.

**Collision** - when multiple suggestions are active concurrently, the UI organizes them into a **Hero/Queue stack**. The highest-priority suggestion appears as the `Priority cue` (Hero), while the remaining active suggestions sit in a compact Queue. Dismissing any card removes it; dismissing the Hero promotes the next prioritized item.

**Stale** - question, objection, and sentiment prompts disappear after 30 seconds. A battle card decays into a collapsed dashed reference strip that can be expanded for another 30 seconds, or until a phase change.

**Error / bad data** - malformed suggestions, unknown suggestion kinds, invalid sentiment severities, and incomplete transcript lines are ignored safely. The UI surfaces a compact `Data gap` badge in the live coaching header, keeping error communication visible without shifting the coaching stack.

**Delayed** - when `arrivalT` lags behind `t`, the UI marks the transcript line or coaching item as delayed so the rep is not misled about its freshness.

## 2. Concurrent and decaying events

What does it do when two suggestions fire at once? When a battle card goes stale? When the stream is silent for 30 seconds?

**Two suggestions at once** - All valid suggestions stay active for their useful lifetime. While multiple suggestions are active, the UI ranks them by urgency, shows the highest-priority item as the Hero, and keeps the remaining active items in the Queue until they expire or are dismissed.

**Battle card goes stale** - after 30 seconds, a battle card decays into a collapsed dashed reference strip. Clicking it reveals the differentiators, objections, and details in a muted stale state, preserving access without cluttering the screen. It vanishes after another 30 seconds or on a phase change.

**Decay indicator** - suggestions show a horizontal `DecayBar` for remaining active TTL. This gives a peripheral freshness cue without forcing the rep to read age text.

**Silent for 30 seconds** - while playback is running, the coaching header changes from `Listening` to `No recent updates`. The surface treats silence as a valid state, not an error.

## 3. Manager view (describe, don't build)

If you added a manager view watching a rep's call live, how would you approach it?

I would reuse the event-shaping rules but change the presentation from rep guidance to monitoring. The manager version would show a compact grid of live calls with current phase, talk-ratio balance, recent transcript evidence, and the highest-severity active signal. Managers need breadth and escalation cues, not a single large `Now` card.

## 4. Tradeoffs

What accessibility, responsiveness, or performance tradeoffs did you make, and why?

**Accessibility** - updates use `aria-live="polite"` because coaching is advisory, not urgent enough to interrupt screen-reader flow. Empty states stay visually consistent but use distinct icons. Global `prefers-reduced-motion` overrides remove transition and animation durations, and non-text marks use `flex-shrink: 0` so dense displays do not crush them.

**Responsiveness** - the layout prioritizes desktop because that is the realistic working context, with a fixed center workspace between the sticky header and controls. On narrow screens (width <= 860px) or height-constrained screens (height <= 600px), the container releases to `height: auto`, columns stack, and panels scroll naturally. The 5-pill phase stepper collapses to a compact status pill like `Demo (3/5)` to prevent header overflow.

**Performance** - for the provided scenarios, deriving state from the emitted event log keeps scrubbing deterministic. At production scale, I would memoize heavier derivations and virtualize the transcript once event volume grows.

**Scope cut** - I did not add snooze or full suggestion history. Those could be useful, but they add interaction complexity that was not necessary to show judgment in this slice.

## 5. With another day

What would you cut, change, or add with another day?

I would add a lightweight suggestion history so a rep can recover a recently expired prompt without re-scrubbing the call.

I would add a **Click to Swap** interaction to the Hero/Queue stack. Clicking a queued suggestion would promote it to the Hero slot and push the current Hero back into the Queue, preserving the single-hero layout while allowing manual inspection.

I would also add a minimal, non-obstructive floating teaser on long battle cards when a new queued cue arrives, so the rep can notice additional active coaching without losing focus or having to hunt for it below the fold.

I would also add focused viewport-behavior tests around zoom levels and card-scoped scrolling, plus tighten keyboard support around the scenario controls and transcript rail.
