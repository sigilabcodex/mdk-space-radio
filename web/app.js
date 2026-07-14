    const viewProfile = window.ViewProfile.applyViewProfile(document, window.location.search);
    const isBroadcastView = viewProfile === 'broadcast';
    const radio = document.getElementById('radio');
    const playBtn = document.getElementById('playBtn');
    const volume = document.getElementById('volume');

    const cover = document.getElementById('cover');
    const track = document.getElementById('track');
    const release = document.getElementById('release');
    const elapsed = document.getElementById('elapsed');
    const duration = document.getElementById('duration');
    const progressBar = document.getElementById('progressBar');
    const primaryTrackLink = document.getElementById('primaryTrackLink');
    const archiveLink = document.getElementById('archiveLink');
    const bandcampLink = document.getElementById('bandcampLink');
    const statusLine = document.getElementById('statusLine');
    const logLine = document.getElementById('logLine');
    const liveText = document.getElementById('liveText');
    const localClock = document.getElementById('localClock');
    const broadcastStartOverlay = document.getElementById('broadcastStartOverlay');
    const welcomeModal = document.getElementById('welcomeModal');
    const welcomeCloseBtn = document.getElementById('welcomeCloseBtn');
    const welcomeEnterRadio = document.getElementById('welcomeEnterRadio');
    const welcomeStartFocus = document.getElementById('welcomeStartFocus');
    const welcomeDontShow = document.getElementById('welcomeDontShow');
    const deepImmersiveBtn = document.getElementById('deepImmersiveBtn');
    const deepImmersiveChrome = document.getElementById('deepImmersiveChrome');
    const deepExitBtn = document.getElementById('deepExitBtn');
    const deepMiniTrack = document.getElementById('deepMiniTrack');
    const deepMiniRelease = document.getElementById('deepMiniRelease');
    const deepMiniStatus = document.getElementById('deepMiniStatus');
    const deepMiniMeta = document.getElementById('deepMiniMeta');
    const viewModeButtons = Array.from(document.querySelectorAll('[data-view-mode]'));
    const butterchurnCanvas = document.getElementById('butterchurnCanvas');
    const spectrumWrap = document.getElementById('spectrumWrap');
    const spectrum = document.getElementById('spectrum');
    const spectrumCtx = spectrum.getContext('2d');
    const welcomeStorageKey = 'mdkRadioWelcomeDismissed';

    let current = null;
    let receivedAt = Date.now();
    let audioContext = null;
    let mediaSource = null;
    let analyser = null;
    let spectrumData = null;
    let spectrumLevels = null;
    let spectrumFrame = null;
    let spectrumActive = false;
    let butterchurnVisualizer = null;
    let butterchurnFrame = null;
    let butterchurnReady = false;
    let butterchurnFailed = false;
    let butterchurnStarting = false;
    let butterchurnConnected = false;
    let butterchurnPresets = null;
    let butterchurnPresetNames = [];
    let butterchurnPresetIndex = 0;
    let recentButterchurnPresetNames = [];
    let currentViewMode = 'radio';
    let deepImmersiveActive = false;
    let deepImmersiveIdleTimer = null;
    let lastPresetTrackKey = null;
    let pendingPresetTrackKey = null;

    radio.volume = Number(volume.value);

    function renderTrackLinks(data) {
      const cta = window.NowPlayingCta.selectNowPlayingCta(data);
      const archiveUrl = window.NowPlayingCta.usableUrl(data.archive_item_url)
        || window.NowPlayingCta.usableUrl(data.archive_details_url);
      const bandcampUrl = window.NowPlayingCta.usableUrl(data.bandcamp_url);

      primaryTrackLink.hidden = !cta;
      if (cta) {
        primaryTrackLink.href = cta.url;
        primaryTrackLink.textContent = cta.label;
      } else {
        primaryTrackLink.removeAttribute('href');
        primaryTrackLink.textContent = '';
      }

      archiveLink.hidden = !archiveUrl || (cta && archiveUrl === cta.url);
      if (archiveUrl) archiveLink.href = archiveUrl;

      bandcampLink.hidden = !bandcampUrl || (cta && bandcampUrl === cta.url);
      if (bandcampUrl) bandcampLink.href = bandcampUrl;
    }

    function updateBroadcastPresentation(data) {
      if (!isBroadcastView) return;

      // Future broadcast feature/immersive state transitions connect here.
      // The timing inputs are data.track_elapsed_seconds,
      // data.track_remaining_seconds and data.track_duration_seconds.
    }

    async function initBroadcastPlayback() {
      if (!isBroadcastView) return;

      if (await window.ViewProfile.tryAutoplay(radio)) {
        broadcastStartOverlay.hidden = true;
        return;
      }

      broadcastStartOverlay.hidden = false;

      const resumeBroadcast = async (event) => {
        if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
        if (!await window.ViewProfile.tryAutoplay(radio)) return;

        broadcastStartOverlay.hidden = true;
        window.removeEventListener('pointerdown', resumeBroadcast);
        window.removeEventListener('keydown', resumeBroadcast);
      };

      window.addEventListener('pointerdown', resumeBroadcast);
      window.addEventListener('keydown', resumeBroadcast);
    }

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          if (existing.dataset.loaded === 'true') resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          script.dataset.loaded = 'true';
          resolve();
        };
        script.onerror = reject;
        document.head.append(script);
      });
    }

    function formatLocalTime(date) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    function hasExplicitTimeZone(value) {
      return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
    }

    function parseLocalTimestamp(value) {
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        const ms = Math.abs(value) < 1e12 ? value * 1000 : value;
        const date = new Date(ms);
        return Number.isNaN(date.getTime()) ? null : date;
      }

      if (typeof value !== 'string') return null;

      const raw = value.trim();
      if (!raw) return null;

      if (hasExplicitTimeZone(raw)) {
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? null : date;
      }

      const isoLike = raw.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/
      );

      if (isoLike) {
        // Zone-less timestamps are treated as local wall-clock values because
        // there is no reliable way to infer the server timezone safely.
        const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '0'] = isoLike;
        const ms = Number(String(fraction).padEnd(3, '0').slice(0, 3));
        const date = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second),
          Number.isFinite(ms) ? ms : 0
        );
        return Number.isNaN(date.getTime()) ? null : date;
      }

      const date = new Date(raw);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    function isWelcomeDismissed() {
      try {
        return window.localStorage.getItem(welcomeStorageKey) === '1';
      } catch (err) {
        return false;
      }
    }

    function setWelcomeDismissed() {
      try {
        window.localStorage.setItem(welcomeStorageKey, '1');
      } catch (err) {
        // Ignore storage failures in private or restricted browsing modes.
      }
    }

    function closeWelcomeModal(options = {}) {
      const { persist = false, nextMode = null } = options;

      if (persist && welcomeDontShow.checked) {
        setWelcomeDismissed();
      }

      welcomeModal.hidden = true;
      document.body.classList.remove('welcome-open');

      if (nextMode) {
        setViewMode(nextMode);
      }

      if (playBtn) {
        playBtn.focus({ preventScroll: true });
      }
    }

    function openWelcomeModal() {
      if (isWelcomeDismissed()) return;

      welcomeModal.hidden = false;
      document.body.classList.add('welcome-open');
      welcomeEnterRadio.focus({ preventScroll: true });
    }

    function initWelcomeModal() {
      if (isWelcomeDismissed()) return;

      openWelcomeModal();
    }

    function setDeepImmersiveChromeVisible(visible) {
      deepImmersiveChrome.hidden = !visible;
      deepImmersiveBtn.setAttribute('aria-pressed', String(visible));
      document.body.classList.toggle('deep-immersive-chrome-visible', visible);
    }

    function syncDeepImmersiveMini(data = current) {
      if (!data) return;

      deepMiniTrack.textContent = data.track_title || data.icecast_title || 'Unknown transmission';
      deepMiniRelease.textContent = [data.release_id, data.release_title].filter(Boolean).join(' · ') || 'MDK archive';
      deepMiniStatus.textContent = 'status live';
      deepMiniMeta.textContent = `${data.bitrate || 160} kbps · ${data.source_format || 'mp3'}`;
    }

    function clearDeepImmersiveIdleTimer() {
      if (deepImmersiveIdleTimer) {
        window.clearTimeout(deepImmersiveIdleTimer);
        deepImmersiveIdleTimer = null;
      }
    }

    function scheduleDeepImmersiveHide() {
      clearDeepImmersiveIdleTimer();

      if (!deepImmersiveActive) return;

      deepImmersiveIdleTimer = window.setTimeout(() => {
        if (!deepImmersiveActive) return;
        setDeepImmersiveChromeVisible(false);
      }, 2400);
    }

    function revealDeepImmersiveChrome() {
      if (!deepImmersiveActive) return;

      setDeepImmersiveChromeVisible(true);
      scheduleDeepImmersiveHide();
    }

    function exitDeepImmersive(options = {}) {
      const { focusReturn = true } = options;
      deepImmersiveActive = false;
      clearDeepImmersiveIdleTimer();
      document.body.classList.remove('deep-immersive');
      setDeepImmersiveChromeVisible(false);
      if (focusReturn) {
        deepImmersiveBtn.focus({ preventScroll: true });
      }
    }

    function enterDeepImmersive() {
      if (currentViewMode !== 'immersive') {
        setViewMode('immersive');
      }

      deepImmersiveActive = true;
      document.body.classList.add('deep-immersive');
      setDeepImmersiveChromeVisible(true);
      scheduleDeepImmersiveHide();
      deepExitBtn.focus({ preventScroll: true });
    }

    function setupAudioGraph() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !spectrumCtx) return false;

      if (!audioContext) {
        audioContext = new AudioCtx();
      }

      if (!mediaSource) {
        mediaSource = audioContext.createMediaElementSource(radio);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0.82;
        spectrumData = new Uint8Array(analyser.frequencyBinCount);
        mediaSource.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      return true;
    }

    function updateViewModeButtons(mode) {
      viewModeButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.viewMode === mode));
      });
    }

    function setViewMode(mode) {
      if (!['radio', 'immersive', 'focus'].includes(mode)) return;

      if (mode !== 'immersive' && deepImmersiveActive) {
        exitDeepImmersive({ focusReturn: false });
      }

      currentViewMode = mode;
      document.body.classList.toggle('view-radio', mode === 'radio');
      document.body.classList.toggle('view-immersive', mode === 'immersive');
      document.body.classList.toggle('view-focus', mode === 'focus');
      updateViewModeButtons(mode);

      if ((mode === 'radio' || mode === 'immersive') && (!isBroadcastView || !radio.paused)) {
        startButterchurn();
      } else {
        stopButterchurn();
      }
    }

    function resizeSpectrum() {
      const rect = spectrum.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (spectrum.width !== width || spectrum.height !== height) {
        spectrum.width = width;
        spectrum.height = height;
      }
    }

    function clamp01(value) {
      return Math.max(0, Math.min(1, value));
    }

    function mixChannel(a, b, amount) {
      return Math.round(a + (b - a) * amount);
    }

    function mixRgb(from, to, amount) {
      return [
        mixChannel(from[0], to[0], amount),
        mixChannel(from[1], to[1], amount),
        mixChannel(from[2], to[2], amount),
      ];
    }

    function rgbString(rgb) {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    function rgbaString(rgb, alpha) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }

    function getSpectrumBarColor(level) {
      const eased = Math.pow(clamp01(level), 0.82);
      const low = [99, 255, 213];
      const mid = [242, 196, 109];
      const high = [255, 145, 212];
      const core = eased < 0.55
        ? mixRgb(low, mid, eased / 0.55)
        : mixRgb(mid, high, (eased - 0.55) / 0.45);
      const top = mixRgb(core, [255, 238, 202], 0.18 + eased * 0.16);
      const base = mixRgb(core, [8, 18, 14], 0.70);

      return {
        top: rgbString(top),
        core: rgbString(core),
        base: rgbString(base),
        glow: rgbaString(core, 0.12 + eased * 0.16),
      };
    }

    function drawSpectrum() {
      if (!analyser || !spectrumData) return;

      resizeSpectrum();
      analyser.getByteFrequencyData(spectrumData);

      const width = spectrum.width;
      const height = spectrum.height;
      const dpr = window.devicePixelRatio || 1;
      const barCount = 48;
      const gap = Math.max(2, Math.floor(3 * dpr));
      const cellWidth = width / barCount;
      const barWidth = Math.max(4 * dpr, cellWidth - gap);
      const nyquist = audioContext.sampleRate / 2;
      const minBin = Math.max(1, Math.floor((10 / nyquist) * spectrumData.length));
      const maxBin = Math.min(spectrumData.length - 1, Math.ceil((20000 / nyquist) * spectrumData.length));
      const noiseFloor = 18;
      const verticalHeadroom = 0.88;

      if (!spectrumLevels || spectrumLevels.length !== barCount) {
        spectrumLevels = new Array(barCount).fill(0);
      }

      spectrumCtx.clearRect(0, 0, width, height);
      spectrumCtx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      spectrumCtx.fillRect(0, 0, width, height);

      for (let i = 0; i < barCount; i += 1) {
        const t0 = i / barCount;
        const t1 = (i + 1) / barCount;
        const start = Math.floor(minBin * Math.pow(maxBin / minBin, t0));
        const end = Math.max(start + 1, Math.floor(minBin * Math.pow(maxBin / minBin, t1)));
        let sum = 0;
        let peak = 0;

        for (let j = start; j < end; j += 1) {
          const bin = spectrumData[Math.min(j, spectrumData.length - 1)];
          sum += bin;
          peak = Math.max(peak, bin);
        }

        const average = sum / (end - start);
        const weighted = average * 0.72 + peak * 0.28;
        const cleaned = Math.max(0, weighted - noiseFloor) / (255 - noiseFloor);
        const lowMidBoost = 1.18 - Math.min(0.30, t0 * 0.42);
        const target = Math.min(verticalHeadroom, Math.pow(cleaned * lowMidBoost, 0.82) * verticalHeadroom);
        const smoothing = target > spectrumLevels[i] ? 0.34 : 0.14;

        spectrumLevels[i] += (target - spectrumLevels[i]) * smoothing;

        const barHeight = Math.max(2 * dpr, spectrumLevels[i] * height);
        const x = i * cellWidth;
        const y = height - barHeight;
        const drawWidth = Math.min(barWidth, width - x);
        const intensity = clamp01(spectrumLevels[i] / verticalHeadroom);
        const color = getSpectrumBarColor(intensity);
        const gradient = spectrumCtx.createLinearGradient(0, y, 0, height);

        gradient.addColorStop(0, color.top);
        gradient.addColorStop(0.58, color.core);
        gradient.addColorStop(1, color.base);
        spectrumCtx.shadowBlur = 5 * dpr * Math.max(0.35, intensity);
        spectrumCtx.shadowColor = color.glow;
        spectrumCtx.fillStyle = gradient;
        spectrumCtx.fillRect(x, y, drawWidth, barHeight);
      }

      spectrumCtx.shadowBlur = 0;
      spectrumCtx.shadowColor = 'transparent';

      spectrumFrame = requestAnimationFrame(drawSpectrum);
    }

    async function startSpectrum() {
      if (spectrumActive) return;

      try {
        if (!setupAudioGraph()) return;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        spectrumActive = true;
        spectrumWrap.classList.add('spectrum-ready');
        if (!spectrumFrame) drawSpectrum();
      } catch (err) {
        spectrumActive = false;
        spectrumWrap.classList.remove('spectrum-ready');
      }
    }

    function resizeButterchurn() {
      if (!butterchurnVisualizer || !butterchurnCanvas) return;

      const rect = butterchurnCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      butterchurnVisualizer.setRendererSize(width, height);
    }

    function renderButterchurn() {
      if (!butterchurnVisualizer || currentViewMode === 'focus') {
        butterchurnFrame = null;
        return;
      }

      butterchurnVisualizer.render();
      butterchurnFrame = requestAnimationFrame(renderButterchurn);
    }

    function chooseNextPresetIndex() {
      if (butterchurnPresetNames.length <= 1) return 0;

      const currentPresetName = butterchurnPresetNames[butterchurnPresetIndex];
      const recent = new Set(recentButterchurnPresetNames);
      const candidates = butterchurnPresetNames.filter((name) => (
        name !== currentPresetName && !recent.has(name)
      ));
      const pool = candidates.length
        ? candidates
        : butterchurnPresetNames.filter((name) => name !== currentPresetName);
      const nextPresetName = pool[Math.floor(Math.random() * pool.length)];

      return butterchurnPresetNames.indexOf(nextPresetName);
    }

    function rememberButterchurnPresetName(presetName) {
      const maxRecent = Math.min(4, Math.max(0, butterchurnPresetNames.length - 1));
      recentButterchurnPresetNames = [
        presetName,
        ...recentButterchurnPresetNames.filter((name) => name !== presetName),
      ].slice(0, maxRecent);
    }

    function loadButterchurnPreset(index, blendTime = 3) {
      if (!butterchurnVisualizer || !butterchurnPresets || !butterchurnPresetNames.length) return;

      butterchurnPresetIndex = index;
      const presetName = butterchurnPresetNames[butterchurnPresetIndex];
      butterchurnVisualizer.loadPreset(butterchurnPresets[presetName], blendTime);
      rememberButterchurnPresetName(presetName);
    }

    function trackKeyFromData(data) {
      return data.source_url || data.track_title || data.icecast_title || '';
    }

    function maybeRotateButterchurnPreset(data) {
      const trackKey = trackKeyFromData(data);
      if (!trackKey || trackKey === lastPresetTrackKey) return;

      lastPresetTrackKey = trackKey;
      pendingPresetTrackKey = trackKey;

      if (!butterchurnReady || !butterchurnVisualizer || !butterchurnPresetNames.length) return;

      loadButterchurnPreset(chooseNextPresetIndex(), 3);
    }

    async function startButterchurn() {
      if (butterchurnFrame || butterchurnStarting || currentViewMode === 'focus') return;

      try {
        butterchurnStarting = true;
        if (!setupAudioGraph()) return;

        await loadScript('vendor/butterchurn/butterchurn.min.js');
        await loadScript('vendor/butterchurn/butterchurn-presets-minimal.min.js');
        await loadScript('vendor/butterchurn/mdk-extra-presets.js');

        const butterchurn = window.butterchurn && window.butterchurn.default;
        const presets = window.butterchurnPresetsMinimal && window.butterchurnPresetsMinimal.getPresets();
        const extraPresets = window.mdkButterchurnExtraPresets && window.mdkButterchurnExtraPresets.getPresets();

        if (!butterchurn || !presets || !butterchurnCanvas) return;
        if (currentViewMode === 'focus') return;

        butterchurnPresets = Object.assign({}, presets, extraPresets || {});
        butterchurnPresetNames = Object.keys(butterchurnPresets);

        if (!butterchurnVisualizer) {
          butterchurnVisualizer = butterchurn.createVisualizer(audioContext, butterchurnCanvas, {
            width: butterchurnCanvas.clientWidth,
            height: butterchurnCanvas.clientHeight,
            pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
            textureRatio: 1,
          });
          loadButterchurnPreset(butterchurnPresetIndex, 0);
        }

        if (!butterchurnConnected && mediaSource) {
          butterchurnVisualizer.connectAudio(mediaSource);
          butterchurnConnected = true;
        }

        butterchurnReady = true;
        document.body.classList.add('butterchurn-ready');
        document.body.classList.remove('butterchurn-failed');
        resizeButterchurn();
        if (pendingPresetTrackKey) {
          loadButterchurnPreset(chooseNextPresetIndex(), 3);
          pendingPresetTrackKey = null;
        }
        if (!butterchurnFrame) renderButterchurn();
      } catch (err) {
        butterchurnFailed = true;
        butterchurnReady = false;
        document.body.classList.remove('butterchurn-ready');
        document.body.classList.add('butterchurn-failed');
      } finally {
        butterchurnStarting = false;
      }
    }

    function stopButterchurn() {
      if (butterchurnFrame) {
        cancelAnimationFrame(butterchurnFrame);
        butterchurnFrame = null;
      }
    }

    function stopSpectrum() {
      spectrumActive = false;
      if (spectrumFrame) {
        cancelAnimationFrame(spectrumFrame);
        spectrumFrame = null;
      }
    }

    function fmt(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
      seconds = Math.floor(seconds);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    function updateLocalClock() {
      const now = new Date();
      localClock.textContent = formatLocalTime(now);
      localClock.dateTime = now.toISOString();
    }

    function updateProgress() {
      if (!current) return;

      const baseElapsed = Number(current.track_elapsed_seconds);
      const total = Number(current.track_duration_seconds);

      if (!Number.isFinite(baseElapsed) || !Number.isFinite(total) || total <= 0) {
        elapsed.textContent = current.track_elapsed_display || '0:00';
        duration.textContent = current.track_duration_display || '--:--';
        progressBar.style.width = '0%';
        return;
      }

      const localDelta = (Date.now() - receivedAt) / 1000;
      const e = Math.min(total, baseElapsed + localDelta);
      const pct = Math.max(0, Math.min(100, (e / total) * 100));

      elapsed.textContent = fmt(e);
      duration.textContent = fmt(total);
      progressBar.style.width = `${pct}%`;
    }

    function formatLogTime(event) {
      const timestamp = Number(event.started_at_unix);
      const date = Number.isFinite(timestamp)
        ? new Date(Math.abs(timestamp) < 1e12 ? timestamp * 1000 : timestamp)
        : parseLocalTimestamp(event.started_at);

      if (!date || Number.isNaN(date.getTime())) return '--:--';

      return formatLocalTime(date);
    }

    function renderTransmissionLog(data) {
      const entries = Array.isArray(data.transmission_log)
        ? data.transmission_log.slice(0, 5)
        : [];

      if (!entries.length) {
        logLine.textContent = `[${data.track_elapsed_display || '0:00'}] ${data.station || 'MDK Space Radio'} transmitting ${data.track_title || data.icecast_title || 'unknown signal'}.`;
        return;
      }

      logLine.replaceChildren();

      entries.forEach((event) => {
        const row = document.createElement('span');
        const time = document.createElement('span');
        const title = document.createElement('span');
        const releaseName = [event.release_id, event.release_title].filter(Boolean).join(' · ');

        row.className = 'log-entry';
        time.className = 'log-time';
        title.className = 'log-title';

        time.textContent = formatLogTime(event);
        title.textContent = [
          event.track_title || 'unknown signal',
          releaseName,
        ].filter(Boolean).join(' / ');

        row.append(time, title);
        logLine.append(row);
      });
    }

    async function loadNowPlaying() {
      try {
        const res = await fetch('/now-playing.json', { cache: 'no-store' });
        const data = await res.json();
        current = data;
        receivedAt = Date.now();
        updateBroadcastPresentation(data);

        track.textContent = data.track_title || data.icecast_title || 'Unknown transmission';
        release.textContent = [data.release_id, data.release_title].filter(Boolean).join(' · ') || 'MDK archive';

        if (data.absolute_cover_url || data.local_cover_url) {
          cover.src = data.absolute_cover_url || data.local_cover_url;
          cover.style.display = '';
        }

        renderTrackLinks(data);

        liveText.textContent = `Live Connections · ${data.listeners ?? 0}`;
        statusLine.textContent = `status live · ${data.bitrate || 160} kbps · ${data.source_format || 'mp3'}`;
        syncDeepImmersiveMini(data);
        renderTransmissionLog(data);
        window.UIWidgets.syncTelemetry(data);
        maybeRotateButterchurnPreset(data);

        updateProgress();
      } catch (err) {
        statusLine.textContent = 'status: telemetry unavailable';
      }
    }

    playBtn.addEventListener('click', async () => {
      if (radio.paused) {
        await radio.play();
        startSpectrum();
        if (currentViewMode !== 'focus') startButterchurn();
      } else {
        radio.pause();
      }
    });

    radio.addEventListener('play', () => {
      playBtn.textContent = 'Mute';
      playBtn.setAttribute('aria-label', 'Mute stream');
      startSpectrum();
      if (currentViewMode !== 'focus') startButterchurn();
    });

    radio.addEventListener('pause', () => {
      playBtn.textContent = 'Unmute';
      playBtn.setAttribute('aria-label', 'Unmute stream');
      stopSpectrum();
    });

    volume.addEventListener('input', () => {
      radio.volume = Number(volume.value);
    });

    viewModeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setViewMode(button.dataset.viewMode);
      });
    });

    deepImmersiveBtn.addEventListener('click', () => {
      if (deepImmersiveActive) {
        exitDeepImmersive();
      } else {
        enterDeepImmersive();
      }
    });

    deepExitBtn.addEventListener('click', () => {
      exitDeepImmersive();
    });

    window.addEventListener('mousemove', () => {
      if (deepImmersiveActive) revealDeepImmersiveChrome();
    }, { passive: true });

    window.addEventListener('touchstart', () => {
      if (deepImmersiveActive) revealDeepImmersiveChrome();
    }, { passive: true });

    window.addEventListener('click', () => {
      if (deepImmersiveActive) revealDeepImmersiveChrome();
    }, { passive: true });

    window.addEventListener('keydown', (event) => {
      if (!deepImmersiveActive) return;

      if (event.key === 'Escape') {
        exitDeepImmersive();
        return;
      }

      revealDeepImmersiveChrome();
    });

    welcomeCloseBtn.addEventListener('click', () => {
      closeWelcomeModal({ persist: true });
    });

    welcomeEnterRadio.addEventListener('click', () => {
      closeWelcomeModal({ persist: true, nextMode: 'radio' });
    });

    welcomeStartFocus.addEventListener('click', () => {
      closeWelcomeModal({ persist: true, nextMode: 'focus' });
    });

    welcomeModal.addEventListener('click', (event) => {
      if (event.target === welcomeModal || event.target.hasAttribute('data-welcome-close')) {
        closeWelcomeModal({ persist: welcomeDontShow.checked });
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !welcomeModal.hidden) {
        closeWelcomeModal({ persist: welcomeDontShow.checked });
      }
    });

    setViewMode('radio');
    if (!isBroadcastView) initWelcomeModal();
    initBroadcastPlayback();
    updateLocalClock();
    loadNowPlaying();
    setInterval(loadNowPlaying, 10000);
    setInterval(updateProgress, 1000);
    setInterval(updateLocalClock, 1000);
    window.addEventListener('resize', () => {
      resizeSpectrum();
      resizeButterchurn();
    });
