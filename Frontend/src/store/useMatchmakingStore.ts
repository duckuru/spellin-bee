import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

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

    socket.on("gameFound", ({ room_id }) => {
      let countdown = 5;
      const toastId = toast.loading(`Game found! Starting in ${countdown}s...`);

      const interval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
          toast.loading(`Game found! Starting in ${countdown}s...`, {
            id: toastId,
          });
        } else {
          clearInterval(interval);
          toast.success("Game starting now!", { id: toastId });
          window.location.href = `/game/${room_id}`;
        }
      }, 1000);
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
