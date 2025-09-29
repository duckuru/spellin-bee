import { create } from "zustand";
import axios from "axios";

export interface Player {
  _id: string;
  username: string;
  score: number;
  rank?: number;
  mmrChange?: number;
}

export interface PlayerHistoryItem {
  _id: string;
  username: string;
  points: number;
  mmrChange: number;
  rank: string;
  createdAt: string;
}

interface ResultStore {
  players: Player[];
  loadingPlayers: boolean;
  playerHistory: PlayerHistoryItem[];
  loadingHistory: boolean;

  fetchResult: (room_id: string) => Promise<void>;
  fetchPlayerHistory: (room_id: string) => Promise<void>;
}

export const useResultStore = create<ResultStore>((set) => ({
  players: [],
  loadingPlayers: false,
  playerHistory: [],
  loadingHistory: false,

  fetchResult: async (room_id) => {
    set({ loadingPlayers: true });
    try {
      const res = await axios.get(
        `http://localhost:3000/api/match-history/${room_id}`,
        { withCredentials: true }
      );
      const matchPlayers: Player[] = res.data?.players || [];
      const sorted = matchPlayers
        .sort((a, b) => b.score - a.score)
        .map((p, idx) => ({ ...p, rank: idx + 1 }));
      set({ players: sorted });
    } catch (err) {
      console.error("❌ Failed to fetch match result:", err);
      set({ players: [] });
    } finally {
      set({ loadingPlayers: false });
    }
  },

fetchPlayerHistory: async (room_id: string) => {
  set({ loadingHistory: true });
  try {
    console.log("Calling fetchPlayerHistory for room:", room_id);
    const res = await axios.get(
      `http://localhost:3000/api/player-history/${room_id}`,
      { withCredentials: true }
    );
    const data = Array.isArray(res.data) ? res.data : [];
    console.log("Received player history data:", data); // <-- log the data
    set({ playerHistory: data });
  } catch (err) {
    console.error("❌ fetchPlayerHistory error:", err);
    set({ playerHistory: [] });
  } finally {
    set({ loadingHistory: false });
  }
},

}));
