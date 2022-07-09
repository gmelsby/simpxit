 export class Room {
  constructor(adminId) {
    this.adminId = adminId;
    this.players = [new Player(adminId, "Player 1")];
    this.gamePhase = "lobby";
    this.storyCard = undefined;
    this.submittedCards = {};
    this.handSize = 6;
    this.maxPlayers = 6;
    this.targetScore = 25;
    this.playerTurn = 0;
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
    this.players.push(new Player(uuid, `Player ${this.playerCount + 1}`));
  }
  
  // removes the player with the passed-in id
  removePlayer(uuid) {
    this.players = this.players.filter(player => player[playerId] !== uuid);
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
