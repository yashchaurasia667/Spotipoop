import user
import utils
import spotify
import download
import os
import re
import json

if __name__ == "__main__":
  while True:
    json_str = input("waiting for JSON:")
    command = json.loads(json_str)

    # reset creds
    if command["choice"] == 0:
      user.initUserCreation(command["id"], command["secret"])

    # download track
    elif command["choice"] == 1:
      res = spotify.searchSpotify(f"{command["name"]} {command["artist"]}")
      download.downloadAudio(res[0], command["quality"])

    # get playlist/album details
    elif command["choice"] == 2:
      collection_id, collection_type = utils.extractId(command["link"])

      if collection_id:
        collection = spotify.getPlaylistFromId(collection_id) if collection_type == "playlist" else spotify.getAlbumFromId(collection_id)
        print(f"\n:::{collection_type.upper()} DETAILS:::")
        print(collection)
      else:
        print("Invalid link.")

    # update download path
    elif command["choice"] == 3:
      download.DOWNLOAD_PATH = command["new_path"] 
      print(f"Path updated to: {download.DOWNLOAD_PATH}")

    # search for a track
    elif command["choice"] == 4:
      tracks = spotify.searchSpotify(command["query"])
      print("\n:::SEARCH RESULTS:::")
      for i, t in enumerate(tracks):
        print(f"{i+1}. {t['name']} - {t['artist']} [{t['length']}]")

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