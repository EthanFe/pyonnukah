const { Player } = require("./Player")
const { UP, DOWN, LEFT, RIGHT } = require('./consts.js')

class Game {
    constructor(sendStateToClients) {
        this.activeLevel = null
        this.players = []
        this.candlesOnLevel = 1
        this.litCandles = {}
        this.shamusOnMenorah = true

        this.sendStateToClients = sendStateToClients
        this.startSimulation()
    }

    get latestState() {
        const playersObject = {}
        this.players.forEach(player => playersObject[player.id] = player.state)
        return {
            players: playersObject,
            candlesOnLevel: this.candlesOnLevel,
            litCandles: this.litCandles,
            shamusOnMenorah: this.shamusOnMenorah
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

    startSimulation() {
        setInterval(() => {
            this.accelerateObjects()
            this.moveObjects()
            this.checkForCandleCollisions()
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

    checkForCandleCollisions() {
        const candleGrabbed = this.checkForCandleGrabbing()
        const candleLit = this.checkForCandleLighting()

        if (candleGrabbed || candleLit) {
            const playerIds = Object.keys(this.latestState.players)
            this.sendStateToClients()
        }
    }

    checkForCandleGrabbing() {
        if (!this.shamusOnMenorah) { return false }
        let dirty = false
        const playerIds = Object.keys(this.players)
        const shamusPosition = {x: 500, y: 500}

        let grabbingBunny = null
        playerIds.forEach(playerId => {
            const bunny = this.players[playerId].bunny
            if (this.candleIsInRange(shamusPosition, bunny.position)) {
                grabbingBunny = bunny
            }
        })

        if (grabbingBunny !== null) {
            grabbingBunny.carryingCandle = true
            this.shamusOnMenorah = false
            dirty = true
        }
        return dirty
    }

    checkForCandleLighting() {
        let dirty = false
        const playerIds = Object.keys(this.players)
        const lightableCandlePositions = [
            {x: 769, y: 447},
            {x: 721, y: 447},
            {x: 669, y: 447},
            {x: 618, y: 447},
            {x: 383, y: 447},
            {x: 333, y: 447},
            {x: 280, y: 447},
            {x: 231, y: 447},
        ]
        .filter((candle, index) => index < this.candlesOnLevel)

        const playerIdForBunnyCarryingCandle = playerIds.find(playerId => this.players[playerId].bunny.carryingCandle)
        if (playerIdForBunnyCarryingCandle === undefined) {
            return false
        }
        const bunnyCarryingCandle = this.players[playerIdForBunnyCarryingCandle].bunny

        let litCandle = null
        lightableCandlePositions.forEach((candlePosition, index) => {
            if (this.candleIsInRange(candlePosition, bunnyCarryingCandle.position)) {
                litCandle = index
            }
        })
        if (litCandle !== null) {
            this.litCandles[litCandle] = true
            dirty = true
        }

        return dirty
    }

    candleIsInRange(candlePosition, bunnyPosition) {
        const maxRange = 200
        const dist = Math.sqrt(Math.pow(candlePosition.x - bunnyPosition.x, 2) + Math.pow(candlePosition.y - bunnyPosition.y, 2))
        return dist <= maxRange
    }
}

module.exports = {
    Game
}