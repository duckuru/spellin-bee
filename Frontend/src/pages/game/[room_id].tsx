import { faChevronLeft, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface Player {
  userId: string;
  username: string;
  score?: number;
  isActive: boolean;
}

function GamePage() {
  const { authUser, socket } = useAuthStore();
  const { room_id } = useParams<{ room_id: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(
    null
  );
  const [turnWord, setTurnWord] = useState<{
    word: string;
    definition: string;
    audio: string;
  } | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(0);
  const [preTurnCountdown, setPreTurnCountdown] = useState<number | null>(null);

  const [lastAnswerResult, setLastAnswerResult] = useState<
    "correct" | "wrong" | null
  >(null);
  const [liveInput, setLiveInput] = useState<string>("");
  const [myInput, setMyInput] = useState("");
  const [othersTyping, setOthersTyping] = useState<Record<string, string>>({});



  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- Leave Room ---
  const handleLeaveRoom = () => {
    if (!socket || !authUser) return;
    socket.once("youLeftRoom", ({ message }: any) => toast.success(message));
    socket.emit("leaveRoom", { room_id, userId: authUser._id });
    navigate("/");
  };

  // --- Speech ---
  const speakWord = (word: string) => {
    if (!word) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(`Can you spell ${word}`);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  // --- Socket handlers ---
  useEffect(() => {
    if (!socket || !authUser || !room_id) return;

    const handleRoomUpdate = (updatedPlayers: Player[]) =>
      setPlayers(updatedPlayers);

    const handleRoomState = (state: any) => {
      setCurrentTurnPlayerId(state.currentTurnPlayerId);
      setTurnTimeLeft(state.turnTimeLeft);
      setCurrentRound(state.currentRound);

      if (state.scores) {
        setPlayers((prev) =>
          Object.keys(state.scores).map((id) => {
            const prevP = prev.find((p) => p.userId === id);
            return {
              userId: id,
              username: prevP?.username || `Player-${id.slice(0, 4)}`,
              isActive: prevP?.isActive ?? true,
              score: state.scores[id] ?? 0,
            };
          })
        );
      }
      if (state.currentTurnWord) setTurnWord(state.currentTurnWord); // restore word, definition, audio
    };

    const handleTurnStart = ({
      playerId,
      word,
      currentRound,
      turnTimeLeft,
    }: any) => {
      setCurrentTurnPlayerId(playerId);
      setTurnWord(word || null);
      setCurrentRound(currentRound ?? 1);
      setTurnTimeLeft(turnTimeLeft ?? 20);
      setPreTurnCountdown(null);

      if (word?.word) speakWord(word.word);
    };

    const handleTurnTimeUpdate = ({ playerId, timeLeft }: any) => {
      if (playerId === currentTurnPlayerId) setTurnTimeLeft(timeLeft);
    };

    const handleTurnEnded = () => {
      setCurrentTurnPlayerId(null);
      setTurnWord(null);
      setTurnTimeLeft(0);
      setMyInput("");
    };

    const handleScoreUpdate = (scores: Record<string, number>) => {
      setPlayers((prev) =>
        prev.map((p) => ({ ...p, score: scores[p.userId] ?? p.score }))
      );
    };

    const handleAnswerResult = ({ userId, isCorrect }: any) => {
      if (userId === authUser?._id) {
        toast(isCorrect ? "✅ Correct!" : "❌ Wrong!");
        setLastAnswerResult(isCorrect ? "correct" : "wrong");

        // Reset background color after 1.5 seconds
        setTimeout(() => setLastAnswerResult(null), 1500);
      }
    };


    const handlePlayerLeftRoom = ({ userId, message }: any) => {
      toast(message);
      setPlayers((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, isActive: false } : p))
      );
      // If the leaving player was the current turn player
      if (userId === currentTurnPlayerId) {
        setCurrentTurnPlayerId(null);
        setTurnWord(null);
        setTurnTimeLeft(0);
        setMyInput("");
      }
    };

    const handleRoomFinished = ({ message, scores }: any) => {
      toast.success(message);
      navigate(`/results/${room_id}`, { state: { scores } });
    };

    const handlePreTurn = ({ countdown }: { countdown: number }) => {
      if (countdown != null) setPreTurnCountdown(countdown);
    };

    const handleRoomFinishedAlready = ({ message }: any) => {
      toast.error(message);
      navigate("/");
    };
    const handleRoomError = ({ message }: any) => {
      toast.error(message);
      navigate("/");
    };

    // --- Socket Listeners ---
    socket.on("roomUpdate", handleRoomUpdate);
    socket.on("roomState", handleRoomState);
    socket.on("turnStart", handleTurnStart);
    socket.on("turnTimeUpdate", handleTurnTimeUpdate);
    socket.on("turnEnded", handleTurnEnded);
    socket.on("scoreUpdate", handleScoreUpdate);
    socket.on("answerResult", handleAnswerResult);
    socket.on("playerLeftRoom", handlePlayerLeftRoom);
    socket.on("roomFinished", handleRoomFinished);
    socket.on("preTurn", handlePreTurn);
    socket.on("roomFinishedAlready", handleRoomFinishedAlready);
    socket.on("roomError", handleRoomError);

    // --- Join Room ---
    socket.emit("joinRoom", {
      room_id,
      userId: authUser._id,
      username: authUser.username,
    });
    socket.emit("getRoomState", { room_id });

    return () => {
      socket.off("roomUpdate", handleRoomUpdate);
      socket.off("roomState", handleRoomState);
      socket.off("turnStart", handleTurnStart);
      socket.off("turnTimeUpdate", handleTurnTimeUpdate);
      socket.off("turnEnded", handleTurnEnded);
      socket.off("scoreUpdate", handleScoreUpdate);
      socket.off("answerResult", handleAnswerResult);
      socket.off("playerLeftRoom", handlePlayerLeftRoom);
      socket.off("roomFinished", handleRoomFinished);
      socket.off("preTurn", handlePreTurn);
      socket.off("roomFinishedAlready", handleRoomFinishedAlready);
      socket.off("roomError", handleRoomError);
    };
  }, [socket, authUser, room_id, navigate, currentTurnPlayerId]);

  // --- Pre-turn countdown ---
  useEffect(() => {
    if (preTurnCountdown === null) return;

    let current = preTurnCountdown;
    setTurnTimeLeft(0);

    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        setPreTurnCountdown(null);
        socket?.emit("startTurn", { room_id });
      } else {
        setPreTurnCountdown(current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [preTurnCountdown, room_id, socket]);

  const sortedPlayers = [...players].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );

  const handleSubmitAnswer = () => {
    if (!socket || !authUser || !room_id || !turnWord) return;
    if (authUser._id !== currentTurnPlayerId) return;

    const answerInput = (inputRef.current?.value || "").trim();
    if (!answerInput) return;

    socket.emit("submitAnswer", {
      room_id,
      userId: authUser._id,
      answer: answerInput,
      word: turnWord.word,
    });

    if (inputRef.current) inputRef.current.value = "";
    setMyInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMyInput(value);

    if (isCurrentUserTurn) {
      socket?.emit("typing", {
        room_id,
        userId: authUser._id,
        text: value,
      });
    }
  };


  useEffect(() => {
    const handleTyping = ({ userId, text }: any) => {
      if (userId !== authUser?._id) {
        setOthersTyping((prev) => ({ ...prev, [userId]: text }));
      }
    };

    socket?.on("typing", handleTyping);

    return () => {
      socket?.off("typing", handleTyping);
    };
  }, [socket, authUser]);


  const isCurrentUserTurn = authUser?._id === currentTurnPlayerId;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 pt-12 text-[#3f3f3f] z-50">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-[85rem]">
        <button
          onClick={handleLeaveRoom}
          className="bg-[#f3f3f3] border-2 border-[#795A3E] hover:bg-[#FDDB5B] py-4 px-3 rounded-lg"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-4xl" />
        </button>
        <div className="flex justify-center w-full">
          <div className="flex justify-between items-center bg-[#f3f3f3] py-3 px-6 border-2 border-[#795A3E] rounded-lg w-full">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faClock} className="text-5xl" />
              <h1 className="text-5xl quicksand-semi">
                {preTurnCountdown !== null
                  ? `Starting in ${preTurnCountdown}s`
                  : `${turnTimeLeft}s`}
              </h1>
            </div>
            <h1 className="text-5xl quicksand-semi">
              Round {currentRound} of 3
            </h1>
          </div>
        </div>
      </div>

      {/* Player Cards + Game Area */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-start pl-22">
        {/* Player List */}
        <div className="flex flex-col gap-2 w-[20rem]">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => {
              const isCurrentUser = player.userId === authUser?._id;
              const isActiveTurn = player.userId === currentTurnPlayerId;
              return (
                <motion.div
                  key={player.userId}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-center justify-between p-2 border-2 rounded-xl w-[20rem] h-[4.375rem]
                    ${
                      isActiveTurn
                        ? "bg-[#fddc5f] border-[#f5af36]"
                        : "bg-[#f3f3f3] border-[#795A3E]"
                    }`}
                >
                  <div className="flex flex-col items-center w-16">
                    {index === 0 && (
                      <span className="text-yellow-400 text-xl">👑</span>
                    )}
                    <span className="text-xl sour-gummy-semi-bold">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 text-center">
                    <span
                      className={`text-xl sour-gummy ${
                        isCurrentUser ? "text-blue-500 font-bold" : ""
                      } ${!player?.isActive ? "opacity-50 line-through" : ""}`}
                    >
                      {player.username || "Waiting..."}
                    </span>
                    {isActiveTurn && (
                      <div className="text-sm mt-1">Taking turn</div>
                    )}
                  </div>

                  <div className="w-20 text-right">
                    <span className="text-xl sour-gummy">
                      {player.score ?? 0} pts
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Game Area */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`h-[30rem] w-[58rem] border-2 border-[#795A3E] p-4 rounded-xl flex flex-col items-center justify-center
    ${
      lastAnswerResult === "correct"
        ? "bg-green-400"
        : lastAnswerResult === "wrong"
        ? "bg-red-400"
        : "bg-[#fddb6b]"
    }`}
          >

            {turnWord && currentTurnPlayerId ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-6xl font-extrabold">
                  {isCurrentUserTurn
                    ? myInput
                    : Object.values(othersTyping)[0]}
                </h2>
                {turnWord.definition && (
                  <p className="text-2xl max-w-[40rem]">
                    {turnWord.definition}
                  </p>
                )}
                {turnWord && (
                  <button
                    className="mt-2 bg-[#F5AF36] text-[#f3f3f3] px-4 py-2 rounded-lg font-bold hover:bg-[#E49B1B]"
                    onClick={() => speakWord(turnWord.word)}
                  >
                    🔊
                  </button>
                )}
                {/* <h3 className="text-3xl">Time Left: {turnTimeLeft}s</h3>
                <h3 className="text-2xl">
                  Current Turn:{" "}
                  {players.find((p) => p.userId === currentTurnPlayerId)
                    ?.username || "Unknown"}
                </h3> */}
              </div>
            ) : (
              <h1 className="text-3xl quicksand-bold">
                Waiting for next turn...
              </h1>
            )}
          </div>

          {/* Answer Input + Submit */}
          <div className="flex gap-4 w-full max-w-5xl">
            <input
              ref={inputRef}
              type="text"
              className={`flex-1 border-2 border-[#795a3e] rounded-lg h-14 px-4 text-2xl font-bold bg-[#f3f3f3] ${
                !isCurrentUserTurn ? "cursor-not-allowed" : ""
              }`}
              placeholder="Input the Answer"
              disabled={!isCurrentUserTurn}
              value={myInput}
              onChange={handleInputChange}
            />
            <button
              className={`bg-[#F5AF36] text-[#f3f3f3] rounded-lg h-14 w-40 text-2xl font-bold border-2 border-[#795A3E] ${
                !isCurrentUserTurn
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#E49B1B]"
              }`}
              onClick={handleSubmitAnswer}
              disabled={!isCurrentUserTurn}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
