import { open } from "@tauri-apps/plugin-dialog";

import { useContext, useEffect, useMemo } from "react";
import DownloadTile from "./DownloadTile";
import { downloads } from "../types/index.ts";

import DownloadsContext from "../context/downloadsContext/DownloadsContext.ts";
import GlobalContext from "../context/globalContext/GlobalContext.ts";

const Downloads = () => {
  const globalContext = useContext(GlobalContext);
  const downloadContext = useContext(DownloadsContext);

  if (!downloadContext) throw new Error("No Download Context");
  if (!globalContext) throw new Error("No global Context");

  const { downloading, downloads, initDownloads } = downloadContext;
  const { childProc, backendStatus } = globalContext;

  const inProgress = useMemo(() => {
    return downloading.map((title: downloads, index) => (
      <DownloadTile key={index} {...title} />
    ));
  }, [downloading]);
  const completed = useMemo(() => {
    return downloads.map((tile, index) => (
      <DownloadTile key={index} {...tile} />
    ));
  }, [downloads]);

  useEffect(() => {
    initDownloads();
  }, []);

  const handleFolderSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!childProc || !backendStatus) return;

      // This opens the native OS dialog box
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Select Download Directory",
        // Optional: defaultPath: 'C:\\Users'
      });

      if (selectedPath) {
        console.log("User selected:", selectedPath);

        // Now you can send this to your Python sidecar (choice: 3)
        await childProc.write(
          JSON.stringify({
            choice: 3,
            path: selectedPath,
          }) + "\n",
        );
      } else {
        console.log("User cancelled the selection");
      }
    } catch (err) {
      console.error("Failed to open dialog:", err);
    }
  };

  return (
    <div className="px-4 py-10">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-4xl mb-4 text-purple-500">Downloads</h1>
        <button
          className="mr-5 text-[#242424] font-semibold bg-purple-400 rounded-full px-4 py-2 hover:bg-purple-300 hover:scale-105 transition-all"
          onClick={(e) => handleFolderSelect(e)}
        >
          Set Download Path
        </button>
      </div>
      <div className="mt-20 flex flex-col gap-y-4">
        {inProgress}
        {completed}
      </div>
    </div>
  );
};

export default Downloads;
