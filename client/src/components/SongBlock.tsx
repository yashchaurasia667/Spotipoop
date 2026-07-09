import { useContext, useMemo, useState, useEffect } from "react";

import { PacmanLoader } from "react-spinners";

import PlaylistTile from "./PlaylistTile";
import SongTile from "./SongTile";

import GlobalContext from "../context/globalContext/GlobalContext";

const SongBlock = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No GlobalContext");

  const { songs, loading, playlist, setPlayingSong } = context;

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    setFocusedIndex(null);
  }, [songs]);

  useEffect(() => {
    if (songs.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in the search bar
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex(prev => prev === null ? 0 : Math.min(prev + 1, songs.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex(prev => prev === null ? songs.length - 1 : Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (focusedIndex !== null && setPlayingSong) {
          e.preventDefault();
          setPlayingSong(songs[focusedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [songs, focusedIndex, setPlayingSong]);

  const renderResult = useMemo(() => {
    return songs.map((song, index) => <SongTile key={index} {...song} isFocused={index === focusedIndex} />);
  }, [songs, focusedIndex]);

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
