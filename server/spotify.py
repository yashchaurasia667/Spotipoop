from unittest import result
import user
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials


def getSpotifyClient():
  """
    Retrieves credentials and returns a valid, authorized Spotipy client.
    """
  user_details = user.getUserDetails()

  # Trigger user creation if credentials are missing
  if not user_details.get("id") or not user_details.get("secret"):
    user_details = user.createEnv()

  auth_manager = SpotifyClientCredentials(client_id=user_details["id"], client_secret=user_details["secret"])
  return spotipy.Spotify(auth_manager=auth_manager)


# Initialize the client ONCE at the start of the script execution
# sp = getSpotifyClient()
sp = None


def format_track(track):
  """
    Standardizes track data into a clean dictionary.
    """
  if not track:
    return None

  duration_ms = track.get('duration_ms', 0)
  minutes = duration_ms // 60000
  seconds = (duration_ms % 60000) // 1000
  length = f"{minutes}:{seconds:02d}"

  # Safely navigate nested dictionaries using .get()
  album_data = track.get('album', {})
  images = album_data.get('images', [])
  thumbnail = images[0]['url'] if images else None

  return {"id": track.get('id'), "name": track.get('name'), "artist": track['artists'][0]['name'] if track.get('artists') else "", "cover": thumbnail, "album": album_data.get('name', "Unknown Album"), "length": length, "explicit": track.get("explicit", False)}


def searchSpotify(query: str):
  """
    Searches for tracks and returns a formatted list.
    """
  try:
    if not sp:
      sp = getSpotifyClient()
    results = sp.search(q=query, limit=10, type="track")
    return [format_track(item) for item in results['tracks']['items']]
  except Exception as e:
    return {"error": str(e)}


def getPlaylistFromId(playlist_id: str):
  """
    Fetches all tracks from a playlist using pagination.
    """
  try:
    if not sp:
      sp = getSpotifyClient()

    playlist = sp.playlist(playlist_id, market="US")
    data = {"name": playlist['name'], "owner": playlist['owner']['display_name'], "thumbnail": playlist['images'][0]['url'] if playlist['images'] else None, "total_tracks": playlist['tracks']['total'], "songs": []}

    results = playlist['tracks']
    items = results['items']

    # Paginate to get all tracks
    while results['next']:
      results = sp.next(results)
      items.extend(results['items'])

    data["songs"] = [format_track(item['track']) for item in items if item.get('track')]
    return data
  except Exception as e:
    return {"error": str(e)}


def getAlbumFromId(album_id: str):
  """
    Fetches all tracks from an album.
    """
  try:
    if not sp:
      sp = getSpotifyClient()

    album = sp.album(album_id)
    data = {"name": album['name'], "owner": album['artists'][0]['name'], "thumbnail": album['images'][0]['url'] if album['images'] else None, "total_tracks": album['tracks']['total'], "songs": []}

    # Album tracks don't have the 'album' object inside them,
    # so we inject it for format_track to work correctly.
    for item in album['tracks']['items']:
      item['album'] = {'name': album['name'], 'images': album['images']}
      data["songs"].append(format_track(item))

    return data
  except Exception as e:
    return {"error": str(e)}


if __name__ == "__main__":
  print("running spotify main")

  # Test with a known public playlist
  test_id = "37i9dQZF1DXaohnPXGkLv6"
  result = getPlaylistFromId(test_id)
  # result = getAlbumFromId("5WulAOx9ilWy1h8UGZ1gkI")

  if "error" in result:
    print(f"Error occurred: {result['error']}")
  else:
    print(f"Successfully fetched: {result['name']} ({len(result['songs'])} songs)")