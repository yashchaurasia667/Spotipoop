import React, { useContext, useState, useRef } from "react";
import GlobalContext from "../context/globalContext/GlobalContext";
import { FaPlay, FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Song } from "../../types";

const QueueItem = ({
  song,
  idx,
  userQueue,
  setUserQueue,
  setPlayingSong,
  draggedItemIdx,
  setDraggedItemIdx,
}: {
  song: Song;
  idx: number;
  userQueue: Song[];
  setUserQueue: (q: Song[]) => void;
  setPlayingSong: (s: Song) => void;
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
    setUserQueue(userQueue.filter((_, i) => i !== idx));
  };

  const moveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx > 0) {
      const newQueue = [...userQueue];
      [newQueue[idx - 1], newQueue[idx]] = [newQueue[idx], newQueue[idx - 1]];
      setUserQueue(newQueue);
    }
  };

  const moveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx < userQueue.length - 1) {
      const newQueue = [...userQueue];
      [newQueue[idx + 1], newQueue[idx]] = [newQueue[idx], newQueue[idx + 1]];
      setUserQueue(newQueue);
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

      // Detect horizontal movement
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
      const newQueue = [...userQueue];
      const item = newQueue.splice(sourceIdx, 1)[0];
      newQueue.splice(idx, 0, item);
      setUserQueue(newQueue);
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
      className={`flex items-center gap-x-3 p-2 hover:bg-[#333] rounded-lg group cursor-pointer ${
        draggedItemIdx === idx ? "opacity-50" : "opacity-100"
      }`}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? "transform 0.2s ease" : "none",
      }}
      onClick={() => {
        if (!wasSwiping.current && setPlayingSong && setUserQueue) {
          setPlayingSong(song);
          setUserQueue(userQueue.slice(idx + 1));
        }
      }}
    >
      <div className="relative w-10 h-10 shrink-0 pointer-events-none">
        <img
          src={song.images}
          alt="cover"
          className="w-full h-full rounded shadow group-hover:opacity-50 transition-opacity"
        />
        <FaPlay
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100"
          size={12}
        />
      </div>
      <div className="min-w-0 flex-1 pointer-events-none">
        <p className="text-white text-sm font-semibold truncate">
          {song.name}
        </p>
        <p className="text-gray-400 text-xs truncate">{song.artists}</p>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-y-2 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={moveUp}
          disabled={idx === 0}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
          title="Move Up"
        >
          <FaChevronUp size={12} />
        </button>
        <button
          onClick={moveDown}
          disabled={idx === userQueue.length - 1}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
          title="Move Down"
        >
          <FaChevronDown size={12} />
        </button>
      </div>
      <button
        onClick={removeSong}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0 p-1"
        title="Remove from Queue"
      >
        <FaTimes size={16} />
      </button>
    </div>
  );
};

const QueueSidebar = () => {
  const globalContext = useContext(GlobalContext);
  if (!globalContext) throw new Error("No global Context");

  const { isQueueVisible, userQueue, autoplayQueue, setPlayingSong, setUserQueue, setAutoplayQueue } =
    globalContext;
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);

  if (!isQueueVisible) return null;

  return (
    <div className="w-80 bg-[#242424] rounded-xl my-3 mr-4 flex flex-col overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-[#333]">
        <h2 className="text-xl font-bold text-white">Queue</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-3 overflow-x-hidden">
        {userQueue.length > 0 && (
          <div className="mb-4">
            <h3 className="text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Next In Queue</h3>
            {userQueue.map((song, idx) => (
              <QueueItem
                key={`user-${song.id}-${idx}`}
                song={song}
                idx={idx}
                userQueue={userQueue}
                setUserQueue={setUserQueue!}
                setPlayingSong={setPlayingSong!}
                draggedItemIdx={draggedItemIdx}
                setDraggedItemIdx={setDraggedItemIdx}
              />
            ))}
          </div>
        )}

        {autoplayQueue && autoplayQueue.length > 0 && (
          <div>
            <h3 className="text-gray-400 text-sm mb-2 font-bold uppercase tracking-wider">Autoplay</h3>
            {autoplayQueue.map((song, idx) => (
              <QueueItem
                key={`auto-${song.id}-${idx}`}
                song={song}
                idx={idx}
                userQueue={autoplayQueue}
                setUserQueue={setAutoplayQueue!}
                setPlayingSong={setPlayingSong!}
                draggedItemIdx={draggedItemIdx}
                setDraggedItemIdx={setDraggedItemIdx}
              />
            ))}
          </div>
        )}

        {userQueue.length === 0 && (!autoplayQueue || autoplayQueue.length === 0) && (
          <p className="text-gray-400 text-center mt-4">Your queue is empty.</p>
        )}
      </div>
    </div>
  );
};

export default QueueSidebar;
