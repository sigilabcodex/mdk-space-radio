# Incident: Internet Archive partial outage and emergency local failover

**Date:** 2026-07-19  
**Service:** MDK Space Radio  
**Severity:** High — the primary remote audio origin became unavailable from the VPS and the station lost normal program continuity and metadata fidelity.

## Summary

Internet Archive remained reachable from at least one residential connection, but requests from the MDK Space Radio VPS (`45.42.40.1`) returned outage/error responses, including HTTP 503 and HTML instead of MP3 audio. This was therefore a partial, regional, routing, edge, or source-IP-specific failure rather than proof of a universal Internet Archive outage.

The station originally depended on Internet Archive for both audio files and release covers. When the VPS could not retrieve those assets, Liquidsoap exhausted or failed remote requests and the public player lost normal continuity.

An emergency local source was assembled from the original MDK library:

- canonical source library: `/media/diegom/rootMX23/home/diegom/Music`
- 1109 FLAC files
- 153 local images, normally `cover.png` inside each release directory
- emergency audio on VPS: `/opt/swr-radio/emergency/tracks/`
- 50 local MP3 files
- emergency covers on VPS: `/opt/swr-radio/emergency/covers/`
- 41 covers for 41 releases represented by those 50 tracks

The local MP3 files retained basic ID3 metadata, but the existing now-playing and play-history pipeline depends on canonical `track_id` and `release_id`. A first plain local playlist therefore produced audio but not complete cover, duration, history, or canonical now-playing data.

A local enriched playlist was later generated with 50 entries and 50 canonical track IDs:

- `/opt/swr-radio/cache/emergency-local-enriched.m3u`
- `/opt/swr-radio/cache/active-playlist.m3u`

Local covers were published through the existing Nginx `/covers/` route under:

- filesystem: `/home/mdk/web/radio.mdkband.com/public_html/covers/`
- public URL pattern: `https://radio.mdkband.com/covers/MDK###.<ext>`

## Important forensic findings

1. No evidence showed a catalog or Liquidsoap code change immediately preceding the first Internet Archive failures.
2. Direct requests from the VPS to Internet Archive also failed outside Liquidsoap.
3. The emergency plain local playlist played audio but Liquidsoap reported `PLAY_HISTORY missing track_id; event skipped`.
4. Replacing `active-playlist.m3u` with an enriched version caused Liquidsoap to log a playlist reload, but tracks already prepared before the reload continued with their original ID3-only metadata. A playlist reload does not retroactively alter a currently playing or already prepared track.
5. The public `now-playing.json` remained stale for emergency tracks whose play-history event was skipped.
6. The original MDK library is the correct recovery source for audio, covers, and local metadata. Emergency operation must not depend on Internet Archive cover URLs.

## Current limitations

The emergency work performed during the incident is not yet a trustworthy production failover implementation.

In particular:

- there is no confirmed, version-controlled `archive-failover.py` in this repository;
- there is no confirmed, version-controlled systemd service/timer for archive health checks;
- local emergency MP3s and covers are runtime assets and should not necessarily be committed to the public repository;
- `swr-radio.liq` is intentionally untracked because the deployed file contains the Icecast password;
- the catalog generator can overwrite `playlist-nowplaying-map.json`, including local cover substitutions;
- the now-playing pipeline must explicitly support local emergency tracks rather than relying on a manual rewrite of generated runtime data;
- there is not yet an auditable public status endpoint showing failover mode and probe history.

## Required production design

### Single observed playlist

Liquidsoap should always watch one runtime file:

`cache/active-playlist.m3u`

The failover controller should atomically replace this file with either:

- the canonical remote playlist generated from `catalog/radio-manifest.json`; or
- a locally enriched emergency playlist with canonical IDs and local file paths.

No routine source switch should require restarting Liquidsoap.

### Archive health probe

The controller must not infer recovery from the Internet Archive home page alone. A successful recovery probe must verify all of the following from the VPS:

1. DNS resolves.
2. HTTPS connection succeeds.
3. At least two representative MP3 objects from different archive items return HTTP 200 or 206.
4. The response is audio, not an HTML outage page.
5. A byte-range request returns nonzero audio bytes.
6. A representative metadata endpoint returns valid JSON.

The exact probe URLs must be configurable and documented.

### Hysteresis

To prevent flapping:

- enter local mode only after at least two consecutive failed probe cycles;
- return to remote mode only after at least three consecutive successful probe cycles;
- use a probe interval of one or two minutes;
- keep the previous valid active playlist if a copy or validation step fails.

### Atomicity and validation

Before changing modes, the controller must verify:

- source playlist exists and is nonempty;
- every local media path exists;
- every enriched emergency entry contains `track_id` and `release_id`;
- all local cover URLs used by emergency tracks return HTTP 200;
- the target playlist can be parsed by an isolated Liquidsoap check;
- replacement uses write + `fsync` + `os.replace` in the same filesystem.

### State and observability

The controller must persist state in a machine-readable file, for example:

`cache/archive-failover-state.json`

Minimum fields:

- `mode`: `remote` or `local`
- `last_probe_at`
- `last_probe_ok`
- `consecutive_failures`
- `consecutive_successes`
- `last_transition_at`
- `last_transition_reason`
- per-probe URL, HTTP status, content type, byte count, and error
- SHA-256 of the active playlist

It must also write a normal log:

`logs/archive-failover.log`

A public read-only status file should be generated, for example:

`public_html/failover-status.json`

The public status must not expose secrets or internal credentials.

### Notification

A transition should be visible without reading journal logs. At minimum:

- log every mode transition;
- expose it in `failover-status.json`;
- add a visual indicator to the public radio UI such as `SOURCE: LOCAL FALLBACK` or `SOURCE: INTERNET ARCHIVE`.

Optional future notification channels can be added after the core mechanism is tested.

### Covers and now-playing

Emergency covers must resolve locally and survive catalog regeneration. Do not patch `playlist-nowplaying-map.json` manually after every generation.

Preferred design:

- keep canonical remote metadata unchanged;
- generate a separate emergency metadata overlay keyed by `track_id` or `release_id`;
- in local mode, the now-playing publisher applies the overlay and uses local cover URLs;
- duration comes from the local media file or enriched emergency manifest;
- play-history receives the canonical IDs directly from the playlist annotations.

## Repository integration plan

The implementation should be split into version-controlled, secret-free files:

- `bin/archive-failover.py`
- `bin/build-emergency-playlist.py`
- `systemd/mdk-archive-failover.service`
- `systemd/mdk-archive-failover.timer`
- `config/archive-failover.example.json`
- `docs/runbooks/archive-failover.md`
- `tests/test_archive_failover.py`
- `tests/fixtures/` for HTML outage pages, valid MP3 range responses, invalid content types, and state transitions

Runtime-only or secret-bearing files must remain ignored:

- actual Icecast credentials
- deployed `swr-radio.liq`
- emergency audio files
- large cover files, unless a deliberate asset-storage policy is adopted
- mutable state and logs

## Acceptance criteria

The failover is not considered trustworthy until all of these are demonstrated:

1. Automated tests cover remote-to-local and local-to-remote transitions.
2. An HTML outage page with HTTP 200 is rejected as audio.
3. A single transient failure does not switch modes.
4. Three confirmed healthy cycles restore remote mode.
5. Switching playlists does not interrupt the stream process.
6. Emergency tracks expose canonical title, `track_id`, `release_id`, duration, and a working local cover.
7. `now-playing.json` updates for emergency tracks.
8. Play history records emergency tracks without `missing track_id`.
9. Reboot restores the previous failover state safely.
10. Catalog regeneration does not erase emergency cover behavior.
11. A human can inspect the current mode and the last probe result from one documented command and from the public status JSON.
12. The deployed files match a committed repository revision.

## Trust model

The controller should not be trusted merely because it is running. It becomes trustworthy through:

- version control;
- reviewable configuration;
- deterministic state transitions;
- tests with recorded failure fixtures;
- observable logs and status JSON;
- atomic writes;
- conservative recovery thresholds;
- a documented rollback procedure;
- verification that the deployed revision matches GitHub.

Until those conditions are met, emergency switching remains provisional and should be treated as an incident workaround rather than a completed production feature.
