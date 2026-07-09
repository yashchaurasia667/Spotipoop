import React, { useContext, useState, useRef } from "react";
import GlobalContext from "../context/globalContext/GlobalContext";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaTrash, FaEdit, FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Song } from "../../types";

const PlaylistItem = ({
  song,
  idx,
  playlistId,
  playlistLength,
  removeSongFromPlaylist,
  reorderPlaylist,
  setPlayingSong,
  setUserQueue,
  playlistSongs,
  draggedItemIdx,
  setDraggedItemIdx,
}: {
  song: Song;
  idx: number;
  playlistId: string;
  playlistLength: number;
  removeSongFromPlaylist: (id: string, idx: number) => void;
  reorderPlaylist: (id: string, start: number, end: number) => void;
  setPlayingSong: (s: Song) => void;
  setUserQueue: (q: Song[]) => void;
  playlistSongs: Song[];
  draggedItemIdx: number | null;
  setDraggedItemIdx: (idx: number | null) => void;
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const swipeOffsetRef = useRef(0);
  const [isDraggable, setIsDraggable] = useState(true);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const wasSwiping = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateSwipe = (val: number) => {
    setSwipeOffset(val);
    swipeOffsetRef.current = val;
  };

  const removeSong = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    removeSongFromPlaylist(playlistId, idx);
  };

  const moveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx > 0) {
      reorderPlaylist(playlistId, idx, idx - 1);
    }
  };

  const moveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx < playlistLength - 1) {
      reorderPlaylist(playlistId, idx, idx + 1);
    }
  };

  // Pointer events for swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    wasSwiping.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX.current !== null && startY.current !== null) {
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
        setIsDraggable(false);
        wasSwiping.current = true;
        updateSwipe(dx);
      }
    }
  };

  const handlePointerUp = () => {
    if (Math.abs(swipeOffsetRef.current) > 100) {
      removeSong();
    }
    updateSwipe(0);
    startX.current = null;
    startY.current = null;
    setIsDraggable(true);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const next = swipeOffsetRef.current - e.deltaX;
      if (Math.abs(next) > 100) {
        removeSong();
        updateSwipe(0);
      } else {
        updateSwipe(next);
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        updateSwipe(0);
      }, 200);
    }
  };

  // DND Handlers
  const handleDragStart = (e: React.DragEvent) => {
    setDraggedItemIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceIdxStr = e.dataTransfer.getData("text/plain");
    if (!sourceIdxStr) return;
    const sourceIdx = parseInt(sourceIdxStr, 10);

    if (!isNaN(sourceIdx) && sourceIdx !== idx) {
      reorderPlaylist(playlistId, sourceIdx, idx);
    }
    setDraggedItemIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIdx(null);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className={`flex items-center gap-x-4 p-3 bg-[#181818] hover:bg-[#282828] rounded-xl group cursor-pointer transition-colors ${
        draggedItemIdx === idx ? "opacity-50" : "opacity-100"
      }`}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? "transform 0.2s ease" : "none",
      }}
      onClick={() => {
        if (!wasSwiping.current && setPlayingSong && setUserQueue) {
          setPlayingSong(song);
          setUserQueue(playlistSongs.slice(idx + 1));
        }
      }}
    >
      <div className="text-gray-400 w-4 text-center text-sm group-hover:hidden">
        {idx + 1}
      </div>
      <div className="w-4 flex items-center justify-center hidden group-hover:flex text-white">
        <FaPlay size={12} />
      </div>

      <div className="relative w-12 h-12 shrink-0 pointer-events-none">
        <img
          src={song.images}
          alt="cover"
          className="w-full h-full rounded shadow"
        />
      </div>
      <div className="min-w-0 flex-1 pointer-events-none">
        <p className="text-white font-semibold truncate">{song.name}</p>
        <p className="text-gray-400 text-sm truncate">{song.artists}</p>
      </div>

      <div className="text-gray-400 text-sm w-16 text-right pointer-events-none">
        {song.duration}
      </div>

      <div
        className="flex flex-col items-center justify-center gap-y-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={moveUp}
          disabled={idx === 0}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
        >
          <FaChevronUp size={12} />
        </button>
        <button
          onClick={moveDown}
          disabled={idx === playlistLength - 1}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
        >
          <FaChevronDown size={12} />
        </button>
      </div>
      <button
        onClick={removeSong}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 p-2"
      >
        <FaTimes size={16} />
      </button>
    </div>
  );
};

const PlaylistDetails = () => {
  const { id } = useParams();
  const context = useContext(GlobalContext);
  if (!context) throw new Error("No GlobalContext");
  
  const { 
    nativePlaylists, 
    updatePlaylist, 
    deletePlaylist, 
    removeSongFromPlaylist, 
    reorderPlaylist, 
    setUserQueue, 
    setPlayingSong 
  } = context;
  const navigate = useNavigate();
  
  const playlist = nativePlaylists.find(p => p.id === id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("");
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);

  // Sync state when playlist loads
  React.useEffect(() => {
    if (playlist && !isEditing) {
      setName(playlist.name);
      setDesc(playlist.description);
      setCover(playlist.cover);
    }
  }, [playlist, isEditing]);

  if (!playlist) return <div className="text-white p-8">Playlist not found</div>;

  const handleSave = () => {
    updatePlaylist(playlist.id, { name, description: desc, cover });
    setIsEditing(false);
  };

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      setUserQueue(playlist.songs.slice(1));
      setPlayingSong(playlist.songs[0]);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlist.id);
      navigate("/library");
    }
  };

  return (
    <div className="w-full h-full p-8 text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-end gap-x-8 mb-8 pb-8 border-b border-[#333]">
        <div className="w-60 h-60 bg-[#282828] rounded-xl shadow-2xl overflow-hidden shrink-0 flex items-center justify-center">
          {playlist.cover ? (
             <img src={playlist.cover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
             <FaPlay size={64} className="text-gray-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Playlist</p>
          
          {isEditing ? (
            <div className="flex flex-col gap-y-3 mb-4 max-w-lg">
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)} 
                className="bg-[#333] text-4xl font-bold text-white px-3 py-2 rounded outline-none w-full"
                placeholder="Playlist Name"
              />
              <input 
                type="text" value={desc} onChange={e => setDesc(e.target.value)} 
                className="bg-[#333] text-gray-300 px-3 py-2 rounded outline-none w-full"
                placeholder="Description"
              />
              <input 
                type="text" value={cover} onChange={e => setCover(e.target.value)} 
                className="bg-[#333] text-gray-300 px-3 py-2 rounded outline-none w-full"
                placeholder="Cover Image URL"
              />
              <div className="flex gap-x-3 mt-2">
                <button onClick={handleSave} className="bg-purple-500 hover:bg-purple-400 px-6 py-2 rounded-full font-bold transition">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white font-bold px-4">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-7xl font-bold mb-6 truncate">{playlist.name}</h1>
              <p className="text-gray-300 text-lg mb-2">{playlist.description}</p>
              <p className="text-gray-400 text-sm">{playlist.songs.length} songs</p>
            </>
          )}

          {!isEditing && (
            <div className="flex items-center gap-x-4 mt-6">
              <button 
                onClick={handlePlayAll}
                disabled={playlist.songs.length === 0}
                className="bg-purple-500 hover:bg-purple-400 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 text-[#121212] p-4 rounded-full transition-all"
                title="Play All"
              >
                <FaPlay size={24} />
              </button>
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white p-3 rounded-full hover:bg-[#333] transition" title="Edit Playlist">
                <FaEdit size={24} />
              </button>
              <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-3 rounded-full hover:bg-[#333] transition" title="Delete Playlist">
                <FaTrash size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Songs List */}
      <div className="flex flex-col gap-y-2">
        {playlist.songs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <h3 className="text-xl font-bold mb-2">It's a bit empty here...</h3>
            <p>Go search for some songs and add them to this playlist!</p>
          </div>
        ) : (
          playlist.songs.map((song, idx) => (
            <PlaylistItem 
              key={`${song.id}-${idx}`}
              song={song}
              idx={idx}
              playlistId={playlist.id}
              playlistLength={playlist.songs.length}
              removeSongFromPlaylist={removeSongFromPlaylist}
              reorderPlaylist={reorderPlaylist}
              setPlayingSong={setPlayingSong}
              setUserQueue={setUserQueue}
              playlistSongs={playlist.songs}
              draggedItemIdx={draggedItemIdx}
              setDraggedItemIdx={setDraggedItemIdx}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistDetails;
