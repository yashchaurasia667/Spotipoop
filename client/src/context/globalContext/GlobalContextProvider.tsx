import { Child, Command } from "@tauri-apps/plugin-shell";
import { appDataDir, join } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, exists, BaseDirectory, mkdir } from "@tauri-apps/plugin-fs";
import React, { useState, ReactNode, useEffect, useRef } from "react";
import GlobalContext from "./GlobalContext";
import { Song, playlist as PlaylistType, NativePlaylist } from "../../types";

interface GlobalContextProviderProps {
  children: ReactNode;
}

const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({
  children,
}) => {
  const [childProc, setChildProc] = useState<Child | undefined>();
  const [backendStatus, setBackendStatus] = useState<boolean>(false);
  const childRef = useRef<Child | null>(null);
  const isSpawning = useRef(false);
  const preloadingIds = useRef<Set<string>>(new Set());

  // States
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [userQueue, setUserQueue] = useState<Song[]>([]);
  const [autoplayQueue, setAutoplayQueue] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const lastFetchedAutoplayId = useRef<string | null>(null);
  const [isQueueVisible, setIsQueueVisible] = useState<boolean>(false);
  const [preloadedUrls, setPreloadedUrls] = useState<Record<string, string>>({});
  const [query, setQuery] = useState<string>("");
  const [qtype, setQtype] = useState<"Playlist" | "Name">("Name");
  const [loading, setLoading] = useState<boolean>(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistType | undefined>({
    cover: "",
    name: "",
    owner: "",
    length: 0,
    tracks: [],
    link: "",
  });

  const startBackend = async () => {
    if (isSpawning.current || childRef.current) return;
    isSpawning.current = true;

    try {
      const command = Command.sidecar("binaries/backend");

      command.on("close", (data) => {
        console.log(`Python process terminated: code ${data.code}`);
        setBackendStatus(false);
        childRef.current = null;
      });

      command.stdout.on("data", (line) => {
        console.log(`[Python Stdout]: ${line}`);
        try {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("{")) {
            const parsed = JSON.parse(trimmedLine);

            // --- 1. Handle Collection Details (Playlist/Album Links) ---
            if (parsed.type === "search_playlist") {
              if (parsed.data.error) {
                console.error("Error fetching playlist:", parsed.data.error);
                setLoading(false);
                return;
              }

              // Update Playlist Metadata
              setPlaylist({
                name: parsed.data.name,
                owner: parsed.data.owner,
                cover: parsed.data.thumbnail,
                length: parsed.data.total_tracks,
                tracks: parsed.data.songs,
                link: parsed.data.link,
              });

              if (!parsed.data.songs || parsed.data.songs.length === 0) {
                console.warn("No songs found in collection");
                setSongs([]);
                setLoading(false);
                return;
              }

              // Map songs using your template
              const mappedSongs = parsed.data.songs.map(
                (track: any, idx: number) => ({
                  album: track.album || parsed.data.name,
                  artists: track.artist,
                  duration: track.length,
                  images: track.cover || parsed.data.cover,
                  index: (idx + 1).toString(),
                  name: track.name,
                  id: track.id,
                }),
              );

              setSongs(mappedSongs);
              setLoading(false);
            }

            // --- 2. Handle Search Results (Name Search) ---
            else if (
              parsed.type === "search_songs" &&
              Array.isArray(parsed.data)
            ) {
              // Clear playlist header info for generic search
              setPlaylist(undefined);

              const mappedSongs = parsed.data.map(
                (track: any, idx: number) => ({
                  album: track.album || "Unknown Album",
                  artists: track.artist,
                  duration: track.length,
                  images: track.cover,
                  index: (idx + 1).toString(),
                  name: track.name,
                  id: track.id,
                }),
              );

              setSongs(mappedSongs);
              setLoading(false);
            } else if (parsed.type === "download_path")
              setDownloadPath(parsed.path);
            // --- 3. Handle Status Updates ---
            else if (parsed.type === "status") {
              console.log("Backend Status:", parsed.message);
            }
            // --- 4. Handle Stream URL ---
            else if (parsed.type === "stream_url") {
              if (parsed.id) {
                setPreloadedUrls(prev => ({ ...prev, [parsed.id]: parsed.url }));
              } else {
                setStreamUrl(parsed.url);
              }
            }
            // --- 5. Handle Autoplay ---
            else if (parsed.type === "autoplay") {
              if (Array.isArray(parsed.data)) {
                const mappedAutoplay = parsed.data.map((track: any, idx: number) => ({
                  album: track.album || "Unknown Album",
                  artists: track.artist || "Unknown Artist",
                  duration: track.length || "0:00",
                  images: track.cover || "",
                  index: (idx + 1).toString(),
                  name: track.name || "Unknown Track",
                  id: track.id,
                }));
                setAutoplayQueue(mappedAutoplay);
              }
            }
          }
        } catch (e) {
          console.error("JSON Parsing error in Provider:", e);
        }
      });

      const child = await command.spawn();
      childRef.current = child;
      setChildProc(child);
      setBackendStatus(true);

      // Initial Path Sync
      const dataDir = await appDataDir();
      const envFilePath = await join(dataDir, ".env");
      await child.write(
        JSON.stringify({
          choice: 6,
          env_path: envFilePath,
        }) + "\n",
      );

      // getting download path
      await child.write(
        JSON.stringify({
          choice: 7,
        }) + "\n",
      );
    } catch (err) {
      console.error("Failed to spawn sidecar:", err);
      setBackendStatus(false);
    } finally {
      isSpawning.current = false;
    }
  };

  useEffect(() => {
    startBackend();
    return () => {
      if (childRef.current) {
        childRef.current.kill().catch(console.error);
        childRef.current = null;
      }
    };
  }, []);

  const loadPreferences = async () => {
    try {
      try {
        const dataDir = await appDataDir();
        await mkdir(dataDir, { recursive: true });
      } catch (e) {}
      
      const hasPrefs = await exists("preferences.json", { baseDir: BaseDirectory.AppData });
      if (hasPrefs) {
        const contents = await readTextFile("preferences.json", { baseDir: BaseDirectory.AppData });
        const prefs = JSON.parse(contents);
        if (prefs.recentSongs) {
          setRecentSongs(prefs.recentSongs);
        }
      }
    } catch (e) {
      console.error("Error loading preferences:", e);
    }
  };

  const savePreferences = async (recent: Song[]) => {
    try {
      try {
        const dataDir = await appDataDir();
        await mkdir(dataDir, { recursive: true });
      } catch (e) {}
      await writeTextFile("preferences.json", JSON.stringify({ recentSongs: recent }), { baseDir: BaseDirectory.AppData });
    } catch (e) {
      console.error("Error saving preferences:", e);
    }
  };

  useEffect(() => {
    if (playingSong && childRef.current && backendStatus) {
      if (preloadedUrls[playingSong.id]) {
        // Use cached URL if available
        setStreamUrl(preloadedUrls[playingSong.id]);
      } else {
        // Only request if not already preloading
        if (!preloadingIds.current.has(playingSong.id)) {
          preloadingIds.current.add(playingSong.id);
          setStreamUrl(null); // Clear previous URL while loading
          childRef.current.write(
            JSON.stringify({
              choice: 8,
              name: playingSong.name,
              artist: playingSong.artists,
              id: playingSong.id,
            }) + "\n"
          ).catch(console.error);
        }
      }
      // Update recent history
      setRecentSongs(prev => {
        // Prevent duplicate consecutive entries and bring to front
        const filtered = prev.filter(s => s.id !== playingSong.id);
        const next = [playingSong, ...filtered].slice(0, 20); // keep last 20
        savePreferences(next);
        return next;
      });
    }
  }, [playingSong, backendStatus, preloadedUrls]);

  // Autoplay Trigger
  useEffect(() => {
    if (backendStatus && childRef.current && autoplayQueue.length === 0) {
      const idToFetch = playingSong ? playingSong.id : (recentSongs.length > 0 ? recentSongs[0].id : null);
      if (idToFetch && lastFetchedAutoplayId.current !== idToFetch) {
        lastFetchedAutoplayId.current = idToFetch;
        childRef.current.write(JSON.stringify({ choice: 9, id: idToFetch }) + "\n").catch(console.error);
      }
    }
  }, [playingSong, autoplayQueue.length, backendStatus, recentSongs]);

  useEffect(() => {
    if (!childRef.current || !backendStatus) return;

    // Preload next 2 songs
    const nextSongs = [...userQueue, ...autoplayQueue].slice(0, 2);
    nextSongs.forEach(song => {
      if (!preloadedUrls[song.id] && !preloadingIds.current.has(song.id)) {
        preloadingIds.current.add(song.id);
        childRef.current?.write(
          JSON.stringify({
            choice: 8,
            name: song.name,
            artist: song.artists,
            id: song.id,
          }) + "\n"
        ).catch(console.error);
      }
    });
  }, [userQueue, autoplayQueue, backendStatus, preloadedUrls]);

  // Autoplay if a song is added to an empty queue while nothing is playing
  useEffect(() => {
    if (!playingSong && (userQueue.length > 0 || autoplayQueue.length > 0)) {
      playNextInQueue();
    }
  }, [playingSong, userQueue, autoplayQueue]);

  const addToUserQueue = (song: Song) => {
    setUserQueue((prev) => [...prev, song]);
  };

  const handleSetPlayingSong = (song: Song | null) => {
    setPlayingSong(song);
    if (song) {
      lastFetchedAutoplayId.current = null;
      setAutoplayQueue([]); // User explicitly played a song, reset autoplay to adapt
    }
  };

  const playNextInQueue = () => {
    if (userQueue.length > 0) {
      const nextSong = userQueue[0];
      setUserQueue((prev) => prev.slice(1));
      setPlayingSong(nextSong);
      lastFetchedAutoplayId.current = null;
      setAutoplayQueue([]); // Adapt autoplay to the latest user queue song
    } else if (autoplayQueue.length > 0) {
      const nextSong = autoplayQueue[0];
      setAutoplayQueue((prev) => prev.slice(1));
      setPlayingSong(nextSong);
    } else {
      // Nothing to play
      setPlayingSong(null);
      setStreamUrl(null);
    }
  };

  const [nativePlaylists, setNativePlaylists] = useState<NativePlaylist[]>([]);

  const loadNativePlaylists = async () => {
    try {
      try {
        const dataDir = await appDataDir();
        await mkdir(dataDir, { recursive: true });
      } catch (e) {
        // Ignore mkdir error if it already exists
      }
      
      const hasPlaylists = await exists("playlists.json", { baseDir: BaseDirectory.AppData });
      if (hasPlaylists) {
        const contents = await readTextFile("playlists.json", { baseDir: BaseDirectory.AppData });
        setNativePlaylists(JSON.parse(contents));
      }
    } catch (e) {
      console.error("Error loading playlists:", e);
    }
  };

  const saveNativePlaylists = async (playlists: NativePlaylist[]) => {
    try {
      try {
        const dataDir = await appDataDir();
        await mkdir(dataDir, { recursive: true });
      } catch (e) {
        // Ignore mkdir error
      }
      await writeTextFile("playlists.json", JSON.stringify(playlists), { baseDir: BaseDirectory.AppData });
    } catch (e) {
      console.error("Error saving playlists:", e);
    }
  };



  useEffect(() => {
    loadNativePlaylists();
    loadPreferences();
  }, []);

  const createPlaylist = async (name: string, description: string, cover: string) => {
    const newPlaylist: NativePlaylist = {
      id: crypto.randomUUID(),
      name,
      description,
      cover,
      songs: []
    };
    const updated = [...nativePlaylists, newPlaylist];
    setNativePlaylists(updated);
    await saveNativePlaylists(updated);
  };

  const updatePlaylist = async (id: string, updates: Partial<NativePlaylist>) => {
    const updated = nativePlaylists.map(p => p.id === id ? { ...p, ...updates } : p);
    setNativePlaylists(updated);
    await saveNativePlaylists(updated);
  };

  const deletePlaylist = async (id: string) => {
    const updated = nativePlaylists.filter(p => p.id !== id);
    setNativePlaylists(updated);
    await saveNativePlaylists(updated);
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const updated = nativePlaylists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    setNativePlaylists(updated);
    await saveNativePlaylists(updated);
  };

  const removeSongFromPlaylist = async (playlistId: string, songIdx: number) => {
    const updated = nativePlaylists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter((_, i) => i !== songIdx) };
      }
      return p;
    });
    setNativePlaylists(updated);
    await saveNativePlaylists(updated);
  };

  const reorderPlaylist = async (playlistId: string, startIndex: number, endIndex: number) => {
    const updated = nativePlaylists.map(p => {
      if (p.id === playlistId) {
        const newSongs = [...p.songs];
        const [removed] = newSongs.splice(startIndex, 1);
        newSongs.splice(endIndex, 0, removed);
        return { ...p, songs: newSongs };
      }
      return p;
    });
    setNativePlaylists(updated);
    await saveNativePlaylists(updated);
  };

  const value = {
    query,
    setQuery,
    qtype,
    setQtype,
    loading,
    setLoading,
    songs,
    setSongs,
    playlist,
    setPlaylist,
    backendStatus,
    downloadPath,
    childProc,
    setBackendStatus,
    startBackend,
    streamUrl,
    setStreamUrl,
    playingSong,
    setPlayingSong: handleSetPlayingSong,
    userQueue,
    setUserQueue,
    autoplayQueue,
    setAutoplayQueue,
    addToUserQueue,
    playNextInQueue,
    isQueueVisible,
    setIsQueueVisible,
    nativePlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylist,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
      {/* Hidden audio tags to force WebKit to establish connections and pre-buffer TCP streams instantly */}
      <div style={{ display: 'none' }}>
        {Object.values(preloadedUrls).map((url, idx) => (
          <audio key={idx} src={url} preload="auto" muted />
        ))}
      </div>
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
