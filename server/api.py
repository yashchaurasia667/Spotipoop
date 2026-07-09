from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import spotify
import download
import utils
import os

app = FastAPI(title="Spotipoop Cloud API")

# Enable CORS for all origins so any Tauri client can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Spotipoop Cloud API is running."}

@app.get("/search")
def search_songs(query: str):
    """Mirror of IPC Choice 4: Search for a track"""
    try:
        tracks = spotify.searchSpotify(query)
        return {"type": "search_songs", "data": tracks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/playlist")
def get_playlist(link: str):
    """Mirror of IPC Choice 2: Get playlist/album details"""
    try:
        collection_id, collection_type = utils.extractId(link)
        if collection_id:
            collection = spotify.scrape_spotify_collection(collection_id, collection_type)
            return {"type": "search_playlist", "data": collection}
        else:
            raise HTTPException(status_code=400, detail="Invalid link.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stream")
def get_stream(
    id: str = Query(..., description="YouTube Video ID"),
    name: str = Query(..., description="Track Name"),
    artist: str = Query(..., description="Artist Name")
):
    """Mirror of IPC Choice 8: Get stream URL"""
    try:
        track_info = {
            "id": id,
            "name": name,
            "artist": artist
        }
        stream_url = download.getStreamUrl(track_info)
        if stream_url:
            return {"type": "stream_url", "url": stream_url, "id": id}
        else:
            raise HTTPException(status_code=404, detail="Failed getting stream URL")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/autoplay")
def get_autoplay(id: str = Query(..., description="YouTube Video ID to seed from")):
    """Mirror of IPC Choice 9: Get autoplay recommendations"""
    try:
        tracks = spotify.get_autoplay_recommendations(id)
        if isinstance(tracks, list):
            return {"type": "autoplay", "data": tracks}
        else:
            raise HTTPException(status_code=500, detail=tracks.get("error", "Unknown error fetching autoplay"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Load config if needed, though for cloud we usually use env vars
    utils.load_config(".env")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
