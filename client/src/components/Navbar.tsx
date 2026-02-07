import { useState } from "react";
import { NavLink } from "react-router-dom";

import { FaArrowDown, FaQuestion, FaSearch, FaSpotify } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
  const [keepOpen, setKeepOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);

  const pages = {
    search: (
      <div className="flex gap-x-4 items-center">
        <FaSearch size={25} className="" />
        {isHovered ? <p className="text-xl">Search</p> : ""}
      </div>
    ),
    downloads: (
      <div className="flex gap-x-4 items-center">
        <FaArrowDown size={25} className="" />
        {isHovered ? <p className="text-xl">Downloads</p> : ""}
      </div>
    ),
    login: (
      <div className="flex gap-x-4 items-center">
        <CgProfile size={25} className="" />
        {isHovered ? <p className="text-xl">Login</p> : ""}
      </div>
    ),
    help: (
      <div className="flex gap-x-4 items-center">
        <FaQuestion size={25} className="" />
        {isHovered ? <p className="text-xl">Help</p> : ""}
      </div>
    ),
  };

  return (
    <div
      className={`flex items-center pl-4 pr-4 relative my-3 rounded-xl bg-[#242424] ${
        keepOpen ? "w-52.5" : "w-23.75 hover:w-52.5"
      } transition-all overflow-hidden`}
      onMouseEnter={() =>
        !keepOpen ? setIsHovered(true) : setIsHovered(isHovered)
      }
      onMouseLeave={() =>
        !keepOpen ? setIsHovered(false) : setIsHovered(isHovered)
      }
    >
      <div className="flex flex-col gap-y-4">
        <FaSpotify
          size={60}
          className="absolute top-6 left-3.25 text-purple-400"
        />
        <NavLink to={"/"} className={"navlink"}>
          {pages.search}
        </NavLink>
        <NavLink to={"/downloads"} className={"navlink"}>
          {pages.downloads}
        </NavLink>
        <NavLink to={"/login"} className={"navlink"}>
          {pages.login}
        </NavLink>
        <NavLink to={"/help"} className={"navlink"}>
          {pages.help}
        </NavLink>
      </div>
      <div className="absolute bottom-5">
        <div
          className={`bottom-0 mt-2 ${
            keepOpen ? "bg-purple-400" : "bg-[#acacac]"
          }  h-8.75 w-15 px-7 py-3 rounded-full outline-none border-[#242424] border-2 relative transition-all duration-150`}
          onClick={() => setKeepOpen((prev) => !prev)}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 toggle h-6.25 w-6.25 bg-[#242424] rounded-full transition-all ${
              keepOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
