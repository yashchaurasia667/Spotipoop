import os
import yt_dlp
import requests
from mutagen.id3 import ID3, TIT2, TALB, TPE1, APIC, ID3NoHeaderError
import user
import utils
from spotify import searchSpotify

DOWNLOAD_PATH = "downloads"

def addMetadata(file_path, title, artist, album, cover_path=None):
  try:
    try:
      tags = ID3(file_path)
    except ID3NoHeaderError:
      tags = ID3()

    tags["TIT2"] = TIT2(encoding=3, text=title)
    tags["TPE1"] = TPE1(encoding=3, text=artist)
    tags["TALB"] = TALB(encoding=3, text=album)

    if cover_path and os.path.exists(cover_path):
      with open(cover_path, 'rb') as img:
        tags["APIC"] = APIC(
          mime='image/jpeg',
          encoding=3,
          type=3,
          desc=u'Cover',
          data=img.read()
        )

    tags.save(file_path, v2_version=3)
    print(f"Success: Metadata and Cover embedded in {file_path}")
  except Exception as e:
      print(f"Metadata Error: {e}")

def getYoutubeLink(query: str, limit: int = 5):
  """
    Returns the URL of the first five YouTube search result for a given query.
    """

  try:
    with yt_dlp.YoutubeDL({
        "quiet": True,
        "extract_flat": True,
        "force_generic_extractor": True,
    }) as ydl:
      # 'ytsearch1:' tells it to return exactly 1 result
      search_query = f"ytsearch{limit}:{query}"
      info = ydl.extract_info(search_query, download=False)

      results = []
      if "entries" in info and len(info["entries"]) > 0:
        for entry in info["entries"]:
          if "url" in entry:
            results.append(entry["url"])
      return results

  except Exception as e:
    return [f"Error: {e}"]


def downloadAudio(track, quality):
  query = f"{track.get("name")} {track.get("artist")} official audio"
  if track.get("explicit"):
    query = f"{query} explicit"

  video_urls = getYoutubeLink(query, limit=5)

  if not video_urls:
    return f"Error: Could not find any YouTube links for {query}"

  if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)
  
  tmp_cover = f"{utils.clean_filename(track.get("name"))}.jpg"
  if track.get("cover"):
    img_data = requests.get(track.get("cover")).content
    with open(tmp_cover, "wb") as handler:
      handler.write(img_data)

  ydl_opts = {
      'format': 'bestaudio/best',
      'outtmpl': os.path.join(DOWNLOAD_PATH, '%(title)s.%(ext)s'),
      'postprocessors': [{
          'key': 'FFmpegExtractAudio',
          'preferredcodec': 'mp3',
          'preferredquality': str(quality),
      }],
      'quiet': False,
      # IMPORTANT: Keep ignoreerrors False so the 'try' block can catch the failure
      'ignoreerrors': False,
  }

  with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    print(f"--- Found {len(video_urls)} options for: {track.get("name")} ---")

    # 2. Iterate through the candidates
    for i, url in enumerate(video_urls):
      try:
        print(f"Attempting option {i+1}...")
        info = ydl.extract_info(url, download=True)
        base_path = ydl.prepare_filename(info)
        final_mp3_path = os.path.splitext(base_path)[0] + ".mp3"

        addMetadata(final_mp3_path, track.get("name"), track.get("artist"), track.get("album"), tmp_cover)
        if os.path.exists(tmp_cover):
          os.remove(tmp_cover)

        return f"Success! Downloaded using option {i+1}."

      except Exception as e:
        print(f"Option {i+1} failed. Reason: {e}")
        print("Trying next link...\n")
        continue

  return "Error: All download attempts failed."


if __name__ == "__main__":
  print("runnign download main")

  user_details = user.getUserDetails()
  if (user_details["id"] == "" or user_details["secret"] == ""):
    user_details = user.createEnv()
  
  res = searchSpotify("vampire")
  downloadAudio(res[0], 320)

  # tracks = spotify.searchSpotify("so american")
  # if len(tracks) > 0:
  #   downloadAudio(tracks[0]["name"], tracks[0]["artist"], 320)
