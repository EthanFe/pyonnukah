// import React from 'react';
// import { movementKeys } from '../consts.js'
// import ActiveLevelScreen from './ActiveLevelScreen';
// import LevelSelectScreen from './LevelSelectScreen.js';
// import TransitionWrapper from './TransitionWrapper.js';

const GameView = ({socketReady, gameState, socket, playingAs}) => {
  return (
    "heya"
  )
  // const keyPressed = (key) => {
  //   if (movementKeys[key]) {
  //     socket.emit('move', movementKeys[key])
  //   }
  //   if (key === "Enter") {
  //     socket.emit('ready', !gameState.playersReady[playingAs])
  //   }
  // }

  // if (!socketReady) {
  //   return <div>connecting...</div>
  // }

  // if (gameState === null) {
  //   return null
  // }

  // return (
  //   <div className="wrapper-thing" tabIndex={0} onKeyDown={({key}) => keyPressed(key)}>
  //     <TransitionWrapper diffData={gameState.activeLevel} scale={1} transitionTime={1} transitionInitially={false}>
  //       {gameState.activeLevel !== null ?
  //       <ActiveLevelScreen gameState={gameState}/> :
  //       <LevelSelectScreen gameState={gameState}/>}
  //     </TransitionWrapper>
  //   </div>
  // )
}

export default GameView;