import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import PlayScreen from './components/PlayScreen';
import { movementKeys } from './consts.js'

const joinGame = (socket) => {
  socket.emit('joinGame')
}

function App({socket}) {
  const [socketReady, setSocketReady] = useState(false)
  
  const [gameState, setGameState] = useState(null)
  const updateGameState = (newGameState) => {
    setGameState(newGameState)
  }

  const [playingAs, setPlayingAs] = useState(null)
  const gameJoinResult = (joinedAs) => {
    setPlayingAs(joinedAs)
  }

  const keyPressed = (key) => {
    console.log(movementKeys[key])
    if (movementKeys[key]) {
      socket.emit('move', movementKeys[key])
    }
    if (key === "Enter") {
      const currentlyReady = gameState.players.find(player => player.id === playingAs).ready
      socket.emit('ready', !currentlyReady)
    }
  }

  socket.on('connect', () => setSocketReady(true));
  socket.on('updateGameState', updateGameState)
  socket.on('gameJoinResult', gameJoinResult)

  useEffect(() => {
    if (playingAs === null) {
      joinGame(socket)
    }
    // eslint-disable-next-line
  }, [playingAs])

  if (!socketReady) {
    return (
      <div>
        connecting...
      </div>
    )
  }

  if (gameState === null) {
    return (
      <div>
        waiting for game to initialize...
      </div>
    )
  }

  return (
    <PlayScreen gameState={gameState} keyPressed={keyPressed}/>
  );
}

export default App;
