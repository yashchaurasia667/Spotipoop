import { Child, Command } from "@tauri-apps/plugin-shell";
import { appDataDir, join } from "@tauri-apps/api/path";
import React, { useState, ReactNode, useEffect, useRef } from "react";
import GlobalContext from "./GlobalContext";
import { Song, playlist as PlaylistType } from "../../types";

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

  // States
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
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
              setStreamUrl(parsed.url);
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

  useEffect(() => {
    if (playingSong && childRef.current && backendStatus) {
      setStreamUrl(null); // Clear previous URL while loading
      childRef.current.write(
        JSON.stringify({
          choice: 8,
          name: playingSong.name,
          artist: playingSong.artists,
        }) + "\n"
      ).catch(console.error);
    }
  }, [playingSong, backendStatus]);

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
    setPlayingSong,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
