'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const preview = path.join(root, 'web/stats/_preview-analytics-dashboard');

function node() {
  return {
    innerHTML: '', textContent: '', hidden: true, dateTime: '',
    classList: { values: new Set(), add(value) { this.values.add(value); } }
  };
}

test('public analytics failure renders unknown without a relative fallback', async () => {
  const nodes = new Map();
  const getNode = selector => {
    if (!nodes.has(selector)) nodes.set(selector, node());
    return nodes.get(selector);
  };
  const requests = [];
  const real = JSON.parse(fs.readFileSync(path.join(preview, 'real-data.json')));
  const demo = JSON.parse(fs.readFileSync(path.join(preview, 'demo-data.json')));
  const fetch = async url => {
    requests.push(url);
    if (url === 'real-data.json') return {ok: true, json: async () => real};
    if (url === 'demo-data.json') return {ok: true, json: async () => demo};
    if (url === '/stats/listener-analytics.json') throw new Error('unavailable');
    throw new Error(`unexpected request: ${url}`);
  };
  const context = vm.createContext({
    document: {querySelector: getNode}, fetch, Intl, Date, Math, Promise,
    setTimeout, clearTimeout
  });
  vm.runInContext(fs.readFileSync(path.join(preview, 'app.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));

  assert.deepEqual(requests, [
    '/stats/listener-analytics.json', 'real-data.json', 'demo-data.json'
  ]);
  assert.equal(requests.includes('listener-analytics.json'), false);
  assert.equal(getNode('#listenerDataState').textContent, 'UNKNOWN');
  assert.equal(getNode('#loadError').hidden, false);
  assert.match(getNode('#loadError').textContent, /metrics are unknown/);
  assert.match(getNode('#kpis').innerHTML, /Current listeners[\s\S]*—/);
  assert.match(getNode('#kpis').innerHTML, /UNKNOWN · public analytics unavailable/);
  assert.doesNotMatch(getNode('#kpis').innerHTML, /Current listeners[\s\S]{0,300}DEMO DATA/);
  assert.match(getNode('#listenerChart').innerHTML, /LISTENER ANALYTICS UNKNOWN/);
});
