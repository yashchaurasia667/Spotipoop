import os
from pydoc import cli
from dotenv import load_dotenv

load_dotenv()


def getUserDetails():
  user_details: dict[str, str] = {"id": "", "secret": ""}

  user_id: str | None = os.getenv("VITE_SPOTIFY_ID")
  user_secret: str | None = os.getenv("VITE_SPOTIFY_SECRET")

  if user_id is not None:
    user_details["id"] = user_id

  if user_secret is not None:
    user_details["secret"] = user_secret

  return user_details


def initUserCreation(client_id=None, client_secret=None):
  fp = open("../../.env", "w")
  if client_id and client_secret:
    fp.write(f"VITE_SPOTIFY_ID={user_id}")
    fp.write("\n")
    fp.write(f"VITE_SPOTIFY_SECRET={user_secret}")
    fp.close()
    return

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
  user_details = getUserDetails()
  if (user_details["id"] == "" or user_details["secret"] == ""):
    initUserCreation()
