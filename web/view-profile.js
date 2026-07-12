(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ViewProfile = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function getViewProfile(search) {
    return new URLSearchParams(search || '').get('view') === 'broadcast'
      ? 'broadcast'
      : 'default';
  }

  function applyViewProfile(document, search) {
    const profile = getViewProfile(search);
    document.body.classList.toggle('broadcast-view', profile === 'broadcast');
    return profile;
  }

  async function tryAutoplay(media) {
    try {
      await media.play();
      return true;
    } catch (error) {
      return false;
    }
  }

  return { applyViewProfile, getViewProfile, tryAutoplay };
}));
