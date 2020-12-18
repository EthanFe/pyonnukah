const { UP, DOWN, LEFT, RIGHT } = require('../consts.js')

class Game {
    constructor(setGameState, activePlayerId) {
        this.setGameState = setGameState

        this.players = {}
        this.activePlayerId = null
        this.startSimulation()
    }

    setActivePlayer(playerId) {
        this.activePlayerId = playerId
    }

    updateState(newState) {
        const playerIds = Object.keys(newState.players)
        playerIds.forEach(playerId => {
            if (playerId !== this.activePlayerId || this.players[this.activePlayerId] === undefined) {
                this.players[playerId] = newState.players[playerId]
            }
        })
        this.displayUpdatedState()
    }

    localMovementInputted(keysHeld) {
        this.players[this.activePlayerId].keysHeld = keysHeld
    }

    startSimulation() {
        setInterval(() => {
            this.accelerateObjects()
            const dirty = this.moveObjects()
            if (dirty) {
                this.displayUpdatedState()
            }
        }, 1000 / 60)
    }

    accelerateObjects() {
        this.updateHorizontalMovement()
        this.updateVerticalMovement()
    }

    updateHorizontalMovement() {
        const accelAmount = 0.6
        const decelAmount = 0.8
        const maxSpeed = 12
        
        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const {keysHeld, bunny} = this.players[playerId]
            const bunnyIsGrounded = bunny.position.y === 0

            if (keysHeld[RIGHT] && !keysHeld[LEFT]) {
                bunny.velocity.x += accelAmount
                if (bunny.velocity.x > maxSpeed) {
                    bunny.velocity.x = maxSpeed
                }
            } else if (keysHeld[LEFT] && !keysHeld[RIGHT]) {
                bunny.velocity.x -= accelAmount
                if (bunny.velocity.x < maxSpeed * -1) {
                    bunny.velocity.x = maxSpeed * -1
                }
            } else {
                if (bunny.velocity.x !== 0 && bunnyIsGrounded) {
                    if (bunny.velocity.x > 0) {
                        if (bunny.velocity.x >= decelAmount) {
                            bunny.velocity.x -= decelAmount
                        } else {
                            bunny.velocity.x = 0
                        }
                    } else {
                        if (bunny.velocity.x <= decelAmount * -1) {
                            bunny.velocity.x += decelAmount
                        } else {
                            bunny.velocity.x = 0
                        }
                    }
                }
            }
        })
    }

    updateVerticalMovement() {
        const accelAmount = 1.6
        const gravityAmount = 0.8
        const maxVerticalSpeed = 18

        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const {keysHeld, bunny} = this.players[playerId]
            if (bunny.velocity.y >= maxVerticalSpeed || (bunny.position.y > 0 && !keysHeld[UP])) {
                bunny.canJump = false
            }
            if (keysHeld[UP] && bunny.canJump) {
                bunny.velocity.y += accelAmount
                if (bunny.velocity.y > maxVerticalSpeed) {
                    bunny.velocity.y = maxVerticalSpeed
                }
            } else if (bunny.position.y > 0) {
                bunny.velocity.y -= gravityAmount
                if (bunny.velocity.y < maxVerticalSpeed * -1) {
                    bunny.velocity.y = maxVerticalSpeed * -1
                }
            } else if (bunny.position.y <= 0) {
                bunny.velocity.y = 0
                bunny.canJump = true
            }
        })
    }

    moveObjects() {
        const minPosY = 0

        let dirty = false
        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const bunny = this.players[playerId].bunny
            if (bunny.velocity.x !== 0) {
                dirty = true
                bunny.position.x += bunny.velocity.x
            }
            if (bunny.velocity.y !== 0) {
                dirty = true
                bunny.position.y += bunny.velocity.y
                if (bunny.position.y < minPosY) {
                    bunny.position.y = minPosY
                }
            }
        })
        return dirty
    }

    displayUpdatedState() {
        this.setGameState({players: this.players})
    }
}

module.exports = {
    Game
}