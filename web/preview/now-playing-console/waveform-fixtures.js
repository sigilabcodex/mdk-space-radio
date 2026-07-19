(function (root) {
  'use strict';

  function seededWave(seed, length) {
    let value = seed >>> 0;
    const wave = [];
    for (let index = 0; index < length; index += 1) {
      value = (value * 1664525 + 1013904223) >>> 0;
      const noise = value / 4294967295;
      const phrase = Math.sin(index * 0.077 + seed) * 0.22;
      const pulse = Math.sin(index * 0.019 + seed * 0.4) * 0.18;
      const envelope = 0.48 + 0.28 * Math.sin(Math.PI * index / length);
      wave.push(Math.max(0.08, Math.min(1, (noise * 0.58 + Math.abs(phrase + pulse)) * envelope)));
    }
    return wave;
  }

  const tracks = {
    normal: {
      id: 'MDK062-D01-T02',
      title: 'Marmalade Insights',
      release: 'MDK062 · Notes From the Listening Room',
      duration: 409.368,
      elapsed: 174.2,
      catalog: 'MDK062 / TRACK 02',
      cover: 'citrine',
      wave: seededWave(62, 420),
    },
    short: {
      id: 'MDK014-D01-T02', title: 'Fold', release: 'MDK014 · Minor Machines',
      duration: 238.4, elapsed: 71.8, catalog: 'MDK014 / TRACK 02', cover: 'oxide', wave: seededWave(14, 420),
    },
    long: {
      id: 'MDK118-D01-T03',
      title: 'Islands of Unfinished Dreams, Reassembled in a Corridor With No Known Exit, Catalogued by Machines That Refuse to Name the Route Home',
      release: 'MDK118 · The One Thousand and Third Tale of Scheherazade — Expanded Transmission Edition',
      duration: 782.2, elapsed: 318.6, catalog: 'MDK118 / TRACK 03', cover: 'violet', wave: seededWave(118, 420),
    },
    incoming: {
      id: 'MDK032-D01-T08', title: 'Was du tust', release: 'MDK032 · Ich weiss nicht was du machst',
      duration: 499.968, elapsed: 0, catalog: 'MDK032 / TRACK 08', cover: 'signal', wave: seededWave(32, 420),
    },
    unknown: {
      id: '', title: 'UNKNOWN TRANSMISSION', release: 'Metadata carrier unavailable',
      duration: 300, elapsed: 42, catalog: 'UNRESOLVED SOURCE', cover: null, wave: seededWave(404, 420),
    },
  };

  root.WaveformFixtures = {
    tracks,
    outgoingWave: seededWave(903, 420),
    incomingWave: seededWave(417, 420),
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
