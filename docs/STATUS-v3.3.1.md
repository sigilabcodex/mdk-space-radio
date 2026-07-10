# MDK Space Radio v3.3.1 Status

## Public URLs

- Web player: https://radio.mdkband.com
- Stream: https://radio.mdkband.com/stream.mp3
- M3U: https://radio.mdkband.com/listen.m3u
- PLS: https://radio.mdkband.com/listen.pls
- Now playing JSON: https://radio.mdkband.com/now-playing.json
- Icecast status proxy: https://radio.mdkband.com/status.json

## Current frontend features

- Radio / Immersive / Focus visual modes
- Butterchurn reactive background with fallback CSS
- Fixed Butterchurn startup in Radio mode
- Track-based preset rotation
- Rich now-playing metadata
- Local cover cache
- Read-only track progress bar
- Real Web Audio spectrum monitor
- Persistent transmission log
- Crossfade stream and timed MDK radio marks
- Brand favicon and social image metadata
- MDK credits and CC BY 3.0 license line

## Current public identity

MDK Space Radio · 24/7 Experimental Electronic Transmission

Music by MDK:
Mik Schuppin, Diego Madero & Kai Kraatz

License:
Creative Commons Attribution 3.0 / CC BY 3.0

## Main repo paths

- Frontend source: /opt/swr-radio/web
- Public web root: /home/mdk/web/radio.mdkband.com/public_html
- Liquidsoap config: /opt/swr-radio/swr-radio.liq
- Manifest: /opt/swr-radio/data/radio-manifest.json
- Now-playing updater: /opt/swr-radio/bin/update-now-playing.py
- M3U generator: /opt/swr-radio/bin/generate-m3u.py
- Audio marks generator: /opt/swr-radio/bin/generate-audio-marks-playlist.py
