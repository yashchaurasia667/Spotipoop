import React, { useContext, useEffect, useState } from "react";

import { FaFolder } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

import DownloadsContext from "../context/downloadsContext/DownloadsContext";

import { downloads } from "../types/index";
interface style {
  display: "grid";
  gridTemplateColumns: string;
}

const DownloadTile = ({
  title,
  type,
  downloadPath,
  coverPath,
  complete,
}: downloads) => {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error("No Downloads context");

  const { initDownloads } = context;
  const [downloadComplete, setDownloadComplete] = useState<boolean>(complete);
  const [progress, setProgress] = useState<style>({
    display: "grid",
    gridTemplateColumns: `0fr 10fr`,
  });

  const openPath = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = window.api.openPath(downloadPath);
      console.log(res);
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
    }
  };

  const removeFromDownloads = async (e: React.FormEvent) => {
    e.preventDefault();
    const downloads = localStorage.getItem("downloads");
    if (downloads) {
      const dwl = JSON.parse(downloads);
      console.log(dwl);
      const newDownloads = dwl.filter(
        (download: downloads) =>
          !(download?.title == title && download?.coverPath == coverPath),
      );
      localStorage.setItem("downloads", JSON.stringify(newDownloads));
    }
    initDownloads();

    console.log("download removed");
  };

  return (
    <div className="h-[100px] rounded-lg bg-[#242424] px-6 py-4 grid grid-cols-[9fr_1fr] items-center">
      <div className="flex gap-x-8">
        <img src={coverPath} width={60} alt="cover" className="rounded-lg" />
        <div className="flex-grow">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-md underline text-purple-700">{type}</p>
          {downloadComplete ? (
            ""
          ) : (
            <div
              style={progress}
              className="w-[90%] rounded-full overflow-hidden mt-2"
            >
              <div className="bg-purple-500 h-[5px]"></div>
              <div className="bg-[#acacac] h-[5px]"></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-x-6">
        <button
          disabled={!downloadComplete}
          className={downloadComplete ? "" : "cursor-not-allowed opacity-50"}
          onClick={(e) => openPath(e)}
        >
          <FaFolder size={25} className="text-purple-300" />
        </button>
        <button onClick={removeFromDownloads}>
          <RxCross2 size={25} className="text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default DownloadTile;
