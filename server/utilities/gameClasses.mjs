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
  // returns the count of players
  get playerCount() {
    return this.players.length;
  }
   
  // returns the object of the storyteller
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
    
    else {
      return false;
    }
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
   
  // returns player given the player's id
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
  
  // returns true if the player is in the kickedPlayers array, false otherwise
  isKicked(uuid) {
    return this.kickedPlayers.includes(uuid);
  }
   
  // returns true if name change is successful, false otherwise
  changeName(uuid, newName) {
    // check that target player is a player
    if (!(this.isCurrentPlayer(uuid))) {
      return false;
    }
    
    console.log('uuid okay');
    
    // check that name is not already in use
    if(this.players.map(player => player.playerName).includes(newName)) {
      return false;
    }
    
    // renames player
    this.players.filter(player => player.playerId === uuid)[0].playerName = newName;
    return true;
  }
  // return true if options change is successful, false otherwise
  changeOptions(uuid, newOptions) {
    // check that requesting player is admin
    if (!(this.isAdmin(uuid))) {
      return false;
    }
    
    // check that target value is within range
    if (newOptions < 5 || newOptions > 100) {
      return false;
    }
    
    this.targetScore = newOptions;
    return true;
  }

  advanceGamePhase() {
    this.gamePhase = Room.gamePhaseDict[this.gamePhase];
  }
   
  // starts the game if gamePhase is lobby, 3 or more players are in, and requesting player is admin
  async startGame(uuid) {
    if (this.gamePhase === "lobby" && this.playerCount >= 3 && this.isAdmin(uuid)) {
      // draws cards
      for (const player of this.players) {
        await player.populateHand(this.handSize);
      }

      this.advanceGamePhase();

      return true;
    }
    
    return false;
  }
   
  // submits the story card and descriptor hint
  submitStoryCard(uuid, card, descriptor) {
    if (this.gamePhase !== "storyTellerPick") { 
      return false;
    }
    
    if (!this.isStoryteller(uuid)) {
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
    // check that uuid corresponds to current player
    if (!this.isCurrentPlayer(uuid)) {
      return false;
    }
    
    const player = this.players.filter(p => p.playerId === uuid)[0]

    if (this.gamePhase !== "otherPlayersPick") {
      return false;
    }
    
    // player has already guessed!
    if (Object.keys(this.submittedCards).includes(uuid)) {
      return false;
    }
    
    this.submittedCards[uuid] = card;
    
    // remove card from player hand
    player.playCard(card.cardId);

    if (Object.keys(this.submittedCards).length === this.playerCount) {
      this.advanceGamePhase();
      console.log("advancing game phase")
    }

    return true;
  }
   
  makeGuess(uuid, cardId) {
    // check uuid is current player
    if (!this.isCurrentPlayer(uuid)) {
      return false;
    }

    if (this.gamePhase !== "otherPlayersGuess") {
      console.log('wrong game phase')
      return false;
    }
    
    if (Object.keys(this.guesses).includes(uuid)) {
      console.log('player has already submited a guess')
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
   
  scoreRound() {
    const correctGuessers = Object.keys(this.guesses).filter(playerId => this.guesses[playerId] === this.storyCard);
    console.log(`${correctGuessers.length} correct guesses`);
    // case where some guessers guessed storyteller's card and some guessed other card
    if (correctGuessers.length > 0 && correctGuessers.length < this.playerCount - 1) {
      console.log('Some players guessed correctly, some did not')
      this.players[this.playerTurn].incrementScore(3);
      for (const correctGuesser of correctGuessers) {
        this.getPlayer(correctGuesser).incrementScore(3);
      }
    }
    
    // case where every guesser guessed storytellers card or no guesser guessed storyteller card
    else {
      console.log('Everyone but the storyteller gets 2 points')
      for (const nonStoryTeller of this.players.filter(p => !Object.is(p, this.storyTeller))) {
        nonStoryTeller.incrementScore(2);
      }
    }
    
    // increment the scores of players who fooled another player
    console.log('Distributing points for fooling other players')
    const successfulFakes = Object.values(this.guesses).filter(cardId => cardId !== this.storyCard);
    for (const fakeId of successfulFakes) {
      const fakerId = Object.keys(this.submittedCards).filter(playerId => this.submittedCards[playerId].cardId === fakeId)[0];
      this.getPlayer(fakerId).incrementScore(1);
    }
    
    console.log("scores")
    for (const player of this.players) {
      console.log(`${player.playerName}: ${player.score}`)
    }
  }
   
  // ends the Scoring phase and starts a new Round if no victory
  // if victory, returns players to Lobby
  async endScoring(uuid) {
    // check we are in scoring phase
    if (this.gamePhase !== "scoring") {
      return false;
    }

    // check player exists
    if (!this.isCurrentPlayer(uuid)) {
      return false;
    }
    
    // check they are not already ready
    if (this.readyForNextRound.includes(uuid)) {
      return false
    }
    
    this.readyForNextRound.push(uuid);

    // if everyone is ready, advance to next round
    if (this.readyForNextRound.length === this.playerCount) {
      await this.startNextRound();
    }

    return true;
  }
  
  // handles moving from the end of one round to the start of the next
  async startNextRound() {
    console.log("starting next round");
    // move storyteller to next player
    this.playerTurn += 1;
    this.playerTurn %= this.playerCount;
    
    this.readyForNextRound = [];
    this.submittedCards = {};
    this.guesses = {};
    
    destroyCards(Object.values(this.submittedCards).map(c => c.cardId));
    
    for (const player of this.players) {
      await player.populateHand(this.handSize);
      player.resetRoundScore();
    }
    
    this.gamePhase = "storyTellerPick";
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

