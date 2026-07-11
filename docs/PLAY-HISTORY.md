# MDK Space Radio play history

This subsystem records source-track starts in SQLite and generates a static statistics report. It is deliberately separate from the active Liquidsoap and now-playing services. The files under `systemd/` are versioned source files; this phase does not install or enable them.

## Runtime and generated paths

The proposed runtime paths are:

```text
/opt/swr-radio/data/play-history.sqlite3
/opt/swr-radio/data/play-history.sqlite3-wal
/opt/swr-radio/data/play-history.sqlite3-shm
/opt/swr-radio/cache/play-history-spool/
```

The proposed public outputs are:

```text
/home/mdk/web/radio.mdkband.com/public_html/stats/index.html
/home/mdk/web/radio.mdkband.com/public_html/stats/stats.json
```

These are runtime/generated data and must not be committed. Scripts, tests, templates, CSS, documentation, and systemd source units are versioned.

## Event format

One JSON object represents one source-track start:

```json
{
  "event_uid": "liquidsoap-boot-id:42",
  "track_id": "MDK100-D01-T07",
  "started_at": "2026-07-12T00:00:00Z",
  "observed_at": "2026-07-12T00:00:00Z",
  "detection_source": "liquidsoap"
}
```

`event_uid` is the idempotency key. Distinct event UIDs are always distinct plays, including consecutive plays of the same track. Events are never deduplicated by title, track, or URL.

## Recorder CLI

Synchronize a schema 1.0 catalog without recording an event:

```bash
bin/record-play-history.py \
  --database /tmp/play-history.sqlite3 \
  --manifest /tmp/mdk-radio-manifest-v1.json \
  --sync-only
```

Read one event from stdin:

```bash
printf '%s\n' '{"event_uid":"session:1","track_id":"MDK001-D01-T01","started_at":"2026-07-12T00:00:00Z"}' | \
  bin/record-play-history.py --database /tmp/play-history.sqlite3 \
  --manifest /tmp/mdk-radio-manifest-v1.json
```

Read from a file or a direct CLI argument:

```bash
bin/record-play-history.py --database /tmp/play-history.sqlite3 \
  --manifest /tmp/mdk-radio-manifest-v1.json --event-file /tmp/event.json

bin/record-play-history.py --database /tmp/play-history.sqlite3 \
  --manifest /tmp/mdk-radio-manifest-v1.json \
  --event-json '{"event_uid":"session:2","track_id":"MDK001-D01-T02","started_at":"2026-07-12T00:05:00Z"}'
```

Exit codes are `0` for success/idempotent duplicate, `2` for invalid input, `3` for storage failures, `4` for an unknown/non-radio-ready track, and `5` when spool consumption moved one or more invalid events to `failed/`.

## Atomic spool and retry

Spooling validates the event envelope, writes a temporary file in the spool directory, flushes it, and publishes it with `os.replace()`:

```bash
bin/record-play-history.py --spool \
  --spool-dir /tmp/play-history-spool --event-file /tmp/event.json
```

Consume root-level `*.json` files in lexical filename order:

```bash
bin/record-play-history.py --database /tmp/play-history.sqlite3 \
  --manifest /tmp/mdk-radio-manifest-v1.json \
  --spool-dir /tmp/play-history-spool --consume-spool
```

Files are removed only after a successful commit or an idempotent duplicate. Invalid or unknown-track events move atomically to `failed/`. After correcting the catalog or event, retry that directory explicitly:

```bash
bin/record-play-history.py --database /tmp/play-history.sqlite3 \
  --manifest /tmp/mdk-radio-manifest-v1.json \
  --spool-dir /tmp/play-history-spool --retry-failed
```

The future Liquidsoap integration should spool from the music source's track-start callback before crossfade and before sonic watermarks are mixed. It must not be connected during this phase.

## Report CLI

```bash
bin/generate-play-report.py \
  --database /tmp/play-history.sqlite3 \
  --template web/stats/index.template.html \
  --css web/stats/stats.css \
  --html-output /tmp/mdk-play-report/index.html \
  --json-output /tmp/mdk-play-report/stats.json
```

Both outputs use temporary files in their destination directories and `os.replace()`. The HTML is complete without JavaScript; its small inline script adds optional search and section filtering. No external libraries are loaded.

Album expected plays are proportional to the number of radio-ready catalog tracks. A nearby album repetition means that the album appeared among the preceding 3, 5, or 10 play positions. Current drought is measured from the last recorded play to report generation time.

Statistics begin with the first committed event. They are not retrospective, and missing callbacks can create gaps.

## Future activation and rollback

Activation requires a separately authorized change to Liquidsoap plus installation of the source units. Before activation, test with a staging database and spool, validate the Liquidsoap configuration, back up the database, and confirm permissions for both runtime and public output directories.

Rollback disables only the report timer and future recorder callback. Preserve the SQLite database and spool for diagnosis; do not delete or overwrite them. Removing the generated `/stats/` directory has no effect on the live stream or existing now-playing frontend.
