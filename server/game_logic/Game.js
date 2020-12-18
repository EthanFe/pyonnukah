const { Player } = require("./Player")
const { UP, DOWN, LEFT, RIGHT } = require('./consts.js')

class Game {
    constructor(sendStateToClients) {
        this.activeLevel = null
        this.players = []
        this.levelStartTimer = null
        this.sendStateToClients = sendStateToClients
        this.startSimulation()
    }

    get latestState() {
        const playersObject = {}
        this.players.forEach(player => playersObject[player.id] = player.state)
        return {
            players: playersObject,
        }
    }

    playerJoined(playerId) {
        this.players.push(new Player(playerId))
        this.sendStateToClients()
    }

    playerLeft(playerId) {
        this.players = this.players.filter(player => player.id !== playerId)
        this.sendStateToClients()
    }

    playerById(id) {
        return this.players.find(player => player.id === id)
    }

    movementInputted(playerId, keysHeld, bunnyState) {
        this.playerById(playerId).updateKeysHeld(keysHeld)
        this.playerById(playerId).updateBunnyState(bunnyState)
        this.sendStateToClients()
    }

    jumpCommandIssued(playerId) {
        
    }

    readyToggled(id, playerIsReady) {
    //     const issuingPlayer = this.playerIdentityFromId(id)
    //     this.players[issuingPlayer].ready = playerIsReady
    //     if (this.playersAreReady) {
    //         this.beginLevelStartTimer()
    //     } else if (this.levelStartTimer !== null) {
    //         clearTimeout(this.levelStartTimer)
    //         this.levelStartTimer = null
    //     }
    //     this.sendStateToClients()
    }

    get playersAreReady() {
        return this.players.every(player => player.ready)
    }

    // beginLevelStartTimer() {
    //     this.levelStartTimer = setTimeout(() => {
    //         this.launchLevel()
    //     }, 2000)
    // }

    // launchLevel() {

    // }

    startSimulation() {
        setInterval(() => {
            this.accelerateObjects()
            this.moveObjects()
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

    updateVerticalMovement() {
        const accelAmount = 1.6
        const gravityAmount = 0.8
        const maxVerticalSpeed = 18

        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const {keysHeld, bunny} = this.players[playerId]
            console.log(bunny)
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
}

module.exports = {
    Game
}