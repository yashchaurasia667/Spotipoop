import React, { useContext, useEffect } from "react";

import GlobalContext from "../context/globalContext/GlobalContext";

import SearchBar from "../components/SearchBar";
import SongBlock from "../components/SongBlock";

import "react-toastify/dist/ReactToastify.css";

const Search: React.FC = () => {

  const context = useContext(GlobalContext);
  if (!context) throw new Error("No global context!");
  const { startBackend } = context;

  // start python backend
  useEffect(() => {
    startBackend();
  }, []);



  return (
    <div className="grid grid-rows-[3fr_5fr] p-5 h-screen">
      <SearchBar />
      <SongBlock />
    </div>
  );
};

export default Search;
