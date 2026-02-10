import { Child, Command } from "@tauri-apps/plugin-shell";
import { appDataDir, join } from "@tauri-apps/api/path";
import React, { useState, ReactNode, useEffect, useRef } from "react";
import GlobalContext from "./GlobalContext";
import { Song, playlist } from "../../types";

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
          // Clean the line and check if it's a JSON object
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("{")) {
            const parsed = JSON.parse(trimmedLine);

            // Handle Search Results
            if (
              parsed.type === "search_songs" &&
              Array.isArray(parsed.data)
            ) {
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
            }

            // Handle Status Updates (like Credentials/Env path set)
            else if (parsed.type === "status") {
              console.log("Backend Status:", parsed.message);
            }
          }
        } catch (e) {
          // Log non-JSON output for debugging
          console.log("Python Log:", line);
        }
      });

      const child = await command.spawn();
      childRef.current = child;
      setChildProc(child);
      setBackendStatus(true);

      // --- INITIAL SETUP (Choice 6) ---
      // We use the local 'child' variable because state hasn't updated yet.
      const dataDir = await appDataDir();
      const envFilePath = await join(dataDir, ".env");

      console.log(`Syncing Env Path: ${envFilePath}`);
      await child.write(
        JSON.stringify({
          choice: 6,
          env_path: envFilePath,
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

  // ... Other states (query, qtype, loading, songs, playlist) ...
  const [query, setQuery] = useState<string>("");
  const [qtype, setQtype] = useState<"Playlist" | "Name">("Name");
  const [loading, setLoading] = useState<boolean>(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<playlist | undefined>({
    cover: "",
    name: "",
    link: "",
  });

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
    childProc,
    setBackendStatus,
    startBackend,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
