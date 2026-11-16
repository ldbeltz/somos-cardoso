export type Player = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: "USER" | "ADMIN";
};
export type Santa = {
  id: number;
  name: string;
  drawAt: string;
  status: "SCHEDULED" | "DRAWN" | "NOT_DRAWN";
  creatorId: string;
  playerCount: number;
  isParticipant: boolean;
};
export type SantaDetail = Santa & {
  inviteToken: string;
  players: { id: string; name: string }[];
  secretWord?: string | null;
  myRecipient: { id: string; name: string } | null;
  notificationStatus: "PENDING" | "SENDING" | "SENT" | null;
};
