import React, { useContext, useRef, useEffect, useState } from "react";
import GlobalContext from "../context/globalContext/GlobalContext";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaStepForward, FaStepBackward, FaList } from "react-icons/fa";

const AudioPlayer = () => {
  const globalContext = useContext(GlobalContext);
  if (!globalContext) throw new Error("No global Context");

  const { streamUrl, playingSong, playNextInQueue, playPreviousInQueue, isQueueVisible, setIsQueueVisible } = globalContext;
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  useEffect(() => {
    if (streamUrl && audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  }, [streamUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !streamUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
        e.preventDefault();
        setIsPlaying(false);
        if (playNextInQueue) playNextInQueue();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        setIsPlaying(false);
        if (playPreviousInQueue) playPreviousInQueue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, playNextInQueue, playPreviousInQueue]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress(total ? (current / total) * 100 : 0);
      setCurrentTime(current);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
      setProgress(val);
    }
  };

  if (!playingSong) return null;

  return (
    <div className="w-full h-24 bg-[#181818]/95 backdrop-blur-xl border-t border-[#333] px-6 flex items-center justify-between shrink-0">
      {/* Song Info */}
      <div className="flex items-center gap-x-4 w-1/4">
        <img
          src={playingSong.images}
          alt="cover"
          className="w-16 h-16 rounded-md shadow-lg"
        />
        <div className="overflow-hidden">
          <p className="text-white font-semibold text-base truncate">
            {playingSong.name}
          </p>
          <p className="text-gray-400 text-sm truncate">
            {playingSong.artists}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-y-2 w-2/4">
        <div className="flex items-center gap-x-6">
          <button 
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={!streamUrl}
            onClick={() => {
              setIsPlaying(false);
              if (playPreviousInQueue) playPreviousInQueue();
            }}
          >
            <FaStepBackward size={14} />
          </button>
          <button
            onClick={togglePlay}
            disabled={!streamUrl}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isPlaying ? (
              <FaPause className="text-black ml-0" size={14} />
            ) : (
              <FaPlay className="text-black ml-1" size={14} />
            )}
          </button>
          <button 
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={!streamUrl}
            onClick={() => {
              setIsPlaying(false);
              if (playNextInQueue) playNextInQueue();
            }}
          >
            <FaStepForward size={14} />
          </button>
        </div>
        <div className="w-full flex items-center gap-x-3 text-sm text-gray-400 group">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={streamUrl ? progress : 0}
            onChange={handleSeek}
            disabled={!streamUrl}
            style={{ background: `linear-gradient(to right, #a855f7 ${streamUrl ? progress : 0}%, #4b5563 ${streamUrl ? progress : 0}%)` }}
            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:opacity-0 group-hover:[&::-moz-range-thumb]:opacity-100 [&::-moz-range-thumb]:transition-opacity [&::-moz-range-thumb]:border-0"
          />
          <span className="w-10">{playingSong.duration}</span>
        </div>
      </div>

      {/* Volume & Queue */}
      <div className="flex items-center gap-x-4 w-1/4 justify-end group">
        <button 
          onClick={() => setIsQueueVisible && setIsQueueVisible(!isQueueVisible)}
          className={`hover:text-white transition-colors ${isQueueVisible ? "text-purple-500" : "text-gray-400"}`}
          title="Queue"
        >
          <FaList size={16} />
        </button>
        <button onClick={toggleMute} className="text-gray-400 hover:text-white">
          {isMuted || volume === 0 ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{ background: `linear-gradient(to right, #a855f7 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)` }}
          className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:opacity-0 group-hover:[&::-moz-range-thumb]:opacity-100 [&::-moz-range-thumb]:transition-opacity [&::-moz-range-thumb]:border-0"
        />
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (playNextInQueue) playNextInQueue();
        }}
      />
    </div>
  );
};

export default AudioPlayer;
