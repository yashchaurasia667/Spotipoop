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

  while True:
    try:
      json_str = sys.stdin.readline()
      if not json_str:
        break

      command = json.loads(json_str.strip())

      # Choice 1: Download single track
      if command["choice"] == 1:
        sys.stderr.write(f"DEBUG: Processing download for {command['name']}\n")
        sys.stderr.flush()
        res = spotify.searchSpotify(f"{command['name']} {command['artist']}")
        dw = download.downloadAudio(res[0], command.get("quality", 320))
        if dw:
          print(json.dumps({"type": "download", "message": f"{res["id"]}"}), flush=True)
        else:
          print(json.dumps({"type": "error", "message": f"Failed downloading {command['name']}"}), flush=True)

      # Choice 2: Get playlist/album details
      elif command["choice"] == 2:
        collection_id, collection_type = utils.extractId(command["link"])
        if collection_id:
          collection = spotify.scrape_spotify_collection(collection_id, collection_type)
          print(json.dumps({"type": "search_playlist", "data": collection}), flush=True)
        else:
          print(json.dumps({"type": "error", "message": "Invalid link."}), flush=True)

      # Choice 3: Update download path
      elif command["choice"] == 3:
        download.DOWNLOAD_PATH = command["path"]
        utils.update_env_variable(ENV_PATH, "VITE_DOWNLOAD_PATH", command["path"])
        print(json.dumps({"type": "download_path", "message": f"path updated to: {download.DOWNLOAD_PATH}"}), flush=True)

      # Choice 4: Search for a track
      elif command["choice"] == 4:
        sys.stderr.write(f"DEBUG: Processing search for {command['query']}\n")
        sys.stderr.flush()
        tracks = spotify.searchSpotify(command["query"])
        print(json.dumps({"type": "search_songs", "data": tracks}), flush=True)

      # Choice 5: Download album/playlist
      elif command["choice"] == 5:
        c_id, c_type = utils.extractId(command["link"])
        collection = spotify.scrape_spotify_collection(c_id, c_type)

        if collection and "songs" in collection:
          original_base = download.DOWNLOAD_PATH
          folder_name = utils.clean_filename(collection["name"])
          download.DOWNLOAD_PATH = os.path.join(original_base, folder_name)

          # FIXED: Wrap bulk download status in JSON
          print(json.dumps({"type": "status", "message": f"Starting bulk download to: {download.DOWNLOAD_PATH}"}), flush=True)

          for i, track in enumerate(collection["songs"]):
            # FIXED: Wrap progress in JSON
            msg = f"[{i+1}/{len(collection['songs'])}] Downloading: {track['name']}"
            print(json.dumps({"type": "status", "message": msg}), flush=True)
            download.downloadAudio(track, command.get("quality", 320))

          download.DOWNLOAD_PATH = original_base
        else:
          print(json.dumps({"type": "error", "message": "Failed to load collection."}), flush=True)

      # Choice 6: Update env path
      elif command["choice"] == 6:
        ENV_PATH = command["env_path"]
        if not ENV_PATH.endswith(".env"):
          ENV_PATH = os.path.join(ENV_PATH, ".env")

        utils.load_config(ENV_PATH)
        if os.getenv("VITE_DOWNLOAD_PATH"):
          download.DOWNLOAD_PATH = os.getenv("VITE_DOWNLOAD_PATH")
        print(json.dumps({"type": "status", "message": f"Env path set to {ENV_PATH}"}), flush=True)

      # Choice 7: Get current download path
      elif command["choice"] == 7:
        print(json.dumps({"type": "download_path", "path": download.DOWNLOAD_PATH}), flush=True)

      # Choice 8: Get stream URL
      elif command["choice"] == 8:
        sys.stderr.write(f"DEBUG: Processing stream for {command['name']}\n")
        sys.stderr.flush()
        res = spotify.searchSpotify(f"{command['name']} {command['artist']}")
        if res and len(res) > 0:
          stream_url = download.getStreamUrl(res[0])
          if stream_url:
            print(json.dumps({"type": "stream_url", "url": stream_url, "id": command.get("id")}), flush=True)
          else:
            print(json.dumps({"type": "error", "message": f"Failed getting stream URL for {command['name']}"}), flush=True)
        else:
          print(json.dumps({"type": "error", "message": f"Could not find track {command['name']}"}), flush=True)

    except json.JSONDecodeError:
      print(json.dumps({"type": "error", "message": "Invalid JSON received"}), flush=True)
    except Exception as e:
      print(json.dumps({"type": "error", "message": str(e)}), flush=True)


if __name__ == "__main__":
  main()
