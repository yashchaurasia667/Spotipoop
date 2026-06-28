import { Link } from "react-router-dom";

const Help = () => {
  const heading = "font-bold text-4xl mb-4 text-purple-500";
  const subheading = "font-bold text-2xl mb-2 text-purple-200";
  const link = "text-purple-500 font-semibold";

  return (
    <div className="px-4 py-8">
      <ul>
        <li>
          <h1 className={heading}>How to use the app?</h1>
          <p>
            You do not need to log in! Simply navigate to the{" "}
            <Link to={"/"} className={link}>
              Search
            </Link>{" "}
            page, choose if you want to
            download a playlist, album, or a song, and search. Click on the download button to save the audio to your device.
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Help;
