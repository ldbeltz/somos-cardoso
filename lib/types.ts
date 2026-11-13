export type Player = {
  id: number;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
};
export type Santa = {
  id: number;
  name: string;
  drawAt: string;
  status: "SCHEDULED" | "DRAWN";
  creatorId: number;
  playerCount: number;
  isParticipant: boolean;
};
export type SantaDetail = Santa & {
  inviteToken: string;
  players: { id: number; name: string }[];
  myRecipient: { id: number; name: string } | null;
  notificationStatus: "PENDING" | "SENDING" | "SENT" | null;
};
