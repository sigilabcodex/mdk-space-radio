(async function(){
  'use strict';

  const M=window.IntegratedPreviewModel;
  const $=id=>document.getElementById(id);
  const audio=$('radio');
  const card=$('integratedNowCard');
  const legacyCard=$('legacyNowCard');
  const toolbar=$('integratedPreviewToolbar');
  const canvas=$('previewWaveform');
  const ctx=canvas.getContext('2d');
  const cover=$('previewCover');
  const legacyCover=$('legacyCover');
  const coverButton=$('coverButton');
  const dialog=$('coverDialog');
  const fixtures=await fetch('../player-widget-lab/fixtures.json',{cache:'no-store'}).then(response=>response.json());
  const tracks=fixtures.tracks;
  const waves=new Map();

  let index=1;
  let currentWave=null;
  let connection='disconnected';
  let transitioning=false;
  let metadataToken=0;
  let lastCoverOpener=null;
  let currentMode='radio';

  const audioUrl=track=>'/local-media/tracks/'+encodeURIComponent(track.audio_file);
  const coverUrl=track=>'/local-media/covers/'+encodeURIComponent(track.cover_file);
  const waveUrl=track=>'../player-widget-lab/'+track.waveform;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function fmt(value){
    if(!Number.isFinite(value)||value<0)return'--:--';
    const seconds=Math.floor(value),hours=Math.floor(seconds/3600),minutes=Math.floor((seconds%3600)/60),remaining=String(seconds%60).padStart(2,'0');
    return hours?hours+':'+String(minutes).padStart(2,'0')+':'+remaining:minutes+':'+remaining;
  }

  async function waveform(track){
    if(!waves.has(track.id)){
      const data=await fetch(waveUrl(track),{cache:'no-store'}).then(response=>response.json());
      if(data.schema!=='mdk-waveform-v1'||data.column_count!==800||data.peaks.length!==800)throw Error('invalid waveform '+track.id);
      waves.set(track.id,data);
    }
    return waves.get(track.id);
  }

  function trackData(track){
    return{track_id:track.id,track_title:track.title,release_id:track.release_id,release_title:track.release_title,track_duration_seconds:track.duration_seconds,track_elapsed_seconds:audio.currentTime||0,listeners:0,absolute_cover_url:coverUrl(track),local_cover_url:coverUrl(track),source_format:'mp3',bitrate:160,transmission_log:[],release_text_fragments:[]};
  }

  function syncLower(track){
    if(window.UIWidgets)window.UIWidgets.syncTelemetry(trackData(track),audio.currentTime||0);
  }

  function setConnection(next){
    connection=next;
    card.dataset.connection=next;
    legacyCard.dataset.connection=next;
    const presentation=M.connectionPresentation(next);
    const button=$('connectButton');
    button.querySelector('span').textContent=presentation.symbol;
    button.querySelector('b').textContent=presentation.label;
    button.setAttribute('aria-pressed',String(next==='connected'));
    button.setAttribute('aria-busy',String(next==='connecting'));
    $('connectionNote').textContent=presentation.note;
    $('playBtn').textContent=next==='connected'?'Disconnect':next==='connecting'?'Acquiring signal…':'Connect';
    $('playBtn').setAttribute('aria-pressed',String(next==='connected'));
    $('playBtn').setAttribute('aria-busy',String(next==='connecting'));
    $('statusLine').textContent=next==='connected'?'status local · fixture audio':next==='unavailable'?'status: audio unavailable':'status: local preview ready';
    draw();
  }

  function updateGain(raw){
    const value=Math.max(0,Math.min(100,Math.round(Number(raw))));
    $('previewVolume').value=String(value);
    $('legacyVolume').value=String(value);
    $('previewVolume').setAttribute('aria-valuenow',String(value));
    $('previewVolume').setAttribute('aria-valuetext',value+' percent');
    $('gainValue').value=String(value);
    $('gainValue').textContent=String(value);
    card.style.setProperty('--gain-percent',value+'%');
    audio.volume=value/100;
  }

  function setCover(track,missing=false){
    const fallback=$('missingCover');
    cover.hidden=missing;
    fallback.hidden=!missing;
    coverButton.disabled=missing;
    if(missing){
      cover.removeAttribute('src');
      cover.removeAttribute('alt');
      legacyCover.removeAttribute('src');
      legacyCover.alt='Cover unavailable';
      return;
    }
    const source=coverUrl(track);
    const alt=track.release_id+' '+track.release_title+' cover';
    cover.src=source;
    cover.alt=alt;
    legacyCover.src=source;
    legacyCover.alt=alt;
    coverButton.setAttribute('aria-label','Open '+track.release_id+' release artwork');
    cover.onerror=()=>setCover(track,true);
  }

  function renderLegacyMetadata(track,missing=false){
    $('legacyTrack').textContent=missing?'Unknown transmission':track.title;
    $('legacyRelease').textContent=missing?'Metadata unavailable':track.release_id+' · '+track.release_title+' · track '+String(track.track_number).padStart(2,'0');
    const query=encodeURIComponent(track.release_id+' '+track.release_title);
    $('legacyArchive').href='https://archive.org/search?query='+query;
    $('legacyGetTrack').href='https://mdklabs.bandcamp.com/';
  }

  function renderMetadata(track,mode=$('degradedState').value){
    const token=++metadataToken;
    if(mode==='delayed'){
      $('previewTrackTitle').textContent='Acquiring signal…';
      $('previewReleaseId').textContent='—';
      $('previewAlbum').textContent='Metadata delayed';
      $('previewTrackNumber').textContent='—';
      $('legacyTrack').textContent='Acquiring signal…';
      $('legacyRelease').textContent='Metadata delayed';
      setTimeout(()=>{if(token===metadataToken)renderMetadata(track,'normal');},1800);
      return;
    }
    const missing=mode==='missing-metadata';
    $('previewTrackTitle').textContent=missing?'Unknown transmission':track.title;
    $('previewReleaseId').textContent=missing?'—':track.release_id;
    $('previewAlbum').textContent=missing?'Metadata unavailable':track.release_title;
    $('previewTrackNumber').textContent=missing?'—':String(track.track_number).padStart(2,'0');
    renderLegacyMetadata(track,missing);
    setCover(track,mode==='missing-cover');
    const query=encodeURIComponent(track.release_id+' '+track.release_title);
    $('archiveAction').href='https://archive.org/search?query='+query;
    $('bandcampAction').href='https://mdklabs.bandcamp.com/';
    $('officialSiteAction').href='https://mdkband.com/';
    syncLower(track);
  }

  function canvasSize(){
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(2,devicePixelRatio||1),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    ctx.setTransform(ratio,0,0,ratio,0,0);
    return{width:rect.width,height:rect.height};
  }

  function radioAccent(){
    const raw=getComputedStyle(card).getPropertyValue('--radio-accent-rgb').trim().replace(/,/g,' ');
    const values=raw.split(/\s+/).map(Number).filter(Number.isFinite);
    return values.length>=3?values.slice(0,3):[117,255,194];
  }

  function draw(){
    const{width,height}=canvasSize();
    ctx.clearRect(0,0,width,height);
    if(!currentWave||width<=1||height<=1)return;
    const track=tracks[index];
    const progress=M.progressRatio(audio.currentTime,Number.isFinite(audio.duration)?audio.duration:track.duration_seconds);
    const blocky=card.dataset.waveVariant==='blocky';
    const active=connection==='connected';
    const accent=radioAccent();
    const accentColor='rgb('+accent.join(' ')+')';
    const count=blocky?M.adaptiveColumnCount(width,track.duration_seconds):Math.max(96,Math.min(220,Math.floor(width/3)));
    const peaks=M.downsample(currentWave.peaks,count),rms=M.downsample(currentWave.rms,count),center=height/2,step=width/count;
    for(let i=0;i<count;i++){
      const played=i/count<=progress,x=i*step+step/2,peak=Math.max(1.5,peaks[i]*height*.39),body=Math.max(1.5,rms[i]*height*.34);
      const color=active&&played?accentColor:active?'rgb(59 91 74)':'rgb(63 78 69)';
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=active?(played?.9:.48):.43;
      if(blocky){
        const amplitude=Math.max(body,peak*.48),barWidth=Math.max(2.5,Math.min(6,step*.62));
        ctx.fillRect(x-barWidth/2,center-amplitude,barWidth,amplitude*2);
      }else{
        ctx.lineWidth=Math.max(1.7,Math.min(2.5,step*.5));
        ctx.beginPath();ctx.moveTo(x,center-peak);ctx.lineTo(x,center+peak);ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
    const head=width*progress;
    ctx.strokeStyle=active?'rgba(237,245,239,.78)':'rgba(183,205,191,.28)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(head,0);ctx.lineTo(head,height);ctx.stroke();
    const marker=Math.max(4,width*Math.min(.035,8/track.duration_seconds));
    ctx.fillStyle='rgba(255,208,120,.09)';ctx.fillRect(width-marker,0,marker,height);
    ctx.strokeStyle='rgba(255,208,120,.52)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(width-marker,0);ctx.lineTo(width-marker,height);ctx.stroke();ctx.setLineDash([]);
  }

  function syncTime(){
    const duration=Number.isFinite(audio.duration)?audio.duration:tracks[index].duration_seconds;
    const elapsed=audio.currentTime||0;
    $('previewElapsed').textContent=fmt(elapsed);
    $('previewRemaining').textContent='−'+fmt(Math.max(0,duration-elapsed));
    $('legacyElapsed').textContent=fmt(elapsed);
    $('legacyDuration').textContent=fmt(duration);
    $('legacyProgressBar').style.width=String(M.progressRatio(elapsed,duration)*100)+'%';
    draw();
    if(window.UIWidgets)window.UIWidgets.tick(trackData(tracks[index]),null,elapsed);
  }

  async function loadTrack(next,{play=false,render=true}={}){
    index=(next+tracks.length)%tracks.length;
    $('previewTrack').value=String(index);
    currentWave=await waveform(tracks[index]);
    audio.src=audioUrl(tracks[index]);
    audio.load();
    if(render)renderMetadata(tracks[index]);
    syncTime();
    if(play){
      try{await audio.play();setConnection('connected');}catch(_){setConnection('unavailable');}
    }
  }

  async function connect(){
    if($('degradedState').value==='unavailable'){setConnection('unavailable');return;}
    setConnection('connecting');
    if($('degradedState').value==='slow')await sleep(1500);
    try{audio.volume=Number($('previewVolume').value)/100;await audio.play();setConnection('connected');}catch(_){setConnection('unavailable');}
  }

  function disconnect(){audio.pause();setConnection('disconnected');}

  function clearTransition(){
    card.classList.remove('transition-forecast','transition-flicker','transition-persistence','transition-writing','transition-wave');
    $('incomingSignal').hidden=true;
    $('metadataBand').style.opacity='';
    cover.classList.remove('cover-out','cover-in');
    transitioning=false;
  }

  async function typeTitle(text){
    const node=$('previewTrackTitle');
    node.textContent='';
    for(let i=0;i<text.length;i++){
      node.textContent+=text[i];
      if(i===3)$('metadataBand').style.opacity='1';
      await sleep(24);
    }
  }

  async function simpleTransition(next,wasPlaying){
    card.style.opacity='.35';
    await sleep(180);
    await loadTrack(next,{play:false,render:true});
    card.style.opacity='1';
    if(wasPlaying)await connect();
    clearTransition();
  }

  async function triggerTransition(){
    if(transitioning||currentMode!=='radio')return;
    transitioning=true;
    const next=(index+1)%tracks.length,nextTrack=tracks[next],nextWave=await waveform(nextTrack),wasPlaying=!audio.paused;
    if(document.body.classList.contains('reduced-motion-preview')||matchMedia('(prefers-reduced-motion: reduce)').matches){await simpleTransition(next,wasPlaying);return;}
    $('incomingSignal').hidden=false;card.classList.add('transition-forecast');await sleep(2200);
    card.classList.remove('transition-forecast');card.classList.add('transition-flicker');await sleep(650);
    card.classList.remove('transition-flicker');card.classList.add('transition-persistence');cover.classList.add('cover-out');await sleep(430);
    audio.pause();index=next;$('previewTrack').value=String(index);currentWave=nextWave;audio.src=audioUrl(nextTrack);audio.load();
    setCover(nextTrack,false);renderLegacyMetadata(nextTrack,false);cover.classList.remove('cover-out');cover.classList.add('cover-in');
    $('metadataBand').style.opacity='0';$('previewReleaseId').textContent=nextTrack.release_id;$('previewAlbum').textContent=nextTrack.release_title;$('previewTrackNumber').textContent=String(nextTrack.track_number).padStart(2,'0');
    card.classList.remove('transition-persistence');card.classList.add('transition-writing');await typeTitle(nextTrack.title);
    card.classList.remove('transition-writing');card.classList.add('transition-wave');draw();syncLower(nextTrack);await sleep(850);
    if(wasPlaying)await connect();
    clearTransition();
  }

  async function advanceWithoutExperiment(){
    const wasPlaying=!audio.paused;
    await loadTrack(index+1,{play:wasPlaying,render:true});
  }

  let actionMenuOpener=null;
  const actionMenus={track:'trackActions',listen:'listenActions',support:'supportActions'};
  const actionToggles={track:'getTrackToggle',listen:'listenToggle',support:'supportToggle'};

  function setActionMenu(name=null,{restoreFocus=false}={}){
    $('primaryActions').hidden=Boolean(name);
    Object.entries(actionMenus).forEach(([key,id])=>{
      $(id).hidden=key!==name;
      $(actionToggles[key]).setAttribute('aria-expanded',String(key===name));
    });
    if(name){
      actionMenuOpener=actionToggles[name];
      $(actionMenus[name]).querySelector('a,button').focus({preventScroll:true});
    }else if(restoreFocus&&actionMenuOpener){
      $(actionMenuOpener).focus({preventScroll:true});
    }
  }

  function openCover(){
    if(coverButton.disabled||!cover.src)return;
    lastCoverOpener=coverButton;
    $('dialogCover').src=cover.currentSrc||cover.src;
    $('dialogCover').alt=cover.alt;
    dialog.showModal();
    $('closeCoverDialog').focus({preventScroll:true});
  }

  function closeCover(){if(dialog.open)dialog.close();}

  function setViewMode(mode){
    currentMode=mode;
    document.body.classList.toggle('view-radio',mode==='radio');
    document.body.classList.toggle('view-focus',mode==='focus');
    document.body.classList.toggle('view-immersive',mode==='immersive');
    card.hidden=mode!=='radio';
    toolbar.hidden=mode!=='radio';
    legacyCard.hidden=mode==='radio';
    document.querySelectorAll('[data-view-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.viewMode===mode)));
    if(mode==='radio')requestAnimationFrame(draw);
  }

  tracks.forEach((track,trackIndex)=>{
    const option=document.createElement('option');
    option.value=String(trackIndex);
    option.textContent=track.release_id+' · '+track.title;
    $('previewTrack').append(option);
  });

  $('previewTrack').addEventListener('change',async event=>{disconnect();await loadTrack(Number(event.target.value));});
  $('waveVariant').addEventListener('change',event=>{card.dataset.waveVariant=event.target.value;draw();});
  $('degradedState').addEventListener('change',event=>{if(event.target.value==='unavailable')disconnect();renderMetadata(tracks[index]);setConnection(event.target.value==='unavailable'?'unavailable':'disconnected');});
  $('reducedMotionPreview').addEventListener('change',event=>document.body.classList.toggle('reduced-motion-preview',event.target.checked));
  $('triggerTransition').addEventListener('click',triggerTransition);
  $('connectButton').addEventListener('click',()=>connection==='connected'||connection==='connecting'?disconnect():connect());
  $('playBtn').addEventListener('click',()=>connection==='connected'||connection==='connecting'?disconnect():connect());
  $('previewVolume').addEventListener('input',event=>updateGain(event.target.value));
  $('legacyVolume').addEventListener('input',event=>updateGain(event.target.value));
  $('getTrackToggle').addEventListener('click',()=>setActionMenu('track'));
  $('listenToggle').addEventListener('click',()=>setActionMenu('listen'));
  $('supportToggle').addEventListener('click',()=>setActionMenu('support'));
  ['trackBack','listenBack','supportBack'].forEach(id=>$(id).addEventListener('click',()=>setActionMenu(null,{restoreFocus:true})));
  coverButton.addEventListener('click',openCover);
  $('closeCoverDialog').addEventListener('click',closeCover);
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeCover();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeCover();});
  dialog.addEventListener('close',()=>{if(lastCoverOpener)lastCoverOpener.focus({preventScroll:true});});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.open)closeCover();});
  audio.addEventListener('timeupdate',syncTime);
  audio.addEventListener('ended',()=>currentMode==='radio'?triggerTransition():advanceWithoutExperiment());
  audio.addEventListener('error',()=>setConnection('unavailable'));
  window.addEventListener('resize',()=>{if(currentMode==='radio')draw();});
  window.addEventListener('mdk:palette-changed',draw);
  document.querySelectorAll('[data-view-mode]').forEach(button=>button.addEventListener('click',()=>setViewMode(button.dataset.viewMode)));

  function clock(){
    const now=new Date();
    $('localClock').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
    $('localClock').dateTime=now.toISOString();
  }

  clock();setInterval(clock,1000);
  updateGain(82);
  setActionMenu();
  setViewMode('radio');
  await loadTrack(index);
  setConnection('disconnected');
}());
