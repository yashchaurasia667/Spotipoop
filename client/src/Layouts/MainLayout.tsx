// import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "../components/Navbar";
import AudioPlayer from "../components/AudioPlayer";

const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 grid grid-cols-[1.3fr_8fr] overflow-hidden">
        <Navbar />
        <div className="overflow-auto pb-4">
          <Outlet />
          <ToastContainer
            className={"overflow-clip absolute"}
            position="top-right"
            theme="dark"
            pauseOnHover
            pauseOnFocusLoss
          />
        </div>
      </div>
      <AudioPlayer />
    </div>
  );
};

export default MainLayout;
