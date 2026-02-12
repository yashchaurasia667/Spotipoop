import React, { ReactNode, useState } from "react";
import DownloadsContext from "./DownloadsContext";

import { downloads } from "../../types";

interface DownloadsContextProviderProps {
  children: ReactNode;
}

const DownloadsContextProvider: React.FC<DownloadsContextProviderProps> = ({
  children,
}) => {
  const [downloads, setDownloads] = useState<downloads[]>([]);
  const [downloading, setDownloading] = useState<downloads[]>([]);

  const initDownloads = () => {
    const dwl = localStorage.getItem("downloads");
    if (dwl) setDownloads(JSON.parse(dwl));
    else setDownloads([]);
  };

  const createDownload = (
    cover: string,
    name: string,
    id: string,
    type: "Song" | "Playlist",
    complete: boolean,
    path: string,
  ) => {
    const newDownload = {
      title: name,
      downloadPath: path,
      coverPath: cover,
      id: id,
      type: type,
      complete: complete,
    };

    setDownloading((prevDownloads) => [...prevDownloads, newDownload]);
  };

  const value = {
    downloads,
    setDownloads,
    downloading,
    initDownloads,
    setDownloading,
    createDownload,
  };

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
};

export default DownloadsContextProvider;
