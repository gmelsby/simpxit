 export class Room {
  constructor(adminId) {
    this.players = [];
    this.gamePhase = "lobby";
    this.storyCard = undefined;
    this.kickedPlayers = [];
    this.submittedCards = {};
    this.handSize = 6;
    this.maxPlayers = 6;
    this.targetScore = 25;
    this.playerTurn = 0;
    this.defaultPlayerNumber = 1;
    this.addPlayer(adminId);
  }


  // gamePhaseDict maps game phases to next game phase
  static gamePhaseDict = {
                        "lobby": "storytellerPick",
                        "storytellerPick": "otherPlayersPick",
                        "otherPlayersPick": "otherPlayersGuess",
                        "otherPlayersGuess": "scoring",
                        "scoring": "drawCards",
                        "drawCards": "storyTellerPick"
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
    this.players.push(new Player(uuid, `Player ${this.defaultPlayerNumber}`));
    this.defaultPlayerNumber += 1;
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
   
  // removes player with kickId if adminId is admin
  kickPlayer(adminId, kickId) {
    if (this.playerCount && adminId === this.players[0].playerId) {
      this.kickedPlayers.push(kickId);
      return this.removePlayer(kickId);
    }
    return false;
  }
  
  // returns if the player is in the kickedPlayers array
  isKicked(uuid) {
    return this.kickedPlayers.includes(uuid);
  }
  

  advanceGamePhase() {
    this.gamePhase = gamePhaseDict[this.gamePhase];
  }
  
}


export class Player {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.hand = [];
  }
}

export class Card {
  constuctor(cardId, locator) {
    this.cardId = cardId;
    this.locator = locator;
  }
}
