import user
import utils
import spotify
import download
import os

if __name__ == "__main__":
  # 0. Initial Credential Check
  user_details = user.getUserDetails()
  if user_details["id"] == "" or user_details["secret"] == "":
    user_details = user.createEnv()

  # Ensure spotify client is ready
  # spotify.initialize_spotify()

  while True:
    print("\n" + "=" * 30)
    print("   SPOTIFY DOWNLOADER CLI")
    print("=" * 30)
    print("1. Download Single Track")
    print("2. View Playlist/Album Details")
    print("3. Set Base Download Path")
    print("4. Search for a Track")
    print("5. Download Entire Playlist/Album")
    print("0. Reset Credentials")
    print("'exit' to quit")

    user_input = input("\nSelect an option: ").strip().lower()

    if user_input == 'exit':
      print("Goodbye!")
      break

    try:
      choice = int(user_input)
    except ValueError:
      print("Invalid input. Please enter a number or 'exit'.")
      continue

    if choice == 0:
      user_details = user.createEnv()

    elif choice == 1:
      name = input("Track Name: ")
      artist = input("Artist: ")
      quality = input("Quality (e.g., 320, 128): ")

      res = spotify.searchSpotify(f"{name} {artist}")
      choice = 0
      for i, t in enumerate(res):
        print(f"{i+1}. {t['name']} - {t['artist']} [{t['length']}]")
      choice = int(input("which to download? "))
      download.downloadAudio(res[choice-1], quality)

    elif choice == 2:
      link = input("Enter playlist/album link: ")
      collection_id, collection_type = utils.extractId(link)

      if collection_id:
        collection = spotify.getPlaylistFromId(collection_id) if collection_type == "playlist" else spotify.getAlbumFromId(collection_id)
        print(f"\n:::{collection_type.upper()} DETAILS:::")
        # print(f"Name: {collection['name']}\nOwner: {collection['owner']}\nTracks: {collection['total_tracks']}")
        print(collection)
      else:
        print("Invalid link.")

    elif choice == 3:
      new_path = input("Enter new base download path: ")
      download.DOWNLOAD_PATH = new_path
      print(f"Path updated to: {download.DOWNLOAD_PATH}")

    elif choice == 4:
      query = input("Search query: ")
      tracks = spotify.searchSpotify(query)
      print("\n:::SEARCH RESULTS:::")
      for i, t in enumerate(tracks):
        print(f"{i+1}. {t['name']} - {t['artist']} [{t['length']}]")

    elif choice == 5:
      link = input("Enter playlist/album link to download: ")
      c_id, c_type = utils.extractId(link)

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
          # Using 320 as default quality for bulk
          download.downloadAudio(track, "320")

        download.DOWNLOAD_PATH = original_base
      else:
        print("Failed to load collection.")
