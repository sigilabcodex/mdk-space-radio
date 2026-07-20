'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const ROOT=__dirname;
const REPO=path.resolve(ROOT,'../..');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'preview.css'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'preview.js'),'utf8');
const model=require('./preview-model.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(REPO,'.artifacts/player-widget-lab/fixtures.json'),'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO,file))).digest('hex');
const section=(start,end)=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));
const radio=section('<article class="now-card integrated-now-card"','<article class="now-card legacy-now-card"');
const legacy=section('<article class="now-card legacy-now-card"','<dialog id="coverDialog"');

test('production shell remains around the mode-specific player compositions',()=>{
  for(const marker of ['ambient-background','class="topbar"','About MDK','telemetry-instruments','archiveRegister','relay-terminal','class="footer"'])assert.ok(html.includes(marker),marker);
  assert.match(radio,/id="integratedNowCard"/);
  assert.match(legacy,/id="legacyNowCard"/);
});

test('Radio alone exposes the integrated waveform widget and lab toolbar',()=>{
  assert.match(app,/card\.hidden=mode!==\'radio\'/);
  assert.match(app,/toolbar\.hidden=mode!==\'radio\'/);
  assert.match(app,/legacyCard\.hidden=mode===\'radio\'/);
  assert.match(css,/body:not\(\.view-radio\) \.integrated-preview-toolbar,body:not\(\.view-radio\) \.integrated-now-card\{display:none!important\}/);
});

test('Focus uses the prior sober production-style player with no console controls',()=>{
  assert.match(legacy,/class="now-card legacy-now-card"/);
  for(const className of ['class="cover"','class="meta"','class="track"','class="release"','class="progress-wrap"','player-controls','track-links','support-links'])assert.ok(legacy.includes(className),className);
  assert.doesNotMatch(legacy,/previewWaveform|waveVariant|triggerTransition|metadata-band|incoming-signal/);
  assert.match(css,/body\.view-focus \.legacy-now-card,body\.view-immersive \.legacy-now-card\{display:grid\}/);
});

test('Immersive keeps the production-style composition and existing mode class',()=>{
  assert.match(app,/classList\.toggle\(\'view-immersive\',mode===\'immersive\'\)/);
  assert.match(legacy,/id="playBtn"/);
  assert.match(legacy,/class="controls player-controls"/);
  assert.doesNotMatch(app,/view-immersive[\s\S]{0,100}(remove|replace|innerHTML)/);
});

test('mode changes never recreate or replace the persistent primary audio node',()=>{
  assert.equal((html.match(/data-role="persistent-primary-audio"/g)||[]).length,1);
  assert.equal((html.match(/<audio /g)||[]).length,1);
  assert.match(app,/const audio=\$\(\'radio\'\)/);
  assert.doesNotMatch(app,/createElement\([\'\"]audio|new Audio|replaceChildren|outerHTML/);
  const modeFunction=app.slice(app.indexOf('function setViewMode'),app.indexOf('tracks.forEach'));
  assert.doesNotMatch(modeFunction,/audio\.|loadTrack|\.src=/);
});

test('cover and Radio content use one stretched row with matching top and bottom anchors',()=>{
  assert.match(css,/\.integrated-now-card\{[^}]*align-items:stretch/);
  assert.match(css,/\.integrated-cover-column,\.integrated-player-meta\{[^}]*align-self:stretch/);
  assert.match(css,/\.integrated-cover-frame\{[^}]*aspect-ratio:1\/1/);
  assert.match(css,/\.integrated-cover-frame \.cover\{[^}]*width:100%;height:100%;aspect-ratio:1\/1;object-fit:cover/);
  assert.match(css,/\.integrated-player-meta\{[^}]*grid-template-rows:repeat\(6,auto\);align-content:space-between;row-gap:5px/);
  assert.doesNotMatch(css,/\.integrated-player-meta\{[^}]*1fr/);
  const actionRule=css.match(/\.integrated-actions\{([^}]*)\}/)[1];
  assert.doesNotMatch(actionRule,/align-self:end|margin-top:auto/);
  assert.doesNotMatch(css,/\.integrated-now-card\{[^}]*(height|min-height):\s*\d+px/);
});

test('all real title cases flow naturally, including a two-line composition',()=>{
  for(const title of ['The Differences','Casting the shadow','I was waiting on you'])assert.ok(fixtures.tracks.some(track=>track.title===title),title);
  const rule=css.match(/\.integrated-track-title\{([^}]*)\}/)[1];
  assert.doesNotMatch(rule,/min-height|height:/);
  assert.match(rule,/overflow-wrap:anywhere/);
  assert.match(rule,/text-wrap:balance/);
  assert.doesNotMatch(rule,/white-space:nowrap/);
});

test('Refined Thin is the default and blocky remains lab-only',()=>{
  assert.match(radio,/data-wave-variant="thin"/);
  assert.match(html,/<option value="thin" selected>REFINED THIN · RECOMMENDED<\/option>/);
  assert.match(html,/<option value="blocky">ADAPTIVE BLOCKY<\/option>/);
  assert.doesNotMatch(radio,/id="waveVariant"/);
  assert.match(section('id="integratedPreviewToolbar"','<article class="now-card integrated-now-card"'),/id="waveVariant"/);
});

test('waveform is reduced by approximately 20 to 30 percent and retains progress semantics',()=>{
  const height=Number(css.match(/#previewWaveform\{[^}]*height:(\d+)px/)[1]);
  assert.ok(height>=68&&height<=74,height);
  assert.match(app,/progress=M\.progressRatio/);
  assert.match(app,/const head=width\*progress/);
  assert.match(app,/const marker=/);
  assert.match(radio,/previewElapsed/);
  assert.match(radio,/previewRemaining/);
});

test('adaptive block density still respects mobile and desktop bounds',()=>{
  for(const duration of [75.572245,358.321633,1311.529796]){
    const mobile=model.adaptiveColumnCount(390,duration),desktop=model.adaptiveColumnCount(900,duration);
    assert.ok(mobile>=48&&mobile<=72,mobile);
    assert.ok(desktop>=96&&desktop<=160,desktop);
  }
});

test('Radio has exactly three equal primary actions in one row',()=>{
  const primary=section('<div id="primaryActions"','<div id="trackActions"');
  for(const label of ['↓</span> GET THIS TRACK','▶</span> LISTEN OPTIONS','♥</span> SUPPORT'])assert.ok(primary.includes(label),label);
  assert.equal((primary.match(/<button /g)||[]).length,3);
  assert.match(css,/\.action-row-primary\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.integrated-actions\{[^}]*grid-template-rows:auto;gap:0/);
  for(const id of ['getTrackToggle','listenToggle','supportToggle'])assert.match(primary,new RegExp('id="'+id+'"[^>]*aria-expanded="false"'));
});

test('all three submenus replace the primary row in place and Back restores it',()=>{
  const expected={trackActions:['OFFICIAL SITE','BANDCAMP','INTERNET ARCHIVE','BACK'],listenActions:['MP3','M3U','PLS','BACK'],supportActions:['COFFEE','KO-FI','BANDCAMP','BACK']};
  for(const[id,labels]of Object.entries(expected)){
    const menu=section('<div id="'+id+'"','</div>');
    for(const label of labels)assert.ok(menu.includes(label),id+' '+label);
  }
  assert.match(css,/\.action-stage>\.action-row\{grid-area:1\/1\}/);
  assert.match(css,/\.action-submenu\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)\}/);
  assert.match(app,/const actionMenus=\{track:'trackActions',listen:'listenActions',support:'supportActions'\}/);
  assert.match(app,/\$\('primaryActions'\)\.hidden=Boolean\(name\)/);
  assert.match(app,/\$\(id\)\.hidden=key!==name/);
  assert.match(app,/setActionMenu\(null,\{restoreFocus:true\}\)/);
});

test('submenu destinations are explicit, safe, and never invented placeholders',()=>{
  for(const id of ['officialSiteAction','bandcampAction','archiveAction'])assert.match(radio,new RegExp('id="'+id+'" href="https://'));
  assert.match(radio,/href="\/stream\.mp3">MP3/);
  assert.match(radio,/href="\/listen\.m3u" download>M3U/);
  assert.match(radio,/href="\/listen\.pls" download>PLS/);
  assert.doesNotMatch(radio,/href="#"|javascript:/i);
});

test('gain slider is calibrated, instrument-styled, and keeps native keyboard behavior',()=>{
  assert.match(radio,/id="previewVolume" type="range" min="0" max="100" step="1"/);
  for(const mark of ['<span>0</span>','<span>25</span>','<span>50</span>','<span>75</span>','<span>100</span>'])assert.ok(radio.includes(mark),mark);
  assert.match(css,/#previewVolume\{[^}]*appearance:none/);
  assert.match(css,/#previewVolume::-webkit-slider-thumb\{[^}]*border-radius:1px/);
  assert.match(app,/previewVolume\'\)\.addEventListener\(\'input\'/);
  assert.match(app,/aria-valuetext/);
  assert.doesNotMatch(app,/keydown[\s\S]{0,100}previewVolume/);
});

test('Gain fill is state-driven and updates immediately at native range values',()=>{
  assert.match(css,/--gain-percent:82%/);
  assert.match(app,/card\.style\.setProperty\('--gain-percent',value\+'%'\)/);
  assert.match(css,/\[data-connection="connected"\] #previewVolume::-moz-range-track\{[^}]*var\(--gain-percent\)[^}]*#07110d/);
  assert.match(css,/\n#previewVolume::-moz-range-track\{[^}]*linear-gradient\(90deg,#0b261b,#07110d\)/);
  assert.match(app,/previewVolume'\)\.addEventListener\('input',event=>updateGain/);
});

test('illumination follows disconnected, acquiring, connected, and palette states',()=>{
  assert.match(css,/--radio-accent-rgb:var\(--cover-accent-1,117 255 194\)/);
  assert.match(css,/\[data-connection="disconnected"\] #previewWaveform/);
  assert.match(css,/\[data-connection="connecting"\] \.integrated-waveform::after\{[^}]*acquisition-sweep/);
  assert.match(css,/\[data-connection="connected"\] \.connection-note\{[^}]*signal-breathe/);
  assert.match(app,/window\.addEventListener\('mdk:palette-changed',draw\)/);
  assert.match(app,/const active=connection==='connected'/);
});

test('reduced motion removes breathing, acquisition sweep, and control pulse',()=>{
  assert.match(css,/\.reduced-motion-preview \[data-connection="connected"\] \.connection-note/);
  assert.match(css,/\.reduced-motion-preview \[data-connection="connecting"\] \.integrated-waveform::after\{animation:none!important\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*?\[data-connection="connecting"\] \.integrated-connect/);
});

test('connection labels and successful transition sequence remain intact',()=>{
  for(const[state,label]of [['disconnected','CONNECT'],['connecting','ACQUIRING SIGNAL'],['connected','DISCONNECT']])assert.equal(model.connectionPresentation(state).label,label);
  for(const state of ['transition-forecast','transition-flicker','transition-persistence','transition-writing','transition-wave'])assert.ok(app.includes(state),state);
  assert.deepEqual(model.TRANSITION_STATES,['forecast','flicker','persistence','writing','wave-reveal','complete']);
  assert.match(app,/simpleTransition/);
  assert.match(app,/prefers-reduced-motion: reduce/);
});

test('cover dialog and local-only fixture safeguards remain intact',()=>{
  assert.match(app,/dialog\.showModal\(\)/);
  assert.match(app,/event\.target===dialog/);
  assert.match(app,/event\.key===\'Escape\'/);
  assert.match(app,/lastCoverOpener\.focus/);
  assert.match(app,/player-widget-lab\/fixtures\.json/);
  assert.match(app,/\/local-media\/tracks\//);
  assert.doesNotMatch(app,/now-playing\.json|\/stream\.mp3/);
});

test('production files match the pre-preview hashes',()=>{
  const baseline=JSON.parse(fs.readFileSync(path.join(ROOT,'production-baseline.json'),'utf8'));
  for(const[file,expected]of Object.entries(baseline))assert.equal(hash(file),expected,file);
});
