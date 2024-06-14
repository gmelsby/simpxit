export interface CardInfo {
  episode: string;
  title: string;
  director: string;
  writer: string;
  airdate: string;
  subtitles: string[];
  locator: string;
}

export interface GameCard extends Partial<CardInfo> {
  id: bigint;
  locator: string;
  submitter?: string;
}

export interface Player {
  playerId: string;
  playerName: string;
  score: number;
  hand: Card[];
  scoredThisRound: number;
}

export interface Options {
  targetScore: number
}

export interface Room {
  players: Player[];
  gamePhase: 'lobby' | 'storyTellerPick' | 'otherPlayersPick' | 'otherPlayersGuess' | 'scoring';
  storyCardId: bigint;
  storyDescriptor: string;
  kickedPlayers: string[];
  submittedCards: Card[];
  guesses: {[key: string]: bigint};
  handSize: number;
  maxPlayers: number;
  targetScore: number;
  playerTurn: number;
  readyForNextRound: string[];
  lastModified: number;
  playerCount?: number;
  storyTeller?: Player;
}