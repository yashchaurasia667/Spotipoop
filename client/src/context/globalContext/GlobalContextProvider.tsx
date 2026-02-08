import React, { useState, ReactNode, useEffect, useRef } from "react";
import { Child, Command } from "@tauri-apps/plugin-shell";
import GlobalContext from "./GlobalContext";
import { Song, playlist } from "../../types";

interface GlobalContextProviderProps {
  children: ReactNode;
}

const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({ children }) => {
  const [childProc, setChildProc] = useState<Child | undefined>();
  const [backendStatus, setBackendStatus] = useState<boolean>(false);
  
  // Refs for logic that needs immediate access or persistence
  const childRef = useRef<Child | null>(null);
  const isSpawning = useRef(false);

  const startBackend = async () => {
    // Prevent multiple spawn attempts simultaneously
    if (isSpawning.current || childRef.current) return;
    isSpawning.current = true;

    try {
      const command = Command.sidecar("binaries/backend");

      command.on("close", (data) => {
        console.log(`Python process terminated: code ${data.code}`);
        setBackendStatus(false);
        childRef.current = null;
      });

      command.on("error", (error) => {
        console.error(`Python process error: "${error}"`);
      });

      command.stdout.on("data", (line) => {
        console.log(`[Python Stdout]: ${line}`);
      });

      command.stderr.on("data", (line) => {
        console.warn(`[Python Stderr]: ${line}`);
      });

      const child = await command.spawn();
      console.log(`Backend started. PID: ${child.pid}`);

      childRef.current = child;
      setChildProc(child);
      setBackendStatus(true);
    } catch (err) {
      console.error("Failed to spawn sidecar:", err);
      setBackendStatus(false);
    } finally {
      isSpawning.current = false;
    }
  };

  // Lifecycle Management
  useEffect(() => {
    // Auto-start backend on mount
    if (!backendStatus) {
      startBackend();
    }

    // CLEANUP: This runs when the app/provider unmounts
    return () => {
      if (childRef.current) {
        console.log("Killing Python sidecar...");
        childRef.current.kill().catch(console.error);
        childRef.current = null;
      }
    };
  }, []);

  // Other states...
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