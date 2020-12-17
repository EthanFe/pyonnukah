class Bunny {
  constructor(player, x, y) {
    this.player = player
    this.position = {x, y}
    this.canJump = true
    this.velocity = {x: 0, y: 0}
  }
}

module.exports = {
  Bunny
}