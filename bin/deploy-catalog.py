#!/usr/bin/env python3
"""Validate, stage, atomically publish, and roll back the radio catalog."""
import argparse
import importlib.util
import json
import os
import shutil
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog/radio-manifest.json"
MANIFEST = ROOT / "data/radio-manifest.json"
PLAYLIST = ROOT / "cache/playlist.m3u"
MAP = ROOT / "cache/playlist-nowplaying-map.json"
RELEASE_METADATA_MAP = ROOT / "cache/release-metadata-map.json"
BACKUPS = ROOT / "snapshots/catalog-deploy"
EXPECTED_IDENTIFIER = "mdk150-council-of-the-perplexed"
ABSENT_BACKUP_SUFFIX = ".absent"
BACKUP_FILES = (
    (CATALOG, "catalog-radio-manifest.json"),
    (MANIFEST, "runtime-radio-manifest.json"),
    (PLAYLIST, "playlist.m3u"),
    (MAP, "playlist-nowplaying-map.json"),
    (RELEASE_METADATA_MAP, "release-metadata-map.json"),
)


def load_generator():
    spec = importlib.util.spec_from_file_location("generate_m3u", ROOT / "bin/generate-m3u.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_manifest(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schema_version") != "1.0":
        raise ValueError("schema_version must be '1.0'")
    releases, tracks = data.get("releases"), data.get("tracks")
    if not isinstance(releases, list) or not isinstance(tracks, list):
        raise ValueError("releases and tracks must be arrays")
    actual = (len(releases), len(tracks))
    declared = (data.get("release_count"), data.get("track_count"))
    if actual != (150, 1109) or declared != actual:
        raise ValueError(f"expected/declared 150 releases and 1109 tracks; actual={actual}, declared={declared}")
    candidates = [release for release in releases if release.get("release_id") == "MDK150"]
    if len(candidates) != 1:
        raise ValueError(f"expected exactly one MDK150 release; found {len(candidates)}")
    release = candidates[0]
    if release.get("release_number") != 150:
        raise ValueError("MDK150 release_number must be 150")
    if release.get("archive_identifier") != EXPECTED_IDENTIFIER:
        raise ValueError(f"MDK150 archive_identifier must be {EXPECTED_IDENTIFIER!r}")
    release_tracks = [track for track in tracks if track.get("release_id") == "MDK150"]
    if len(release_tracks) != 10 or release.get("track_count") != 10:
        raise ValueError("MDK150 must declare and contain exactly 10 tracks")
    if set(release.get("track_ids") or ()) != {track.get("track_id") for track in release_tracks}:
        raise ValueError("MDK150 track_ids do not match its tracks")
    if sum(track.get("radio_ready") is True for track in tracks) != 1109:
        raise ValueError("all 1109 tracks must be radio_ready")
    return data


def atomic_copy(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{destination.name}.", dir=destination.parent)
    try:
        with source.open("rb") as reader, os.fdopen(fd, "wb") as writer:
            shutil.copyfileobj(reader, writer)
            writer.flush()
            os.fsync(writer.fileno())
        os.chmod(temporary, source.stat().st_mode & 0o777)
        os.replace(temporary, destination)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def snapshot():
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = BACKUPS / stamp
    target.mkdir(parents=True)
    for path, backup_name in BACKUP_FILES:
        if not path.is_file():
            if path == RELEASE_METADATA_MAP:
                (target / f"{backup_name}{ABSENT_BACKUP_SUFFIX}").touch()
                continue
            raise FileNotFoundError(f"active file missing: {path}")
        shutil.copy2(path, target / backup_name)
    return target


def backup_path(value):
    if value != "latest":
        return Path(value).resolve()
    choices = sorted(path for path in BACKUPS.iterdir() if path.is_dir())
    if not choices:
        raise FileNotFoundError(f"no backups under {BACKUPS}")
    return choices[-1]


def install(manifest, playlist, metadata_map, release_metadata_map):
    # The map and manifests are ready before Liquidsoap sees the watched playlist.
    atomic_copy(manifest, CATALOG)
    atomic_copy(manifest, MANIFEST)
    atomic_copy(release_metadata_map, RELEASE_METADATA_MAP)
    atomic_copy(metadata_map, MAP)
    atomic_copy(playlist, PLAYLIST)


def restore(directory):
    required = {active: directory / backup_name for active, backup_name in BACKUP_FILES}
    release_absent_marker = directory / f"{required[RELEASE_METADATA_MAP].name}{ABSENT_BACKUP_SUFFIX}"
    missing = [
        str(path) for active, path in required.items()
        if active != RELEASE_METADATA_MAP and not path.is_file()
    ]
    if not required[RELEASE_METADATA_MAP].is_file() and not release_absent_marker.is_file():
        missing.append(str(required[RELEASE_METADATA_MAP]))
    if missing:
        raise FileNotFoundError(f"incomplete backup: {', '.join(missing)}")
    # Restore the watched playlist first; maps follow immediately afterwards.
    atomic_copy(required[PLAYLIST], PLAYLIST)
    if required[RELEASE_METADATA_MAP].is_file():
        atomic_copy(required[RELEASE_METADATA_MAP], RELEASE_METADATA_MAP)
    else:
        RELEASE_METADATA_MAP.unlink(missing_ok=True)
    atomic_copy(required[MAP], MAP)
    atomic_copy(required[MANIFEST], MANIFEST)
    atomic_copy(required[CATALOG], CATALOG)


def smoke():
    validate_manifest(MANIFEST)
    if CATALOG.read_bytes() != MANIFEST.read_bytes():
        raise ValueError("catalog and runtime manifests differ")
    if sum(line.startswith("annotate:") for line in PLAYLIST.read_text(encoding="utf-8").splitlines()) != 1109:
        raise ValueError("active playlist does not contain 1109 entries")
    metadata = json.loads(MAP.read_text(encoding="utf-8"))
    if len(metadata) != 1109 or sum(item.get("release_id") == "MDK150" for item in metadata.values()) != 10:
        raise ValueError("active metadata map has incorrect total or MDK150 count")
    release_metadata = json.loads(RELEASE_METADATA_MAP.read_text(encoding="utf-8"))
    if len(release_metadata) != 150 or "MDK150" not in release_metadata:
        raise ValueError("active release metadata map has incorrect total or missing MDK150")
    expected_fields = {
        "release_text", "release_text_source", "release_text_source_url",
        "release_text_fragments", "producer_codes", "producer_profile", "producer_label",
    }
    if any(
        not isinstance(item, dict)
        or set(item) != expected_fields
        or not isinstance(item["release_text"], str)
        or not isinstance(item["release_text_fragments"], list)
        or not isinstance(item["producer_codes"], list)
        for item in release_metadata.values()
    ):
        raise ValueError("active release metadata map has an invalid entry schema")
    with urllib.request.urlopen("http://127.0.0.1:8000/status-json.xsl", timeout=10) as response:
        status = json.load(response)
    if not status.get("icestats", {}).get("source"):
        raise ValueError("Icecast status has no active source")


def deploy(source):
    validate_manifest(source)
    generator = load_generator()
    with tempfile.TemporaryDirectory(prefix="catalog-deploy-", dir=ROOT / "cache") as temp:
        stage = Path(temp)
        staged_manifest = stage / MANIFEST.name
        shutil.copy2(source, staged_manifest)
        staged_playlist, staged_map = stage / PLAYLIST.name, stage / MAP.name
        staged_release_metadata = stage / RELEASE_METADATA_MAP.name
        count = generator.generate(staged_manifest, staged_playlist, staged_map,
                                  release_metadata_map_output=staged_release_metadata)
        if count != 1109:
            raise ValueError(f"playlist generator emitted {count}, expected 1109")
        backup = snapshot()
        try:
            install(staged_manifest, staged_playlist, staged_map, staged_release_metadata)
            smoke()
        except Exception:
            restore(backup)
            raise
    print(f"Deployed catalog; rollback backup: {backup}")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    deploy_parser = sub.add_parser("deploy")
    deploy_parser.add_argument("--manifest", type=Path, required=True)
    rollback_parser = sub.add_parser("rollback")
    rollback_parser.add_argument("--backup", required=True, help="backup directory or 'latest'")
    args = parser.parse_args(argv)
    try:
        if args.command == "deploy":
            deploy(args.manifest.resolve())
        else:
            directory = backup_path(args.backup)
            restore(directory)
            print(f"Rolled back catalog from {directory}")
    except Exception as exc:
        print(f"catalog {args.command} failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
