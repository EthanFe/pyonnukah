const { Game } = require("./game_logic/Game")
const { makeUniqueId } = require("./utils")

const startServer = () => {
  const port = process.env.PORT || '3000'
  const server = require('socket.io')({
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    }
  }).listen(port);

  server.on('connection', (client) => {
    console.log(`New client connected, creating socket connection with client id ${client.id}`)

    registerGameEvents(client, server)

    client.on('disconnect', (disconnectReason) => {
      console.log(`Client with id ${client.id} disconnected`)
    });
  });
  console.log("Socket is ready.")

  return server
}

function registerGameEvents(client, server) {
  client.on("joinGame", () => {
    joinGame(client, server)
  })
}

function registerInputListeners(client, game) {
  client.on("move", (direction) => {
    game.moveCommandIssued(client.id, direction)
  })
  client.on("ready", (playerIsReady) => {
    game.readyToggled(client.id, playerIsReady)
  })
  client.on("jump", () => {
    game.playerJumped(client.id)
  })
}

function makeGame(server) {
  const gameId = makeUniqueId({})
  return {game: new Game(() => updateClientsInRoom(gameId, server)), gameId: gameId}
}

function joinGame(client, server) {
  console.log(`Client with id ${client.id} trying to join game`)

  game.playerJoined(client.id)
  client.join(gameId)
  registerInputListeners(client, game)
  updateClientsInRoom(gameId, server)

  console.log("Successfully joined game")
  client.emit("gameJoinResult", client.id)
}

function updateClientsInRoom(gameId, server) {
  console.log("Updating clients in room for game: " + gameId)
  server.to(gameId).emit("updateGameState", game.latestState)
}

const server = startServer()
const {game, gameId} = makeGame(server)