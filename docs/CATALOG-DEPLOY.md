# Catalog deployment runbook

The only catalog input consumed by this repository is the schema 1.0
`radio-manifest.json` exported by `mdk-catalog-tools`. `releases.csv` and
`tracks.csv` are not read or installed by the radio.

The deploy helper validates the input, generates the runtime M3U and metadata
map in a staging directory, snapshots the four active files, and publishes each
file with an atomic rename. The watched playlist is published last. If an
install or smoke check fails, the helper restores the snapshot automatically.

It requires exactly 150 releases, 1109 radio-ready tracks, and one `MDK150`
release with ten matching tracks and Internet Archive identifier
`mdk150-council-of-the-perplexed`.

## Pre-deploy tests

```sh
cd /opt/swr-radio
python3 -m unittest discover -s tests -p 'test_*.py'
```

## Deploy (do not run until authorized)

Place the received export at `/tmp/radio-manifest.json`, then run:

```sh
cd /opt/swr-radio
./bin/deploy-catalog.py deploy --manifest /tmp/radio-manifest.json
```

The successful command prints the timestamped backup directory. Liquidsoap
already watches `/opt/swr-radio/cache/playlist.m3u`, so no service reload or
restart is part of this procedure.

## Rollback

To restore the most recently created catalog backup:

```sh
cd /opt/swr-radio
./bin/deploy-catalog.py rollback --backup latest
```

For an unambiguous historical rollback, pass the timestamped directory printed
by deploy instead of `latest`.
