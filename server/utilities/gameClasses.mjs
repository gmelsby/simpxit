import { generateUuid } from './generateUtils.mjs';
import axios from 'axios';

 export class Room {
  constructor(adminId) {
    this.players = [];
    this.gamePhase = "lobby";
    this.storyCard = undefined;
    this.storyDescriptor = undefined;
    this.kickedPlayers = [];
    this.submittedCards = {};
    this.guesses = {};
    this.handSize = 6;
    this.maxPlayers = 6;
    this.targetScore = 25;
    this.playerTurn = 0;
    this.readyForNextRound = [];
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
  }
  
  // removes the player with the passed-in id
  removePlayer(uuid) {
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }
    const initialPlayerCount = this.playerCount;
    this.players = this.players.filter(player => player.playerId !== uuid);
    if (this.playerCount < initialPlayerCount) {
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
    return this.players.filter(player => player.playerId === uuid)[0];
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
    if (!(this.isCurrentPlayer(uuid)) || this.isNameInUse()) {
      return false;
    }
    
    // renames player
    this.players.filter(player => player.playerId === uuid)[0].playerName = newName;
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
    return true;
  }

  advanceGamePhase() {
    this.gamePhase = Room.gamePhaseDict[this.gamePhase];
  }
   
  // starts the game if gamePhase is lobby, 3 or more players are in, and requesting player is admin
  startGame(uuid) {
    if (this.gamePhase === "lobby" && this.playerCount >= 3 && this.isAdmin(uuid)) {
      this.advanceGamePhase();
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
    this.submittedCards[uuid] = card;
    this.storyCard = card.cardId;
    this.storyDescriptor = descriptor;
    this.advanceGamePhase();
    return true;
  }
   
  // submits other players cards
  submitOtherCard(uuid, card) {
    if (!(this.isOtherCardSubmittable(uuid))) {
      return false;
    }
    this.submittedCards[uuid] = card;
    // remove card from player hand
    this.players.filter(p => p.playerId === uuid)[0].playCard(card.cardId);
    if (Object.keys(this.submittedCards).length === this.playerCount) {
      this.advanceGamePhase();
    }
    return true;
  }

  // checks whether a card submission from uuid is able to proceed, returns true if so, false if not
  isOtherCardSubmittable(uuid) {
    if (!this.isCurrentPlayer(uuid) || this.gamePhase !== "otherPlayersPick") {
      return false;
    }
    // player has already submitted a card!
    if (Object.keys(this.submittedCards).includes(uuid)) {
      return false;
    }
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
      console.log("advancing game phase")
    }
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
    return true;
  }

  // assigns points for case where some players guessed the correct card and some did not
  handleSomeCorrectSomeIncorrect(correctGuessers) {
      console.log('Some players guessed correctly, some did not')
      this.players[this.playerTurn].incrementScore(3);
      for (const correctGuesser of correctGuessers) {
        this.getPlayer(correctGuesser).incrementScore(3);
      }
  }

  // assigns points for case where all or no players guessed the correct card
  handleAllOrNoneCorrect() {
    console.log('Everyone but the storyteller gets 2 points')
    for (const nonStoryTeller of this.players.filter(p => !Object.is(p, this.storyTeller))) {
      nonStoryTeller.incrementScore(2);
    }
  }

  // assigns points to players who fooled other players.
  handleFoolingPoints() {
    console.log('Distributing points for fooling other players')
    const successfulFakes = Object.values(this.guesses).filter(cardId => cardId !== this.storyCard);
    for (const fakeId of successfulFakes) {
      const fakerId = Object.keys(this.submittedCards).filter(playerId => this.submittedCards[playerId].cardId === fakeId)[0];
      this.getPlayer(fakerId).incrementScore(1);
    }
  }

  scoreRound() {
    const correctGuessers = Object.keys(this.guesses).filter(playerId => this.guesses[playerId] === this.storyCard);
    if (correctGuessers.length > 0 && correctGuessers.length < this.playerCount - 1) {
      this.handleSomeCorrectSomeIncorrect(correctGuessers);
    }
    else {
      this.handleAllOrNoneCorrect();
    }

    this.handleFoolingPoints()
    console.log("scores")
    for (const player of this.players) {
      console.log(`${player.playerName}: ${player.score}`)
    }
  }
   
  // ends the Scoring phase and starts a new Round if no victory
  // if victory, returns players to Lobby
  endScoring(uuid) {
    if (!(this.isAbleToEndScoring(uuid))) {
      return false;
    }
    this.readyForNextRound.push(uuid);
    // if everyone is ready, advance to next round
    if (this.readyForNextRound.length === this.playerCount) {
      this.startNextRound();
    }
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


  
  // handles moving from the end of one round to the start of the next
  startNextRound() {
    console.log("starting next round");
    destroyCards(Object.values(this.submittedCards).map(c => c.cardId));
    this.resetRoundValues();
    for (const player of this.players) {
      player.resetRoundScore();
    }
    this.gamePhase = "storyTellerPick";
  }

  resetRoundValues() {
    this.playerTurn += 1;
    this.playerTurn %= this.playerCount;
    this.readyForNextRound = [];
    this.submittedCards = {};
    this.guesses = {};
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
    while (this.hand.length < size) {
      const freshCard = await newCard();
      this.hand.push(freshCard);
    }
  }
  
  playCard(cardId) {
    this.hand = this.hand.filter(card => card.cardId !== cardId);
  }
  
  incrementScore(points) {
    this.score += points;
    this.scoredThisRound += points;
  }
  
  resetRoundScore() {
    this.scoredThisRound = 0;
  }

}

// function to remove played cards from cache
const destroyCards = cardIds => {
  for (const cardId of cardIds){
    console.log(`deleting card ${cardId}`)
    delete cardCache[cardId];
    console.log(`removed cardId ${cardId}`);
  }
}

const cardCache = {}

// returns the info for a card with passed-in id 
export function retrieveCardInfo(cardId) {
  return cardCache[cardId];
}

const newCard = async () => {
    const cardId = generateUuid();
    // gets info for card
    const info = await getNewCardInfo()
    console.log(`cardInfo: ${JSON.stringify(info)}`);
    cardCache[cardId] = info.data;
    const locator = cardCache[cardId].Image;
    return { cardId, locator };
}

const getNewCardInfo = async () => {
  return axios.get("http://localhost:8080")
    .then(response => {
      // check if request successful
      if (response.status == 200) {
        // processes data and sends processed data if request successful
        console.log(`received response: ${response.data}`);
        return response.data;
      }
      // throws descriptive error if not successful
      else {
        console.log("received unexpected response");
        throw new Error(`Received response code ${response.status} from microservice`);
      }
    })
    // handles error
    .catch(err => {
      console.error(err);
      return err;
    });
}

