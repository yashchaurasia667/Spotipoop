import user
import os
import yt_dlp

DOWNLOAD_PATH = "downloads"


def getYoutubeLink(query: str):
  """
    Returns the URL of the first YouTube search result for a given query.
    """

  try:
    with yt_dlp.YoutubeDL({
        "quiet": True,
        "extract_flat": True,
        "force_generic_extractor": True,
    }) as ydl:
      # 'ytsearch1:' tells it to return exactly 1 result
      search_query = f"ytsearch1:{query}"
      info = ydl.extract_info(search_query, download=False)

      if "entries" in info and len(info["entries"]) > 0:
        video_url = info["entries"][0]["url"]
        return video_url
      else:
        return None

  except Exception as e:
    return f"Error: {e}"


def downloadAudio(name, artist, quality):
  query = f"{name} {artist} official audio"
  video_url = getYoutubeLink(query)

  if not video_url:
    return f"Error: Could not find a YouTube link for {query}"

  if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)

  try:
    with yt_dlp.YoutubeDL({
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(DOWNLOAD_PATH, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': str(quality),  # Ensure quality is a string
        }],
        'quiet': False,
    }) as ydl:
      print(f"--- Downloading: {name} by {artist} ---")
      ydl.download([video_url])  # url_list can just be [video_url]
      return "Download and conversion successful!"
  except Exception as e:
    return f"An error occurred: {e}"


if __name__ == "__main__":
  user_details = user.getUserDetails()
  if (user_details["id"] == "" or user_details["secret"] == ""):
    user_details = user.initUserCreation()

  # tracks = spotify.searchSpotify("so american")
  # if len(tracks) > 0:
  #   downloadAudio(tracks[0]["name"], tracks[0]["artist"], 320)
