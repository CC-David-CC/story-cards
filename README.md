# Story Cards — desktop integration

Story Cards is a twelve-node branching narrative with three endings. The story
graph, choice history, visited nodes, discovered endings and transition state
are deterministic and app-owned. Choices remain semantic HTML buttons, with a
Canvas presentation for the current scene.

The app exports synchronous `mount(host)`, supports desktop and phone-sized
layouts, saves and opens through the signed-in desktop's My files, restores
paused and routes saved files back from Files. Restart and open discard
confirmation, changed/conflicting-file notices and idempotent teardown are
included.

Saving marks the window protected until storage responds, pauses the story and
captures an exact logical snapshot. Later choices remain unsaved. Open and
restart confirmations recheck the story after the answer so newer progress cannot
be discarded. The story pauses when its desktop window loses focus, is minimized,
rolled up, hidden, or the browser loses visibility; Resume is explicit. Loaded
history is replayed during validation so malformed edges or a mismatched current
scene are rejected.

## Remaining gates

No authored `story-cast.riv` is supplied. The scene card is a clearly labeled
procedural fallback, with no claim that Rive acceptance is complete. Authored
character art, environment art and narration audio remain to be supplied.
Physical-phone testing remains open; automated desktop and emulated-phone
playthrough evidence is maintained in the app tests.

## Local tests

```sh
npm ci --prefix active-system/tools/app-builder --ignore-scripts
npm ci --prefix tests --ignore-scripts
node apps/system/story-cards/tests/model.test.mjs
python3 active-system/scripts/build-public-apps.py --output .build/story-cards-test --apps story-cards
python3 -m http.server 18414 --bind 127.0.0.1 --directory .build/story-cards-test
CODI_TEST_CDP=http://127.0.0.1:19414 CODI_STORY_URL=http://127.0.0.1:18414/ node tests/story-cards-browser.test.mjs
```

The fixture must be served as the build root's `index.html`. The registered
desktop account test requires the shared game registration added by the primary
integration branch.

If a previously opened or saved story is deleted elsewhere, saving it again
reports the deletion instead of silently recreating it. Choose a different save
path to keep a copy. The account-backed desktop and phone-sized workflow tests
cover this alongside server synchronization; physical touch remains untested.
