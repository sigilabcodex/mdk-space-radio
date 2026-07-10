# MDK Space Radio v1.1 Status

## Public URLs

- Web player: https://radio.mdkband.com
- Stream: https://radio.mdkband.com/stream.mp3
- M3U: https://radio.mdkband.com/listen.m3u
- PLS: https://radio.mdkband.com/listen.pls
- Now playing JSON: https://radio.mdkband.com/now-playing.json
- Icecast status proxy: https://radio.mdkband.com/status.json

## Features

- Liquidsoap + Icecast stream
- Internet Archive source playlist
- 10 second crossfade
- Random station IDs / audio marks every 10-15 minutes
- Rich now-playing metadata
- Local cover cache
- Read-only progress bar
- Mobile-friendly web player

## Main paths

- Liquidsoap config: /opt/swr-radio/swr-radio.liq
- Manifest: /opt/swr-radio/data/radio-manifest.json
- Main playlist: /opt/swr-radio/cache/playlist.m3u
- Audio marks playlist: /opt/swr-radio/cache/audio-marks-timed.m3u
- Metadata map: /opt/swr-radio/cache/playlist-nowplaying-map.json
- Now playing updater: /opt/swr-radio/bin/update-now-playing.py
- M3U generator: /opt/swr-radio/bin/generate-m3u.py
- Audio marks generator: /opt/swr-radio/bin/generate-audio-marks-playlist.py
- Web root: /home/mdk/web/radio.mdkband.com/public_html

## Nginx includes

- /home/mdk/conf/web/radio.mdkband.com/nginx.ssl.conf_swr-radio
- /home/mdk/conf/web/radio.mdkband.com/nginx.conf_swr-radio

## Services

- icecast2
- swr-radio
- mdk-now-playing

## Quick checks

    sudo systemctl status icecast2 --no-pager
    sudo systemctl status swr-radio --no-pager
    sudo systemctl status mdk-now-playing --no-pager

    curl -I https://radio.mdkband.com/stream.mp3
    curl -s https://radio.mdkband.com/now-playing.json | jq .
    curl -s https://radio.mdkband.com/listen.m3u
    curl -s https://radio.mdkband.com/listen.pls

## Current version note

This is the first stable public web-radio version with stream, metadata, cover cache, progress bar, crossfade, timed station IDs and mobile-friendly player.
