import { Room as IRoom, Player as IPlayer, GameCard } from '../../types.js';
import { drawCards } from './cardModel.js';
import { logger } from '../app.js';

type IGamePhase = 'lobby' | 'storyTellerPick' | 'otherPlayersPick' | 'otherPlayersGuess' | 'scoring';

export class Room implements IRoom {
  players: Player[];
  gamePhase: IGamePhase;
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
  updateCount: number;

  constructor(adminId: string) {
    this.players = [];
    this.gamePhase = 'lobby';
    this.storyCardId = '';
    this.storyDescriptor = '';
    this.kickedPlayers = [];
    this.submittedCards = [];
    this.guesses = {};
    this.handSize = 6;
    this.maxPlayers = 8;
    this.targetScore = 25;
    this.playerTurn = 0;
    this.readyForNextRound = [];
    this.lastModified = Date.now();
    this.addPlayer(adminId);
    this.updateCount = 0;
  }


  // gamePhaseDict maps game phases to next game phase
  static gamePhaseDict: {[key: string]: IGamePhase} = {
    'lobby': 'storyTellerPick',
    'storyTellerPick': 'otherPlayersPick',
    'otherPlayersPick': 'otherPlayersGuess',
    'otherPlayersGuess': 'scoring',
    'scoring': 'storyTellerPick'
  };
  get playerCount() {
    return this.players.length;
  }
   
  // returns Player object of storyteller
  get storyTeller() {
    return this.players[this.playerTurn];
  }

  // increments updateCount and returns updated count
  incrementUpdateCount() {
    this.updateCount += 1;
    return this.updateCount;
  }
  
  // returns message if the current player count is less than the max player count
  // also the gamePhase must be 'lobby'
  // If room is joinable, returns undefined
  // Otherwise, returns a message about why the room is not joinable
  isNotJoinable() {
    if (this.gamePhase !== 'lobby') {
      return 'Gameplay is in progress';
    }
    if(this.playerCount >= this.maxPlayers) {
      return 'Room is full';
    } 
    return undefined;
  }
  
  // returns true if a player with the currently passed-in id is already in the room
  isCurrentPlayer(uuid: string) {
    if (this.players.map(p => p.playerId).includes(uuid)){
      return true;
    }
    
    return false;
  }
  
  // adds a player with the passed-in id
  addPlayer(uuid: string) {
    const newPlayer = new Player(uuid, '');
    this.players.push(newPlayer);
    this.lastModified = Date.now();
    return {...{newPlayer}, index: this.players.indexOf(newPlayer)};
  }
  
  // removes the player with the passed-in id
  // returns -1 if player not found, otherwise returns player's index
  removePlayer(uuid: string) {
    const playerIndex = this.getPlayerIndex(uuid);
    if (playerIndex < 0) {
      return playerIndex;
    }
    this.players = this.players.filter(player => player.playerId !== uuid);
    this.lastModified = Date.now();
    return playerIndex;
  }
   
  // returns true if the uuid is the admin, otherwise false
  isAdmin(uuid: string) {
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }

    return (this.playerCount && uuid === this.players[0].playerId);
  }

  // returns true if the uuid is the storyteller, otherwise false 
  isStoryteller(uuid: string) {
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }

    return (this.playerCount > this.playerTurn && uuid === this.players[this.playerTurn].playerId);
  }
   
  // returns Player object given the player's id
  getPlayer(uuid: string) {
    // if player does not exist return undefined
    if (!(this.isCurrentPlayer(uuid))) {
      return undefined;
    }
    return this.players.find(player => player.playerId === uuid);
  }

  // returns the index of the player with the specified id
  // returns -1 if no match is found
  getPlayerIndex(uuid: string) {
    return this.players.findIndex(p => p.playerId === uuid);
  }
   
  // removes player with kickId if adminId is admin
  // returns the index of the kicked player if successful, otherwise returns undefined
  kickPlayer(adminId: string, kickId: string) {
    // check that both players are current players and kicker is admin
    if (!(this.isCurrentPlayer(kickId)) || !this.isAdmin(adminId)) {
      return undefined;
    }

    this.kickedPlayers.push(kickId);
    this.lastModified = Date.now();
    return this.removePlayer(kickId);
  }
  
  // checks if player has been kicked from the game
  isKicked(uuid: string) {
    return this.kickedPlayers.includes(uuid);
  }
   
  // returns { changedName, playerIndex } if name change is successful
  changeName(uuid: string, newName: string) {
    // check that target player is a player
    const playerIndex = this.getPlayerIndex(uuid);
    if (playerIndex === -1 || this.isNameInUse(newName) || newName.length === 0) {
      return { changedName: '', playerIndex: -1};
    }

    
    const player = this.getPlayer(uuid);
    if (player !== undefined) {
      player.playerName = newName;
      this.lastModified = Date.now();
    }
    // send new name
    return { changedName: player?.playerName, playerIndex};
  }

  // returns true if name is in use, false otherwise
  isNameInUse(newName: string) {
    if(this.players.map(player => player.playerName.toLowerCase()).includes(newName.toLowerCase())) {
      return true;
    }
    logger.log('info', 'name is not in use');
    return false;
  }

  // return new options if options change is successful, undefined otherwise
  changeOptions(uuid: string, newOptions: number) {
    // check that requesting player is admin
    if (!(this.isAdmin(uuid)) || newOptions < 5 || newOptions > 100) {
      return undefined;
    }
    
    this.targetScore = newOptions;
    this.lastModified = Date.now();
    return this.targetScore;
  }

  // game phase moves forward by one
  advanceGamePhase() {
    this.gamePhase = Room.gamePhaseDict[this.gamePhase];
    return this.gamePhase;
  }
   
  // starts the game if gamePhase is lobby, 3 or more players are in, and requesting player is admin
  startGame(uuid: string) {
    if (this.gamePhase === 'lobby' && this.playerCount >= 3 && this.isAdmin(uuid)) {
      this.advanceGamePhase();
      this.lastModified = Date.now();
      return true;
    }
    
    return false;
  }

  // draws cards
  async populateHands() {
    const cardsNeededPerPlayer = this.players.map(p => this.handSize - p.hand.length);
    const totalCardsNeeded =  cardsNeededPerPlayer.reduce((sum, a) => sum + a, 0);
    const currentCardIds = this.players.map(p => p.hand.map(c => c.id)).flat();
    logger.log('info', `currentCardIds: ${JSON.stringify(currentCardIds)}`);
    // get total number of cards needed in one database call
    const newCards = await drawCards(totalCardsNeeded, currentCardIds);
    logger.log('info', `${cardsNeededPerPlayer.reduce((sum, a) => sum + a, 0)} cards needed, ${newCards.length} cards drawn`);
    const newCardsPerPlayer: {card: GameCard, handIndex: number}[][] = [];
    for (const player of this.players) {
      const newCardsForCurrentPlayer: {card: GameCard, handIndex: number}[] = [];
      for (let handIndex = player.hand.length; handIndex < this.handSize; handIndex += 1) {
        const card = newCards.pop();
        if (card !== undefined) {
          player.hand.push(card);
          newCardsForCurrentPlayer.push({card, handIndex});
        } else {
          logger.error('something went wrong - not enough cards drawn');
        }
      }
      newCardsPerPlayer.push(newCardsForCurrentPlayer);
    }
    return newCardsPerPlayer;
  }

   
  // submits the story card and descriptor hint
  submitStoryCard(uuid: string, cardId: string, descriptor: string) {
    const playerIndex = this.getPlayerIndex(uuid);
    if (this.gamePhase !== 'storyTellerPick' || playerIndex === -1 || !this.isStoryteller(uuid)) { 
      return { card: undefined, playerIndex: -1, handIndex: -1, storyDescriptor: '', gamePhase: '' };
    }
    const {handIndex, card} = this.players[this.playerTurn].playCard(cardId);
    if (handIndex === -1 || card === undefined) {
      return { card: undefined, playerIndex: -1, handIndex: -1, storyDescriptor: '', gamePhase: '' };
    }

    // adds playerId to the submitted object
    card.submitter = uuid;
    this.submittedCards.push(card);
    this.storyCardId = card.id;
    this.storyDescriptor = descriptor;
    this.lastModified = Date.now();
    const gamePhase = this.advanceGamePhase();
    return { ...{card, playerIndex, handIndex, gamePhase}, storyDescriptor: this.storyDescriptor, };
  }
   
  // submits other players cards
  submitOtherCard(uuid: string, cardId: string) {
    const playerIndex = this.getPlayerIndex(uuid);
    if (!(this.isOtherCardSubmittable(uuid, cardId)) || playerIndex === -1) {
      return { card: undefined, playerIndex: -1, handIndex: -1, gamePhase: undefined};
    }

    const player = this.players[playerIndex];
    const { handIndex, card } = player.playCard(cardId);
    if (handIndex === -1 || card === undefined) {
      return { card: undefined, playerIndex: -1, handIndex: -1, gamePhase: undefined};
    }

    let gamePhase: undefined | IGamePhase = undefined;
    // adds playerId to the submitted object
    card.submitter = uuid;
    this.submittedCards.push(card);
    if (this.submittedCards.length === this.expectedSubmitCount) {
      this.advanceGamePhase();
      gamePhase = this.gamePhase;
    }
    this.lastModified = Date.now();
    return { card, playerIndex, handIndex, gamePhase };
  }

  // returns number of cards expected to be submitted during a round
  get expectedSubmitCount() {
    if (this.playerCount === 3) {
      return 5;
    }
    return this.playerCount;
  }

  // checks whether a card submission from uuid is able to proceed, returns true if so, false if not
  isOtherCardSubmittable(uuid: string, cardId: string) {
    if (!this.isCurrentPlayer(uuid) || this.gamePhase !== 'otherPlayersPick') {
      return false;
    }

    // check that card is in player's hand
    if (!this.getPlayer(uuid)?.isCardInHand(cardId)) {
      return false;
    }

    // player has already submitted a card!
    if (this.playerCount > 3 && this.submittedCards.map(c => c.submitter).includes(uuid)) {
      return false;
    }

    // three player case: players are allowed to submit 2 cards
    if (this.playerCount === 3 && this.submittedCards.filter(c => c.submitter === uuid).length > 2) {
      return false;
    }

    this.lastModified = Date.now();
    return true;
  }
   
  makeGuess(uuid: string, cardId: string) {
    if (!(this.canMakeGuess(uuid))) {
      return { isSuccessful: false, scoringInfo: undefined };
    }
    this.guesses[uuid] = cardId;
    let scoringInfo = undefined;
    if (Object.keys(this.guesses).length === this.playerCount - 1) {
      this.scoreRound();
      this.advanceGamePhase();
      scoringInfo = {
        gamePhase: this.gamePhase,
        scoreList: this.players.map(p => [p.score, p.scoredThisRound]),
      };
      logger.log('info', 'advancing game phase');
    }
    this.lastModified = Date.now();
    return { isSuccessful: true, ...{scoringInfo} };
  }
   
  // returns true if player can make a guess, false othewise
  canMakeGuess(uuid: string) {
    if (!this.isCurrentPlayer(uuid) || this.gamePhase !== 'otherPlayersGuess') {
      return false;
    }
    // player has already guessed!
    if (Object.keys(this.guesses).includes(uuid)) {
      return false;
    }
    return true;
  }

  // assigns points for case where some players guessed the correct card and some did not
  handleSomeCorrectSomeIncorrect(correctGuessers: string[]) {
    // logger.log('info', 'Some players guessed correctly, some did not');
    this.players[this.playerTurn].incrementScore(3);
    for (const correctGuesser of correctGuessers) {
      this.getPlayer(correctGuesser)?.incrementScore(3);
    }
  }

  // assigns points for case where all or no players guessed the correct card
  handleAllOrNoneCorrect() {
    // logger.log('info', 'Everyone but the storyteller gets 2 points');
    for (const nonStoryTeller of this.players.filter(p => !Object.is(p, this.storyTeller))) {
      nonStoryTeller.incrementScore(2);
    }
  }

  // assigns points to players who fooled other players.
  handleFoolingPoints() {
    // logger.log('info', 'Distributing points for fooling other players');
    const successfulFakes = Object.values(this.guesses).filter(cardId => cardId !== this.storyCardId);
    for (const fakeId of successfulFakes) {
      const fakerId = this.submittedCards.find(c => c.id === fakeId)?.submitter;
      if (fakerId === undefined) return;
      this.getPlayer(fakerId)?.incrementScore(1);
    }
  }

  scoreRound() {
    const guessers = Object.keys(this.guesses);
    const correctGuessers = guessers.filter(playerId => this.guesses[playerId] === this.storyCardId);
    if (correctGuessers.length > 0 && correctGuessers.length < this.playerCount - 1) {
      this.handleSomeCorrectSomeIncorrect(correctGuessers);
    }
    else {
      this.handleAllOrNoneCorrect();
    }
    this.handleFoolingPoints();
    this.lastModified = Date.now();
  }
   
  // ends the Scoring phase and starts a new Round if no victory
  endScoring(uuid: string) {
    let gamePhase = undefined;
    if (!(this.isAbleToEndScoring(uuid))) {
      return { successful: false, ...{ gamePhase }};
    }
    this.readyForNextRound.push(uuid);
    // if everyone is ready, advance to next round
    if (this.readyForNextRound.length === this.playerCount) {
      this.startNextRound();
      gamePhase = this.gamePhase;
    }
    this.lastModified = Date.now();
    return { successful: true, ...{gamePhase}};
  }

  // returns true if uuid is able to end the scoring phase, false if not
  isAbleToEndScoring(uuid: string) {
    if (this.gamePhase !== 'scoring') {
      return false;
    }
    if (!this.isCurrentPlayer(uuid)) {
      return false;
    }
    if (this.readyForNextRound.includes(uuid)) {
      return false;
    }
    return true;
  }
  
  isGameWon() {
    return this.players.filter(p => p.score >= this.targetScore).length >= 1;
  }

  // handles moving from the end of one round to the start of the next
  startNextRound() {
    if (this.isGameWon()) {
      this.resetToLobby();
      logger.log('info', 'resetting to lobby');
      return;
    }
    logger.log('info', 'starting next round');
    this.resetRoundValues();
    this.gamePhase = 'storyTellerPick';
  }

  resetRoundValues() {
    this.playerTurn += 1;
    this.playerTurn %= this.playerCount;
    this.readyForNextRound = [];
    this.submittedCards = [];
    this.guesses = {};
    for (const player of this.players) {
      player.resetRoundScore();
    }
  }

  resetToLobby() {
    this.gamePhase = 'lobby';
    this.storyCardId = '';
    this.storyDescriptor = '';
    this.submittedCards = [];
    this.guesses = {};
    this.playerTurn = 0;
    this.readyForNextRound = [];
    for (const p of this.players) {
      p.resetAll();
    }
  }
}


export class Player implements IPlayer {
  playerId: string;
  playerName: string;
  score: number;
  hand: GameCard[];
  scoredThisRound: number;

  constructor(playerId: string, playerName: string) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.score = 0;
    this.scoredThisRound = 0;
    this.hand = [];
  }
  
  // removes card from hand and returns the former index of the card
  playCard(cardId: string) {
    const handIndex = this.hand.findIndex(card => card.id === cardId);
    const card = this.hand[handIndex];
    this.hand = this.hand.filter(card => card.id !== cardId);
    return { handIndex, card };
  }

  isCardInHand(cardId: string) {
    return this.hand.map(c => c.id).includes(cardId);
  }

  incrementScore(points: number) {
    this.score += points;
    this.scoredThisRound += points;
  }
  
  resetRoundScore() {
    this.scoredThisRound = 0;
  }

  // clears all game-specific values for a player
  resetAll() {
    this.score = 0;
    this.scoredThisRound = 0;
    this.hand = [];
  }

}
