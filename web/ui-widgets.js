(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UIWidgets = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function progressPercent(data) {
    const explicit = Number(data.progress_percent);
    if (Number.isFinite(explicit)) return Math.max(0, Math.min(100, explicit));
    const elapsed = Number(data.track_elapsed_seconds);
    const duration = Number(data.track_duration_seconds);
    return Number.isFinite(elapsed) && Number.isFinite(duration) && duration > 0
      ? Math.max(0, Math.min(100, elapsed / duration * 100))
      : 0;
  }

  function deriveTelemetryProfile(data) {
    const trackId = String(data.track_id || data.source_url || data.track_title || 'unknown-track');
    const releaseId = String(data.release_id || data.release_title || 'MDK');
    const progress = progressPercent(data);
    const listeners = Math.max(0, Number(data.listeners) || 0);
    const seed = hash(`${trackId}|${releaseId}|${progress.toFixed(2)}|${listeners}`);
    const next = (salt) => hash(`${seed}:${salt}`);
    return {
      trackId, releaseId, progress, listeners,
      channel: 1 + next('channel') % 12,
      lock: (910 + next('lock') % 85) / 10,
      azimuth: (next('azimuth') % 3600) / 10,
      elevation: -18 + (next('elevation') % 710) / 10,
    };
  }

  if (!root.document) return { deriveTelemetryProfile, progressPercent };

  const document = root.document;
  const body = document.body;
  const cover = document.getElementById('cover');
  let lastOpener = null;

  function isRadioInteractive() {
    return body.classList.contains('view-radio') && !body.classList.contains('broadcast-view');
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
  }

  function createLightbox() {
    const dialog = document.createElement('dialog');
    dialog.className = 'cover-lightbox';
    dialog.setAttribute('aria-labelledby', 'coverLightboxTitle');
    dialog.innerHTML = '<div class="lightbox-panel"><div id="coverLightboxTitle" class="lightbox-title">Current release artwork</div><button type="button" class="lightbox-close" aria-label="Close artwork">Close</button><img class="lightbox-image" alt=""></div>';
    document.body.append(dialog);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (lastOpener && isRadioInteractive()) lastOpener.focus({ preventScroll: true });
      lastOpener = null;
    });
    return dialog;
  }

  const dialog = createLightbox();

  function syncCoverInteractivity() {
    if (!cover) return;
    const enabled = isRadioInteractive();
    cover.tabIndex = enabled ? 0 : -1;
    if (enabled) {
      cover.setAttribute('role', 'button');
      cover.setAttribute('aria-label', 'Expand current release artwork');
    } else {
      cover.removeAttribute('role');
      cover.removeAttribute('aria-label');
      if (dialog.open) dialog.close();
    }
  }

  function openLightbox() {
    if (!cover || !isRadioInteractive() || !(cover.currentSrc || cover.src)) return;
    const image = dialog.querySelector('.lightbox-image');
    image.src = cover.currentSrc || cover.src;
    image.alt = cover.alt || 'Current release artwork';
    lastOpener = cover;
    dialog.showModal();
    dialog.querySelector('.lightbox-close').focus({ preventScroll: true });
  }

  function syncTelemetry(data) {
    const profile = deriveTelemetryProfile(data || {});
    const channel = `CH–${String(profile.channel).padStart(2, '0')}`;
    const now = new Date().toLocaleTimeString([], { hour12: false });
    setText('[data-telemetry-release]', profile.releaseId);
    setText('[data-telemetry-az]', `AZ ${profile.azimuth.toFixed(1)}°`);
    setText('[data-telemetry-el]', `EL ${profile.elevation >= 0 ? '+' : ''}${profile.elevation.toFixed(1)}°`);
    setText('[data-telemetry-channel]', channel);
    setText('[data-telemetry-lock]', profile.lock.toFixed(1));
    setText('[data-telemetry-listeners]', String(profile.listeners));
    setText('[data-telemetry-progress]', `${profile.progress.toFixed(1)}%`);
    setText('[data-telemetry-matrix-progress]', `PROG ${profile.progress.toFixed(1)}%`);
    setText('[data-telemetry-matrix-live]', `LIVE ${profile.listeners}`);
    setText('[data-relay-node]', `TRACK ${profile.trackId.slice(-8)}`);
    setText('[data-relay-time]', now);
    setText('[data-relay-release]', profile.releaseId);
    setText('[data-relay-track]', String(data.track_title || data.icecast_title || 'unknown signal'));
    setText('[data-relay-progress]', `${profile.progress.toFixed(1)}% complete`);
  }

  if (cover) {
    cover.addEventListener('click', openLightbox);
    cover.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(); }
    });
  }
  syncCoverInteractivity();
  new MutationObserver(syncCoverInteractivity).observe(body, { attributes: true, attributeFilter: ['class'] });

  return { deriveTelemetryProfile, progressPercent, syncTelemetry };
}));
