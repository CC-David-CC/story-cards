> Original design reference from 2026-10-30. This describes intended behavior, not current implementation or qualification. The current app README is authoritative for status. Pseudocode and template JSON here are documentation, not build entries.

# Rive brief — Story Cards

**Asset to author:** `story-cast.riv` · **artboard:** `Main` · **state machine:** `Presentation`.

These are required names for the proposed asset contract, not existing files or built-in Rive API fields. No `.riv` binary is included. Verify the chosen authoring/runtime version supports the actual binding design.

## Role and staging

Animated cast, environment mood and transitions; choices stay semantic and accessible.

Use original coherent artwork consistent with this game's theme. Keep the activity readable in a narrow app window and phone portrait; animated overlays cannot hide controls.

## Data contract

| Property | Type / range | Authority |
|---|---|---|
| `scene` | integer | Game/application model |
| `speaker` | enum owl/robot | Game/application model |
| `emotion` | enum calm/worried/joy | Game/application model |
| `transitionProgress` | number 0..1 | Game/application model |

One-shot presentation triggers: `enter`, `choice`, `ending`.

Authored visual states: `idle`, `speak`, `react`, `transition`. These states describe animation, not a second game-state machine.

Use app-controlled, typed data binding and a verified runtime bridge. Validate all names/types when loading. The asset may emit only allowlisted UI intents such as an activated menu action. It must not award score, spend currency, change physics or access host services directly. Keep one input-dispatch path to prevent duplicate commands.

## Render path

One app-owned Rive drawing surface; multiple artboards may share the surface while retaining independent mutable state.

The game owns advancement and texture updates. State machines advance once per presentation frame, not once per stereo eye. Freeze dirty/static panels; retain semantic labels and accessible actions. Test alpha, Y orientation, UV fit and phone-size sharpness. Do not create a new texture per frame or use Rive pose as a collision shape.

See [RIVE-COMPOSITION.md](../../../../../docs/games/design-reference/RIVE-COMPOSITION.md) for Phaser CanvasTexture / Three CanvasTexture / Babylon DynamicTexture guidance and renderer tradeoffs. This ZIP provides no tested adapter.

## Acceptance of the artwork

Actual asset loads; every required property has a visible verified effect; all named triggers are exercised; normal/reduced-motion modes are readable; authored imagery/fonts/audio have rights recorded; two app instances animate independently; disposal releases this instance only. A functional placeholder keeps this gate **open**.
