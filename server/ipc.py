import sys
import os
import json
import platform
from pathlib import Path
import utils
import spotify
import download

ENV_PATH = ".env"

def get_default_download_path():
  home = str(Path.home())
  if platform.system() == "Windows":
    return os.path.join(home, "Documents", "spotipoop-downloads")
  else:
    return os.path.join(home, "spotipoop-downloads")

def main():
  global ENV_PATH
  utils.load_config(ENV_PATH)
  if os.getenv("VITE_DOWNLOAD_PATH"):
    download.DOWNLOAD_PATH = os.getenv("VITE_DOWNLOAD_PATH")
  else:
    download.DOWNLOAD_PATH = get_default_download_path()

  import concurrent.futures
  import threading
  
  print_lock = threading.Lock()
  
  def safe_print(data):
    with print_lock:
      print(json.dumps(data), flush=True)

  def process_command(command):
    global ENV_PATH
    try:
      # Choice 1: Download single track
      if command["choice"] == 1:
        sys.stderr.write(f"DEBUG: Processing download for {command['name']}\n")
        sys.stderr.flush()
        res = spotify.searchSpotify(f"{command['name']} {command['artist']}")
        dw = download.downloadAudio(res[0], command.get("quality", 320))
        if dw:
          safe_print({"type": "download", "message": f"{res[0].get('id', '')}"})
        else:
          safe_print({"type": "error", "message": f"Failed downloading {command['name']}"})

      # Choice 2: Get playlist/album details
      elif command["choice"] == 2:
        collection_id, collection_type = utils.extractId(command["link"])
        if collection_id:
          collection = spotify.scrape_spotify_collection(collection_id, collection_type)
          safe_print({"type": "search_playlist", "data": collection})
        else:
          safe_print({"type": "error", "message": "Invalid link."})

      # Choice 3: Update download path
      elif command["choice"] == 3:
        download.DOWNLOAD_PATH = command["path"]
        utils.update_env_variable(ENV_PATH, "VITE_DOWNLOAD_PATH", command["path"])
        safe_print({"type": "download_path", "message": f"path updated to: {download.DOWNLOAD_PATH}"})

      # Choice 4: Search for a track
      elif command["choice"] == 4:
        sys.stderr.write(f"DEBUG: Processing search for {command['query']}\n")
        sys.stderr.flush()
        tracks = spotify.searchSpotify(command["query"])
        safe_print({"type": "search_songs", "data": tracks})

      # Choice 5: Download album/playlist
      elif command["choice"] == 5:
        c_id, c_type = utils.extractId(command["link"])
        collection = spotify.scrape_spotify_collection(c_id, c_type)

        if collection and "songs" in collection:
          original_base = download.DOWNLOAD_PATH
          folder_name = utils.clean_filename(collection["name"])
          download.DOWNLOAD_PATH = os.path.join(original_base, folder_name)

          safe_print({"type": "status", "message": f"Starting bulk download to: {download.DOWNLOAD_PATH}"})

          for i, track in enumerate(collection["songs"]):
            msg = f"[{i+1}/{len(collection['songs'])}] Downloading: {track['name']}"
            safe_print({"type": "status", "message": msg})
            download.downloadAudio(track, command.get("quality", 320))

          download.DOWNLOAD_PATH = original_base
        else:
          safe_print({"type": "error", "message": "Failed to load collection."})

      # Choice 6: Update env path
      elif command["choice"] == 6:
        ENV_PATH = command["env_path"]
        if not ENV_PATH.endswith(".env"):
          ENV_PATH = os.path.join(ENV_PATH, ".env")

        utils.load_config(ENV_PATH)
        if os.getenv("VITE_DOWNLOAD_PATH"):
          download.DOWNLOAD_PATH = os.getenv("VITE_DOWNLOAD_PATH")
        safe_print({"type": "status", "message": f"Env path set to {ENV_PATH}"})

      # Choice 7: Get current download path
      elif command["choice"] == 7:
        safe_print({"type": "download_path", "path": download.DOWNLOAD_PATH})

      # Choice 8: Get stream URL
      elif command["choice"] == 8:
        sys.stderr.write(f"DEBUG: Processing stream for {command.get('name')} (ID: {command.get('id')})\n")
        sys.stderr.flush()
        
        track_info = {
            "id": command.get("id"),
            "name": command.get("name"),
            "artist": command.get("artist")
        }
        
        stream_url = download.getStreamUrl(track_info)
        if stream_url:
          safe_print({"type": "stream_url", "url": stream_url, "id": command.get("id")})
        else:
          safe_print({"type": "error", "message": f"Failed getting stream URL for {command.get('name')}"})

      # Choice 9: Get autoplay recommendations
      elif command["choice"] == 9:
        sys.stderr.write(f"DEBUG: Processing autoplay for {command.get('id')}\n")
        sys.stderr.flush()
        if "id" in command and command["id"]:
          tracks = spotify.get_autoplay_recommendations(command["id"])
          if isinstance(tracks, list):
            safe_print({"type": "autoplay", "data": tracks})
          else:
            safe_print({"type": "error", "message": tracks.get("error", "Unknown error fetching autoplay")})
        else:
          safe_print({"type": "error", "message": "No id provided for autoplay"})

    except Exception as e:
      safe_print({"type": "error", "message": str(e)})

  executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)

  while True:
    try:
      json_str = sys.stdin.readline()
      if not json_str:
        break

      command = json.loads(json_str.strip())
      executor.submit(process_command, command)

    except json.JSONDecodeError:
      safe_print({"type": "error", "message": "Invalid JSON received"})
    except Exception as e:
      safe_print({"type": "error", "message": str(e)})


if __name__ == "__main__":
  main()
