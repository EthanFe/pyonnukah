const { Bunny } = require("./Bunny")

class Player {
  constructor(id) {
    this.id = id
    this.ready = false
    this.bunny = new Bunny(this, 0, 0)
  }

  get state() {
    return {
      id: this.id,
      ready: this.ready,
      bunnyPosition: this.bunny.position
    }
  }
}

module.exports = {
    Player
}