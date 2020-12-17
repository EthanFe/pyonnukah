const { Game } = require("./game_logic/Game")
const { makeUniqueId } = require("./utils")

const games = {}

const startServer = () => {
  const port = process.env.PORT || '3000'
  const server = require('socket.io')().listen(port);

  server.on('connection', (socket) => {
    console.log(`New client connected, creating socket connection with socket id ${socket.id}`)
    registerGameEvents(socket, server)
  });

  console.log("Socket is ready.")

  return server
}

function registerGameEvents(socket, server) {
  socket.on("makeGame", () => {
    makeGame(socket, server)
  })

  socket.on("joinGame", (gameId) => {
    joinGame(socket, server, gameId)
  })
}

function registerInputListeners(socket, game) {
  socket.on("move", (direction) => {
    game.moveCommandIssued(socket.id, direction)
  })
  socket.on("ready", (playerIsReady) => {
    game.readyToggled(socket.id, playerIsReady)
  })
  socket.on("jump", () => {
    game.playerJumped(socket.id)
  })
}

function makeGame(socket, server) {
  const gameId = makeUniqueId(games)
  const game = new Game(() => updateClientsInRoom(gameId, server))
  games[gameId] = game
  socket.emit("newGameCreated", gameId)
}

function joinGame(socket, server, gameId) {
  console.log(`Client with id ${socket.id} trying to join game with id: ${gameId}`)

  const game = games[gameId]
  if (game === undefined) {
    console.log("Failed to join game, no game with that id found")
    socket.emit("gameJoinResult", false)
    return
  }

  game.playerJoined(socket.id)
  socket.join(gameId)
  registerInputListeners(socket, game)
  updateClientsInRoom(gameId, server)

  console.log("Successfully joined game")
  socket.emit("gameJoinResult", true)
}

function updateClientsInRoom(gameId, server) {
  console.log("Updating clients in room for game: " + gameId)
  server.to(gameId).emit("updateGameState", games[gameId].latestState)
}

const server = startServer()