import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import GlobalContext from "../context/globalContext/GlobalContext";

import SearchBar from "../components/SearchBar";
import SongBlock from "../components/SongBlock";

import "react-toastify/dist/ReactToastify.css";

const Search: React.FC = () => {
  const navigate = useNavigate();

  const context = useContext(GlobalContext);
  if (!context) throw new Error("No global context!");
  const { startBackend } = context;

  // start python backend
  useEffect(() => {
    startBackend();
  }, []);

  // check for credentials in .env file
  useEffect(() => {
    const id = import.meta.env.VITE_SPOTIFY_ID;
    const secret = import.meta.env.VITE_SPOTIFY_SECRET;
    if (!id || !secret) navigate("/login");
    else {
      const toastStyle = {
        backgroundColor: "#232323",
      };
      toast.success("Connected to Spotify", {
        style: toastStyle,
      });
    }
  }, []);

  return (
    <div className="grid grid-rows-[3fr_5fr] p-5 h-screen">
      <SearchBar />
      <SongBlock />
    </div>
  );
};

export default Search;
