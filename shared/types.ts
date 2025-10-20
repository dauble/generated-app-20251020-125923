export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// ApexDraft specific types
export interface Driver {
  id: number; // driver_number
  name: string; // full_name
  teamName: string;
  teamColour: string;
  number: number; // driver_number
  headshotUrl: string;
  countryCode: string;
  points: number | null;
  price: number;
}
export interface Constructor {
  id: number; // team_number
  name: string;
  price: number;
  teamColour: string;
  logoUrl: string | null;
}
export interface DriverStats {
  driverNumber: number;
  position: number | null;
  points: number | null;
  fastestLapRank: number | null;
  fastestLapTime: string | null;
  lapsCompleted: number | null;
}