import React from "react";

import { Song, playlist } from "../../types";
import { Child } from "@tauri-apps/plugin-shell";

interface GlobalContextType {
  query: string;
  setQuery: (query: string) => void;
  qtype: "Playlist" | "Name";
  setQtype: (qtype: "Playlist" | "Name") => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  playlist: playlist | undefined;
  setPlaylist: (playlist: playlist | undefined) => void;
  backendStatus: boolean;
  // setBackendStatus: (e: boolean) => void;
  childProc: Child | undefined;
  startBackend: () => Promise<void>;
}

const GlobalContext = React.createContext(
  <GlobalContextType | undefined>undefined,
);
export default GlobalContext;
