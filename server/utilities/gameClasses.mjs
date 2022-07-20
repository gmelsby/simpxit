import { generateUuid } from './generateUtils.mjs';

 export class Room {
  constructor(adminId) {
    this.players = [];
    this.gamePhase = "lobby";
    this.storyCard = undefined;
    this.storyDescriptor = undefined;
    this.kickedPlayers = [];
    this.submittedCards = {};
    this.handSize = 6;
    this.maxPlayers = 6;
    this.targetScore = 25;
    this.playerTurn = 0;
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
    if (this.players.filter(player => player.playerId === uuid).length) {
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
    return (this.playerCount && uuid === this.players[0].playerId);
  }

  // returns true if the uuid is the storyteller, otherwise false 
  isStoryteller(uuid) {
    return (this.playerCount > this.playerTurn && uuid === this.players[this.playerTurn].playerId);
  }
   
  // removes player with kickId if adminId is admin
  kickPlayer(adminId, kickId) {
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
    if (!(this.players.map(player => player.playerId).includes(uuid))) {
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
    // checks that room is populated
    if (!(this.playerCount)) {
      return false;
    }

    // check that requesting player is admin
    if (this.players[0].playerId !== uuid) {
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
   
  // starts the game if gamePhas is lobby, 3 or more players are in, and requesting player is admin
  startGame(uuid) {
    if (this.gamePhase === "lobby" && this.playerCount >= 3 && this.isAdmin(uuid)) {
      // draws cards
      this.players.forEach(player => player.populateHand(this.handSize));

      this.advanceGamePhase();

      return true;
    }
    
    return false;
  }
   
  // submits the story card and descriptor hint
  submitStoryCard(uuid, cardId, descriptor) {
    if (this.gamePhase !== "storyTellerPick") { 
      return false;
    }
    
    if (!this.isStoryteller(uuid)) {
      return false;
    }
    
    this.players[this.playerTurn].playCard(cardId);
    this.submittedCards[cardId] = uuid;
    this.storyCard = cardId;
    this.storyDescriptor = descriptor;
    this.advanceGamePhase();
  }

}


export class Player {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.hand = [];
  }
  
  populateHand(size) {
    while (this.hand.length < size) {
      this.hand.push(new Card());
    }
  }
  
  playCard(cardId) {
    this.hand = this.hand.filter(card => card.cardId !== cardId);
  }
}

export class Card {
  constructor() {
    this.cardId = generateUuid();
    this.locator = "https://frinkiac.com/img/S14E16/900441.jpg";
  }
}
