const { UP, DOWN, LEFT, RIGHT } = require('../consts.js')
const { Player } = require("./Player")

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
                // console.log(newState.players[playerId])
                this.players[playerId] = newState.players[playerId] //new Player(playerId, newState.players[playerId])
                // this.players[playerId] = new Player(playerId, newState.players[playerId])
            }
        })
        // for (let playerId in newState.players) {
            
        // }
        this.displayUpdatedState()
    }

    // get latestState() {
    //     return {
    //         players: Object.values(this.players).map(player => player.state),
    //     }
    // }

    localMovementInputted(keysHeld) {
        this.players[this.activePlayerId].keysHeld = keysHeld
    }

    jumpCommandIssued(playerId) {
        
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
        const accelAmount = 1
        const decelAmount = 5
        const maxSpeed = 30
        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const {keysHeld, bunny} = this.players[playerId]
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
                if (bunny.velocity.x !== 0) {
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

    moveObjects() {
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