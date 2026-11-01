const nodes=[
 ['start','owl','calm','The sky-lamp over the workshop has gone dark. Two couriers answer the call.',[['Ask the owl for help','owl-route'],['Wake the robot','robot-route']]],
 ['owl-route','owl','worried','The owl remembers a spare filament in the clock tower.',[['Climb at dusk','tower'],['Search the garden first','garden']],['owl-route']],
 ['robot-route','robot','calm','The robot has a spare coil, but its storage hatch is jammed.',[['Fetch the oil can','shed'],['Try the magnet','magnet'],['Find the other courier','shared-1']],['robot-route']],
 ['tower','owl','joy','The filament glows when lifted. The tower bell rings.',[['Return to the workshop','ending-light']],['tower']],
 ['garden','owl','calm','The garden path hides a cracked glass bulb.',[['Mend it with resin','tower'],['Leave it and climb','ending-dim']],['garden']],
 ['shed','robot','joy','The oil can loosens the hatch with one turn.',[['Install the coil','ending-light']],['shed']],
 ['magnet','robot','worried','The magnet snaps the hatch shut instead.',[['Try the latch from below','shed'],['Give up for the night','ending-dim']],['magnet']],
 ['ending-light','owl','joy','The workshop lamp burns warm again. The sky-lanterns answer back.',[],['ending-light'],'light'],
 ['ending-dim','robot','worried','The lamp waits through one more quiet night.',[],['ending-dim'],'dim'],
 ['shared-1','robot','calm','Both couriers compare their maps at the door.',[['Split up','shared-2'],['Stay together','ending-dawn']],['shared-1']],
 ['shared-2','owl','calm','The owl spots the filament from above; the robot holds the ladder.',[['Reach the lamp','ending-dawn']],['shared-2']],
 ['ending-dawn','owl','joy','By first light the lamp is lit and the third ending is reached.',[],['ending-dawn'],'dawn'],
].map(([id,speaker,emotion,text,choices,flags=[],ending])=>({id,speaker,emotion,text,choices:choices.map(([label,next])=>({label,next})),flags,ending}));
export const STORY_NODES=Object.freeze(nodes);
export const NODE_MAP=new Map(nodes.map(node=>[node.id,node]));
export class StorySession{
 constructor(snapshot){this.nodeId='start';this.history=[];this.flags=[];this.visited=['start'];this.endings=[];this.transitionProgress=1;if(snapshot)this.apply(snapshot)}
 get node(){const node=NODE_MAP.get(this.nodeId);if(!node)throw Error('Unknown story node.');return node}
 choose(index){const choice=this.node.choices[index];if(!choice)return false;this.history.push(this.nodeId+':'+index);this.nodeId=choice.next;this.transitionProgress=0;if(!this.visited.includes(this.nodeId))this.visited.push(this.nodeId);for(const flag of this.node.flags)if(!this.flags.includes(flag))this.flags.push(flag);if(this.node.ending&&!this.endings.includes(this.node.ending))this.endings.push(this.node.ending);return true}
 advance(ms){if(this.transitionProgress<1)this.transitionProgress=Math.min(1,this.transitionProgress+Math.max(0,Math.min(250,ms))/500)}
 snapshot(){return {nodeId:this.nodeId,history:[...this.history],flags:[...this.flags],visited:[...this.visited],endings:[...this.endings],transitionProgress:this.transitionProgress}}
 apply(snapshot){validateSnapshot(snapshot);this.nodeId=snapshot.nodeId;this.history=[...snapshot.history];this.flags=[...snapshot.flags];this.visited=[...snapshot.visited];this.endings=[...snapshot.endings];this.transitionProgress=snapshot.transitionProgress}
}
export function validateSnapshot(snapshot){
 if(!snapshot||!NODE_MAP.has(snapshot.nodeId)||!Array.isArray(snapshot.history)||snapshot.history.length>64||!Array.isArray(snapshot.flags)||snapshot.flags.length>32||!snapshot.flags.every(value=>typeof value==='string'&&NODE_MAP.has(value))||!Array.isArray(snapshot.visited)||snapshot.visited.length>12||!snapshot.visited.every(id=>NODE_MAP.has(id))||new Set(snapshot.visited).size!==snapshot.visited.length||!snapshot.visited.includes('start')||!Array.isArray(snapshot.endings)||snapshot.endings.length>3||new Set(snapshot.endings).size!==snapshot.endings.length||!snapshot.endings.every(value=>['light','dim','dawn'].includes(value))||!Number.isFinite(snapshot.transitionProgress)||snapshot.transitionProgress<0||snapshot.transitionProgress>1)throw Error('Invalid story save.');
 let current='start';
 for(const entry of snapshot.history){const match=typeof entry==='string'&&/^([a-z0-9-]+):([0-3])$/.exec(entry);if(!match||match[1]!==current)throw Error('Invalid story save.');const choice=NODE_MAP.get(current)?.choices[Number(match[2])];if(!choice)throw Error('Invalid story save.');current=choice.next}
 if(current!==snapshot.nodeId)throw Error('Invalid story save.');
}
export function encodeSave(session){return JSON.stringify({format:'ksu.game.save',schemaVersion:1,appId:'story-cards',kind:'logical-snapshot',gameBuild:'rules-1',contentVersion:'1',payload:session.snapshot()})}
export function decodeSave(text){if(typeof text!=='string'||text.length>1024*1024)throw Error('Story save is too large.');let envelope;try{envelope=JSON.parse(text)}catch{throw Error('Story save is not valid JSON.')}if(envelope?.format!=='ksu.game.save'||envelope.schemaVersion!==1||envelope.appId!=='story-cards'||envelope.kind!=='logical-snapshot')throw Error('Not a Story Cards save.');validateSnapshot(envelope.payload);return envelope.payload}
