import assert from 'node:assert/strict';
import {STORY_NODES,NODE_MAP,StorySession,encodeSave,decodeSave} from '../model.mjs';

assert.equal(STORY_NODES.length,12);
assert.equal(new Set(STORY_NODES.filter(node=>node.ending).map(node=>node.ending)).size,3);
for(const node of STORY_NODES)for(const choice of node.choices)assert.ok(NODE_MAP.has(choice.next),`${node.id} points to ${choice.next}`);

const session=new StorySession();
assert.equal(session.nodeId,'start');
assert.equal(session.choose(0),true);
assert.equal(session.nodeId,'owl-route');
assert.deepEqual(session.history,['start:0']);
assert.equal(session.choose(0),true);
assert.equal(session.nodeId,'tower');
assert.equal(session.choose(0),true);
assert.equal(session.node.id,'ending-light');
assert.deepEqual(session.endings,['light']);
assert.equal(session.choose(0),false);

const restored=new StorySession(decodeSave(encodeSave(session)));
assert.deepEqual(restored.snapshot(),session.snapshot());
const invalid=JSON.parse(encodeSave(session));
invalid.payload.nodeId='missing';
assert.throws(()=>decodeSave(JSON.stringify(invalid)),/Invalid story save/);
invalid.payload={...session.snapshot(),transitionProgress:2};
assert.throws(()=>decodeSave(JSON.stringify({...JSON.parse(encodeSave(session)),payload:invalid.payload})),/Invalid story save/);
invalid.payload={...session.snapshot(),history:['owl-route:0']};
assert.throws(()=>decodeSave(JSON.stringify({...JSON.parse(encodeSave(session)),payload:invalid.payload})),/Invalid story save/);

const all=new StorySession();
all.choose(1);all.choose(2);all.choose(1);
assert.equal(all.nodeId,'ending-dawn');
all.apply(session.snapshot());assert.deepEqual(all.endings,['light']);
console.log('PASS story graph, choices, endings, exact save restore and invalid saves');
