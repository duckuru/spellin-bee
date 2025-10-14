import { Navigate, Route, Routes} from 'react-router'
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import GuestPage from './pages/GuestPage';
import HexagonBackground from './components/background/Hexagon';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from './store/useAuthStore';
import PageLoader from './components/PageLoader';
import { Toaster } from 'react-hot-toast';
import GamePage from './pages/game/[room_id]';
import ResultPage from './pages/result/[result_id]';
import ProfilePage from './pages/ProfilePage';
import LobbyPage from './pages/CreateLobbyPage';
import Leaderboard from './pages/Leaderboard';
import Ads from './components/ads/Ads';
import AdsPackage from './pages/AdsPackage';
import Support from './pages/Support';
import AdBanner from './components/ads/AdsSense';


function App() {
  const colors = useMemo(() => ["#795a3e", "#fddb59", "#ffc105", "#f3f3f3", "#3f3f3f",], []);

  const {checkAuth, isCheckingAuth, authUser} = useAuthStore();

  useEffect(() => {
    checkAuth()
  },[checkAuth])


  // console.log({authUser})
  // console.log({onlineUsers})

  if(isCheckingAuth) return <PageLoader/>

  return (
    <div className="min-h-screen overflow-hidden flex flex-col bg-gradient-to-b from-[#ffe397] to-[#f3f3f3] quicksand-bold">
      <HexagonBackground colorsProp={colors} />
      <div className="absolute top-[2rem] w-full flex items-center justify-center px-[3rem] z-20">
        <div className="flex items-center  gap-4">
          <img
            src="/logoSB4.png"
            alt="Spelling Bee"
            className="w-[clamp(4rem,6.8vw,12rem)] h-[clamp(4rem,6.8vw,12rem)]"
          />
          <h1 className="text-[clamp(3rem,6vw,6.5rem)] text-[#FFC105] sour-gummy-bold">
            <span className="text-[#FFC105]">SPELLIN</span>
            <span className="text-[#795a3e]">-BEE</span>
          </h1>
        </div>
      </div>

      <Routes>
        <Route
          path="/"
          element={!authUser ? <GuestPage /> : <Navigate to={"/main"} />}
        ></Route>
        <Route
          path="/main"
          element={authUser ? <MainPage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/main"} />}
        ></Route>
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to={"/main"} />}
        ></Route>
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/leaderboard"
          element={authUser ? <Leaderboard /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/lobby/:room_id?"
          element={authUser ? <LobbyPage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/game/:room_id"
          element={authUser ? <GamePage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/results/:room_id"
          element={authUser ? <ResultPage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/ads-package"
          element={authUser ? <AdsPackage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/support"
          element={authUser ? <Support /> : <Navigate to={"/login"} />}
        ></Route>
      </Routes>

      <Toaster />
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 bg-[#3f3f3f]">
      <AdBanner/>
        <Ads />
      </div>
    </div>
  );
}

export default App