> Original design reference from 2026-10-30. This describes intended behavior, not current implementation or qualification. The current app README is authoritative for status. Pseudocode and template JSON here are documentation, not build entries.

# Story Cards

**Interactive animated story · Rive web runtime + application state · single-player · phone required · flat-screen app**

> Planned design, not implemented or browser-tested. `index.pseudo.mjs` is an explanatory entry point, not a playable game.

## Experience

Explore a tiny branching adventure through expressive animated cards and clear choices.

## What this demonstrates

- Multiple artboards and character states
- Data-bound text and choice UI
- Branching authored content

## Rules and complete loop

- A finite, validated story graph has choice nodes and three endings. Choices commit before transitions.
- No generative backend or AI dependency. Text is authored, captions available and history readable.
- Loading returns to a node/choice state, not a half-finished visual transition.

## Bounded polished release

Twelve story nodes, three endings, two characters and replayable choices.

- Readable type, skip animation and transcript
- Transitions respect reduced-motion settings
- Replays do not overwrite unlocked endings silently

No multiplayer, accounts, server simulation or generic editor is required. Start, rules/help, play/activity, pause, outcome/goal feedback and retry must all be complete. Settings include volume/mute, reduced motion, contrast and game-specific options where meaningful. State changes occur in the game model; animations illustrate them.

## Rive inside this app

Animated cast, environment mood and transitions; choices stay semantic and accessible. The requested asset is `story-cast.riv`; it is **not included**. See [RIVE.md](RIVE.md) for the authoring/integration contract. A placeholder or unrelated animated logo does not satisfy this requirement.

## Save behavior

Exact logical story node, flags and complete choice history. See [SAVE.md](SAVE.md). Loading starts paused; resume is explicit. Restart and load cancel stale callbacks and any owned AI work.

## Build sequence

Implement the rule loop in [gameplay.pseudo.txt](gameplay.pseudo.txt); bind the exact app lifecycle from [index.pseudo.mjs](index.pseudo.mjs); complete [CONTROLS.md](CONTROLS.md); author/integrate [RIVE.md](RIVE.md); then satisfy [ACCEPTANCE.md](ACCEPTANCE.md). Do not add XR or a 3D engine solely to widen the technology list.

Target wave: **2**. Integrator first reads [AGENTS.md](../../../../../docs/games/design-reference/ORIGINAL-INSTRUCTIONS.md); do not guess host APIs from symbolic helper names.

Use original/licensed artwork and audio. Keep the scope small enough to polish; expand content only after the release gates pass.
