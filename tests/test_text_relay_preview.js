'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const relay = require('../preview/text-relay/preview.js');

test('text relay preview is isolated and never inserts editorial content with innerHTML', () => {
  const script = fs.readFileSync(path.join(ROOT, 'preview/text-relay/preview.js'), 'utf8');
  const builder = fs.readFileSync(path.join(ROOT, 'tools/build-text-relay-preview.js'), 'utf8');
  const html = fs.readFileSync(path.join(ROOT, 'preview/text-relay/index.html'), 'utf8');
  const previewApp = fs.readFileSync(path.join(ROOT, 'preview/text-relay/preview-app.js'), 'utf8');
  assert.doesNotMatch(script, /innerHTML/);
  assert.match(builder, /_preview-text-relay/);
  assert.match(builder, /release-metadata-map\.json/);
  assert.match(script, /now-playing\.json/);
  assert.match(html, /id="previewTransmissionRegister"/);
  assert.doesNotMatch(html, /id="logLine"/);
  assert.match(html, /preview-app\.js/);
  assert.match(previewApp, /function renderTransmissionLog\(_data\) \{ \/\* Preview owns its isolated archive register\. \*\/ \}/);
  assert.match(script, /previewTransmissionRegister/);
  assert.doesNotMatch(script, /logLine/);
  assert.match(script, /body\.dataset\.coverPalette=source/);
  assert.match(script, /image\.onerror=\(\)=>applyPalette\(\[\],'fallback'\)/);
});

test('fragment selection is deterministic within each twenty-second bucket', () => {
  const data = { release_id: 'MDK046', track_id: 'MDK046-D01-T01', release_text_fragments: [{}, {}, {}, {}] };
  assert.equal(relay.fragmentIndex(data, 20), relay.fragmentIndex(data, 39.9));
  assert.equal(relay.fragmentIndex({ ...data, release_text_fragments: [] }, 20), null);
});

test('event rhythms and fallbacks are deterministic without inventing editorial text', () => {
  assert.ok(relay.intervalFor('MDK052-D01-T01', 'TEXT', 3) >= 24);
  assert.ok(relay.intervalFor('MDK052-D01-T01', 'TEXT', 3) <= 40);
  assert.ok(relay.intervalFor('MDK052-D01-T01', 'SIGNAL', 3) >= 8);
  assert.ok(relay.intervalFor('MDK052-D01-T01', 'SIGNAL', 3) <= 14);
  const empty = { release_id: 'MDK092', track_id: 'MDK092-D01-T01', track_title: 'Signal', release_text_fragments: [] };
  assert.match(relay.fallbackMessage(empty, 0), /track metadata/);
  assert.equal(relay.makeEvent(empty, 'TEXT', 0), null);
  assert.match(relay.makeEvent(empty, 'SYSTEM', 0).message, /track metadata/);
});

test('producer signatures preserve canonical combinations and neutral fallback', () => {
  assert.equal(relay.producerSignature({ producer_profile: 'D' }), 'OPS-D');
  assert.equal(relay.producerSignature({ producer_profile: 'MK' }), 'OPS-MK');
  assert.equal(relay.producerSignature({}), 'OPS-Ø');
  assert.equal(relay.producerVisual({ release_id: 'MDK009', producer_profile: 'K' }).matrix, 'k');
  assert.deepEqual(relay.producerVisual({ release_id: 'MDK100', producer_profile: 'D' }), relay.producerVisual({ release_id: 'MDK100', producer_profile: 'D' }));
});

test('transmission register keeps real archive fields in a compact stable row key', () => {
  const entry = {
    started_at: '2026-07-15T03:12:35Z',
    release_id: 'MDK119',
    release_title: 'disCONTENT',
    track_title: 'Not an event, but a flow',
  };
  const parts = relay.logEntryParts(entry);
  assert.equal(parts.releaseId, 'MDK119');
  assert.equal(parts.title, 'Not an event, but a flow');
  assert.equal(parts.releaseTitle, 'disCONTENT');
  assert.match(parts.time, /^\d{2}:\d{2}$/);
  assert.equal(relay.logEntryKey(entry), relay.logEntryKey({ ...entry }));
  assert.notEqual(relay.logEntryKey(entry), relay.logEntryKey({ ...entry, track_title: 'Other signal' }));
  assert.equal(relay.isCurrentLogEntry(entry, { release_id: 'MDK119', track_title: 'Not an event, but a flow' }), true);
  assert.equal(relay.isCurrentLogEntry(entry, { release_id: 'MDK119', track_title: 'Another track' }), false);
});

test('broadcast preview instruments are deterministic and explicitly derived', () => {
  const data = { track_id: 'MDK052-D01-T01', producer_profile: 'D', progress_percent: 24.6, track_duration_seconds: 600, listeners: 7 };
  const now = new Date('2026-07-15T04:20:00Z');
  const first = relay.deriveBroadcastInstruments(data, now);
  const second = relay.deriveBroadcastInstruments(data, now);
  assert.deepEqual(first, second);
  assert.equal(first.activeReceivers, 7);
  assert.equal(first.receiverPattern.filter(Boolean).length, 7);
  assert.equal(first.drift.length, 11);
  assert.equal(first.progress, 24.6);
});

test('cover palette normalization constrains lightness and saturation safely', () => {
  for (const input of [[255, 0, 0], [250, 250, 250], [3, 3, 3], [128, 128, 128]]) {
    const normalized = relay.normalizePaletteColor(input);
    assert.equal(normalized.length, 3);
    normalized.forEach((channel) => assert.ok(channel >= 0 && channel <= 255));
    const mean = normalized.reduce((sum, channel) => sum + channel, 0) / 3;
    assert.ok(mean > 35 && mean < 220);
  }
});

test('preview and canonical frontend share the reusable Butterchurn preset event', () => {
  const script = fs.readFileSync(path.join(ROOT, 'preview/text-relay/preview.js'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'web/app.js'), 'utf8');
  assert.match(script, /mdk:preset-changed/);
  assert.match(script, /preset loaded:/);
  assert.match(app, /mdk:preset-changed/);
});

test('relay phosphor motion has a reduced-motion fallback', () => {
  const css = fs.readFileSync(path.join(ROOT, 'preview/text-relay/preview.css'), 'utf8');
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /phosphor-echoes/);
  assert.match(css, /register-echoes/);
  assert.match(css, /display:none/);
  assert.match(css, /transmission-register/);
  assert.match(css, /register-row/);
  assert.match(css, /font-size:\.70rem/);
  assert.match(css, /font-size:\.60rem/);
  assert.match(css, /line-height:1\.22/);
  assert.doesNotMatch(css, /is-live/);
  assert.doesNotMatch(css, /log-live/);
  assert.match(css, /overflow:hidden/);
  assert.match(css, /animation:none!important/);
  assert.match(css, /--cover-accent-1/);
  assert.match(css, /signal-transit/);
  assert.match(css, /receiver-array/);
  assert.match(css, /temporal-drift/);
  assert.match(css, /data-matrix-state/);
});
