import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "../components/Navbar";
import AudioPlayer from "../components/AudioPlayer";
import QueueSidebar from "../components/QueueSidebar";
import GlobalContext from "../context/globalContext/GlobalContext";

const MainLayout = () => {
  const globalContext = useContext(GlobalContext);
  const isQueueVisible = globalContext?.isQueueVisible || false;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-auto pb-4">
          <Outlet />
          <ToastContainer
            className={"overflow-clip absolute"}
            position="top-right"
            theme="dark"
            pauseOnHover
            pauseOnFocusLoss
          />
        </div>
        <QueueSidebar />
      </div>
      <AudioPlayer />
    </div>
  );
};

export default MainLayout;
