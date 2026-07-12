'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { applyViewProfile, getViewProfile } = require('../web/view-profile.js');

function mockDocument(initial = []) {
  const classes = new Set(initial);
  return {
    classes,
    body: {
      classList: {
        toggle(name, enabled) {
          if (enabled) classes.add(name);
          else classes.delete(name);
        },
      },
    },
  };
}

test('view=broadcast selects the broadcast profile', () => {
  assert.equal(getViewProfile('?view=broadcast'), 'broadcast');
  assert.equal(getViewProfile('?utm_source=obs&view=broadcast'), 'broadcast');
});

test('the normal URL and other view values select the default profile', () => {
  assert.equal(getViewProfile(''), 'default');
  assert.equal(getViewProfile('?view=radio'), 'default');
  assert.equal(getViewProfile('?view=Broadcast'), 'default');
});

test('applying profiles adds and removes only broadcast-view', () => {
  const document = mockDocument(['view-radio']);
  assert.equal(applyViewProfile(document, '?view=broadcast'), 'broadcast');
  assert.deepEqual([...document.classes].sort(), ['broadcast-view', 'view-radio']);

  assert.equal(applyViewProfile(document, ''), 'default');
  assert.deepEqual([...document.classes], ['view-radio']);
});

test('shared page contains the static broadcast message and no duplicate page', () => {
  const html = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
  assert.match(html, /<span class="broadcast-listen-label">Listen live<\/span>/);
  assert.match(html, /<span class="broadcast-listen-url">radio\.mdkband\.com<\/span>/);
  assert.doesNotMatch(html, /broadcast\.html/);
});

test('broadcast CSS hides controls while retaining core visual regions', () => {
  const css = fs.readFileSync(path.join(__dirname, '../web/styles.css'), 'utf8');
  for (const hidden of ['.view-mode-switch', '.player-controls', '.track-links', '.support-links']) {
    assert.match(css, new RegExp(`body\\.broadcast-view \\${hidden}`));
  }
  for (const retained of ['.now-card', '.track', '.subgrid', '.spectrum-wrap']) {
    assert.match(css, new RegExp(`body\\.broadcast-view \\${retained}`));
  }
});
