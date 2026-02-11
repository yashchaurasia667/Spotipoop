import React, { useContext } from "react";
import { FaArrowDown } from "react-icons/fa";

import GlobalContext from "../context/globalContext/GlobalContext";
import { playlist } from "../types";

const PlaylistTile = ({
  cover = "",
  name = "",
  owner = "",
  length = 0,
  link = "",
}: playlist) => {
  // const toastStyle = {
  //   backgroundColor: "#232323",
  // };

  const context = useContext(GlobalContext);
  if (!context) throw new Error("No global context");
  const { backendStatus, childProc } = context;

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (!backendStatus || !childProc) return;

      childProc.write(
        JSON.stringify({
          choice: 5,
          link: link,
        }) + "\n",
      );
    } catch (error) {
      console.error(error);
    }
  };

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
        onClick={handleDownload}
      >
        <FaArrowDown size={35} />
      </button>
    </div>
  );
};

export default PlaylistTile;
