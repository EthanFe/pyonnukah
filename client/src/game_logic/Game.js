const { UP, DOWN, LEFT, RIGHT } = require('../consts.js')
const { makeUniqueId } = require('../utils.js')

class Game {
    constructor(setGameState, activePlayerId) {
        this.setGameState = setGameState

        this.players = {}
        this.candlesOnLevel = null
        this.litCandles = {}
        this.shamusOnMenorah = null
        this.activePyonPairs = []

        this.activePlayerId = null
        this.startSimulation()
    }

    get latestState() {
        return {
            players: this.players,
            candlesOnLevel: this.candlesOnLevel,
            litCandles: this.litCandles,
            shamusOnMenorah: this.shamusOnMenorah,
            activePyonPairs: this.activePyonPairs,
        }
    }

    setActivePlayer(playerId) {
        this.activePlayerId = playerId
    }

    updateState(newState) {
        const playerIds = Object.keys(newState.players)
        playerIds.forEach(playerId => {
            if (this.players[playerId] !== undefined) {
                this.players[playerId].bunny.carryingCandle = newState.players[playerId].bunny.carryingCandle //always update candle carrying state
            }
            if (playerId !== this.activePlayerId || this.players[this.activePlayerId] === undefined) {
                this.players[playerId] = newState.players[playerId] // only update movement/velocity state for other, non-local bunnies
            }
        })
        this.candlesOnLevel = newState.candlesOnLevel
        this.litCandles = newState.litCandles
        this.shamusOnMenorah = newState.shamusOnMenorah

        this.displayUpdatedState()
    }

    localMovementInputted(keysHeld) {
        this.players[this.activePlayerId].keysHeld = keysHeld
    }

    startSimulation() {
        setInterval(() => {
            this.accelerateObjects()

            const newPyonPairs = this.updatePyonCapableBunnyPairs()
            const objectsMoved = this.moveObjects()
            const dirty = newPyonPairs || objectsMoved // how would objectsmoved ever not be true but newpyonpairs was? no clue. but fuckin whatever
            if (dirty) {
                this.displayUpdatedState()
            }
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
                this.moveBunny(bunny, {x: bunny.velocity.x * activePyonSpeedModifier, y: 0})
            }
            if (bunny.velocity.y !== 0) {
                dirty = true
                this.moveBunny(bunny, {y: bunny.velocity.y * activePyonSpeedModifier, x: 0})
                if (bunny.position.y < minPosY) {
                    bunny.position.y = minPosY
                }
            }
        })
        return dirty
    }

    moveBunny(bunny, {x, y}) {
        const oldBunnyXPos = bunny.position.x
        bunny.position.x += x
        bunny.position.y += y
        if (bunny.position.x !== oldBunnyXPos) {
            bunny.lastMovedDirection = bunny.position.x > oldBunnyXPos ? 1 : -1
        }
    }

    displayUpdatedState() {
        this.setGameState(this.latestState)
    }
}

module.exports = {
    Game
}