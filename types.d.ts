export interface CardInfo {
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

export interface GameCard extends Partial<CardInfo> {
  id: string;
  locator: string;
  submitter?: string;
}

export interface Player {
  playerId: string;
  playerName: string;
  score: number;
  hand: GameCard[];
  scoredThisRound: number;
}

export interface Options {
  targetScore: number
}

export interface Room {
  players: Player[];
  gamePhase: 'lobby' | 'storyTellerPick' | 'otherPlayersPick' | 'otherPlayersGuess' | 'scoring';
  storyCardId: string;
  storyDescriptor: string;
  kickedPlayers: string[];
  submittedCards: GameCard[];
  guesses: {[key: string]: string};
  handSize: number;
  maxPlayers: number;
  targetScore: number;
  playerTurn: number;
  readyForNextRound: string[];
  lastModified: number;
}