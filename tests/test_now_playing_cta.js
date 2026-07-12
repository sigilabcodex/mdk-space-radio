'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { selectNowPlayingCta } = require('../web/now-playing-cta.js');

test('CAMPWP wins over every other destination', () => {
  assert.deepEqual(selectNowPlayingCta({
    campwp_url: 'https://campwp.test/track/coffea',
    bandcamp_track_url: 'https://mdk.test/track/coffea',
    bandcamp_url: 'https://mdk.test/album/release',
    archive_item_url: 'https://archive.test/details/release',
    source_url: 'https://audio.test/coffea.mp3',
  }), {
    field: 'campwp_url', label: 'Track page', kind: 'campwp',
    url: 'https://campwp.test/track/coffea',
  });
});

test('track Bandcamp wins over album Bandcamp and Archive', () => {
  const cta = selectNowPlayingCta({
    bandcamp_track_url: 'https://mdk.test/track/coffea',
    bandcamp_url: 'https://mdk.test/album/release',
    archive_item_url: 'https://archive.test/details/release',
  });
  assert.equal(cta.field, 'bandcamp_track_url');
  assert.equal(cta.label, 'Get this track');
});

test('album Bandcamp wins over Archive', () => {
  assert.equal(selectNowPlayingCta({
    bandcamp_url: 'https://mdk.test/album/release',
    archive_item_url: 'https://archive.test/details/release',
  }).field, 'bandcamp_url');
});

test('Archive wins over direct audio', () => {
  assert.equal(selectNowPlayingCta({
    archive_item_url: 'https://archive.test/details/release',
    source_url: 'https://audio.test/coffea.mp3',
  }).field, 'archive_item_url');
});

test('direct audio is used by itself', () => {
  assert.deepEqual(selectNowPlayingCta({ source_url: 'https://audio.test/coffea.mp3' }), {
    field: 'source_url', label: 'Download audio', kind: 'audio',
    url: 'https://audio.test/coffea.mp3',
  });
});

test('missing and empty URLs do not produce a CTA', () => {
  assert.equal(selectNowPlayingCta({}), null);
  assert.equal(selectNowPlayingCta({ campwp_url: '', bandcamp_url: '  ', source_url: null }), null);
});

test('unsafe schemes are rejected and URL characters remain safely encoded', () => {
  assert.equal(selectNowPlayingCta({ source_url: 'javascript:alert(1)' }), null);
  assert.equal(
    selectNowPlayingCta({ source_url: 'https://audio.test/file?a=1&b=%22quoted%22' }).url,
    'https://audio.test/file?a=1&b=%22quoted%22',
  );
});

test('primary CTA markup has safe external-link attributes and no download attribute', () => {
  const html = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
  const markup = html.match(/<a id="primaryTrackLink"[^>]*>/)[0];
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.doesNotMatch(markup, /\sdownload(?:[\s=>])/);
  assert.match(markup, /\shidden(?:[\s>])/);
});
