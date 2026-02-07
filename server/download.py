import user
import os
import yt_dlp

DOWNLOAD_PATH = "downloads"


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


def downloadAudio(name, artist, quality):
  print()
  query = f"{name} {artist} official audio"

  # 1. Get a list of candidates (e.g., top 5)
  video_urls = getYoutubeLink(query, limit=5)

  if not video_urls:
    return f"Error: Could not find any YouTube links for {query}"

  if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)

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
    print(f"--- Found {len(video_urls)} options for: {name} ---")

    # 2. Iterate through the candidates
    for i, url in enumerate(video_urls):
      try:
        print(f"Attempting option {i+1}...")
        ydl.download([url])
        # 3. IF WE REACH HERE, SUCCESS!
        # We return immediately, stopping the loop and the function.
        return f"Success! Downloaded using option {i+1}."

      except Exception as e:
        # 4. IF FAILURE, CATCH IT AND CONTINUE
        print(f"Option {i+1} failed. Reason: {e}")
        print("Trying next link...\n")
        continue

  # 5. If the loop finishes without returning, all links failed
  return "Error: All download attempts failed."


if __name__ == "__main__":
  user_details = user.getUserDetails()
  if (user_details["id"] == "" or user_details["secret"] == ""):
    user_details = user.initUserCreation()

  # tracks = spotify.searchSpotify("so american")
  # if len(tracks) > 0:
  #   downloadAudio(tracks[0]["name"], tracks[0]["artist"], 320)
