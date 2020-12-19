const { Bunny } = require("./Bunny")

class Player {
  constructor(id) {
    this.id = id
    this.bunny = new Bunny(this, 0, 0)
    this.keysHeld = {}
  }

  get state() {
    return {
      id: this.id,
      bunny: this.bunny.state,
      keysHeld: this.keysHeld
    }
  }

  updateKeysHeld(keysHeld) {
    this.keysHeld = keysHeld
  }
  
  updateBunnyState(newState) {
    this.bunny.updateState(newState)
  }
}

module.exports = {
    Player
}