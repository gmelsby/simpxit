import { JSONPatchOperation } from 'immutable-json-patch';

export type CardInfo = {
  episode_key: string;
  season: number;
  episode: number;
  title: string;
  director: string;
  writer: string;
  airdate: string;
  subtitles: string[];
  locator: string;
  timestamp: number;
  frinkiacLink: string?;
}

export type GameCard = {
  id: string;
  locator: string;
  submitter?: string;
} & Partial<CardInfo>

export type Player = {
  playerId: string;
  playerName: string;
  score: number;
  hand: GameCard[];
  scoredThisRound: number;
}

export interface Options {
  targetScore: number
}

export type GamePhase = 'lobby' | 'storyTellerPick' | 'otherPlayersPick' | 'otherPlayersGuess' | 'scoring';

export type GuessMap = {[key: string]: string};


export type Room = {
  players: Player[];
  gamePhase: GamePhase;
  storyCardId: string;
  storyDescriptor: string;
  kickedPlayers: string[];
  submittedCards: GameCard[];
  guesses: GuessMap;
  handSize: number;
  maxPlayers: number;
  targetScore: number;
  playerTurn: number;
  readyForNextRound: string[];
  updateCount: number;
}

// Socket.IO types
export interface ServerToClientEvents {
  receiveRoomState: (room: Room) => void;
  receiveRoomPatch: ({operations, updateCount}: {operations: JSONPatchOperation[], updateCount: number}) => void;
  resetRoundValues: (updateCount: number) => void;
  resetToLobby: (updateCount: number) => void;
}

export interface ClientToServerEvents {
  requestRoomState: ({roomId, userId}: {roomId: string, userId: string}) => void;
  joinRoom: ({roomId, userId}: {roomId: string, userId: string}, callback: (e: string) => void) => void;
  kickPlayer: ({roomId, userId, kickUserId}: {roomId: string, userId: string, kickUserId: string}) => void;
  leaveRoom: ({roomId, userId}: {roomId: string, userId: string}, callback: (e: string) => void) => void;
  changeName: ({roomId, userId, newName}: {roomId: string, userId: string, newName: string}) => void;
  changeOptions: ({roomId, userId, newOptions}: {roomId: string, userId: string, newOptions: number}) => void;
  startGame: ({roomId, userId}: {roomId: string, userId: string}) => void;
  submitStoryCard: ({roomId, userId, selectedCardId, descriptor}: {roomId: string, userId: string, selectedCardId: string, descriptor: string}) => void;
  submitOtherCard: ({roomId, userId, selectedCardId}: {roomId: string, userId: string, selectedCardId: string}) => void;
  guess: ({roomId, userId, selectedCardId}: {roomId: string, userId: string, selectedCardId: string}) => void;
  endScoring: ({roomId, userId}: {roomId: string, userId: string}) => void;
}