import { useContext } from "react";
import { toast } from "react-toastify";
import { Song } from "../types";

import GlobalContext from "../context/globalContext/GlobalContext";
import DownloadsContext from "../context/downloadsContext/DownloadsContext";

const SongTile = ({
  index,
  images,
  name,
  artists,
  album,
  duration,
  id,
}: Song) => {
  const globalContext = useContext(GlobalContext);
  if (!globalContext) throw new Error("No global Context");

  const downloadContext = useContext(DownloadsContext);
  if (!downloadContext) throw new Error("No download context");

  const { backendStatus, childProc, downloadPath } = globalContext;
  const { createDownload } = downloadContext;

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (!childProc || !backendStatus) return;

      await childProc.write(
        JSON.stringify({
          choice: 1,
          name: name,
          artist: artists,
          quality: 320,
        }) + "\n",
      );
      createDownload(images, name, id, "Song", true, downloadPath);

      toast.info(`Downloading ${name}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err) {
      console.error("Failed to open dialog:", err);
    }
  };

  return (
    <div className="overflow-hidden font-semibold w-full h-20 grid grid-cols-[3fr_2fr_1fr_1fr] gap-x-8 items-center rounded-lg bg-[#242424] mt-3 px-6 py-4">
      <div className="flex items-center gap-x-4 max-h-20 overflow-hidden group1">
        <div>{index}</div>
        <img
          src={images}
          width={50}
          className="rounded-[10px]"
          alt={`${name} cover`}
        />
        <div className="min-w-0">
          <p className="text-purple-500 whitespace-nowrap overflow-hidden text-ellipsis">
            {name}
          </p>
          <p className="underline truncate">{artists}</p>
        </div>
      </div>
      <div className="album truncate">{album}</div>
      <div>{duration}</div>
      <button
        className="text-[#121212] bg-purple-500 hover:bg-purple-400 hover:scale-105 rounded-full px-4 py-2 transition-all cursor-pointer"
        onClick={(e) => handleDownload(e)}
      >
        Download
      </button>
    </div>
  );
};

export default SongTile;
