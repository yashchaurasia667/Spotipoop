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


def update_env_variable(file_path, key, value):
  if os.path.exists(file_path):
    with open(file_path, 'r') as f:
      lines = f.readlines()
  else:
    lines = []

  key_found = False
  new_lines = []

  for line in lines:
    # Check if the line starts with the key followed by an equals sign
    if line.strip().startswith(f"{key}="):
      new_lines.append(f"{key}={value}\n")
      key_found = True
    else:
      new_lines.append(line)

  if not key_found:
    # Ensure there's a newline if the file wasn't empty
    if lines and not lines[-1].endswith('\n'):
      new_lines.append('\n')
    new_lines.append(f"{key}={value}\n")

  with open(file_path, 'w') as f:
    f.writelines(new_lines)
