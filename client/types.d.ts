export interface CardInfo {
  id: number;
  episode: string;
  title: string;
  director: string;
  writer: string;
  airdate: string;
  subtitles: string[];
  locator: string[];
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
  scoredThisRound: number;
}

export interface Options {
  targetScore: number
}