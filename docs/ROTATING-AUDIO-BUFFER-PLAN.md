# Rotating audio buffer proposal

Status: proposal only. This document does not authorize implementation, deployment, playlist changes, or runtime changes.

## Current architecture

Liquidsoap reads `/opt/swr-radio/cache/active-playlist.m3u`. The current controller selects either the remote `playlist.m3u` or `emergency-local-enriched.m3u`.

- Two consecutive failed remote probes switch to the local emergency playlist.
- Three consecutive successful remote probes switch back to the remote playlist.

## Proposed architecture

Internet Archive becomes a replenishment origin rather than a direct real-time playback dependency.

### 1. Persistent catalog assets

Maintain metadata by canonical `track_id`, local cover, local waveform sidecar, source URL, and validation state. Asset absence must never block existing audio playback.

### 2. Rotating local audio bank

Start by evaluating an approximately 100-track bank against a total-playable-hours capacity target. The bank would use staged downloads, validation before activation, atomic playlist updates, replacement before eviction, and an anti-repetition policy.

### 3. Stable emergency library

Retain the existing emergency library unchanged initially. It is used only when the rotating bank falls below a critical safe minimum.

## Supervisor states

| State | Meaning |
|---|---|
| `REMOTE_HEALTHY` | Origin probes succeed and the bank can replenish normally. |
| `BUFFERED` | The bank has its target-safe validated capacity. |
| `BUFFER_LOW` | Capacity remains playable but replenishment is urgent. |
| `EMERGENCY` | The bank is below the critical safe minimum; use the existing emergency library. |
| `RECOVERING` | New validated replacements are being staged before return to normal operation. |

Final thresholds are intentionally undecided.

## Supervisor responsibilities

- Probe Internet Archive availability.
- Inspect valid local track count and playable duration.
- Replenish the bank with staged downloads.
- Validate downloaded audio before activation.
- Ensure metadata, cover, and waveform readiness.
- Build playlists atomically.
- Avoid deleting an active item or the sole valid replacement.
- Prevent immediate repeats and encourage release diversity.
- Enter emergency mode only below a critical threshold.
- Refill before leaving emergency mode.
- Expose human-readable state and logs.

## Safety invariants

- Never interrupt the current Liquidsoap process during replenishment.
- Never expose partial downloads to Liquidsoap.
- Never replace a valid active playlist with an empty or invalid playlist.
- Never delete a bank item until a validated replacement exists.
- Preserve the current emergency library.
- Use locking to prevent overlapping supervisor runs.
- Use atomic rename or symlink replacement.
- Retain rollback manifests.
- Frontend asset absence must never block audio playback.

## Open decisions for tomorrow

- Track count versus total-hour capacity.
- Target, low, and emergency thresholds.
- Disk budget.
- Eviction policy.
- Repeat-avoidance window.
- Release diversity rules.
- Download concurrency and rate limits.
- Validation method.
- Waveform schema.
- Catalog repository ownership.
- Active-playlist contract.
- Interaction with the current failover timer.
- Monitoring/status interface.
- Recovery and rollback behavior.

## Suggested phased implementation

1. Audit catalog repository and disk capacity.
2. Define a manifest schema keyed by `track_id`.
3. Prototype 10–20 tracks locally.
4. Generate covers and waveform sidecars.
5. Prototype a bank manager without connecting Liquidsoap.
6. Validate atomic playlist generation.
7. Run shadow mode alongside the current controller.
8. Compare decisions and logs for several days.
9. Connect the bank as the primary Liquidsoap playlist.
10. Preserve emergency fallback and rollback.
