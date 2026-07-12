(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NowPlayingCta = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function usableUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch (error) {
      return null;
    }
  }

  function selectNowPlayingCta(data) {
    const candidates = [
      ['campwp_url', 'Track page', 'campwp'],
      ['bandcamp_track_url', 'Get this track', 'bandcamp'],
      ['bandcamp_url', 'Get this track', 'bandcamp'],
      ['archive_item_url', 'Download / Archive', 'archive'],
      ['archive_details_url', 'Download / Archive', 'archive'],
      ['source_url', 'Download audio', 'audio'],
    ];
    for (const [field, label, kind] of candidates) {
      const url = usableUrl(data && data[field]);
      if (url) return { field, label, kind, url };
    }
    return null;
  }

  return { selectNowPlayingCta, usableUrl };
}));
