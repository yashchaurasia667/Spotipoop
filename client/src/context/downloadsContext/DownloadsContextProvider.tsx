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

  const setDownloadPath = async (e: React.FormEvent | undefined) => {
    if (e) e.preventDefault();
    try {
      const res = await window.api.openDownloadDialog();
      if (res && !res?.canceled) {
        const path = res.filePaths[0];
        localStorage.setItem("downloadPath", path);
        console.log(`Download path set to: ${path}`);
        return path;
      } else console.log("Operation canceled");
    } catch (error) {
      console.error(`Something went wrong opening file dialog: ${error}`);
    }
    return "";
  };

  const createDownload = (
    cover: string,
    name: string,
    id: string,
    type: "Song" | "Playlist",
    complete: boolean,
  ) => {
    const path = localStorage.getItem("downloadPath");

    const newDownload = {
      title: name,
      downloadPath: path || "c:/",
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
    setDownloadPath,
    createDownload,
  };

  return (
    <DownloadsContext.Provider value={value}>
      {children}
    </DownloadsContext.Provider>
  );
};

export default DownloadsContextProvider;
