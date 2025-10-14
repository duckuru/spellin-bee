import { useEffect, useRef, useState } from "react";
// import ProfileComponent from "../components/navigations/ProfileComponent";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";

interface LeaderboardUser {
  userId: string;
  username: string;
  profilePic?: string;
  mmr: number;
  rank: string;
}

function Leaderboard() {
  const { authUser, onlineUsers } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const authUserRef = useRef<HTMLTableRowElement | null>(null);
  const navigate = useNavigate();

  const updatePinnedState = () => {
    if (!authUserRef.current || !scrollRef.current) return;
    const userTop = authUserRef.current.offsetTop;
    const scrollTop = scrollRef.current.scrollTop;
    const containerHeight = scrollRef.current.clientHeight;
    setIsPinned(userTop > scrollTop + containerHeight || userTop < scrollTop);
  };

  useEffect(() => {
    axiosInstance
      .get("/leaderboard")
      .then((res) => {
        setLeaderboard(res.data.allUsers ?? []);
        setTimeout(() => updatePinnedState(), 50);
      })
      .catch((err) => console.error("Leaderboard fetch error:", err));
  }, []);

  const handleLeaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="relative overflow-hidden">
      {/* <div className="absolute z-60 right-20 top-[4.6rem] gap-2">
        <ProfileComponent />
      </div> */}

      <div className="flex items-center justify-center px-8 lg:p-0">
        <div className="flex w-full lg:max-w-[70%] h-[70vh] bg-[#FDDB5B] border-[#795A3E] border-2 rounded-2xl">
          <div className="flex flex-col w-full h-full rounded text-[#795A3E] p-8">
            <div className="relative">
              <button
                onClick={handleLeaveRoom}
                className="absolute cursor-pointer  lg:py-3 lg:px-2 rounded-lg"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-2xl lg:text-4xl" />
                <span className="text-2xl lg:text-4xl items-center">Back</span>
              </button>
            </div>
            <h1 className=" text-4xl lg:text-6xl sour-gummy-bold mb-4 text-center">
              Leaderboard
            </h1>

            {/* Header */}
            <div className="overflow-hidden border-b-2 border-[#795A3E]">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-[#FDDB5B] sticky top-0 z-10">
                  <tr className="text-[1.5rem] lg:text-[2.5rem] sour-gummy-bold">
                    <th className="w-[15%] px-6 text-left">No</th>
                    <th className="w-[35%] px-6 text-left">Username</th>
                    <th className="w-[25%] px-6 pr-10 text-center">Rank</th>
                    <th className="w-[25%] px-6 pr-10 text-center">MMR</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable body */}
            <div
              className="flex-1 overflow-y-auto max-h-[26rem] mt-2 lg:mt-2"
              ref={scrollRef}
              onScroll={updatePinnedState}
            >
              <table className="w-full table-fixed border-collapse">
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <tr
                      key={user.userId}
                      ref={user.userId === authUser?._id ? authUserRef : null}
                      className={`text-[1.5rem] lg:text-[2.5rem] sour-gummy-semi ${
                        user.userId === authUser?._id ? "text-[#2E74F5]" : ""
                      }`}
                    >
                      <td className="w-[15%] px-6 py-4 lg:py-1 text-left">{idx + 1}</td>
                      <td className="w-[35%] px-6 text-left">
                        <div className="flex items-center gap-4">
                          <div className="avatar relative">
                            <div
                              className={`w-12 h-12 rounded-full overflow-hidden ${
                                onlineUsers.includes(user.userId)
                                  ? "avatar-online"
                                  : "avatar-offline"
                              }`}
                            >
                              <img
                                src={user.profilePic || "/Caught.png"}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <span>
                            {user.username.length > 8
                              ? user.username.slice(0, 8) + "…"
                              : user.username}
                            {user.userId === authUser?._id ? "" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="w-[25%] px-6 text-center">{user.rank}</td>
                      <td className="w-[25%] px-6 text-center">{user.mmr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pinned row */}
            {authUser && isPinned && (
              <div className="flex justify-between px-6 text-[#2E74F5] sticky bottom-0 text-[1.5rem] lg:text-[2.5rem] sour-gummy-semi bg-[#FDDB5B] border-t-2 border-[#795A3E]">
                <span className="w-[15%] text-left">
                  {leaderboard.findIndex((u) => u.userId === authUser._id) + 1}
                </span>
                <span className="w-[35%] flex items-center gap-4">
                  <div className="avatar relative">
                    <div
                      className={`w-12 h-12 rounded-full overflow-hidden ${
                        onlineUsers.includes(authUser._id)
                          ? "avatar-online"
                          : "avatar-offline"
                      }`}
                    >
                      <img
                        src={authUser.profilePic || "/Caught.png"}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {authUser.username.length > 8
                    ? authUser.username.slice(0, 8) + "…"
                    : authUser.username}
                </span>
                <span className="w-[25%] text-center">
                  {leaderboard.find((u) => u.userId === authUser._id)?.rank ||
                    "-"}
                </span>
                <span className="w-[25%] text-center">
                  {leaderboard.find((u) => u.userId === authUser._id)?.mmr ||
                    "-"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
