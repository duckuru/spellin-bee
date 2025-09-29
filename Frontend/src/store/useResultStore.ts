// store/useResultStore.ts
import { create } from "zustand";
import axios from "axios";

interface Player {
  userId: string;
  name: string;
  score: number;
  rank: number;
}

interface ResultState {
  players: Player[];
  loading: boolean;
  fetchResult: (room_id: string) => Promise<void>;
}

export const useResultStore = create<ResultState>((set) => ({
  players: [],
  loading: true,
  fetchResult: async (room_id: string) => {
    set({ loading: true });
    try {
      const res = await axios.get(`http://localhost:3000/api/match-history/${room_id}`);
      const matchPlayers = res.data?.players || [];

      const mappedPlayers = matchPlayers.map((p: any, idx: number) => ({
        userId: p.userId,
        name: p.username,
        score: p.score,
        rank: idx + 1, // keep order from backend
      }));

      set({ players: mappedPlayers });
    } catch (err) {
      console.error("Failed to fetch match data:", err);
      set({ players: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
