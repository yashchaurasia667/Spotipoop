import os

ENV_PATH = ".env"


def getUserDetails():
  user_details: dict[str, str] = {"id": "", "secret": ""}

  user_id: str | None = os.getenv("VITE_SPOTIFY_ID")
  user_secret: str | None = os.getenv("VITE_SPOTIFY_SECRET")

  if user_id is not None:
    user_details["id"] = user_id

  if user_secret is not None:
    user_details["secret"] = user_secret

  return user_details


def initUserCreation(client_id, client_secret):
  # Construct the strings in standard .env format
  content = f"VITE_SPOTIFY_ID={client_id}\nVITE_SPOTIFY_SECRET={client_secret}\n"

  try:
    folder = os.path.dirname(ENV_PATH)
    if folder and not os.path.exists(folder):
      os.makedirs(folder, exist_ok=True)
    with open(ENV_PATH, "w") as f:
      f.write(content)
  except Exception as e:
    print(f"Failed to write .env: {e}")


def update_env_path(new_path):
  global ENV_PATH
  # Ensure the path includes the filename if it's just a directory
  if os.path.isdir(new_path):
    ENV_PATH = os.path.join(new_path, ".env")
  else:
    ENV_PATH = new_path


def createEnv():
  fp = open(ENV_PATH, "w")

  while True:
    user_id = input("CLIENT ID: ")
    user_secret = input("CLIENT SECRET: ")
    if user_id != "" and user_secret != "":
      fp.write(f"VITE_SPOTIFY_ID={user_id}")
      fp.write("\n")
      fp.write(f"VITE_SPOTIFY_SECRET={user_secret}")
      fp.close()
      return {"id": user_id, "secret": user_secret}


if __name__ == "__main__":
  print("running user main")
  user_details = getUserDetails()
  if (user_details["id"] == "" or user_details["secret"] == ""):
    createEnv()
