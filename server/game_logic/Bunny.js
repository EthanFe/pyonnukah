class Bunny {
  constructor(player, x, y) {
    this.player = player
    this.position = {x, y}
    this.canJump = true
    this.velocity = {x: 0, y: 0}
    this.carryingCandle = false
  }

  get state() {
    return {
      position: this.position,
      velocity: this.velocity,
      canJump: this.canJump,
      carryingCandle: this.carryingCandle
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