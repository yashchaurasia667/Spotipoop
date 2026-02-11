import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { Song } from "../types";

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
  const toastStyle = {
    backgroundColor: "#232323",
  };

  const context = useContext(DownloadsContext);
  if (!context) throw new Error("No Downloads context");

  const { setDownloadPath, createDownload } = context;

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let path = localStorage.getItem("downloadPath");
    if (!path) path = await setDownloadPath(undefined);
    console.log(`Download Path: ${path}`);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song: { name, artists, images, id },
          path,
          qtype: "name",
        }),
      });

      const data = await res.json();

      if (data.success)
        toast.success("Download complete", { style: toastStyle });
      else {
        if (data?.status == 409)
          toast.error("Song already exists", { style: toastStyle });
        else toast.error("Something went wrong...", { style: toastStyle });
      }
    } catch (error) {
      console.error(`Something went wrong while downloading the song ${error}`);
    }
  };

  // useEffect(() => {
  //   socket.on("start", (data) => {
  //     if (data.id == id) {
  //       console.log("download started ", data);
  //       createDownload(images, name, id, "Song", false);
  //     }
  //   });

  //   return () => {
  //     socket.off("start");
  //   };
  // }, [socket, createDownload, id, images, name]);

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
        className="text-[#121212] bg-purple-500 hover:bg-purple-400 hover:scale-105 rounded-full px-4 py-2 transition-all"
        onClick={(e) => handleDownload(e)}
      >
        Download
      </button>
    </div>
  );
};

export default SongTile;
