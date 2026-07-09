import React from "react";

import { Song, playlist, NativePlaylist } from "../../types";
import { Child } from "@tauri-apps/plugin-shell";

interface GlobalContextType {
  streamUrl: string | null;
  setStreamUrl: (url: string | null) => void;
  playingSong: Song | null;
  setPlayingSong: (song: Song | null) => void;
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
  downloadPath: string;
  childProc: Child | undefined;
  startBackend: () => Promise<void>;
  userQueue: Song[];
  setUserQueue: (queue: Song[]) => void;
  autoplayQueue: Song[];
  setAutoplayQueue: (queue: Song[]) => void;
  addToUserQueue: (song: Song) => void;
  playNextInQueue: () => void;
  isQueueVisible: boolean;
  setIsQueueVisible: (visible: boolean) => void;
  nativePlaylists: NativePlaylist[];
  createPlaylist: (name: string, description: string, cover: string) => Promise<void>;
  updatePlaylist: (id: string, updates: Partial<NativePlaylist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songIdx: number) => Promise<void>;
  reorderPlaylist: (playlistId: string, startIndex: number, endIndex: number) => Promise<void>;
}
const GlobalContext = React.createContext(
  <GlobalContextType | undefined>undefined,
);
export default GlobalContext;
