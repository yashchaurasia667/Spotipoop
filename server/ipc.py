import sys
import os
import json
import user
import utils
import spotify
import download


def main():
  utils.load_config(user.ENV_PATH)
  if os.getenv("VITE_DOWNLOAD_PATH"):
    download.DOWNLOAD_PATH = os.getenv("VITE_DOWNLOAD_PATH")

  while True:
    try:
      json_str = sys.stdin.readline()
      if not json_str:
        break

      command = json.loads(json_str.strip())

      # Choice 0: Reset credentials
      if command["choice"] == 0:
        user.initUserCreation(command["id"], command["secret"])
        print(json.dumps({"type": "status", "message": "Credentials set"}), flush=True)

      # Choice 1: Download single track
      elif command["choice"] == 1:
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
          collection = spotify.getPlaylistFromId(collection_id) if collection_type == "playlist" else spotify.getAlbumFromId(collection_id)
          print(json.dumps({"type": "search_playlist", "data": collection}), flush=True)
        else:
          print(json.dumps({"type": "error", "message": "Invalid link."}), flush=True)

      # Choice 3: Update download path
      elif command["choice"] == 3:
        download.DOWNLOAD_PATH = command["path"]
        utils.update_env_variable(user.ENV_PATH, "VITE_DOWNLOAD_PATH", command["path"])
        print(json.dumps({"type": "download_path", "message": f"path updated to: {download.DOWNLOAD_PATH}"}), flush=True)

      # Choice 4: Search for a track
      elif command["choice"] == 4:
        tracks = spotify.searchSpotify(command["query"])
        print(json.dumps({"type": "search_songs", "data": tracks}), flush=True)

      # Choice 5: Download album/playlist
      elif command["choice"] == 5:
        c_id, c_type = utils.extractId(command["link"])
        collection = spotify.getPlaylistFromId(c_id) if c_type == "playlist" else spotify.getAlbumFromId(c_id)

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
        user.ENV_PATH = command["env_path"]
        if not user.ENV_PATH.endswith(".env"):
          user.ENV_PATH = os.path.join(user.ENV_PATH, ".env")

        utils.load_config(user.ENV_PATH)
        if os.getenv("VITE_DOWNLOAD_PATH"):
          download.DOWNLOAD_PATH = os.getenv("VITE_DOWNLOAD_PATH")
        print(json.dumps({"type": "status", "message": f"Env path set to {user.ENV_PATH}"}), flush=True)

      # Choice 7: Get current download path
      elif command["choice"] == 7:
        print(json.dumps({"type": "download_path", "path": download.DOWNLOAD_PATH}), flush=True)

    except json.JSONDecodeError:
      print(json.dumps({"type": "error", "message": "Invalid JSON received"}), flush=True)
    except Exception as e:
      print(json.dumps({"type": "error", "message": str(e)}), flush=True)


if __name__ == "__main__":
  main()
