import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
// import ProfileComponent from "../components/navigations/ProfileComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import PageLoader from "../components/PageLoader";
import toast from "react-hot-toast";

const predefinedImages = [
  "/images/cataware.png",
  "/images/catpointing.png",
  "/images/cookeddog.png",
  "/images/copium.png",
  "/images/damn.png",
  "/images/dogpointing.png",
  "/images/fatfk.png",
  "/images/gigachad.png",
  "/images/kekw.png",
  "/images/xdd.png",
];

function ProfilePage() {
  const {
    myMatches,
    fetchMyMatches,
    isLoadingMatches,
    myHistory,
    fetchMyHistory,
    isLoadingHistory,
    authUser,
    userData,
    updateProfile,
    isUpdatingProfileImage
  } = useAuthStore();
  const navigate = useNavigate();

  const [view, setView] = useState<"matches" | "history" | "profile">(
    "profile"
  );
  const myAuthUserId = authUser?._id;
  // const fileInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarPopupOpen, setAvatarPopupOpen] = useState(false);


  const handleSelectImage = async (img: string) => {
    setSelectedImage(img);
    await updateProfile({ profilePic: img });
    setAvatarPopupOpen(false);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload only PNG or JPG images.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
      setAvatarPopupOpen(false);
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    if (view === "matches"){
      fetchMyMatches();
      setAvatarPopupOpen(false);
    }else if (view === "history"){
      fetchMyHistory()
      setAvatarPopupOpen(false);
    };
  }, [view, fetchMyMatches, fetchMyHistory]);

  const handleBack = () => {
    navigate("/main");
  };
  const handleGoBuy = () => {
    navigate("/ads-package");
  }
  const handleGoSupport = () => {
    navigate("/support");
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 text-[#3f3f3f] overflow-hidden">
      {/* <div className="flex justify-end absolute z-60 right-20 top-[4.6rem] items-center gap-2">
        <ProfileComponent />
      </div> */}
      <div className="relative w-[50rem] lg:w-[70rem] bg-[#FDDB5B] rounded-xl border-2 border-[#795A3E] h-[40rem] p-6 overflow-y-auto">
        <div className="flex gap-4 mb-4 text-[2rem] text-[#3f3f3f] sour-gummy">
          <button
            onClick={handleBack}
            className="bg-[#f3f3f3] border-2 border-[#795A3E] hover:bg-[#FDDB5B] py-3 px-3 rounded-xl items-center flex"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-4xl" />
          </button>
          <button
            onClick={() => setView("profile")}
            className={`px-4 py-2 rounded-xl ${
              view === "profile" ? "bg-[#795A3E] text-[#f3f3f3]" : "bg-gray-200"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setView("matches")}
            className={`px-4 py-2 rounded-xl ${
              view === "matches" ? "bg-[#795A3E] text-[#f3f3f3]" : "bg-gray-200"
            }`}
          >
            Match History
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-xl ${
              view === "history" ? "bg-[#795A3E] text-[#f3f3f3]" : "bg-gray-200"
            }`}
          >
            Player History
          </button>
        </div>

        {view === "profile" && authUser && (
          <>
            <h1 className="text-2xl quicksand-bold mb-2">My Profile</h1>

            <div className="flex flex-col items-start gap-6 py-6 relative">
              {/* Show loader overlay if updating */}
              {isUpdatingProfileImage && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded">
                  <PageLoader />
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex flex-row items-center gap-4">
                <div className="avatar relative">
                  <div className="w-16 h-16 rounded-full avatar-online group ">
                    <button
                      className="w-full h-full rounded-full overflow-hidden"
                      onClick={() => setAvatarPopupOpen(true)}
                    >
                      <img
                        src={
                          selectedImage || authUser.profilePic || "/Caught.png"
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                        <span className="text-[#f3f3f3] text-xs">Change</span>
                      </div>
                    </button>
                  </div>
                </div>

                {avatarPopupOpen && (
                  <div className="absolute top-full mt-2 w-72 bg-white border-2 border-[#795A3E] rounded-xl shadow-lg p-4 grid grid-cols-5 gap-2 z-50">
                    {predefinedImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`avatar-${idx}`}
                        className="w-12 h-12 object-cover rounded-full cursor-pointer hover:ring-2 hover:ring-[#795A3E]"
                        onClick={() => handleSelectImage(img)}
                      />
                    ))}
                    <label className="col-span-5 mt-2 cursor-pointer px-2 py-1 bg-[#FDDB5B] rounded-lg text-center hover:bg-[#F0C419]">
                      Upload Your Own
                      <input
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        className="hidden"
                        onChange={handleUploadImage}
                      />
                    </label>
                  </div>
                )}

                <div className="flex flex-col">
                  <h2 className="text-3xl quicksand-bold text-[#3f3f3f]">
                    {authUser.username}
                  </h2>
                  <p className="text-xl text-[#3f3f3f]">{authUser.email}</p>
                </div>
              </div>

              {/* Rank & MMR */}
              <div className="flex flex-col gap-4">
                <span className="text-[#3f3f3f] text-2xl">
                  Rank: {userData?.rank}
                </span>
                <span className="text-[#3f3f3f] text-2xl">
                  MMR: {userData?.mmr}
                </span>
              </div>
              <div className="flex flex-row gap-4">
              <button className="border-2 rounded-xl p-4 hover:bg-[#ffe08d]" onClick={handleGoBuy}>Ads Free Pakage: $2.99</button>
              <button className="border-2 rounded-xl p-4 hover:bg-[#ffe08d]" onClick={handleGoSupport}>Support the Creator</button>
              </div>
            </div>
          </>
        )}

        {view === "matches" && (
          <>
            <h1 className="text-2xl quicksand-bold mb-2">My Matches</h1>
            {isLoadingMatches && <PageLoader />}
            {!isLoadingMatches && myMatches.length === 0 && (
              <p>No matches found.</p>
            )}

            {myMatches.map((match) => (
              <div
                key={match._id}
                className="border p-4 my-4 rounded bg-[#f3f3f3] shadow"
              >
                <h2 className="quicksand-bold text-lg mb-1">
                  Room: {match.room_id}
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  Date: {new Date(match.createdAt).toLocaleString()}
                </p>

                <div className="grid grid-cols-4 quicksand-bold border-b pb-1 mb-2">
                  <span>Username</span>
                  <span>Score</span>
                  <span>Rank</span>
                  <span>MMR Change</span>
                </div>

                {match.players.map((p) => {
                  const isAuthUser = p.userId === myAuthUserId; // replace `myAuthUserId` with your actual auth user ID from store
                  return (
                    <div
                      key={p.userId}
                      className="grid grid-cols-4 border-b quicksand-bold last:border-b-0 py-1"
                    >
                      <span className={isAuthUser ? "text-[#2E74F5]" : ""}>
                        {p.username}
                      </span>
                      <span>{p.score}</span>
                      <span>{p.rank}</span>
                      <span
                        className={
                          p.mmrChange >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {p.mmrChange > 0 ? "+" : ""}
                        {p.mmrChange}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {view === "history" && (
          <>
            <h1 className="text-2xl quicksand-bold mb-2">My Player History</h1>
            {isLoadingHistory && <PageLoader />}
            {!isLoadingHistory && myHistory.length === 0 && (
              <p>No player history found.</p>
            )}
            {myHistory.map((h) => (
              <div
                key={h._id}
                className="border p-2 my-2 quicksand-bold rounded bg-white"
              >
                <h2>Room: {h.room_id}</h2>
                <p>Score: {h.points} pts</p>
                <p>
                  {" "}
                  MMR gained: ({h.mmrChange > 0 ? "+" : ""}
                  {h.mmrChange})
                </p>
                <p>Rank: {h.rank}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
