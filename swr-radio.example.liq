settings.log.file.path := "/opt/swr-radio/logs/liquidsoap.log"
settings.log.stdout := true

playlist_file = "/opt/swr-radio/cache/playlist.m3u"
marks_file = "/opt/swr-radio/cache/audio-marks-timed.m3u"

music = playlist(
  mode="randomize",
  reload_mode="watch",
  playlist_file
)

# Current MDK Space Radio transition style.
music = crossfade(duration=10., music)

marks = playlist(
  mode="normal",
  reload_mode="watch",
  marks_file
)

# Station IDs / watermarks.
# Start a little louder for testing; later we can reduce to 0.8–1.0.
marks = amplify(1.20, marks)

# Music + independently timed station IDs.
radio = add(normalize=false, [music, marks])

radio = mksafe(radio)

output.icecast(
  %mp3(bitrate=160),
  host="127.0.0.1",
  port=8000,
  password="**************************",
  mount="strange-waves.mp3",
  name="MDK Space Radio",
  description="MDK experimental electronic music from the Internet Archive",
  genre="Experimental Electronic",
  url="https://mdkband.com",
  radio
)
