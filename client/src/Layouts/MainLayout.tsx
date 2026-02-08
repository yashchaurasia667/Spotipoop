// import { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "../components/Navbar";

// import DownloadsContext from "../context/downloadsContext/DownloadsContext";

// import { io } from "socket.io-client";

const MainLayout = () => {

  // const context = useContext(DownloadsContext);
  // if (!context) throw new Error("No Download context");
  // const { downloading, setDownloading, downloads, initDownloads } = context;

  // const socket = io("http://localhost:5000", {
  //   transports: ["websocket", "polling"],
  // });

  // useEffect(() => {
  //   socket.on("complete", (data) => {
  //     console.log("download complete", data);
  //     let newDownload = undefined;
  //     setDownloading(
  //       downloading.filter((item) => {
  //         if (item.id == data.id) {
  //           console.log("id: ", item.id);
  //           item.complete = true;
  //           newDownload = item;
  //         } else return item;
  //       }),
  //     );
  //     initDownloads();
  //     if (newDownload) {
  //       if (downloads) {
  //         localStorage.setItem(
  //           "downloads",
  //           JSON.stringify([...downloads, newDownload]),
  //         );
  //       } else localStorage.setItem("downloads", JSON.stringify([newDownload]));
  //       initDownloads();
  //     }
  //   });

  //   return () => {
  //     socket.off("complete");
  //   };
  // }, [downloading, downloads]);

  return (
    <div className="min-h-[100vh] grid grid-cols-[1.3fr_8fr]">
      <Navbar />
      <div>
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
  );
};

export default MainLayout;
