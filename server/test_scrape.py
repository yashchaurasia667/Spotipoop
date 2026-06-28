import requests
from bs4 import BeautifulSoup
import json

def scrape_spotify(url):
    html = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}).text
    soup = BeautifulSoup(html, 'html.parser')
    
    title = soup.find('h1')
    playlist_name = title.text.strip() if title else "Unknown Playlist"
    
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
        
        # We need to return the structure expected by the frontend
        # {"name": song_title, "artist": artist, "id": f"{song_title} {artist}", "cover": thumbnail, "album": "Unknown", "length": "0:00"}
        
        tracks.append({
            "name": song_title,
            "artist": artist,
            "id": f"{song_title} {artist}",
            "cover": thumbnail,
            "album": playlist_name,
            "length": "0:00",
            "explicit": False
        })
        
    return {
        "name": playlist_name,
        "owner": "Spotify",
        "thumbnail": thumbnail,
        "total_tracks": len(tracks),
        "songs": tracks,
        "link": url
    }

print(json.dumps(scrape_spotify('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'), indent=2)[:500])
