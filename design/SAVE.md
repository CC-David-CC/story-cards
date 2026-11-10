> Original design reference from 2026-10-30. This describes intended behavior, not current implementation or qualification. The current app README is authoritative for status. Pseudocode and template JSON here are documentation, not build entries.

# Save and load — Story Cards

## Promise shown to the user

Exact logical story node, flags and complete choice history.

## Authoritative fields

- story version
- current node and choice history
- flags and visited nodes
- ending collection
- text/audio settings

Use the versioned envelope from [SAVE-LOAD.md](../../../../../docs/games/design-reference/SAVE-LOAD.md), app id `story-cards`, a content/rules version and any required engine fingerprint. Derived render positions, DOM, texture handles, Rive artboards and in-flight worker jobs are excluded. XR anchors, tracked poses and hardware identities are excluded.

Pause at a committed game boundary, cancel uncommitted input, capture only the documented snapshot/checkpoint and report what was actually written. A visible Save operation must not quietly write an older checkpoint without saying so. On load validate size, app/version, finite values, ids and invariants, prepare a replacement, then commit; failure leaves the current game intact. The game resumes paused with an explicit Resume.

Restart/load invalidates callbacks, held inputs and queued AI results from the previous state.

File integration is unbound until the real host services are inspected. Do not invent host method names, atomic write guarantees or another hidden document store. Use explicit Save As/conflict handling appropriate to the actual provider.
