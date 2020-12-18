class Bunny {
  constructor(player, x, y) {
    this.player = player
    this.position = {x, y}
    this.canJump = true
    this.velocity = {x: 0, y: 0}
  }

  get state() {
    return {
      position: this.position,
      velocity: this.velocity,
      canJump: this.canJump,
    }
  }

  updateState(newState) {
    this.position = newState.position
    this.velocity = newState.velocity
  }
}

module.exports = {
  Bunny
}