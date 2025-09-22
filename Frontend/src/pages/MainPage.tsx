import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserIcon, LogOutIcon } from "lucide-react";
import MainContent from "../components/content/MainContent";

function MainPage() {
  const { authUser, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!authUser) return null;

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Top-right dropdown */}
      <div className="flex justify-end absolute z-50 right-20 top-[4.6rem] items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-colors text-3xl font-bold quicksand-bold bg-transparent text-[#3f3f3f] shadow-none ${
              dropdownOpen
                ? "bg-[#ffe08d] border-[#795a3e]"
                : "border-[#795a3e] hover:bg-[#ffe08d]"
            }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{authUser.username}</span>
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src={
                  authUser.profilePic ||
                  "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                }
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-transparent border-2 border-[#795a3e] rounded-xl shadow-lg overflow-hidden z-50">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-[#3f3f3f] text-xl font-bold hover:bg-[#ffe08d] rounded-xl transition-colors"
                onClick={() => alert("Go to profile")}
              >
                <UserIcon className="w-5 h-5" />
                Profile
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-[#3f3f3f] text-xl font-bold hover:bg-[#ffe08d] rounded-xl transition-colors"
                onClick={logout}
              >
                <LogOutIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MainContent centered */}
      <div className="w-full min-h-screen flex items-center justify-center z-50 top-[30rem]">
        <MainContent />
      </div>
    </div>
  );
}

export default MainPage;
