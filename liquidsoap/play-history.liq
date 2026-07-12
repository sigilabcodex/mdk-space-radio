# Persistent play-history event capture.
# This module contains no stream output or Icecast configuration.

play_history_spool = "/opt/swr-radio/cache/play-history-spool"
play_history_helper = "/opt/swr-radio/bin/write-play-history-event.py"
play_history_boot_id = string.trim(process.read("cat /proc/sys/kernel/random/uuid"))
play_history_counter = ref(0)

def record_play_start(metadata) =
  track_id = list.assoc(default="", "track_id", metadata)
  if track_id == "" then
    log.important("PLAY_HISTORY missing track_id; event skipped: #{metadata}")
  else
    ref.incr(play_history_counter)
    event_uid = "#{play_history_boot_id}:#{play_history_counter()}"
    started_at = "#{time()}"
    release_id = list.assoc(default="", "release_id", metadata)
    source_url = list.assoc(default="", "source_url", metadata)
    title = list.assoc(default="", "title", metadata)
    thread.run(fast=false, fun () -> begin
      observed_at = "#{time()}"
      process.run(
        env=[
          ("MDK_EVENT_UID", event_uid),
          ("MDK_TRACK_ID", track_id),
          ("MDK_STARTED_AT", started_at),
          ("MDK_OBSERVED_AT", observed_at),
          ("MDK_DETECTION_SOURCE", "liquidsoap"),
          ("MDK_RELEASE_ID", release_id),
          ("MDK_SOURCE_URL", source_url),
          ("MDK_TITLE", title)
        ],
        inherit_env=true,
        rwdirs=[play_history_spool],
        network=false,
        play_history_helper
      )
    end)
  end
end
