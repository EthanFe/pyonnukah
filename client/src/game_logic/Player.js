const { Bunny } = require("./Bunny")

class Player {
  constructor(id, existingState = null) {
    this.id = id
    this.ready = false
    this.bunny = new Bunny(this, {x: 0, y: 0})
    this.keysHeld = {}
    if (existingState !== null) {
      this.bunny = new Bunny(this, existingState.bunny.position)
      this.keysHeld = existingState.keysHeld
      this.ready = existingState.ready
    }
  }

  get state() {
    return {
      id: this.id,
      ready: this.ready,
      bunny: this.bunny.state,
      keysHeld: this.keysHeld
    }
  }

  updateKeysHeld(keysHeld) {
    this.keysHeld = keysHeld
  }
}

module.exports = {
    Player
}