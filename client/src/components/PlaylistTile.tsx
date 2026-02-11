import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";

import { FaArrowDown } from "react-icons/fa";

import DownloadsContext from "../context/downloadsContext/DownloadsContext";
import { playlist } from "../types";

const PlaylistTile = ({
  cover = "",
  name = "",
  owner = "",
  length = 0,
}: playlist) => {
  const toastStyle = {
    backgroundColor: "#232323",
  };

  const context = useContext(DownloadsContext);
  if (!context) throw new Error("No Downloads context");

  const { createDownload } = context;

  // useEffect(() => {
  //   socket.on("start", (data) => {
  //     if (data.id == link) {
  //       console.log("data: ", data);
  //       createDownload(cover, name, link, "Playlist", false);
  //     }
  //   });

  //   return () => {
  //     socket.off("start");
  //   };
  // }, [socket, createDownload, cover, link, name]);

  // const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   const path = localStorage.getItem("downloadPath");
  //   if (path) {
  //     const res = await fetch("api/download", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         // song: link,
  //         path,
  //         qtype: "playlist",
  //       }),
  //     });
  //     const data = await res.json();
  //     if (data.success)
  //       toast.success("Playlist downloaded", {
  //         style: toastStyle,
  //       });
  //     else toast.error("Could not download playlist...", { style: toastStyle });
  //   }
  // };
  return (
    <div className="flex items-center justify-between bg-[#282828] font-semibold rounded-xl mx-auto mt-3 px-6 py-4">
      <div className="flex items-center gap-x-8 h-full">
        <img
          src={cover}
          width={"250px"}
          alt={`${name} cover`}
          className="rounded-lg"
        />
        <section>
          <div className="font-bold text-6xl">{name}</div>
          <div className="font-medium text-md text-gray-400">{`by ${owner}, ${length} songs`}</div>
        </section>
      </div>
      <button
        className="text-[#121212] bg-purple-500 hover:bg-purple-400 hover:scale-110 rounded-[50%] p-6 transition-all cursor-pointer"
        // onClick={handleDownload}
      >
        <FaArrowDown size={35} />
      </button>
    </div>
  );
};

export default PlaylistTile;
