import { generateUuid } from './utilities/generateUtils.js';
import { filterFrinkiac } from './utilities/filterFrinkiac.js';
import axios from 'axios';


 export class Room {
  constructor(adminId) {
    this.players = [];
    this.gamePhase = "lobby";
    this.storyCardId = undefined;
    this.storyDescriptor = undefined;
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
  }


  // gamePhaseDict maps game phases to next game phase
  static gamePhaseDict = {
                        "lobby": "storyTellerPick",
                        "storyTellerPick": "otherPlayersPick",
                        "otherPlayersPick": "otherPlayersGuess",
                        "otherPlayersGuess": "scoring",
                        "scoring": "storyTellerPick"
                         };
  get playerCount() {
    return this.players.length;
  }
   
  // returns Player object of storyteller
  get storyTeller() {
    return this.players[this.playerTurn];
  }
  
  // returns true if the current player count is less than the max player count
  // also the gamePhase must be 'lobby'
  isJoinable() {
    if(this.playerCount < this.maxPlayers && this.gamePhase === 'lobby') {
      return true;
    }
    
    return false;
  }
  
  // returns true if a player with the currently passed-in id is already in the room
  isCurrentPlayer(uuid) {
    if (this.players.map(p => p.playerId).includes(uuid)){
      return true;
    }
    
    return false;
  }
  
  // adds a player with the passed-in id
  addPlayer(uuid) {
    let playerNumber = 1;
    while(this.players.map(p => p.playerName).includes(`Player ${playerNumber}`)) {
      playerNumber++;
    }
    this.players.push(new Player(uuid, `Player ${playerNumber}`));
    this.lastModified = Date.now();
  }
  
  // removes the player with the passed-in id
  removePlayer(uuid) {
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }
    const initialPlayerCount = this.playerCount;
    this.players = this.players.filter(player => player.playerId !== uuid);
    if (this.playerCount < initialPlayerCount) {
      this.lastModified = Date.now();
      return true;
    }
    return false;
  }
   
  // returns true if the uuid is the admin, otherwise false
  isAdmin(uuid) {
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }

    return (this.playerCount && uuid === this.players[0].playerId);
  }

  // returns true if the uuid is the storyteller, otherwise false 
  isStoryteller(uuid) {
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }

    return (this.playerCount > this.playerTurn && uuid === this.players[this.playerTurn].playerId);
  }
   
  // returns Player object given the player's id
  getPlayer(uuid) {
    // if player does not exist return undefined
    if (!(this.isCurrentPlayer(uuid))) {
      return undefined;
    }
    return this.players.find(player => player.playerId === uuid);
  }
   
  // removes player with kickId if adminId is admin
  kickPlayer(adminId, kickId) {
    // check that both players are current players
    if (!(this.isCurrentPlayer(adminId)) || !(this.isCurrentPlayer(kickId))) {
      return false;
    }
    // check that player attempting to kick is admin
    if (this.isAdmin(adminId)) {
      this.kickedPlayers.push(kickId);
      this.lastModified = Date.now();
      return this.removePlayer(kickId);
    }
    return false;
  }
  
  isKicked(uuid) {
    return this.kickedPlayers.includes(uuid);
  }
   
  // returns true if name change is successful, false otherwise
  changeName(uuid, newName) {
    // check that target player is a player
    if (!(this.isCurrentPlayer(uuid)) || this.isNameInUse(newName) || newName.length === 0) {
      return false;
    }
    
    // renames player
    this.players.find(player => player.playerId === uuid).playerName = newName;
    this.lastModified = Date.now();
    return true;
  }

  // returns true if name is in use, false otherwise
  isNameInUse(newName) {
    if(this.players.map(player => player.playerName).includes(newName)) {
      return true;
    }

    return false;
  }

  // return true if options change is successful, false otherwise
  changeOptions(uuid, newOptions) {
    // check that requesting player is admin
    if (!(this.isAdmin(uuid)) || newOptions < 5 || newOptions > 100) {
      return false;
    }
    
    this.targetScore = newOptions;
    this.lastModified = Date.now();
    return true;
  }

  advanceGamePhase() {
    this.gamePhase = Room.gamePhaseDict[this.gamePhase];
  }
   
  // starts the game if gamePhase is lobby, 3 or more players are in, and requesting player is admin
  startGame(uuid) {
    if (this.gamePhase === "lobby" && this.playerCount >= 3 && this.isAdmin(uuid)) {
      this.advanceGamePhase();
      this.lastModified = Date.now();
      return true;
    }
    
    return false;
  }

  // draws cards
  async populateHands() {
    for (const player of this.players) {
      await player.populateHand(this.handSize);
    }
    return true
  }

   
  // submits the story card and descriptor hint
  submitStoryCard(uuid, card, descriptor) {
    if (this.gamePhase !== "storyTellerPick" || !this.isStoryteller(uuid)) { 
      return false;
    }
    this.players[this.playerTurn].playCard(card.cardId);
    // adds playerId to the submitted object
    card.submitter = uuid;
    this.submittedCards.push(card);
    this.storyCardId = card.cardId;
    this.storyDescriptor = descriptor;
    this.lastModified = Date.now();
    this.advanceGamePhase();
    return true;
  }
   
  // submits other players cards
  submitOtherCard(uuid, card) {
    if (!(this.isOtherCardSubmittable(uuid, card.cardId))) {
      return false;
    }
    // adds playerId to the submitted object
    card.submitter = uuid;
    this.submittedCards.push(card);
    // remove card from player hand
    this.players.find(p => p.playerId === uuid).playCard(card.cardId);
    if (this.submittedCards.length === this.expectedSubmitCount) {
      this.advanceGamePhase();
    }
    this.lastModified = Date.now();
    return true;
  }

  // returns number of cards expected to be submitted during a round
  get expectedSubmitCount() {
    if (this.playerCount === 3) {
      return 5;
    }
    return this.playerCount;
  }

  // checks whether a card submission from uuid is able to proceed, returns true if so, false if not
  isOtherCardSubmittable(uuid, cardId) {
    if (!this.isCurrentPlayer(uuid) || this.gamePhase !== "otherPlayersPick") {
      return false;
    }

    // check that card is in player's hand
    if (!this.players.find(p => p.playerId === uuid).isCardInHand(cardId)) {
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
   
  makeGuess(uuid, cardId) {
    if (!(this.canMakeGuess(uuid))) {
      return false;
    }
    this.guesses[uuid] = cardId;
    if (Object.keys(this.guesses).length === this.playerCount - 1) {
      this.scoreRound();
      this.advanceGamePhase();
      // console.log("advancing game phase")
    }
    this.lastModified = Date.now();
    return true;
  }
   
  // returns true if player can make a guess, false othewise
  canMakeGuess(uuid) {
    if (!this.isCurrentPlayer(uuid) || this.gamePhase !== "otherPlayersGuess") {
      return false;
    }
    // player has already guessed!
    if (Object.keys(this.guesses).includes(uuid)) {
      return false;
    }
    this.lastModified = Date.now();
    return true;
  }

  // assigns points for case where some players guessed the correct card and some did not
  handleSomeCorrectSomeIncorrect(correctGuessers) {
      // console.log('Some players guessed correctly, some did not');
      this.players[this.playerTurn].incrementScore(3);
      for (const correctGuesser of correctGuessers) {
        this.getPlayer(correctGuesser).incrementScore(3);
      }
  }

  // assigns points for case where all or no players guessed the correct card
  handleAllOrNoneCorrect() {
    // console.log('Everyone but the storyteller gets 2 points');
    for (const nonStoryTeller of this.players.filter(p => !Object.is(p, this.storyTeller))) {
      nonStoryTeller.incrementScore(2);
    }
  }

  // assigns points to players who fooled other players.
  handleFoolingPoints() {
    // console.log('Distributing points for fooling other players');
    const successfulFakes = Object.values(this.guesses).filter(cardId => cardId !== this.storyCardId);
    for (const fakeId of successfulFakes) {
      const fakerId = this.submittedCards.find(c => c.cardId === fakeId).submitter;
      this.getPlayer(fakerId).incrementScore(1);
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
    this.handleFoolingPoints()
    this.lastModified = Date.now();
  }
   
  // ends the Scoring phase and starts a new Round if no victory
  endScoring(uuid) {
    if (!(this.isAbleToEndScoring(uuid))) {
      return false;
    }
    this.readyForNextRound.push(uuid);
    // if everyone is ready, advance to next round
    if (this.readyForNextRound.length === this.playerCount) {
      this.startNextRound();
    }
    this.lastModified = Date.now();
    return true;
  }

  // returns true if uuid is able to end the scoring phase, false if not
  isAbleToEndScoring(uuid) {
    if (this.gamePhase !== "scoring") {
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
      return;
    }
    // console.log("starting next round");
    destroyCards(this.submittedCards.map(c => c.cardId));
    this.resetRoundValues();
    this.gamePhase = "storyTellerPick";
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
    this.gamePhase = "lobby";
    this.storyCardId = undefined;
    this.storyDescriptor = undefined;
    destroyCards(this.submittedCards.map(c => c.cardId));
    this.submittedCards = [];
    this.guesses = {};
    this.playerTurn = 0;
    this.readyForNextRound = [];
    for (const p of this.players) {
      p.resetAll();
    }
  }

  // removes all relevant cards from Cards cache
  teardownCards() {
    destroyCards(this.submittedCards.map(c => c.cardId));
    for (const p of this.players) {
      p.destroyHand();
    }
  }

}


export class Player {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.score = 0;
    this.scoredThisRound = 0
    this.hand = [];
  }
  
  async populateHand(size) {
    for (let i = this.hand.length; i < size; i++) {
      const freshCard = await newCard();
      this.hand.push(freshCard);
    }
  }
  
  playCard(cardId) {
    this.hand = this.hand.filter(card => card.cardId !== cardId);
  }

  isCardInHand(cardId) {
    return this.hand.map(c => c.cardId).includes(cardId);
  }

  incrementScore(points) {
    this.score += points;
    this.scoredThisRound += points;
  }
  
  resetRoundScore() {
    this.scoredThisRound = 0;
  }

  destroyHand() {
    destroyCards(this.hand);
    this.hand = [];
  }

  // clears all game-specific values for a player
  resetAll() {
    this.score = 0;
    this.scoredThisRound = 0;
    this.destroyHand();
  }

}

// function to remove played cards from cache
const destroyCards = cardIds => {
  for (const cardId of cardIds){
    // console.log(`deleting card ${cardId}`)
    delete cardCache[cardId];
    // console.log(`removed cardId ${cardId}`);
  }
}

const cardCache = {}

// returns the info for a card with passed-in id 
export function retrieveCardInfo(cardId) {
  return cardCache[cardId];
}

const newCard = async () => {
    const cardId = generateUuid();
    const info = await getNewCardInfo()
    // console.log(`cardInfo: ${JSON.stringify(info)}`);
    cardCache[cardId] = info;
    const locator = cardCache[cardId].locator;
    return { cardId, locator };
}

const getNewCardInfo = async () => {
  return axios.get("https://frinkiac.com/api/random")
    .then(response => {
      if (response.status == 200) {
        // console.log(response.data);
        const filtered_data = filterFrinkiac(response.data);
        // console.log(`filtered: ${filtered_data}`);
        return filtered_data;
      }
      else {
        // console.log("received unexpected response");
        throw new Error(`Received response code ${response.status} from frinkiac api`);
      }
    })
    .catch(err => {
      console.error(err);
      return err;
    });
}

