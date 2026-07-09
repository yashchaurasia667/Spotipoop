import requests
from bs4 import BeautifulSoup
from ytmusicapi import YTMusic

# Initialize the client ONCE at the start of the script execution
yt = None

def getYTMusicClient():
  """
    Retrieves and returns a valid YTMusic client.
    """
  global yt
  if not yt:
    yt = YTMusic()
  return yt


def format_track(track):
  """
    Standardizes track data into a clean dictionary.
    """
  if not track:
    return None

  duration_ms = track.get('duration_seconds', 0) * 1000 if track.get('duration_seconds') else 0
  if duration_ms == 0 and track.get('duration'):
    # Sometimes duration is "M:SS"
    parts = track['duration'].split(":")
    if len(parts) == 2:
      duration_ms = (int(parts[0]) * 60 + int(parts[1])) * 1000
    elif len(parts) == 3:
      duration_ms = (int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])) * 1000

  minutes = duration_ms // 60000
  seconds = (duration_ms % 60000) // 1000
  length = f"{minutes}:{seconds:02d}"

  # Safely navigate nested dictionaries using .get()
  thumbnails = track.get('thumbnails') or track.get('thumbnail') or []
  thumbnail = thumbnails[-1]['url'] if thumbnails else None

  album_data = track.get('album', {})
  if album_data:
      album_name = album_data.get('name', "Unknown Album")
  else:
      album_name = "Unknown Album"

  artists = track.get('artists', [])
  artist_name = ", ".join([a.get('name', '') for a in artists]) if artists else ""

  return {"id": track.get('videoId'), "name": track.get('title'), "artist": artist_name, "cover": thumbnail, "album": album_name, "length": length, "explicit": track.get("isExplicit", False)}


def searchSpotify(query: str):
  """
    Searches for tracks and returns a formatted list using YTMusic.
    """
  try:
    client = getYTMusicClient()
    results = client.search(query=query, filter="songs", limit=10)
    return [format_track(item) for item in results]
  except Exception as e:
    return {"error": str(e)}

def get_autoplay_recommendations(video_id: str):
  """
  Fetches up to 50 related/autoplay songs based on a video ID.
  """
  try:
    client = getYTMusicClient()
    results = client.get_watch_playlist(videoId=video_id)
    tracks = results.get("tracks", [])
    
    formatted_tracks = []
    # Skip the first track as it's usually the requested video_id itself
    for track in tracks[1:51]:
      formatted = format_track(track)
      if formatted and formatted["id"]:
        formatted_tracks.append(formatted)
        
    return formatted_tracks
  except Exception as e:
    return {"error": str(e)}


def scrape_spotify_collection(collection_id: str, collection_type: str):
  """
  Scrapes a Spotify playlist or album and returns a formatted collection dictionary.
  """
  url = f"https://open.spotify.com/{collection_type}/{collection_id}"
  try:
    html = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}).text
    soup = BeautifulSoup(html, 'html.parser')
    
    title = soup.find('h1')
    collection_name = title.text.strip() if title else "Unknown Collection"
    
    img = soup.find('img')
    thumbnail = img['src'] if img else None
    
    tracks = []
    rows = soup.find_all('div', {'data-testid': 'track-row'})
    
    for row in rows:
        title_elem = row.find('p', {'data-encore-id': 'listRowTitle'})
        if not title_elem:
            title_elem = row.find('div', class_=lambda c: c and 'title' in c.lower())
            
        song_title = title_elem.text.strip() if title_elem else "Unknown"
        
        artist_links = row.find_all('a', href=lambda href: href and '/artist/' in href)
        artists = [a.text.strip() for a in artist_links] if artist_links else []
        artist = ", ".join(artists)
        
        tracks.append({
            "name": song_title,
            "artist": artist,
            "id": f"{song_title} {artist}",
            "cover": thumbnail,
            "album": collection_name,
            "length": "0:00",
            "explicit": False
        })
        
    return {
        "name": collection_name,
        "owner": "Spotify User",
        "thumbnail": thumbnail,
        "total_tracks": len(tracks),
        "songs": tracks,
        "link": url
    }
  except Exception as e:
    return {"error": str(e)}


if __name__ == "__main__":
  print("running ytmusic main")

  tracks = searchSpotify("obsessed")
  for i, t in enumerate(tracks):
    print(f"{i+1}. {t['name']}, {t['artist']}")
