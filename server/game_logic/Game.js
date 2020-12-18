const { Player } = require("./Player")

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

    playerJoined(playerId) {
        this.players.push(new Player(playerId))
        this.sendStateToClients()
    }

    playerLeft(playerId) {
        this.players = this.players.filter(player => player.id !== playerId)
        this.sendStateToClients()
    }

    moveCommandIssued(playerId, direction) {

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