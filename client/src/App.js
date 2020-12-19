import './App.css';
import { useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import PlayScreen from './components/PlayScreen';
import { Game } from './game_logic/Game';
import { movementKeys } from './consts.js'
import TransitionWrapper from './components/TransitionWrapper';

const joinGame = (socket) => {
  socket.emit('joinGame')
}

const updateGameStateFromServer = (newGameState, game) => {
  game.updateState(newGameState)
}

const keyPressed = (key, keysHeld, socket, thisPlayer, game) => {
  // if (movementKeys[key]) {
    const newKeyPress = !keysHeld.current[key]
    keysHeld.current[key] = true
    if (newKeyPress) {
      game.localMovementInputted(keysHeld.current)
      socket.emit('movementInputted', {keysHeld: keysHeld.current, bunnyState: thisPlayer.bunny})
    }
  // }
  // if (key === "Enter") {
  //   const currentlyReady = thisPlayer.ready
  //   socket.emit('ready', !currentlyReady)
  // }
}

const keyReleased = (key, keysHeld, socket, thisPlayer) => {
  // if (movementKeys[key]) {
    keysHeld.current[key] = false
    socket.emit('movementInputted', {keysHeld: keysHeld.current, bunnyState: thisPlayer.bunny})
  // }
}

function App({socket}) {
  const [socketReady, setSocketReady] = useState(false)
  const [gameState, setGameState] = useState(null)
  const game = useMemo(() => new Game(setGameState), [])

  const [playingAs, setPlayingAs] = useState(null)
  const gameJoinResult = (joinedAs) => {
    setPlayingAs(joinedAs)
    game.setActivePlayer(joinedAs)
  }

  useEffect(() => {
    socket.on('connect', () => setSocketReady(true));
    socket.on('updateGameState', (newGameState) => updateGameStateFromServer(newGameState, game))
    socket.on('gameJoinResult', gameJoinResult)
  }, [socket])

  useEffect(() => {
    if (playingAs === null) {
      joinGame(socket)
    }
    // eslint-disable-next-line
  }, [playingAs])

  const thisPlayer = gameState ? gameState.players[playingAs] : null

  const keysHeld = useRef({})

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
      <TransitionWrapper diffData={gameState.candlesOnLevel} scale={1} transitionTime={0.85} transitionType="fade">
        <PlayScreen gameState={gameState} keyPressed={(key) => keyPressed(key, keysHeld, socket, thisPlayer, game)} keyReleased={(key) => keyReleased(key, keysHeld, socket, thisPlayer)}/>
      </TransitionWrapper>
  );
}

export default App;
