import re
import os
from dotenv import load_dotenv


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


def load_config(custom_path):
  # check if the file actually exists first to avoid silent failures
  if os.path.exists(custom_path):
    load_dotenv(dotenv_path=custom_path)
    print(f"Loaded config from: {custom_path}")
  else:
    print(f"Warning: No .env found at {custom_path}")


if __name__ == "__main__":
  print("running utils main")
