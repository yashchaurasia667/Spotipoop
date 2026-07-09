import React, { useContext } from "react";
import GlobalContext from "../context/globalContext/GlobalContext";
import { FaTimes, FaList } from "react-icons/fa";
import { Song } from "../../types";

const AddToPlaylistModal = ({ song, onClose }: { song: Song, onClose: () => void }) => {
  const context = useContext(GlobalContext);
  if (!context) return null;
  const { nativePlaylists, addSongToPlaylist } = context;

  const handleAdd = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#242424] rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-y-2 overflow-y-auto">
          {nativePlaylists.length === 0 ? (
            <p className="text-gray-400 text-center py-4">You haven't created any playlists yet.</p>
          ) : (
            nativePlaylists.map(pl => (
              <div 
                key={pl.id} 
                onClick={() => handleAdd(pl.id)}
                className="flex items-center gap-x-4 p-3 hover:bg-[#333] rounded-lg cursor-pointer transition"
              >
                <div className="w-12 h-12 bg-[#181818] rounded flex items-center justify-center overflow-hidden shrink-0">
                  {pl.cover ? (
                    <img src={pl.cover} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    <FaList className="text-gray-500" />
                  )} 
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{pl.name}</p>
                  <p className="text-gray-400 text-sm">{pl.songs.length} songs</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
