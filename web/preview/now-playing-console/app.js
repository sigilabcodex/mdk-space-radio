(function () {
  'use strict';

  const fixtures = window.WaveformFixtures;
  const consoleNode = document.getElementById('console');
  const coverFrame = document.getElementById('coverFrame');
  const coverArt = document.getElementById('coverArt');
  const coverMissing = document.getElementById('coverMissing');
  const titleTicker = document.getElementById('titleTicker');
  const titleText = document.getElementById('titleText');
  const titleLine = document.getElementById('titleLine');
  const releaseLine = document.querySelector('.release-line');
  const releaseText = document.getElementById('releaseText');
  const fullTitle = document.getElementById('fullTitle');
  const splitFirst = document.getElementById('splitTitleFirst');
  const splitSecond = document.getElementById('splitTitleSecond');
  const canvas = document.getElementById('waveCanvas');
  const context = canvas.getContext('2d');
  const transitionTokens = new WeakMap();

  const state = {
    track: fixtures.tracks.normal,
    outgoing: fixtures.tracks.normal,
    elapsed: fixtures.tracks.normal.elapsed,
    remaining: fixtures.tracks.normal.duration - fixtures.tracks.normal.elapsed,
    crossfade: 0,
    connection: 'connected',
    reduced: false,
    lastFrame: performance.now(),
  };

  function formatTime(seconds) {
    const safe = Math.max(0, Math.round(Number(seconds) || 0));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
  }

  function controlledDelay(index) {
    return 17 + ((index * 7 + 3) % 9);
  }

  function cancelTransition(node) {
    transitionTokens.set(node, (transitionTokens.get(node) || 0) + 1);
    node.classList.remove('is-erasing', 'has-residue');
  }

  function terminalText(node, value, options = {}) {
    cancelTransition(node);
    const token = transitionTokens.get(node);
    const target = options.target || node;
    const previous = target.textContent;
    if (state.reduced || options.immediate) {
      target.textContent = value;
      options.done?.();
      return;
    }
    const begin = () => {
      if (transitionTokens.get(node) !== token) return;
      node.dataset.residue = previous;
      node.classList.add('is-erasing');
      window.setTimeout(() => {
        if (transitionTokens.get(node) !== token) return;
        node.classList.remove('is-erasing');
        node.classList.add('has-residue');
        target.textContent = '';
        let index = 0;
        const type = () => {
          if (transitionTokens.get(node) !== token) return;
          if (index >= value.length) {
            window.setTimeout(() => node.classList.remove('has-residue'), 130);
            options.done?.();
            return;
          }
          target.textContent += value[index];
          index += 1;
          window.setTimeout(type, controlledDelay(index));
        };
        window.setTimeout(type, 55);
      }, 330);
    };
    window.setTimeout(begin, options.delay || 0);
  }

  function splitTitle(value) {
    const words = value.split(/\s+/);
    if (words.length < 5) return [value, ''];
    const midpoint = Math.ceil(words.length * .45);
    return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
  }

  function configureTicker() {
    const value = state.track.title;
    const mode = consoleNode.dataset.titleVariant;
    titleTicker.dataset.mode = mode;
    titleTicker.classList.remove('has-overflow');
    titleText.nextElementSibling.textContent = mode === 'continuous' ? value : '';
    const [first, second] = splitTitle(value);
    splitFirst.textContent = first;
    splitSecond.textContent = second;
    requestAnimationFrame(() => {
      let overflow;
      if (mode === 'split') {
        const viewport = splitSecond.parentElement.clientWidth;
        overflow = splitSecond.scrollWidth > viewport + 2;
        const distance = Math.min(0, viewport - splitSecond.scrollWidth - 12);
        titleTicker.style.setProperty('--split-distance', `${distance}px`);
        titleTicker.style.setProperty('--ticker-duration', `${Math.max(12, Math.abs(distance) / 17 + 8)}s`);
      } else {
        const viewport = titleTicker.clientWidth;
        const copyWidth = titleText.scrollWidth;
        overflow = copyWidth > viewport + 2;
        const distance = Math.min(0, viewport - copyWidth - 34);
        titleTicker.style.setProperty('--ticker-distance', `${distance}px`);
        titleTicker.style.setProperty('--ticker-loop-distance', `${-(copyWidth + 54)}px`);
        titleTicker.style.setProperty('--ticker-duration', `${Math.max(13, copyWidth / 18)}s`);
      }
      titleTicker.classList.toggle('has-overflow', overflow && !state.reduced);
    });
  }

  function transitionCover(track) {
    coverFrame.classList.remove('is-transitioning');
    void coverFrame.offsetWidth;
    coverFrame.classList.add('is-transitioning');
    const apply = () => {
      coverArt.className = `cover-art cover-${track.cover || 'citrine'}`;
      coverArt.querySelector('strong').textContent = (track.id.match(/MDK(\d+)/) || [,'---'])[1];
      coverArt.setAttribute('aria-label', track.cover ? `Procedural dummy cover for ${track.release}` : 'No cover received');
      coverArt.hidden = !track.cover;
      coverMissing.hidden = Boolean(track.cover);
      document.getElementById('artworkState').textContent = track.cover ? 'RECEIVED' : 'ABSENT / TEXT FALLBACK';
    };
    if (state.reduced) apply(); else window.setTimeout(apply, 300);
    window.setTimeout(() => coverFrame.classList.remove('is-transitioning'), state.reduced ? 20 : 900);
  }

  function updateMetadata(track, animate) {
    fullTitle.textContent = track.title;
    titleTicker.setAttribute('aria-label', `${track.title}. Press Space to pause scrolling.`);
    terminalText(titleLine, track.title, { target: titleText, immediate: !animate, done: configureTicker });
    terminalText(releaseLine, track.release, { target: releaseText, delay: 180, immediate: !animate });
    document.getElementById('catalogText').textContent = track.catalog;
    document.getElementById('trackId').textContent = track.id || 'NO TRACK ID';
    document.getElementById('startedAt').textContent = new Date().toISOString().slice(11, 19) + ' UTC';
    if (!animate) configureTicker();
  }

  function setTrack(trackOrKey, options = {}) {
    const track = typeof trackOrKey === 'string' ? fixtures.tracks[trackOrKey] : trackOrKey;
    if (!track) return;
    state.outgoing = state.track;
    state.track = track;
    state.elapsed = Number.isFinite(options.elapsed) ? options.elapsed : track.elapsed;
    state.remaining = Math.max(0, track.duration - state.elapsed);
    state.crossfade = options.crossfade || 0;
    consoleNode.classList.remove('is-last10', 'is-crossfade');
    updateMetadata(track, options.animate !== false);
    transitionCover(track);
    startTransition();
    syncControls();
    drawWaveform();
  }

  function startTransition() {
    consoleNode.classList.remove('is-track-redraw');
    void consoleNode.offsetWidth;
    consoleNode.classList.add('is-track-redraw');
    window.setTimeout(() => consoleNode.classList.remove('is-track-redraw'), state.reduced ? 10 : 850);
  }

  function setRemainingTime(seconds) {
    state.remaining = Math.max(0, Math.min(state.track.duration, Number(seconds) || 0));
    state.elapsed = Math.max(0, state.track.duration - state.remaining);
    consoleNode.classList.toggle('is-last10', state.remaining <= 10);
    if (state.remaining <= 10 && state.crossfade === 0) {
      document.getElementById('xfadeLabel').textContent = 'XFADE REGION ENTERED';
      document.getElementById('xfadeDetail').textContent = `Incoming edge in ${state.remaining.toFixed(1)} seconds`;
    } else if (!state.crossfade) {
      document.getElementById('xfadeLabel').textContent = state.remaining <= 30 ? 'END APPROACH' : 'SEQUENCE STABLE';
      document.getElementById('xfadeDetail').textContent = state.remaining <= 30 ? 'Crossfade region armed at T−10' : 'Crossfade region armed at T−10';
    }
    syncControls();
    drawWaveform();
  }

  function setCrossfadeProgress(progress) {
    state.crossfade = Math.max(0, Math.min(1, Number(progress) || 0));
    consoleNode.classList.toggle('is-crossfade', state.crossfade > 0);
    consoleNode.classList.toggle('is-last10', state.crossfade > 0 || state.remaining <= 10);
    document.getElementById('xfadeLabel').textContent = state.crossfade > 0 ? 'CROSSFADE ACTIVE' : 'SEQUENCE STABLE';
    document.getElementById('xfadeDetail').textContent = state.crossfade > 0
      ? `Outgoing ${Math.round((1 - state.crossfade) * 100)}% / incoming ${Math.round(state.crossfade * 100)}%`
      : 'Crossfade region armed at T−10';
    syncControls();
    drawWaveform();
  }

  function setConnectionState(connection) {
    state.connection = connection;
    const node = document.getElementById('connectionState');
    node.classList.toggle('is-slow', connection === 'slow');
    consoleNode.classList.toggle('is-slow', connection === 'slow');
    consoleNode.setAttribute('aria-busy', String(connection === 'slow'));
    terminalText(node, connection === 'slow' ? 'CARRIER ACQUIRING / SLOW' : 'CARRIER LOCKED', {
      target: document.getElementById('connectionText'), immediate: state.reduced,
    });
  }

  function setReducedMotionPreview(enabled) {
    state.reduced = Boolean(enabled);
    document.body.classList.toggle('reduced-motion-preview', state.reduced);
    document.getElementById('motionState').innerHTML = `<b>MOTION</b> ${state.reduced ? 'REDUCED' : 'SYSTEM'}`;
    configureTicker();
    drawWaveform();
  }

  function syncControls() {
    document.getElementById('remainingRange').max = Math.round(state.track.duration);
    document.getElementById('remainingRange').value = Math.round(state.remaining);
    document.getElementById('remainingOutput').textContent = `${Math.round(state.remaining)} s`;
    document.getElementById('crossfadeRange').value = Math.round(state.crossfade * 100);
    document.getElementById('crossfadeOutput').textContent = `${Math.round(state.crossfade * 100)}%`;
    document.getElementById('elapsedText').textContent = formatTime(state.elapsed);
    document.getElementById('remainingText').textContent = formatTime(state.remaining);
  }

  function canvasMetrics() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { width: rect.width, height: rect.height };
  }

  function drawBars(wave, bounds, color, alpha, gain, progress, completedColor) {
    const { x, y, width, height } = bounds;
    const step = width / wave.length;
    context.lineWidth = Math.max(1, step * .62);
    for (let index = 0; index < wave.length; index += 1) {
      const px = x + index * step;
      const amplitude = wave[index] * height * .44 * gain;
      const complete = index / wave.length <= progress;
      context.strokeStyle = complete && completedColor ? completedColor : color;
      context.globalAlpha = alpha * (complete ? 1 : .38);
      context.beginPath();
      context.moveTo(px, y + height / 2 - amplitude);
      context.lineTo(px, y + height / 2 + amplitude);
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  function drawPlayhead(width, height, progress) {
    const x = Math.max(0, Math.min(width, width * progress));
    context.strokeStyle = '#e8eee8';
    context.globalAlpha = .82;
    context.lineWidth = 1;
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
    context.fillStyle = '#e8eee8';
    context.beginPath(); context.moveTo(x - 3, 0); context.lineTo(x + 3, 0); context.lineTo(x, 5); context.fill();
    context.globalAlpha = 1;
  }

  function drawWaveform() {
    const { width, height } = canvasMetrics();
    context.clearRect(0, 0, width, height);
    const progress = Math.max(0, Math.min(1, state.elapsed / state.track.duration));
    const mode = consoleNode.dataset.waveVariant;
    const crossfade = state.crossfade;
    if (mode === 'stacked') {
      drawBars(crossfade ? fixtures.outgoingWave : state.track.wave, { x: 0, y: 3, width, height: height * .47 }, '#91b89a', .95, crossfade ? 1 - crossfade * .72 : 1, progress, '#a8f2b7');
      drawBars(crossfade ? fixtures.incomingWave : state.track.wave, { x: 0, y: height * .52, width, height: height * .45 }, '#d7b66e', crossfade ? 1 : .28, crossfade ? .25 + crossfade * .75 : .7, crossfade ? crossfade * .05 : progress, '#efcb7c');
      context.strokeStyle = 'rgba(178,214,188,.18)'; context.beginPath(); context.moveTo(0, height / 2); context.lineTo(width, height / 2); context.stroke();
    } else if (mode === 'overlay' && crossfade > 0) {
      drawBars(fixtures.outgoingWave, { x: 0, y: 0, width, height }, '#91b89a', .92, 1 - crossfade * .76, 1, '#a8f2b7');
      drawBars(fixtures.incomingWave, { x: 0, y: 0, width, height }, '#d7b66e', .92, .2 + crossfade * .8, crossfade * .06, '#efcb7c');
    } else {
      drawBars(state.track.wave, { x: 0, y: 0, width, height }, '#73917b', 1, 1, progress, '#9ff3b2');
    }
    drawPlayhead(width, height, progress);
    const regionWidth = Math.max(36, width * Math.min(.2, 10 / state.track.duration));
    document.getElementById('crossfadeBracket').style.width = `${regionWidth}px`;
  }

  function scenario(name) {
    document.querySelectorAll('[data-scenario]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scenario === name)));
    if (name !== 'mobile') consoleNode.classList.remove('force-mobile');
    if (name !== 'reduced') setReducedMotionPreview(false);
    if (name !== 'slow') setConnectionState('connected');
    switch (name) {
      case 'normal': setTrack('normal'); break;
      case 'short': setTrack('short'); break;
      case 'long': setTrack('long'); break;
      case 'change': setTrack(state.track.id === fixtures.tracks.incoming.id ? 'normal' : 'incoming'); break;
      case 'last30': setRemainingTime(30); break;
      case 'last10': setRemainingTime(9.5); break;
      case 'crossfade': setRemainingTime(6); setCrossfadeProgress(.56); break;
      case 'newCover': transitionCover(state.track.cover === 'violet' ? fixtures.tracks.normal : fixtures.tracks.long); break;
      case 'noCover': setTrack({ ...fixtures.tracks.normal, cover: null }); break;
      case 'unknown': setTrack('unknown'); break;
      case 'slow': setConnectionState('slow'); break;
      case 'reduced': setReducedMotionPreview(true); setTrack('long', { animate: false }); break;
      case 'mobile': consoleNode.classList.add('force-mobile'); setTrack('long', { animate: false }); break;
      default: setTrack('normal', { animate: false });
    }
  }

  document.getElementById('scenarioControls').addEventListener('click', (event) => {
    const button = event.target.closest('[data-scenario]');
    if (button) scenario(button.dataset.scenario);
  });
  document.getElementById('titleVariant').addEventListener('change', (event) => { consoleNode.dataset.titleVariant = event.target.value; configureTicker(); });
  document.getElementById('waveVariant').addEventListener('change', (event) => { consoleNode.dataset.waveVariant = event.target.value; drawWaveform(); });
  document.getElementById('coverVariant').addEventListener('change', (event) => { consoleNode.dataset.coverTransition = event.target.value; transitionCover(state.track); });
  document.getElementById('controlVariant').addEventListener('change', (event) => { consoleNode.dataset.controls = event.target.value; });
  document.getElementById('remainingRange').addEventListener('input', (event) => setRemainingTime(event.target.value));
  document.getElementById('crossfadeRange').addEventListener('input', (event) => setCrossfadeProgress(event.target.value / 100));
  document.getElementById('moreButton').addEventListener('click', (event) => {
    const actions = document.getElementById('secondaryActions');
    const open = actions.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('muteButton').addEventListener('click', (event) => {
    const muted = event.currentTarget.getAttribute('aria-pressed') !== 'true';
    event.currentTarget.setAttribute('aria-pressed', String(muted));
    event.currentTarget.querySelector('span:last-child').textContent = muted ? 'Unmute' : 'Mute';
    event.currentTarget.setAttribute('aria-label', muted ? 'Unmute stream' : 'Mute stream');
  });
  titleTicker.addEventListener('keydown', (event) => {
    if (event.code === 'Space') { event.preventDefault(); titleTicker.classList.toggle('is-paused'); }
  });

  const resizeObserver = new ResizeObserver(() => { configureTicker(); drawWaveform(); });
  resizeObserver.observe(consoleNode);

  function animationFrame(now) {
    const delta = Math.min(.1, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    if (state.connection !== 'slow' && state.remaining > 0 && !state.reduced) {
      state.elapsed = Math.min(state.track.duration, state.elapsed + delta);
      state.remaining = Math.max(0, state.track.duration - state.elapsed);
    }
    drawWaveform();
    requestAnimationFrame(animationFrame);
  }

  window.setTrack = setTrack;
  window.startTransition = startTransition;
  window.setRemainingTime = setRemainingTime;
  window.setCrossfadeProgress = setCrossfadeProgress;
  window.setConnectionState = setConnectionState;
  window.setReducedMotionPreview = setReducedMotionPreview;

  const params = new URLSearchParams(window.location.search);
  document.body.classList.toggle('capture-mode', params.get('capture') === '1');
  for (const [parameter, elementId, dataKey] of [
    ['title', 'titleVariant', 'titleVariant'], ['wave', 'waveVariant', 'waveVariant'],
    ['cover', 'coverVariant', 'coverTransition'], ['controls', 'controlVariant', 'controls'],
  ]) {
    if (params.has(parameter)) {
      const element = document.getElementById(elementId);
      element.value = params.get(parameter);
      consoleNode.dataset[dataKey] = params.get(parameter);
    }
  }
  scenario(params.get('scenario') || 'normal');
  if (params.get('audit') === '1') {
    window.setTimeout(() => {
      const rect = consoleNode.getBoundingClientRect();
      document.body.dataset.pageOverflow = String(document.documentElement.scrollWidth > window.innerWidth + 1);
      document.body.dataset.consoleClipped = String(rect.left < -1 || rect.right > window.innerWidth + 1);
      document.body.dataset.canvasReady = String(canvas.width > 1 && canvas.height > 1);
      document.body.dataset.fullTitleAccessible = String(fullTitle.textContent === state.track.title);
    }, 900);
    window.setTimeout(() => {
      document.body.dataset.tickerActive = String(titleTicker.classList.contains('has-overflow'));
      document.body.dataset.reducedMotion = String(state.reduced);
    }, 3200);
  }
  requestAnimationFrame(animationFrame);
}());
