const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '../web/preview/now-playing-console');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('isolated lab has the required static architecture', () => {
  for (const file of ['index.html', 'styles.css', 'app.js', 'waveform-fixtures.js', 'README.md']) {
    assert.ok(fs.statSync(path.join(root, file)).isFile(), file);
  }
  const html = read('index.html');
  assert.doesNotMatch(html, /https?:\/\//);
  assert.match(html, /waveform-fixtures\.js/);
  assert.match(html, /app\.js/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'HTML ids must be unique');
});

test('all simulation scenarios and public lab functions are present', () => {
  const html = read('index.html');
  const app = read('app.js');
  for (const scenario of ['normal', 'short', 'long', 'change', 'last30', 'last10', 'crossfade', 'newCover', 'noCover', 'unknown', 'slow', 'reduced', 'mobile']) {
    assert.match(html, new RegExp(`data-scenario="${scenario}"`));
  }
  for (const name of ['setTrack', 'startTransition', 'setRemainingTime', 'setCrossfadeProgress', 'setConnectionState', 'setReducedMotionPreview']) {
    assert.match(app, new RegExp(`window\\.${name} =`));
  }
});

test('title, waveform, cover and control alternatives remain selectable', () => {
  const html = read('index.html');
  for (const value of ['single', 'split', 'continuous', 'overlay', 'stacked', 'scan', 'shutter', 'phosphor', 'aperture', 'rows', 'more']) {
    assert.match(html, new RegExp(`value="${value}"`));
  }
  const css = read('styles.css');
  assert.match(css, /has-overflow/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /prefers-reduced-motion/);
  for (const duration of ['720ms', '620ms', '850ms', '680ms']) assert.ok(css.includes(duration));
});

test('accessibility semantics and non-color crossfade labels are explicit', () => {
  const html = read('index.html');
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Press Space to pause/);
  assert.match(html, />XFADE 10 SEC</);
  assert.match(html, />OUTGOING</);
  assert.match(html, />INCOMING</);
});

test('lab does not reference production telemetry or audio analysis', () => {
  const source = `${read('app.js')}\n${read('waveform-fixtures.js')}`;
  assert.doesNotMatch(source, /now-playing\.json|status-json|stream\.mp3|AudioContext|getUserMedia|fetch\(/);
});
