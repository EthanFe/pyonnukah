import './App.css';
import { useState } from 'react';

import LobbyView from './components/LobbyView';
import GameView from './components/GameView';
import { useEffect } from 'react';

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

  return (
    <div>
      heya
    </div>
  );
}

export default App;
