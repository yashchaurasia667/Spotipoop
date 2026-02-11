import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

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
    const checkCreds = async () => {
      const appData = await appDataDir();
      const envPath = await join(appData, ".env");

      const fileExists = await exists(envPath);

      if (!fileExists) {
        navigate("/login");
        return;
      }

      const content = await readTextFile(envPath);
      if (!content.includes("VITE_SPOTIFY_ID") || !content.includes("VITE_SPOTIFY_SECRET")) {
        navigate("/login");
      } else {
        // console.log(content)
        toast.success("Connected to Spotify", {
          style: { backgroundColor: "#232323" },
        });
      }
    };

    checkCreds();
  }, [navigate]);

  return (
    <div className="grid grid-rows-[3fr_5fr] p-5 h-screen">
      <SearchBar />
      <SongBlock />
    </div>
  );
};

export default Search;
