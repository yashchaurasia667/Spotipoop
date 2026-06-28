import { useContext, useMemo } from "react";

import { PacmanLoader } from "react-spinners";

import PlaylistTile from "./PlaylistTile";
import SongTile from "./SongTile";

import GlobalContext from "../context/globalContext/GlobalContext";

const SongBlock = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No GlobalContext");

  const { songs, loading, playlist } = context;

  const renderResult = useMemo(() => {
    return songs.map((song, index) => <SongTile key={index} {...song} />);
  }, [songs]);

  return (
    <>
      {loading ? (
        <PacmanLoader
          color="#a855f7"
          size={35}
          className="absolute left-1/3 mt-16"
        />
      ) : (
        <div
          className={`${
            playlist?.name == "" ? "" : "bg-[#282828]"
          } rounded-xl w-[90%] px-3 mx-auto mt-8 overflow-auto`}
        >
          <div className={playlist?.name == "" ? "hidden" : ""}>
            {playlist ? <PlaylistTile {...playlist} /> : ""}
          </div>
          <div
            className={`${
              playlist?.name == "" ? "mx-auto w-[75%]" : ""
            } mt-5 overflow-auto`}
          >
            {renderResult}
          </div>
        </div>
      )}
    </>
  );
};

export default SongBlock;
