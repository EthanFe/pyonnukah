class Bunny {
  constructor(player, position) {
    this.player = player
    this.position = position
    this.canJump = true
    this.velocity = {x: 0, y: 0}
  }

  get state() {
    return {
      position: this.position,
      velocity: this.velocity
    }
  }
}

module.exports = {
  Bunny
}