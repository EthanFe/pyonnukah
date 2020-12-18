// import TransitionWrapper from './TransitionWrapper.js';

import React from 'react';
import './PlayScreen.css';
import bunnyImage from '../images/bunny.png';

const PlayScreen = ({gameState, keyPressed}) => {
  const totalScreenDimensions = {x: 900, y: 600}
  const imageDimensions = {x: 64, y: 64}
  const rangeOfPositionForImages = {x: totalScreenDimensions.x - imageDimensions.x,
                                    y: totalScreenDimensions.y - imageDimensions.y}

  const styles = {
    playArea: {
      width: `${totalScreenDimensions.x}px`,
      height: `${totalScreenDimensions.y}px`,
      backgroundColor: "slategray",
      borderRadius: "7px",
      position: "relative",
    },
    image: ({x, y}) => ({
      width: "64px",
      height: "64px",
      backgroundColor: "black",
      position: "absolute",
      top: rangeOfPositionForImages.y - (y / 1000) * rangeOfPositionForImages.y,
      left: (x / 1000) * rangeOfPositionForImages.x
    }),
  }

  const bunnyPositions = gameState.players.map(player => player.bunnyPosition)
  console.log(bunnyPositions)

  return (
    <div className="wrapper-thing" tabIndex={0} onKeyDown={({key}) => keyPressed(key)}>
      <div className="inner-wrapper-thing">
        <div style={styles.playArea}>
          {bunnyPositions.map(bunny => 
            <img
              style={styles.image(bunny)}
              src={bunnyImage}
              alt=""
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayScreen;