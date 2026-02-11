import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./Layouts/MainLayout";

import Search from "./Pages/Search";

import Downloads from "./components/Downloads";
import Login from "./components/Login";
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
          <DownloadsContextProvider>
            <MainLayout />
          </DownloadsContextProvider>
        }
      >
        <Route
          index
          element={
            <GlobalContextProvider>
              <Search />
            </GlobalContextProvider>
          }
        ></Route>
        <Route
          path="downloads"
          element={
            <GlobalContextProvider>
              <Downloads />
            </GlobalContextProvider>
          }
        />
        <Route
          path="login"
          element={
            <GlobalContextProvider>
              <Login />
            </GlobalContextProvider>
          }
        />
        <Route path="help" element={<Help />} />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
}

export default App;
