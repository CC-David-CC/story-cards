import './style.css';
import {StorySession,encodeSave,decodeSave} from './model.mjs';

export function mount(host){
 const {make,textButton,appInput}=host.ui,owner=host.w?.launchContext?.owner||host.storage.signedInSubject(),state=host.w?.storyCards??{dirty:false};
 if(host.w){host.w.storyCards=state;host.w.ownerSub=owner;}
 let session=new StorySession(),paused=true,dirty=false,disposed=false,busy=false,unwatch=()=>{},watchSerial=0,watchCheck=0,savedPath=null,savedVersion=null,revision=0,frame=0,last=performance.now(),reduced=false,highContrast=false,resizeObserver=null,windowObserver=null,observedWindow=null;
 const body=make('div','window-content story-app'),toolbar=make('div','story-toolbar'),canvas=document.createElement('canvas'),prompt=make('div','story-prompt'),choices=make('div','story-choices'),history=docElement('details'),warning=make('div','story-warning'),status=make('div','app-status');
 canvas.width=720;canvas.height=300;canvas.className='story-stage';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Animated story card');
 const resume=textButton('Start story',()=>{if(!valid()||busy)return;paused=!paused;if(!paused)session.advance(1000);refresh();});
 const restart=textButton('Restart',()=>void restartStory()),openButton=textButton('Open from My files',()=>void open()),saveButton=textButton('Save to My files',()=>void save());
 toolbar.append(resume,restart,openButton,saveButton);
 const settings=docElement('details'),motion=document.createElement('input'),contrast=document.createElement('input'),motionLabel=make('label','story-setting','Reduce motion '),contrastLabel=make('label','story-setting','High contrast ');
 motion.type='checkbox';motion.setAttribute('aria-label','Reduce motion');contrast.type='checkbox';contrast.setAttribute('aria-label','High contrast');motionLabel.prepend(motion);contrastLabel.prepend(contrast);settings.append(make('summary','','Settings'),motionLabel,contrastLabel);
 const help=docElement('details');help.append(make('summary','','How to play'),make('p','story-note','Read each scene, then choose a response. Choices update the story only after they are selected. Replay to discover all three endings.'));
 const saveDetails=docElement('details'),saveFields=make('div','story-save-fields'),path=appInput('Story save path',host.w?.launchContext?.path||'/Story Cards.game.json'),folder=textButton('Choose folder',()=>void chooseFolder());
 saveDetails.className='story-save';saveFields.append(path,folder);saveDetails.append(make('summary','','Save location'),saveFields);
 const transcript=make('div','story-transcript'),transcriptSummary=make('summary','','Transcript');history.append(transcriptSummary,transcript);history.className='story-history';
 warning.hidden=true;warning.setAttribute('role','status');status.setAttribute('role','status');
 body.append(toolbar,canvas,prompt,choices,history,warning,settings,help,saveDetails,status);
 const context=canvas.getContext('2d');
 const valid=()=>!disposed&&!host.signal.aborted&&body.isConnected&&owner===host.storage.signedInSubject();
 const say=text=>{if(valid())status.textContent=text};
 const mark=()=>{dirty=true;state.dirty=true;revision++};
 const clearDirty=()=>{dirty=false;state.dirty=false};
 const setBusy=value=>{busy=value;resume.disabled=value;restart.disabled=value;openButton.disabled=value;saveButton.disabled=value;};
 const syncLayout=()=>{const rect=body.getBoundingClientRect();canvas.style.width='100%';canvas.style.height=Math.max(180,Math.min(300,Math.round(rect.width*.42)))+'px'};
 const wrap=(ctx,text,x,y,width,height)=>{const words=text.split(/\s+/);let line='',row=y;for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){ctx.fillText(line,x,row);line=word;row+=height}else line=test}if(line)ctx.fillText(line,x,row)};
 function draw(){
  if(!context)return;
  const node=session.node,cw=canvas.width,ch=canvas.height,progress=reduced?1:session.transitionProgress;
  context.fillStyle=highContrast?'#05070b':'#30283a';context.fillRect(0,0,cw,ch);
  context.globalAlpha=.25+.75*progress;
  context.fillStyle=node.speaker==='owl'?'#86d4bd':'#8bb8e8';context.beginPath();context.arc(150,145,72,0,Math.PI*2);context.fill();
  context.fillStyle='#f4edda';context.beginPath();context.arc(125,130,25,0,Math.PI*2);context.arc(175,130,25,0,Math.PI*2);context.fill();
  context.fillStyle='#1b2432';context.beginPath();context.arc(125,130,8,0,Math.PI*2);context.arc(175,130,8,0,Math.PI*2);context.fill();
  context.fillStyle=node.emotion==='worried'?'#d16d64':'#d5ad5e';context.beginPath();context.moveTo(150,145);context.lineTo(164,163);context.lineTo(136,163);context.closePath();context.fill();
  context.fillStyle=highContrast?'#fff':'#eef1f7';context.font='600 22px system-ui';context.fillText(node.speaker.toUpperCase(),260,70);
  context.font='20px system-ui';wrap(context,node.text,260,108,410,28);
  if(node.ending){context.fillStyle='#f0cf73';context.font='600 18px system-ui';context.fillText('ENDING · '+node.ending.toUpperCase(),260,245)}
  context.globalAlpha=1;
  canvas.setAttribute('aria-label',`${node.speaker}: ${node.text}`);prompt.textContent=node.ending?'Ending reached. Restart to explore another path.':paused?'Story paused. Press Resume to continue.':'Choose what happens next.';
 }
 function refresh(){
  resume.textContent=paused?'Resume':'Pause';resume.setAttribute('aria-label',resume.textContent);
  choices.replaceChildren();
  if(!paused)for(const [index,choice] of session.node.choices.entries()){
   const button=textButton(choice.label,()=>{if(!valid()||paused)return;session.choose(index);mark();draw();refresh()});
   choices.append(button);
  }
  transcript.replaceChildren(...session.history.map((item,index)=>make('p','story-history-row',`${index+1}. ${item.replace(':',' · choice ')}`)));
  if(session.endings.length)transcript.append(make('p','story-endings','Endings found: '+session.endings.join(', ')));
  if(paused)say('Story paused. Press Resume when ready.');else if(!session.node.ending)say('Choose a response to continue the story.');draw();
 }
 function suspend(){if(disposed||paused)return;paused=true;refresh();say('Story paused when its window lost attention. Press Resume when ready.');}
 const visibility=()=>{if(document.hidden)suspend();};
 window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',visibility);
 function watchWindow(){const target=body.closest('.window');if(target!==observedWindow){windowObserver?.disconnect();observedWindow=target;windowObserver=target?new MutationObserver(()=>{if(observedWindow&&(observedWindow.hidden||!observedWindow.classList.contains('focused')||observedWindow.classList.contains('rolled')))suspend();}):null;windowObserver?.observe(target,{attributes:true,attributeFilter:['class','hidden']});}if(target&&(target.hidden||!target.classList.contains('focused')||target.classList.contains('rolled')))suspend();}
 async function restartStory(){
  if(busy||!valid())return;const before=revision;setBusy(true);paused=true;refresh();
  try{if(dirty&&!await host.ui.confirm('Restart the story and discard unsaved progress?',{title:'Restart story',confirmLabel:'Restart',cancelLabel:'Keep story',danger:true,signal:host.signal})){say('Story paused. Press Resume to continue.');return;}if(!valid())return;if(revision!==before)throw Error('The story changed while confirming; try again.');session=new StorySession();clearDirty();savedPath=null;savedVersion=null;if(host.w)delete host.w.launchContext;unwatch();watchSerial++;revision++;path.value='/Story Cards.game.json';refresh();say('Story restarted and paused.');}catch(error){say('Could not restart story: '+error.message)}finally{setBusy(false)}
 }
 function watch(c,p,version){unwatch();const serial=++watchSerial,check=async()=>{const checkId=++watchCheck;if(!valid()||!c.valid()||savedPath!==p||savedVersion!==version)return;let text='';try{const file=await c.files.stat(p);text=file.status==='conflict'?'This story has conflicting copies. Resolve them in Files.':file.version!==version?'The saved story changed. Your current story is unchanged.':'';}catch{text='The saved story is unavailable. Your current story is unchanged.'}if(valid()&&serial===watchSerial&&checkId===watchCheck){warning.textContent=text;warning.hidden=!text}};unwatch=c.files.subscribe?.(check)||(()=>{});queueMicrotask(check)}
 async function save(){
  if(busy||!valid())return;const wasDirty=dirty,captured=revision,text=encodeSave(session),targetName=path.value;setBusy(true);paused=true;dirty=true;state.dirty=true;refresh();let committed=false;
  try{const c=await host.storage.mirrorFileContext(),target=c.path(targetName);if(!target.toLowerCase().endsWith('.game.json'))throw Error('Use a .game.json file name.');let expected=null;try{const old=await c.files.stat(target);if(old.status==='conflict')throw Error('Resolve the conflict in Files first.');if(target===savedPath&&savedVersion&&old.version!==savedVersion)throw Error('The saved story changed. Save a copy or reopen it.');if(target!==savedPath&&!await host.ui.confirm('Replace '+target+'?',{title:'Replace saved story',confirmLabel:'Replace',cancelLabel:'Cancel',danger:true,signal:host.signal})){say('Save cancelled.');return}expected=old.version}catch(error){if(error.message!=='File not found.')throw error}if(!valid()||!c.valid())return;const result=await c.files.write(target,new TextEncoder().encode(text),expected);savedPath=target;savedVersion=result.version;path.value=target;host.w&&(host.w.launchContext=Object.freeze({version:1,storage:'mirror',path:target,owner}),host.w.title=target.split('/').pop()+' — Story Cards');dirty=revision!==captured;state.dirty=dirty;committed=true;watch(c,target,result.version);say(result.status==='conflict'?'Story saved with a conflict. Resolve it in Files.':dirty?'Saved an earlier story state; newer progress remains unsaved.':'Story saved to My files; syncing with the server.');
  }catch(error){say('Could not save story: '+error.message)}finally{if(!committed){dirty=wasDirty;state.dirty=wasDirty;}setBusy(false)}
 }
 async function open(selected){
  if(busy||!valid())return;const before=revision;setBusy(true);paused=true;refresh();try{if(dirty&&!await host.ui.confirm('Open a saved story and discard current progress?',{title:'Unsaved story',confirmLabel:'Discard progress',cancelLabel:'Keep story',danger:true,signal:host.signal})){say('Story paused.');return}if(!valid())return;if(revision!==before)throw Error('The story changed while confirming; try again.');const choice=selected||await host.storage.pickFile({extensions:['.json'],signal:host.signal});if(!choice)return;const c=await host.storage.mirrorFileContext(),target=c.path(choice),file=await c.files.read(target);if(!valid()||!c.valid())return;if(file.status==='conflict')throw Error('Resolve the conflict in Files first.');const replacement=new StorySession(decodeSave(new TextDecoder('utf-8',{fatal:true}).decode(file.data)));if(revision!==before)throw Error('The story changed while opening; try again.');session=replacement;revision++;savedPath=target;savedVersion=file.version;path.value=target;host.w&&(host.w.launchContext=Object.freeze({version:1,storage:'mirror',path:target,owner}),host.w.title=target.split('/').pop()+' — Story Cards');clearDirty();watch(c,target,file.version);refresh();say('Story loaded and paused.');
  }catch(error){say('Could not open story: '+error.message)}finally{setBusy(false)}
 }
 async function chooseFolder(){try{const dir=await host.storage.pickFolder({signal:host.signal});if(dir===null)return;const c=await host.storage.mirrorFileContext();path.value=c.path((dir==='/'?'':dir)+'/'+c.name(path.value.split('/').pop()||'Story Cards.game.json'))}catch(error){say('Could not choose folder: '+error.message)}}
 motion.addEventListener('change',()=>{reduced=motion.checked;draw()});contrast.addEventListener('change',()=>{highContrast=contrast.checked;draw()});
 const loop=now=>{if(disposed)return;watchWindow();if(!paused){const delta=Math.min(250,Math.max(0,now-last));if(session.transitionProgress<1){session.advance(delta);draw()}}last=now;frame=requestAnimationFrame(loop)};
 resizeObserver=new ResizeObserver(syncLayout);resizeObserver.observe(body);syncLayout();queueMicrotask(watchWindow);frame=requestAnimationFrame(loop);refresh();
 if(host.w?.launchContext?.storage==='mirror'&&host.w.launchContext.owner===owner){const target=host.w.launchContext.path;path.value=target;const loadWhenConnected=(attempt=0)=>{if(disposed||host.signal.aborted)return;if(!body.isConnected&&attempt<60)setTimeout(()=>loadWhenConnected(attempt+1),16);else if(valid())void open(target)};queueMicrotask(loadWhenConnected)}
 return {element:body,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);watchSerial++;watchCheck++;unwatch();windowObserver?.disconnect();window.removeEventListener('blur',suspend);document.removeEventListener('visibilitychange',visibility);resizeObserver.disconnect();body.replaceChildren()}};
}
function docElement(tag){return document.createElement(tag)}
