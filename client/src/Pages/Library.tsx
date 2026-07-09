import { useContext, useState } from "react";
import GlobalContext from "../context/globalContext/GlobalContext";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const Library = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No GlobalContext");
  
  const { nativePlaylists, createPlaylist } = context;
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("New Playlist");

  const handleCreate = async () => {
    await createPlaylist(name, "My awesome playlist", "https://misc.scdn.co/liked-songs/liked-songs-300.png");
    setIsCreating(false);
    setName("New Playlist");
  };

  return (
    <div className="w-full h-full p-8 text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Library</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-full flex items-center gap-2 transition font-bold"
        >
          <FaPlus /> Create Playlist
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-[#242424] p-4 rounded-xl flex gap-4 items-center max-w-md">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="bg-[#333] text-white px-3 py-2 rounded flex-1 outline-none"
            placeholder="Playlist Name"
            autoFocus
          />
          <button onClick={handleCreate} className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded text-white font-bold transition">Save</button>
          <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white transition">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {nativePlaylists.map(pl => (
          <div 
            key={pl.id} 
            className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition cursor-pointer group"
            onClick={() => navigate(`/playlist/${pl.id}`)}
          >
            <div className="aspect-square bg-[#333] rounded-lg mb-4 overflow-hidden shadow-lg relative">
              {pl.cover ? (
                <img src={pl.cover} alt={pl.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Cover</div>
              )}
            </div>
            <h3 className="font-bold text-lg truncate text-white">{pl.name}</h3>
            <p className="text-gray-400 text-sm truncate">{pl.description}</p>
          </div>
        ))}
        {nativePlaylists.length === 0 && !isCreating && (
          <p className="text-gray-400 col-span-full">You haven't created any playlists yet.</p>
        )}
      </div>
    </div>
  );
};

export default Library;
