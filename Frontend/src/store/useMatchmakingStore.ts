import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface MatchmakingState {
  inQueue: boolean;
  queuePlayers: string[];
  currentQueueLength: number;
  startMatchmaking: () => void;
  leaveQueue: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set, get) => ({
  inQueue: false,
  queuePlayers: [],
  currentQueueLength: 0,

  startMatchmaking: () => {
    const { socket, authUser, userData } = useAuthStore.getState();
    if (!socket || !authUser || !userData) return;

    if (get().inQueue) return;

    socket.emit("joinQueue", {
      userId: authUser._id,
      username: authUser.username,
      rank: userData.rank,
    });

    set({ inQueue: true });

    // Listen for queue updates
    socket.on("queueUpdate", (players: string[]) => {
      set({ queuePlayers: players });
      set({ currentQueueLength: players.length });
    });

    socket.on("gameFound", ({ room_id, players }) => {
      console.log("Game found!", room_id, players);
      // redirect user to /game/roomId
      window.location.href = `/game/${room_id}`;
    });


    socket.on("queueError", (data: { message: string }) => {
      console.error(data.message);
      set({ inQueue: false, queuePlayers: [], currentQueueLength: 0 });
    });
  },

  leaveQueue: () => {
    const { socket, authUser, userData } = useAuthStore.getState();
    if (!socket || !authUser || !userData) return;

    socket.emit("leaveQueue", {
      userId: authUser._id,
      rank: userData.rank,
    });

    set({ inQueue: false, queuePlayers: [], currentQueueLength: 0 });
  },
}));
