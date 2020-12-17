const Player = require("./Player")

class Game {
    constructor(sendStateToClients) {
        this.activeLevel = null
        this.players = []
        this.levelStartTimer = null
        this.sendStateToClients = sendStateToClients
    }

    get latestState() {
        return {
            players: this.players.map(player => player.state),
        }
    }

    playerJoined(id) {
        this.players.push(new Player(id))
        this.sendStateToClients()
    }

    // readyToggled(id, playerIsReady) {
    //     const issuingPlayer = this.playerIdentityFromId(id)
    //     this.players[issuingPlayer].ready = playerIsReady
    //     if (this.playersAreReady) {
    //         this.beginLevelStartTimer()
    //     } else if (this.levelStartTimer !== null) {
    //         clearTimeout(this.levelStartTimer)
    //         this.levelStartTimer = null
    //     }
    //     this.sendStateToClients()
    // }

    get playersAreReady() {
        return this.players.every(player => player.ready)
    }

    beginLevelStartTimer() {
        this.levelStartTimer = setTimeout(() => {
            this.launchLevel()
        }, 2000)
    }

    // launchLevel() {

    // }
}

module.exports = {
    Game
}