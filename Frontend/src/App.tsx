import { Navigate, Route, Routes, useNavigate } from 'react-router'
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import GuestPage from './pages/GuestPage';
import HexagonBackground from './components/background/Hexagon';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from './store/useAuthStore';
import PageLoader from './components/PageLoader';
import { Toaster } from 'react-hot-toast';
import CreateLobbyPage from './pages/CreateLobbyPage';
import GamePage from './pages/game/[room_id]';
import ResultPage from './pages/ResultPage';


function App() {
  const colors = useMemo(() => ["#795a3e", "#fddb59", "#ffc105", "#f3f3f3", "#3f3f3f",], []);

  const {checkAuth, isCheckingAuth, authUser , onlineUsers} = useAuthStore();

  useEffect(() => {
    checkAuth()
  },[checkAuth])

  console.log({authUser})
  console.log({onlineUsers})

  if(isCheckingAuth) return <PageLoader/>

  return (
    <div className="min-h-screen overflow-hidden flex flex-col bg-gradient-to-b from-[#ffe397] to-[#f3f3f3] quicksand-bold">
      <HexagonBackground colorsProp={colors} />
      <div className="absolute top-[2rem] w-full flex items-center justify-between px-[3rem] sm:px-6 md:px-12 z-20">
        <div className="flex items-center justify-center flex-1 gap-4">
          <img src="/logoSB.png" alt="Spelling Bee" className="w-32 h-32" />
          <h1 className="text-[6.5rem] text-[#FFC105] sour-gummy-bold">
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
          path="/create-lobby"
          element={authUser ? <CreateLobbyPage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/game/:room_id"
          element={authUser ? <GamePage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/result"
          element={authUser ? <ResultPage /> : <Navigate to={"/login"} />}
        ></Route>
      </Routes>

      <Toaster />
    </div>
  );
}

export default App