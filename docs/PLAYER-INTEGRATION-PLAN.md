# Player integration plan

Status: approved local prototypes preserved; production integration is paused pending waveform, catalog, and rotating-buffer architecture review.

## Radio

The approved Radio composition is the local artifact at `.artifacts/player-integrated-preview/`.

- Square cover, expressive title, compact framed release/album/track metadata, and a secondary Refined Thin waveform are approved.
- The waveform shows elapsed and remaining time, played/unplayed regions, a playhead, palette-derived accent, and a discreet end marker.
- Track identity changes use the restrained phosphor sequence: incoming signal, outgoing persistence, cover crossfade, typed title, metadata appearance, and waveform reveal. Reduced motion uses a short opacity transition.
- Radio retains Connect/Disconnect semantics, the calibrated Gain control, three primary action menus, and the internal accessible cover lightbox.
- Existing Radio and Focus responsive behavior remains in scope.

## Broadcast

The approved Broadcast composition is the local artifact at `.artifacts/broadcast-integrated-preview/`.

- Broadcast shares Radio's title, metadata, Refined Thin waveform, palette treatment, cover crossfade, and visual track-change transition.
- It replaces Radio controls/actions with passive transmission state, the Broadcast listen identity, and SIGNAL TRANSIT, RECEIVER ARRAY, and TEMPORAL DRIFT.
- It retains spectrum, lower telemetry, archive register, text relay, Butterchurn behavior, and the autoplay standby overlay.
- Broadcast is desktop-only: primary target 1920x1080; supported minimum approximately 1366x768. Normal vertical scrolling is acceptable.
- Mobile and touch-first Broadcast work are out of scope. No phone layout is part of production integration.

## Integration boundary

Production integration must preserve one persistent `#radio` element and must not make UI rendering control Liquidsoap or stream transitions. Existing now-playing synchronization remains the timing authority. The shared visual layer may render metadata, waveform data, palette accents, and visual transition state, while Radio and Broadcast retain their mode-specific lower regions.

## Pause condition

Do not begin production integration until the waveform/catalog contract and the rotating local audio-buffer architecture have been reviewed and accepted. A missing frontend waveform asset must always fall back without affecting audio playback.
