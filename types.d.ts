export interface CardInfo {
  episode: string;
  title: string;
  director: string;
  writer: string;
  airdate: string;
  subtitles: string[];
  locator: string;
}

export interface Card extends CardInfo {
  cardId: string;
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
  gamePhase: "lobby" | "storyTellerPick" | "otherPlayersPick" | "otherPlayersGuess" | "scoring",
  storyCardId: string;
  storyDescriptor: string;
  kickedPlayers: string[];
  submittedCards: Card[];
  guesses: {[key: string]: string};
  handSize: number;
  maxPlayers: number;
  targetScore: number;
  playerTurn: number;
  readyForNextRound: string[];
  lastModified: number;
}