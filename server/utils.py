import re

def extractId(url: str):
  """
    Returns a tuple of (id, type) e.g., ("abc123...", "album")
    """
  # Pattern looks for 'playlist/' OR 'album/'
  pattern = r"(playlist|album)/([a-zA-Z0-9]{22})"
  match = re.search(pattern, url)

  if match:
    return match.group(2), match.group(1)
  return "", ""

def clean_filename(name: str):
  """
  Removes characters that are illegal in Windows/Linux filenames.
  """
  return re.sub(r'[<>:"/\\|?*]', '', name).strip()

