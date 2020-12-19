const { Player } = require("./Player")
const { UP, DOWN, LEFT, RIGHT } = require('./consts.js')
const { makeUniqueId } = require("../../client/src/utils")

class Game {
    constructor(sendStateToClients) {
        this.activeLevel = null
        this.players = []
        this.candlesOnLevel = 1
        this.litCandles = {}
        this.shamusOnMenorah = true
        this.activePyonPairs = []

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
            shamusOnMenorah: this.shamusOnMenorah,
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
            this.updatePyonCapableBunnyPairs()
            this.moveObjects()
            this.checkForCandleCollisions()
        }, 1000 / 60)
    }

    updatePyonCapableBunnyPairs() {
        let dirty = false

        let existingPyonPairs = this.activePyonPairs
        existingPyonPairs = existingPyonPairs.filter(pyonPair => 
            this.bunniesArePyonCapable(
                this.players[pyonPair.playerIds[0]].bunny,
                this.players[pyonPair.playerIds[1]].bunny
            )
        )
        if (existingPyonPairs.length < this.activePyonPairs.length) { dirty = true }

        const playerIds = Object.keys(this.players)
        const pyonPairs = []
        for (let i = 0; i < playerIds.length; i++) {
            const playerId1 = playerIds[i]
            const bunny = this.players[playerId1].bunny
            if (i === playerIds.length - 1) { continue }

            for (let j = i + 1; j < playerIds.length; j++) {
                const playerId2 = playerIds[j]
                const otherBunny = this.players[playerId2].bunny
                if (this.bunniesArePyonCapable(bunny, otherBunny)) {
                    if (existingPyonPairs.find(pyonPair => pyonPair.playerIds.find(pairedPlayerId => pairedPlayerId === playerId1) !== undefined
                                                        && pyonPair.playerIds.find(pairedPlayerId => pairedPlayerId === playerId2) !== undefined)
                        === undefined) {
                        pyonPairs.push(
                            {
                                id: makeUniqueId(existingPyonPairs.map(pair => pair.id)),
                                playerIds: [playerId1, playerId2],
                                originTime: Date.now()
                            }
                        )
                    }
                }
            }
        }
        if (pyonPairs.length > 0) { dirty = true }

        this.activePyonPairs = [...existingPyonPairs, ...pyonPairs]
        return dirty
    }

    bunniesArePyonCapable(bunny1, bunny2) {
        const maxRange = 140
        const dist = Math.sqrt(Math.pow(bunny1.position.x - bunny2.position.x, 2) + Math.pow(bunny1.position.y - bunny2.position.y, 2))
        // requires: both bunnies are airborne, haven't pyonned yet, going upward, and fairly close to each other
        // jk both going upwards seems too restrictive; only at least one of them has to be moving upwards
        return bunny1.position.y > 0 && //bunny1.velocity.y >= 0 &&
               bunny2.position.y > 0 && //bunny2.velocity.y >= 0 &&
               (bunny1.velocity.y >= 0 || bunny2.velocity.y >= 0) &&
               !bunny1.hasPyonned && !bunny2.hasPyonned &&
               dist <= maxRange
    }

    bunnyCanCurrentlyPyon(bunny) {
        return this.activePyonPairs.some(pyonPair => pyonPair.playerIds.some(pairedPlayerId => this.players[pairedPlayerId].bunny === bunny))
    }

    accelerateObjects() {
        this.updateHorizontalMovement()
        this.updateVerticalMovement()
    }

    updateHorizontalMovement() {
        const accelAmount = 0.6
        const decelAmount = 0.8
        const maxSpeed = 12

        const pyonSpeedModifier = 0.3
        
        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const {keysHeld, bunny} = this.players[playerId]
            const activePyonSpeedModifier = this.bunnyCanCurrentlyPyon(bunny) ? pyonSpeedModifier : 1
            const bunnyIsGrounded = bunny.position.y === 0

            if (keysHeld[RIGHT] && !keysHeld[LEFT]) {
                bunny.velocity.x += accelAmount * activePyonSpeedModifier
                if (bunny.velocity.x > maxSpeed) {
                    bunny.velocity.x = maxSpeed
                }
            } else if (keysHeld[LEFT] && !keysHeld[RIGHT]) {
                bunny.velocity.x -= accelAmount * activePyonSpeedModifier
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

        const pyonSpeedModifier = 0.3
        const pyonBoostSpeed = 24

        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const {keysHeld, bunny} = this.players[playerId]
            const activePyonSpeedModifier = this.bunnyCanCurrentlyPyon(bunny) ? pyonSpeedModifier : 1
            if (bunny.velocity.y >= maxVerticalSpeed || (bunny.position.y > 0 && !keysHeld[UP])) {
                bunny.canJump = false
            }
            if (keysHeld[UP]) {
                if (bunny.canJump) {
                    bunny.velocity.y += accelAmount * activePyonSpeedModifier
                    if (bunny.velocity.y > maxVerticalSpeed) {
                        bunny.velocity.y = maxVerticalSpeed
                    }
                } else if (bunny.canPyon && !bunny.hasPyonned && this.bunnyCanCurrentlyPyon(bunny)) {
                    bunny.velocity.y = pyonBoostSpeed
                    bunny.canPyon = false
                    bunny.hasPyonned = true
                }
            }
            if (bunny.position.y > 0) {
                if (!keysHeld[UP] || !bunny.canJump) { // gravity only takes effect once bunny isn't accelerating upwards
                    bunny.velocity.y -= gravityAmount * activePyonSpeedModifier
                    // if (bunny.velocity.y < maxVerticalSpeed * -1) {
                    //     bunny.velocity.y = maxVerticalSpeed * -1
                    // }
                    // gravity has no max downward speed
                }
                if (!keysHeld[UP]) {
                    bunny.canPyon = true // pyon only enabled after jump button is released post-start of jump
                }
            } else if (!bunny.canJump) {
                bunny.velocity.y = 0
                bunny.canJump = true
                bunny.canPyon = false
                bunny.hasPyonned = false
            }
        })
    }

    moveObjects() {
        const minPosY = 0

        const pyonSpeedModifier = 0.3

        let dirty = false
        const playerIds = Object.keys(this.players)
        playerIds.forEach(playerId => {
            const bunny = this.players[playerId].bunny
            const activePyonSpeedModifier = this.bunnyCanCurrentlyPyon(bunny) ? pyonSpeedModifier : 1
            if (bunny.velocity.x !== 0) {
                dirty = true
                bunny.position.x += bunny.velocity.x * activePyonSpeedModifier
            }
            if (bunny.velocity.y !== 0) {
                dirty = true
                bunny.position.y += bunny.velocity.y * activePyonSpeedModifier
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