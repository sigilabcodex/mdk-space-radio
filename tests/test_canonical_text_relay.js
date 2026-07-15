'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const widgets = require('../web/ui-widgets.js');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

test('canonical archive register has one isolated renderer and one polling authority', () => {
  const html = read('web/index.html');
  const app = read('web/app.js');
  const ui = read('web/ui-widgets.js');
  assert.match(html, /id="archiveRegister"/);
  assert.doesNotMatch(html, /id="logLine"/);
  assert.doesNotMatch(app, /renderTransmissionLog|logLine/);
  assert.equal((app.match(/fetch\('\/now-playing\.json'/g) || []).length, 1);
  assert.equal((app.match(/setInterval\(loadNowPlaying, 10000\)/g) || []).length, 1);
  assert.doesNotMatch(ui, /fetch\(|setInterval\(/);
});

test('canonical archive excludes current entries and retains real fields', () => {
  const current = { release_id: 'MDK100', track_id: 'track-1', track_title: 'Current' };
  assert.equal(widgets.isCurrentLogEntry({ track_id: 'track-1' }, current), true);
  assert.equal(widgets.isCurrentLogEntry({ release_id: 'MDK100', track_title: 'Current' }, current), true);
  assert.equal(widgets.isCurrentLogEntry({ release_id: 'MDK100', track_title: 'Previous' }, current), false);
});

test('canonical relay scheduling, matrix inputs, and palette normalization are deterministic', () => {
  const data = { release_id: 'MDK046', track_id: 'track-2', producer_profile: 'D', listeners: 9,
    progress_percent: 47, track_duration_seconds: 500, release_text_fragments: [{ text: 'uno' }, { text: 'dos' }] };
  assert.equal(widgets.fragmentIndex(data, 20), widgets.fragmentIndex(data, 39.9));
  assert.deepEqual(widgets.deriveBroadcastInstruments(data, new Date('2026-07-15T12:00:00Z')),
    widgets.deriveBroadcastInstruments(data, new Date('2026-07-15T12:00:00Z')));
  assert.equal(widgets.producerSignature(data), 'OPS-D');
  assert.deepEqual(widgets.normalizePaletteColor([255, 255, 255]), widgets.normalizePaletteColor([255, 255, 255]));
  assert.equal(widgets.makeEvent({ track_id: 'silent', release_text_fragments: [] }, 'TEXT', 0, 0), null);
  assert.equal(widgets.producerSignature({}), 'OPS-Ø');
  assert.equal(widgets.deriveBroadcastInstruments({ track_id: 'few', listeners: 0 }).receiverPattern.filter(Boolean).length, 0);
  assert.equal(widgets.deriveBroadcastInstruments({ track_id: 'many', listeners: 99 }).receiverPattern.filter(Boolean).length, 12);
});

test('canonical markup and code contain no preview routes or obsolete broadcast labels', () => {
  const source = ['web/index.html', 'web/app.js', 'web/styles.css', 'web/ui-widgets.js'].map(read).join('\n');
  assert.doesNotMatch(source, /_preview|preview-text-relay|preview-broadcast/);
  assert.doesNotMatch(read('web/index.html'), /CARRIER LOCKED|DECK ONLINE/);
  assert.match(read('web/ui-widgets.js'), /SIGNAL TRANSIT/);
  assert.match(read('web/ui-widgets.js'), /RECEIVER ARRAY/);
  assert.match(read('web/ui-widgets.js'), /TEMPORAL DRIFT/);
});
