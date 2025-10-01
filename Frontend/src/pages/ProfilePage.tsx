import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import ProfileComponent from "../components/navigations/ProfileComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import PageLoader from "../components/PageLoader";

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
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader()
  reader.readAsDataURL(file);

  reader.onloadend = async () => {
    const base64Image = reader.result as string; 
    setSelectedImage(base64Image)
    await updateProfile({profilePic:base64Image});
  }
};

  useEffect(() => {
    if (view === "matches") fetchMyMatches();
    if (view === "history") fetchMyHistory();
  }, [view, fetchMyMatches, fetchMyHistory]);

  const handleBack = () => {
    navigate("/main");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-12 text-[#3f3f3f] overflow-hidden">
      <div className="flex justify-end absolute z-60 right-20 top-[4.6rem] items-center gap-2">
        <ProfileComponent />
      </div>
      <div className="relative w-[70rem] bg-[#FDDB5B] rounded-xl border-2 border-[#795A3E] h-[40rem] p-6 overflow-y-auto">
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
        <div className="w-16 h-16 rounded-full avatar-online group">
          <button
            className="w-full h-full rounded-full overflow-hidden"
            onClick={() => fileInput.current?.click()}
          >
            <img
              src={selectedImage || authUser.profilePic || "/Caught.png"}
              alt="avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
              <span className="text-[#f3f3f3] text-xs">Change</span>
            </div>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <h2 className="text-3xl quicksand-bold text-[#3f3f3f]">
          {authUser.username}
        </h2>
        <p className="text-xl text-[#3f3f3f]">{authUser.email}</p>
      </div>
    </div>

    {/* Rank & MMR */}
    <div className="flex flex-col gap-4">
        <span className="text-[#3f3f3f] text-2xl">Rank: {userData?.rank}</span>
        <span className="text-[#3f3f3f] text-2xl">MMR: {userData?.mmr}</span>
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
