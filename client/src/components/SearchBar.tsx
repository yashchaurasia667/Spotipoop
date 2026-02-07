import { useContext } from "react";

import { FaChevronDown } from "react-icons/fa";
import GlobalContext from "../context/globalContext/GlobalContext";

const SearchBar = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No GlobalContext");

  const {
    query,
    setQuery,
    qtype,
    setQtype,
    setPlaylist,
    setLoading,
    setSongs,
  } = context;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query == "") return;

    setLoading(true);
    setSongs([]);
    setPlaylist(undefined);
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, qtype }),
      });

      const data = await res.json();
      if (data.success) {
        if (qtype == "Playlist") {
          setPlaylist({
            cover: data.cover,
            name: data.name,
            link: query,
          });
        }
        // else {
        //   setPlaylist((prev) => ({
        //     ...prev,
        //     name: "",
        //   }));
        // }
        setSongs(data.songs);
      } else if (!data.success) throw new Error("Check the playlist link");
    } catch (error) {
      console.error(`Error fetching songs: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[40%] p-5 self-end">
      <form
        method="post"
        className="flex md:flex-row flex-col justify-center items-center gap-x-3 gap-y-6"
        onSubmit={handleSubmit}
      >
        <div className="dropdown">
          <div className="select flex items-center gap-x-2">
            {qtype}
            <FaChevronDown />
          </div>
          <div className="dropdown_content">
            <div onClick={() => setQtype("Name")}>Name</div>
            <div onClick={() => setQtype("Playlist")}>Playlist</div>
          </div>
        </div>

        <input
          type="text"
          name="link"
          className="bg-[#242424] w-[90%] md:w-[40%] px-8 py-3 rounded-full outline-none border-2 border-[#acacac] hover:border-white focus:border-white focus:border-[3px] transition-all"
          placeholder={
            qtype === "Name"
              ? "Name of the song"
              : "Link to the Spotify playlist"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="font-semibold bg-purple-400 text-[#121212] rounded-full px-10 py-4 hover:scale-105 hover:bg-purple-300 transition-all"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
