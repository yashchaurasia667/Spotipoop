import React from "react";

import { downloads } from "../../types";

interface DownloadsContext {
  downloads: downloads[];
  setDownloads: (download: downloads[]) => void;
  downloading: downloads[];
  setDownloading: (download: downloads[]) => void;
  initDownloads: () => void;
  createDownload: (
    cover: string,
    name: string,
    id: string,
    type: "Song" | "Playlist",
    complete: boolean,
    path: string,
  ) => void;
}

const DownloadsContext = React.createContext(
  <DownloadsContext | undefined>undefined,
);
export default DownloadsContext;
