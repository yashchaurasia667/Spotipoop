import { useState } from "react";
import { toast } from "react-toastify";

const Login = () => {
  const inputClass =
    "mb-2 mx-auto bg-[#242424] w-[100%] px-8 py-3 rounded-full outline-none border-2 border-[#acacac] hover:border-white focus:border-white focus:border-[3px] transition-all";
  const buttonClass =
    "mt-2 mx-auto bg-purple-400 text-[#121212] font-bold w-[100%] px-8 py-3 rounded-full transition-all hover:scale-105 hover:bg-purple-300";

  const [id, setId] = useState<string>("");
  const [secret, setSecret] = useState<string>("");

  const toastStyle = {
    backgroundColor: "#232323",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (id != "" && secret != "")
      try {
        localStorage.setItem("credentials", JSON.stringify({ id, secret }));
        toast.success("Credentials set");
        console.log("Credentials set", { style: toastStyle });
      } catch (error) {
        console.error(`Something went wrong while logging in: ${error}`);
        toast.error("Failed to set Credentials", { style: toastStyle });
      }
  };

  return (
    <div className="w-full min-h-full flex flex-col justify-center">
      <p className="font-bold text-3xl mx-auto mb-10">Log In</p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col mx-auto w-[90%] md:w-[40%] xl:w-[25%]"
      >
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="CLIENT ID"
          className={inputClass}
        />
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="CLIENT SECRET"
          className={inputClass}
        />
        <button type="submit" className={buttonClass}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
