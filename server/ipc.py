import sys
import os
import json
import user
import utils
import spotify
import download

def main():
  utils.load_config(user.ENV_PATH)
  while True:
    try:
      # json_str = input("waiting for JSON:")
      json_str = sys.stdin.readline()
      if not json_str:
        break

      command = json.loads(json_str.strip())

      # reset creds
      if command["choice"] == 0:
        user.initUserCreation(command["id"], command["secret"])
        print(json.dumps({"type": "status", "message": "Credentials set"}), flush=True)

      # download track
      elif command["choice"] == 1:
        res = spotify.searchSpotify(f"{command["name"]} {command["artist"]}")
        download.downloadAudio(res[0], command["quality"])

      # get playlist/album details
      elif command["choice"] == 2:
        collection_id, collection_type = utils.extractId(command["link"])

        if collection_id:
          collection = spotify.getPlaylistFromId(collection_id) if collection_type == "playlist" else spotify.getAlbumFromId(collection_id)
          print(json.dumps({"type": "search_playlist", "data": collection}),flush=True)
        else:
          print("Invalid link.")

      # update download path
      elif command["choice"] == 3:
        download.DOWNLOAD_PATH = command["new_path"] 
        print(f"Path updated to: {download.DOWNLOAD_PATH}")

      # search for a track
      elif command["choice"] == 4:
        tracks = spotify.searchSpotify(command["query"])
        print(json.dumps({"type": "search_songs", "data": tracks}), flush=True)

      # download album/playlist
      elif command["choice"] == 5:
        # link = input("Enter playlist/album link to download: ")
        c_id, c_type = utils.extractId(command["link"])

        collection = None
        if c_type == "playlist":
          collection = spotify.getPlaylistFromId(c_id)
        elif c_type == "album":
          collection = spotify.getAlbumFromId(c_id)

        if collection and "songs" in collection:
          original_base = download.DOWNLOAD_PATH

          folder_name = utils.clean_filename(collection["name"])
          download.DOWNLOAD_PATH = os.path.join(original_base, folder_name)

          print(f"\nStarting bulk download to: {download.DOWNLOAD_PATH}")
          for i, track in enumerate(collection["songs"]):
            print(f"\n[{i+1}/{len(collection['songs'])}] Downloading: {track['name']}")
            download.downloadAudio(track, command["quality"] if command["quality"] else 320)

          download.DOWNLOAD_PATH = original_base
        else:
          print("Failed to load collection.")

      elif command["choice"] == 6:
        user.ENV_PATH = command["env_path"]
        if not user.ENV_PATH.endswith(".env"):
          user.ENV_PATH = os.path.join(user.ENV_PATH, ".env")

        utils.load_config(user.ENV_PATH)
        print(json.dumps({"type": "status", "message": f"Env path set to {user.ENV_PATH}"}), flush=True)

    except json.JSONDecodeError:
      print(json.dumps({"type": "error", "message": "Invalid JSON received"}), flush=True)
    except Exception as e:
      print(json.dumps({"type": "error", "message": str(e)}), flush=True)

if __name__ == "__main__":
  main()