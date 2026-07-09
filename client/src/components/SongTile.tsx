import { useContext } from "react";
import { toast } from "react-toastify";
import { FaPlay, FaDownload, FaPlus } from "react-icons/fa";
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

  const { backendStatus, childProc, downloadPath, setPlayingSong, addToUserQueue } = globalContext;
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
    <div 
      className="overflow-hidden font-semibold w-full h-20 grid grid-cols-[3fr_2fr_1fr_1fr] gap-x-8 items-center rounded-lg bg-[#242424] mt-3 px-6 py-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
      onClick={() => {
        if (setPlayingSong) {
          setPlayingSong({ index, images, name, artists, album, duration, id });
        }
      }}
    >
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
      <div className="flex items-center justify-end gap-x-6">
        <button
          className="text-gray-400 hover:text-white transition-colors cursor-pointer z-10 flex items-center gap-x-2 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (addToUserQueue) {
              addToUserQueue({ index, images, name, artists, album, duration, id });
              toast.success("Added to Queue", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                theme: "dark",
              });
            }
          }}
          title="Add to Queue"
        >
          <FaPlus />
        </button>
        <button
          className="text-gray-400 hover:text-white transition-colors cursor-pointer z-10 flex items-center gap-x-2 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(e);
          }}
        >
          <FaDownload /> Download
        </button>
        <button
          className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center text-[#121212] transition-transform hover:scale-105 cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            if (setPlayingSong) {
              setPlayingSong({ index, images, name, artists, album, duration, id });
            }
          }}
        >
          <FaPlay className="ml-1" size={14} />
        </button>
      </div>
    </div>
  );
};

export default SongTile;
