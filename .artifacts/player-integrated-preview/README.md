# Integrated player preview

Local-only full-page visual integration at `http://127.0.0.1:8765/.artifacts/player-integrated-preview/`.

- Radio shows the revised waveform player and the separate lab toolbar.
- Focus and Immersive use the prior production-style player composition.
- All compositions control the single persistent `#radio` audio element; switching modes never reloads it.
- Refined Thin is the recommended default. Adaptive Blocky remains a lab-only option.
- The Radio transition is a local visual simulation. Production radio audio is continuous and has no authoritative incoming-transition timing yet.
- Fixture audio, covers, and 800-point sidecars come from the existing three-track player-widget lab.
- Production URLs and APIs are not requested by the preview.

Run the bounded preview suite with:

```sh
node --test .artifacts/player-integrated-preview/test_integrated_preview.js
```
