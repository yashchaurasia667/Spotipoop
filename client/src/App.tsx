import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./Layouts/MainLayout";

import Search from "./Pages/Search";
import Library from "./Pages/Library";
import PlaylistDetails from "./Pages/PlaylistDetails";

import Downloads from "./components/Downloads";
import Help from "./components/Help";

import GlobalContextProvider from "./context/globalContext/GlobalContextProvider";
import DownloadsContextProvider from "./context/downloadsContext/DownloadsContextProvider";

import "./App.css";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={
          <GlobalContextProvider>
            <MainLayout />
          </GlobalContextProvider>
        }
      >
        <Route
          index
          element={
            <DownloadsContextProvider>
              <Search />
            </DownloadsContextProvider>
          }
        ></Route>
        <Route
          path="library"
          element={
            <DownloadsContextProvider>
              <Library />
            </DownloadsContextProvider>
          }
        />
        <Route
          path="playlist/:id"
          element={
            <DownloadsContextProvider>
              <PlaylistDetails />
            </DownloadsContextProvider>
          }
        />
        <Route
          path="downloads"
          element={
            <DownloadsContextProvider>
              <Downloads />
            </DownloadsContextProvider>
          }
        />
        <Route path="help" element={<Help />} />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
}

export default App;
