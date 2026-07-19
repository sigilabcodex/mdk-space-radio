# Now Playing Console — isolated visual lab

Static, offline-first laboratory for a possible future MDK Space Radio now
playing block. It does not import the production player, fetch the live radio,
or require a build step.

## Run

Open `index.html` directly, or serve this directory with any static HTTP server.
Query parameters are available for captures:

```text
?scenario=long&title=split&wave=stacked&cover=phosphor&controls=rows
```

The global simulation API is intentionally small:

```js
setTrack('long');
startTransition();
setRemainingTime(9.5);
setCrossfadeProgress(0.56);
setConnectionState('slow');
setReducedMotionPreview(true);
```

## Text variants

- **A — single line:** pauses, scrolls slowly to the end, pauses, then returns.
- **B — two lines:** the first line remains fixed; only an overflowing second
  line moves. This is the recommended default for information density and
  predictable component height.
- **C — continuous:** restrained Winamp-like loop with a visible separator.

All activate only after measured overflow. Hover, focus, or Space pauses the
ticker. The full title remains in accessible text. Reduced motion disables the
ticker and permits a compact multiline title.

## Waveform variants

1. **Single + XFADE region:** quietest and most conventional.
2. **Dual overlay:** outgoing and incoming envelopes share a baseline, with
   textual labels. Recommended because it communicates the mix without doubling
   vertical height.
3. **Dual stacked:** clearest analytical separation, but visually heavier.

The playhead is continuous. Tick marks do not redraw every second. Erase/redraw
only runs on a track change. Dummy arrays in `waveform-fixtures.js` are stable
and deterministic; no audio is analyzed.

## Cover transitions

1. **Scan-mask reveal — recommended:** 720 ms, one narrow luminous edge.
2. **Horizontal shutter:** 620 ms, closes into a restrained horizontal slit.
3. **Phosphor-line overwrite:** 850 ms, line-by-line replacement.
4. **Aperture slit:** 680 ms, neutral center aperture without 3D rotation.

Reduced motion collapses each to an immediate replacement. Every cover remains
square and the missing-art state is textually explicit.

## Controls

- **A:** all actions visible across two compact rows.
- **B — recommended:** Mute and Get This Track remain visible; Direct Stream,
  M3U, PLS, Archive, and Support live under an accessible More disclosure.

No link functionality is removed in either variant.

## Captures

Generated locally with headless Chromium; none are deployed:

- `/.artifacts/now-playing-console/lab-desktop-1920x1080.png`
- `/.artifacts/now-playing-console/recommended-desktop-1366x768.png`
- `/.artifacts/now-playing-console/recommended-mobile-390x844.png`
- `/.artifacts/now-playing-console/reduced-motion-mobile-390x844.png`
- `/.artifacts/now-playing-console/xfade-overlay-desktop-1920x1080.png`
- `/.artifacts/now-playing-console/xfade-single-1366x768.png`
- `/.artifacts/now-playing-console/xfade-stacked-768x1024.png`

## Recommended composition

Use title variant B, waveform variant 2, scan-mask cover reveal, and controls
variant B. This combination preserves editorial hierarchy, makes the 10-second
crossfade legible, and remains compact on 390 px screens.
