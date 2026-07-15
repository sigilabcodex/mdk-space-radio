(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UIWidgets = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const EVENT_RANGES = { TEXT: [24, 40], ORBIT: [10, 18], SIGNAL: [8, 14], MATRIX: [12, 20], ARCHIVE: [36, 58], SYSTEM: [18, 35] };
  const PRIORITY = { TEXT: 1, VISUAL: 2, ARCHIVE: 3, OPS: 3, ORBIT: 4, SIGNAL: 5, MATRIX: 6, SYSTEM: 7 };
  const MAX_HISTORY = 14;

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < String(value).length; index += 1) {
      result ^= String(value).charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function progressPercent(data) {
    const explicit = Number(data && data.progress_percent);
    const elapsed = Number(data && data.track_elapsed_seconds);
    const duration = Number(data && data.track_duration_seconds);
    if (Number.isFinite(explicit)) return Math.max(0, Math.min(100, explicit));
    return Number.isFinite(elapsed) && Number.isFinite(duration) && duration > 0
      ? Math.max(0, Math.min(100, elapsed / duration * 100)) : 0;
  }

  function deriveTelemetryProfile(data) {
    const trackId = String(data.track_id || data.source_url || data.track_title || 'unknown-track');
    const releaseId = String(data.release_id || data.release_title || 'MDK');
    const progress = progressPercent(data);
    const listeners = Math.max(0, Number(data.listeners) || 0);
    const seed = hash(`${trackId}|${releaseId}|${progress.toFixed(2)}|${listeners}`);
    const next = (salt) => hash(`${seed}:${salt}`);
    return { trackId, releaseId, progress, listeners, channel: 1 + next('channel') % 12,
      lock: (910 + next('lock') % 85) / 10, azimuth: (next('azimuth') % 3600) / 10,
      elevation: -18 + (next('elevation') % 710) / 10 };
  }

  function intervalFor(trackId, type, sequence) {
    const range = EVENT_RANGES[type];
    return range ? range[0] + hash(`${trackId}${type}${sequence}`) % (range[1] - range[0] + 1) : 0;
  }

  function producerSignature(data) {
    const profile = String(data && data.producer_profile || '').toUpperCase().replace(/[^MDK]/g, '');
    return profile ? `OPS-${profile}` : 'OPS-Ø';
  }

  function fragmentIndex(data, elapsed) {
    const fragments = Array.isArray(data && data.release_text_fragments) ? data.release_text_fragments : [];
    return fragments.length ? hash(`${data.release_id || ''}${data.track_id || ''}${Math.max(0, Math.floor((Number(elapsed) || 0) / 20))}`) % fragments.length : null;
  }

  function estimateLineCount(message, type, chars = 74) {
    const count = String(message || '').split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / chars)), 0);
    return type === 'TEXT' ? Math.max(2, count) : Math.max(1, count);
  }

  function fallbackMessage(data, sequence) {
    const choices = [
      data.track_title && `track metadata: ${data.track_title}`,
      data.release_title && `release metadata: ${data.release_title}`,
      data.producer_label && `producer metadata: ${data.producer_label}`,
      (data.release_id || data.track_id) && `archive identity: ${data.release_id || 'release --'} / ${data.track_id || 'track --'}`,
      data.archive_identifier && `archive identifier: ${data.archive_identifier}`,
      (data.archive_details_url || data.source_url) && `source metadata: ${data.archive_details_url || data.source_url}`,
      'system: release annotation channel is silent',
    ].filter(Boolean);
    return choices[sequence % choices.length];
  }

  function makeEvent(data, type, sequence, elapsed) {
    const fragments = (Array.isArray(data.release_text_fragments) ? data.release_text_fragments : [])
      .filter((item) => item && typeof item.text === 'string' && item.text.trim());
    let message;
    if (type === 'TEXT') {
      if (!fragments.length || (fragments.length === 1 && sequence > 0 && sequence % 5 !== 0)) return null;
      const index = (fragmentIndex(data, elapsed + sequence * 29) + sequence) % fragments.length;
      message = fragments[index].text;
    } else if (type === 'ARCHIVE') message = `archive coherence / ${data.release_id || 'release --'} / ${data.track_id || 'track --'} / ${data.release_text_source || data.source_format || 'source pending'}`;
    else if (type === 'OPS') message = `${producerSignature(data)} / ${data.producer_label || 'producer metadata unavailable'}`;
    else if (type === 'ORBIT') message = `derived orbit / azimuth ${hash(`${data.track_id}az${sequence}`) % 360}° / elevation ${(hash(`${data.track_id}el${sequence}`) % 71) - 18}°`;
    else if (type === 'SIGNAL') message = `derived carrier / CH-${String(1 + hash(`${data.track_id}ch${sequence}`) % 12).padStart(2, '0')} / lock ${((910 + hash(`${data.track_id}lock${sequence}`) % 85) / 10).toFixed(1)}`;
    else if (type === 'MATRIX') message = `derived matrix / pattern ${String(1 + hash(`${data.track_id}matrix${sequence}`) % 12).padStart(2, '0')} / stable channel map`;
    else if (type === 'SYSTEM') message = fallbackMessage(data, sequence);
    return message ? { type, message, priority: PRIORITY[type] || PRIORITY.SYSTEM,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }) } : null;
  }

  function logEntryKey(entry) {
    return [entry && (entry.started_at_unix || entry.started_at) || '', entry && entry.release_id || '', entry && entry.track_title || ''].join('|');
  }

  function isCurrentLogEntry(entry, data) {
    if (!entry || !data) return false;
    if (entry.track_id && data.track_id && entry.track_id === data.track_id) return true;
    return Boolean(entry.release_id && data.release_id && entry.release_id === data.release_id
      && (entry.track_title || entry.icecast_title) === (data.track_title || data.icecast_title));
  }

  function logEntryParts(entry) {
    const raw = entry && ((entry.started_at_unix && Number(entry.started_at_unix) * 1000) || entry.started_at);
    const date = raw ? new Date(raw) : null;
    return { time: date && !Number.isNaN(date.getTime()) ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--',
      releaseId: String(entry && entry.release_id || 'ARCHIVE'),
      title: String(entry && (entry.track_title || entry.icecast_title) || 'unknown signal'),
      releaseTitle: String(entry && entry.release_title || ''), key: logEntryKey(entry) };
  }

  function deriveBroadcastInstruments(data, now = new Date()) {
    const trackId = String(data && (data.track_id || data.track_title) || 'unknown-track');
    const profile = String(data && data.producer_profile || 'Ø').toUpperCase();
    const progress = progressPercent(data);
    const duration = Math.max(0, Number(data && data.track_duration_seconds) || 0);
    const connections = Math.max(0, Number(data && data.listeners) || 0);
    const bucket = Math.floor(progress / 10);
    const timeBucket = now.getHours() * 6 + Math.floor(now.getMinutes() / 10);
    const seed = hash(`${trackId}|${profile}`);
    const order = Array.from({ length: 12 }, (_, index) => ({ index, rank: hash(`${trackId}|${profile}|receiver|${index}`) }))
      .sort((a, b) => a.rank - b.rank).map((item) => item.index);
    const activeSet = new Set(order.slice(0, Math.min(12, connections)));
    const spacing = 6 + duration % 5;
    return { trackId, profile, progress, duration, connections, bucket, seed,
      receiverPattern: Array.from({ length: 12 }, (_, index) => activeSet.has(index)),
      drift: Array.from({ length: 11 }, (_, index) => 18 + hash(`${trackId}|${timeBucket}|${bucket}|drift|${index}`) % 65),
      transitNodes: Array.from({ length: 5 }, (_, index) => Math.min(96, Math.max(4, progress + connections % 7 + (index - 2) * spacing))) };
  }

  function rgbToHsl(rgb) {
    const [r, g, b] = rgb.map((value) => value / 255); const max = Math.max(r, g, b); const min = Math.min(r, g, b); const delta = max - min;
    let h = 0; if (delta) { if (max === r) h = ((g - b) / delta) % 6; else if (max === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h *= 60; if (h < 0) h += 360; }
    const l = (max + min) / 2; return [h, delta ? delta / (1 - Math.abs(2 * l - 1)) : 0, l];
  }

  function hslToRgb([h, s, l]) {
    const c = (1 - Math.abs(2 * l - 1)) * s; const x = c * (1 - Math.abs((h / 60) % 2 - 1)); const m = l - c / 2;
    let raw; if (h < 60) raw = [c, x, 0]; else if (h < 120) raw = [x, c, 0]; else if (h < 180) raw = [0, c, x]; else if (h < 240) raw = [0, x, c]; else if (h < 300) raw = [x, 0, c]; else raw = [c, 0, x];
    return raw.map((value) => Math.round((value + m) * 255));
  }

  function normalizePaletteColor(rgb) {
    let [h, s, l] = rgbToHsl(rgb); if (s < 0.08) { h = 155; s = 0.32; }
    return hslToRgb([h, Math.max(0.24, Math.min(0.68, s)), Math.max(0.28, Math.min(0.68, l))]);
  }

  if (!root.document) return { hash, intervalFor, fragmentIndex, producerSignature, estimateLineCount,
    fallbackMessage, makeEvent, logEntryKey, isCurrentLogEntry, logEntryParts, progressPercent,
    deriveTelemetryProfile, deriveBroadcastInstruments, normalizePaletteColor };

  const document = root.document; const body = document.body; const cover = document.getElementById('cover');
  const terminal = document.querySelector('.relay-terminal'); const reduced = () => root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
  let lastOpener = null; let current = null; let receivedAt = 0; let trackKey = ''; let schedules = {};
  let history = []; let pending = []; let typing = false; let relayGeneration = 0; let paletteUrl = '';
  let registerRows = []; let registerPending = []; let registerTyping = false; let broadcastNodes;

  function setText(selector, value) { document.querySelectorAll(selector).forEach((node) => { node.textContent = value; }); }
  function isRadioInteractive() { return body.classList.contains('view-radio') && !body.classList.contains('broadcast-view'); }

  function createLightbox() {
    const dialog = el('dialog', 'cover-lightbox'); dialog.setAttribute('aria-labelledby', 'coverLightboxTitle');
    dialog.innerHTML = '<div class="lightbox-panel"><div id="coverLightboxTitle" class="lightbox-title">Current release artwork</div><button type="button" class="lightbox-close" aria-label="Close artwork">Close</button><img class="lightbox-image" alt=""></div>';
    document.body.append(dialog); dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { if (lastOpener && isRadioInteractive()) lastOpener.focus({ preventScroll: true }); lastOpener = null; });
    return dialog;
  }
  const dialog = createLightbox();
  function syncCoverInteractivity() { if (!cover) return; const enabled = isRadioInteractive(); cover.tabIndex = enabled ? 0 : -1;
    if (enabled) { cover.setAttribute('role', 'button'); cover.setAttribute('aria-label', 'Expand current release artwork'); }
    else { cover.removeAttribute('role'); cover.removeAttribute('aria-label'); if (dialog.open) dialog.close(); } }
  function openLightbox() { if (!cover || !isRadioInteractive() || !(cover.currentSrc || cover.src)) return; const image = dialog.querySelector('.lightbox-image'); image.src = cover.currentSrc || cover.src; image.alt = cover.alt || 'Current release artwork'; lastOpener = cover; dialog.showModal(); dialog.querySelector('.lightbox-close').focus({ preventScroll: true }); }

  function createTerminal() {
    const header = el('header'); const title = el('span', 'text-relay-title', 'TEXT RELAY'); const count = el('b', 'text-relay-count', 'MEM 00'); header.append(title, count);
    const viewport = el('div', 'text-relay-viewport'); const log = el('ol', 'text-relay-log'); const echoes = el('div', 'text-relay-echoes'); echoes.setAttribute('aria-hidden', 'true'); viewport.append(log, echoes);
    const footer = el('footer'); const source = el('span', 'text-relay-source'); const indicator = el('i', 'text-relay-indicator'); const state = el('b', 'text-relay-state'); footer.append(source, indicator, state); terminal.replaceChildren(header, viewport, footer);
    return { title, count, viewport, log, echoes, source, state };
  }
  const terminalNodes = createTerminal();

  function createRegister() {
    const host = document.getElementById('archiveRegister'); if (!host) return null; host.className = 'transmission-register';
    const kicker = el('div', 'register-kicker'); kicker.append(el('span', 'register-archive', 'ARCHIVE REGISTER'), el('b', 'register-state', 'TRACK HISTORY'));
    const viewport = el('div', 'register-viewport'); const list = el('ol', 'register-list'); const echoes = el('div', 'register-echoes'); echoes.setAttribute('aria-hidden', 'true'); viewport.append(list, echoes); host.replaceChildren(kicker, viewport);
    return { host, kicker, viewport, list, echoes };
  }
  const registerNodes = createRegister();
  function registerLimit() { return root.innerWidth <= 720 ? 5 : 6; }
  function registerEcho(row) { if (reduced() || !row || !row.isConnected) return; const rect = row.getBoundingClientRect(); const base = registerNodes.viewport.getBoundingClientRect(); const echo = row.cloneNode(true); echo.className = 'register-echo'; echo.setAttribute('aria-hidden', 'true'); echo.style.top = `${rect.top - base.top + 1}px`; registerNodes.echoes.append(echo); root.setTimeout(() => echo.remove(), 720); }
  function trimRegister() { while (registerRows.length > registerLimit()) { const removed = registerRows.pop(); if (removed.item.isConnected) removed.item.remove(); } }
  function makeRegisterRow(entry) { const parts = logEntryParts(entry); const item = el('li', 'register-row'); const title = el('span', 'register-title'); if (parts.releaseTitle) title.title = parts.releaseTitle; item.dataset.key = parts.key; item.append(el('time', 'register-time', parts.time), el('span', 'register-release', parts.releaseId), title); return { item, title, parts }; }
  function finishRegisterRow(row, text) { row.title.textContent = text; row.item.classList.add('is-complete'); registerEcho(row.item); registerTyping = false; trimRegister(); writeRegisterNext(); }
  function writeRegisterNext() {
    if (registerTyping || !registerPending.length || !registerNodes) return; const entry = registerPending.shift(); const row = makeRegisterRow(entry); const text = row.parts.title; registerNodes.list.prepend(row.item); registerRows.unshift(row); registerTyping = true;
    if (reduced()) { finishRegisterRow(row, text); return; } const cursor = el('span', 'register-cursor', '_'); row.title.append(cursor); let index = 0;
    const step = () => { if (index >= text.length) { cursor.remove(); finishRegisterRow(row, text); return; } cursor.before(document.createTextNode(text[index])); index += 1; root.setTimeout(step, registerPending.length ? 2 : 6 + hash(`${row.parts.key}${index}`) % 9); }; step();
  }
  function renderRegister(data) {
    if (!registerNodes) return; const entries = Array.isArray(data.transmission_log) ? data.transmission_log.filter((entry) => entry && !isCurrentLogEntry(entry, data)) : [];
    const incoming = entries.slice(0, registerLimit()).filter((entry, index, list) => index === 0 || logEntryKey(entry) !== logEntryKey(list[index - 1]));
    registerNodes.kicker.lastElementChild.textContent = incoming.length ? 'TRACK HISTORY' : 'AWAITING HISTORY'; if (!incoming.length) return;
    const key = logEntryKey(incoming[0]); if (!registerRows.length) { incoming.slice(1).forEach((entry) => { const row = makeRegisterRow(entry); row.title.textContent = row.parts.title; registerNodes.list.append(row.item); registerRows.push(row); }); registerPending.push(incoming[0]); writeRegisterNext(); return; }
    if (registerRows[0] && registerRows[0].parts.key === key) { trimRegister(); return; }
    if (!registerPending.some((entry) => logEntryKey(entry) === key)) { registerPending.push(incoming[0]); writeRegisterNext(); }
  }

  function instrument(name, className, count) { const module = el('section', `broadcast-instrument ${className}`); const header = el('header'); const state = el('em', '', 'DERIVED'); header.append(el('b', '', name), state); const visual = el('div', 'instrument-visual'); for (let index = 0; index < count; index += 1) visual.append(el('i')); module.append(header, visual); return { module, state, visual }; }
  function createBroadcastWidgets() { const host = document.querySelector('.broadcast-system-widgets'); if (!host) return null; const transit = instrument('SIGNAL TRANSIT', 'signal-transit', 5); const receivers = instrument('RECEIVER ARRAY', 'receiver-array', 12); const drift = instrument('TEMPORAL DRIFT', 'temporal-drift', 11); host.replaceChildren(transit.module, receivers.module, drift.module); return { host, transit, receivers, drift }; }
  function syncBroadcastWidgets(data) { if (!broadcastNodes) broadcastNodes = createBroadcastWidgets(); if (!broadcastNodes) return; const derived = deriveBroadcastInstruments(data); broadcastNodes.host.dataset.profile = derived.profile;
    broadcastNodes.transit.state.textContent = `${derived.progress.toFixed(0)}% · DERIVED`; [...broadcastNodes.transit.visual.children].forEach((node, index) => node.style.setProperty('--node-progress', `${derived.transitNodes[index]}%`));
    [...broadcastNodes.receivers.visual.children].forEach((node, index) => { node.classList.toggle('is-active', derived.receiverPattern[index]); node.style.setProperty('--receiver-delay', `${hash(`${derived.trackId}|${index}`) % 900}ms`); }); broadcastNodes.receivers.state.textContent = `${derived.connections} INPUTS · DERIVED`;
    [...broadcastNodes.drift.visual.children].forEach((node, index) => node.style.setProperty('--drift-level', `${derived.drift[index]}%`)); broadcastNodes.drift.state.textContent = `BUCKET ${String(derived.bucket).padStart(2, '0')} · DERIVED`; }
  function syncChannelMatrix(data) { const derived = deriveBroadcastInstruments(data); document.querySelectorAll('.telemetry-matrix i').forEach((cell, index) => { const value = hash(`${derived.trackId}|${derived.profile}|matrix|${index}`) % 100; const active = value < 42 + derived.connections % 12; cell.dataset.matrixState = active && (value + derived.bucket) % 4 === 0 ? 'accent' : active ? 'active' : 'idle'; cell.style.setProperty('--matrix-phase', `${hash(`${derived.seed}|${index}`) % 7 * 90}ms`); }); }

  function applyPalette(colors, source) { const first = normalizePaletteColor(colors[0] || [117, 205, 170]); let second = normalizePaletteColor(colors[1] || [165, 126, 196]); if (Math.hypot(...first.map((value, index) => value - second[index])) < 52) second = normalizePaletteColor([165, 126, 196]); const muted = first.map((value, index) => Math.round(value * 0.55 + second[index] * 0.45)); body.style.setProperty('--cover-accent-1', first.join(' ')); body.style.setProperty('--cover-accent-2', second.join(' ')); body.style.setProperty('--cover-accent-muted', muted.join(' ')); body.style.setProperty('--cover-glow', `${first.join(' ')} / .18`); body.dataset.coverPalette = source; root.dispatchEvent(new CustomEvent('mdk:palette-changed', { detail: { accent1: first, accent2: second, muted, source } })); }
  function extractPalette(url) { if (!url || url === paletteUrl) return; paletteUrl = url; const image = new Image(); image.crossOrigin = 'anonymous'; image.decoding = 'async'; image.onload = () => { try { const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32; const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0, 32, 32); const pixels = context.getImageData(0, 0, 32, 32).data; const bins = new Map(); for (let index = 0; index < pixels.length; index += 16) { if (pixels[index + 3] < 220) continue; const rgb = [pixels[index], pixels[index + 1], pixels[index + 2]]; const light = (rgb[0] + rgb[1] + rgb[2]) / 765; if (light < 0.05 || light > 0.95) continue; const key = rgb.map((value) => Math.round(value / 32) * 32).join(','); bins.set(key, (bins.get(key) || 0) + 1); } const ranked = [...bins].sort((a, b) => b[1] - a[1]).map(([key]) => key.split(',').map(Number)); const selected = []; ranked.forEach((color) => { if (selected.length < 3 && selected.every((other) => Math.hypot(...color.map((value, i) => value - other[i])) > 55)) selected.push(color); }); if (!selected.length) throw new Error('empty palette'); applyPalette(selected, 'cover'); } catch (_error) { applyPalette([], 'fallback'); } }; image.onerror = () => applyPalette([], 'fallback'); image.src = url; }

  function lineBudget() { if (body.classList.contains('view-focus')) return 4; return root.innerWidth <= 720 ? 5 : body.classList.contains('broadcast-view') ? 9 : 8; }
  function visibleCost() { return [...terminalNodes.log.children].reduce((sum, item) => sum + Number(item.dataset.lines || 1), 0); }
  function echo(item) { if (reduced() || !item || !item.isConnected) return; const rect = item.getBoundingClientRect(); const base = terminalNodes.viewport.getBoundingClientRect(); [1, 2].forEach((offset) => { const ghost = item.cloneNode(true); ghost.className = `phosphor-echo echo-${offset}`; ghost.style.top = `${rect.top - base.top + offset}px`; terminalNodes.echoes.append(ghost); root.setTimeout(() => ghost.remove(), offset === 1 ? 680 : 1040); }); }
  function trimVisible(nextCost) { while (terminalNodes.log.firstElementChild && visibleCost() + nextCost > lineBudget()) { const oldest = terminalNodes.log.firstElementChild; echo(oldest); oldest.remove(); } }
  function writeNext() { if (typing || !pending.length) return; const event = pending.shift(); const item = el('li', `text-relay-event type-${event.type.toLowerCase()}`); const message = el('p', 'text-relay-message'); item.dataset.lines = String(estimateLineCount(event.message, event.type, root.innerWidth <= 720 ? 48 : 78)); item.append(el('time', 'text-relay-time', event.timestamp), el('span', 'text-relay-type', event.type), message); trimVisible(Number(item.dataset.lines)); terminalNodes.log.append(item); history.push(event); history = history.slice(-MAX_HISTORY); terminalNodes.count.textContent = `MEM ${String(history.length).padStart(2, '0')}`; typing = true;
    const finish = () => { item.classList.add('is-complete'); echo(item); typing = false; writeNext(); }; if (reduced()) { message.textContent = event.message; finish(); return; }
    const token = relayGeneration; const cursor = el('span', 'text-relay-cursor', '_'); message.append(cursor); const speed = event.type === 'TEXT' ? 18 + hash(`${event.message}speed`) % 18 : 8 + hash(`${event.type}${event.message}speed`) % 11; let index = 0;
    const step = () => { if (token !== relayGeneration) return; if (index >= event.message.length) { cursor.remove(); finish(); return; } cursor.before(document.createTextNode(event.message[index])); index += 1; root.setTimeout(step, event.message[index - 1] === '\n' ? speed * 2 : speed); }; step(); }
  function enqueue(event) { if (!event) return; if (typing && pending.length >= 2) { const worst = pending.reduce((pick, item) => item.priority > pick.priority ? item : pick, pending[0]); if (event.priority >= worst.priority) return; pending.splice(pending.indexOf(worst), 1); } if (pending.some((item) => item.type === event.type && item.message === event.message)) return; pending.push(event); pending.sort((a, b) => a.priority - b.priority); writeNext(); }
  function reset(data) { relayGeneration += 1; trackKey = `${data.release_id || ''}|${data.track_id || ''}`; schedules = {}; history = []; pending = []; typing = false; terminalNodes.log.replaceChildren(); terminalNodes.echoes.replaceChildren(); ['TEXT', 'ARCHIVE', 'OPS', 'ORBIT', 'SIGNAL', 'MATRIX', 'SYSTEM'].forEach((type) => { schedules[type] = { sequence: 0, lastAt: -intervalFor(data.track_id || '', type, 0) }; }); }
  function visualEvent(detail) { if (!current || !detail || !detail.name) return; const author = typeof detail.author === 'string' && detail.author.trim(); enqueue({ type: 'VISUAL', message: author ? `${author} / ${detail.name}` : `preset loaded: ${detail.name}`, priority: PRIORITY.VISUAL, timestamp: new Date().toLocaleTimeString([], { hour12: false }) }); }
  function applyProducerVisual(data) { const profile = String(data.producer_profile || '').toUpperCase().replace(/[^MDK]/g, '') || 'Ø'; const seed = hash(`${data.release_id || ''}${profile}`); const labels = { orbit: `OPS-${profile}`, carrier: `PROFILE ${profile}-${String(seed % 100).padStart(2, '0')}`, matrix: `CHANNEL ${profile}` }; document.querySelectorAll('.telemetry-module').forEach((module) => { const role = module.classList.contains('orbit-module') ? 'orbit' : module.classList.contains('carrier-module') ? 'carrier' : 'matrix'; const label = module.querySelector('header span'); if (label) label.dataset.producerOps = labels[role]; module.title = data.producer_label || 'Producer profile unavailable'; }); }

  function syncTelemetry(data) {
    current = data || {}; receivedAt = Date.now(); const key = `${current.release_id || ''}|${current.track_id || ''}`; if (key !== trackKey) reset(current);
    const profile = deriveTelemetryProfile(current); const channel = `CH–${String(profile.channel).padStart(2, '0')}`;
    setText('[data-telemetry-release]', profile.releaseId); setText('[data-telemetry-az]', `AZ ${profile.azimuth.toFixed(1)}°`); setText('[data-telemetry-el]', `EL ${profile.elevation >= 0 ? '+' : ''}${profile.elevation.toFixed(1)}°`); setText('[data-telemetry-channel]', channel); setText('[data-telemetry-lock]', profile.lock.toFixed(1)); setText('[data-telemetry-listeners]', String(profile.listeners)); setText('[data-telemetry-progress]', `${profile.progress.toFixed(1)}%`); setText('[data-telemetry-matrix-progress]', `PROG ${profile.progress.toFixed(1)}%`); setText('[data-telemetry-matrix-live]', `LIVE ${profile.listeners}`);
    applyProducerVisual(current); syncBroadcastWidgets(current); syncChannelMatrix(current); renderRegister(current); extractPalette(current.absolute_cover_url || current.local_cover_url || current.cover_url); tick(current, receivedAt);
  }
  function tick(data, timestamp) { if (data) current = data; if (timestamp) receivedAt = timestamp; if (!current) return; const elapsed = Math.max(0, Number(current.track_elapsed_seconds) || 0) + (Date.now() - receivedAt) / 1000;
    Object.keys(schedules).forEach((type) => { const schedule = schedules[type]; if (type === 'OPS' && schedule.sequence > 0) return; const delay = type === 'OPS' ? 0 : intervalFor(current.track_id || '', type, schedule.sequence); if (elapsed - schedule.lastAt < delay) return; schedule.lastAt = elapsed; enqueue(makeEvent(current, type, schedule.sequence, elapsed)); schedule.sequence += 1; });
    terminalNodes.title.textContent = `TEXT RELAY / ${producerSignature(current)}`; terminalNodes.source.textContent = `SOURCE ${String(current.release_text_source || 'UNAVAILABLE').toUpperCase()}`; terminalNodes.state.textContent = Array.isArray(current.release_text_fragments) && current.release_text_fragments.length ? 'RX TEXT CHANNEL ACTIVE_' : 'RX TEXT CHANNEL STANDBY_'; }

  if (cover) { cover.addEventListener('click', openLightbox); cover.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(); } }); }
  syncCoverInteractivity(); new MutationObserver(syncCoverInteractivity).observe(body, { attributes: true, attributeFilter: ['class'] });
  root.addEventListener('mdk:preset-changed', (event) => visualEvent(event.detail));
  return { hash, intervalFor, fragmentIndex, producerSignature, estimateLineCount, fallbackMessage, makeEvent,
    logEntryKey, isCurrentLogEntry, logEntryParts, progressPercent, deriveTelemetryProfile,
    deriveBroadcastInstruments, normalizePaletteColor, syncTelemetry, tick };
}));
