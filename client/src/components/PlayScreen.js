// import TransitionWrapper from './TransitionWrapper.js';

import React from 'react';
import './PlayScreen.css';
import bunnyImage from '../images/bunny.png';
import menorahImage from '../images/menorah.png';
import candlesImage from '../images/candles_on_menorah.png';
import candleFlamesImage from '../images/candles_on_menorah_flames.png';
import candleFlameImage from '../images/single_candle_flame.png';

const totalScreenDimensions = {x: 900, y: 600}

const styles = {
  playArea: {
    width: `${totalScreenDimensions.x}px`,
    height: `${totalScreenDimensions.y}px`,
    backgroundColor: "slategray",
    borderRadius: "7px",
    position: "relative",
  },
  image: ({x, y}, dimensions) => {
    const rangeOfPositionForImages = {x: totalScreenDimensions.x - dimensions.width,
                                      y: totalScreenDimensions.y - dimensions.height}
    return {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      position: "absolute",
      top: rangeOfPositionForImages.y - (y / 1000) * rangeOfPositionForImages.y,
      left: (x / 1000) * rangeOfPositionForImages.x
    }
  },
}

const PlayScreen = ({gameState, keyPressed, keyReleased}) => {
  const bunnyPositions = Object.values(gameState.players).map(player => player.bunny.position)

  return (
    <div className="wrapper-thing" tabIndex={0} onKeyDown={({key}) => keyPressed(key)} onKeyUp={({key}) => keyReleased(key)}>
      <div className="inner-wrapper-thing">
        <div style={styles.playArea}>
          <Menorah position={{x: 500, y: 0}} candles={2} litCandles={1}/>
          {bunnyPositions.map((bunny, index) => 
            <img
              style={styles.image(bunny, {width: 64, height: 64})}
              src={bunnyImage}
              alt=""
              key={index}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const Menorah = ({position, candles, litCandles}) => {
  const dimensions = {width: 524, height: 400}

  return (
    <>
      <Shamus position={position} dimensions={dimensions}/>
      <Candles position={position} dimensions={dimensions} candles={8}/>
      <img
        style={styles.image(position, dimensions)}
        src={menorahImage}
        alt=""
      />
    </>
  )
}

const Shamus = ({position, dimensions}) => {
  return (
    <>
      <img
        style={{...styles.image(position, dimensions), clipPath: "inset(0px 38% 0px 38%)"}}
        src={candlesImage}
        alt=""
      />
      <img
        style={{...styles.image({x: 500, y: 545}, {width: 70, height: 91})}}
        src={candleFlameImage}
        alt=""
      />
    </>
  )
}

const Candles = ({position, dimensions, candles, litCandles}) => {
  const cutoffValues = [
    {left: 38, right: 100},
    {left: 38, right: 89.5},
    {left: 38, right: 81.5},
    {left: 38, right: 73.5},
    {left: 38, right: 62},
    {left: 27.5, right: 62},
    {left: 19.5, right: 62},
    {left: 11.5, right: 62},
    {left: 0, right: 62}
  ]
  const cutoff = cutoffValues[candles]
  const clipPathValue = `polygon(${cutoff.left}% 100%, ${cutoff.left}% 0%, 38% 0%, 38% 100%, ${cutoff.right}% 100%, ${cutoff.right}% 0%, 100% 0%, 100% 100%)`
  console.log(clipPathValue)
  return (
    <>
      <img
        style={{...styles.image(position, dimensions), clipPath: clipPathValue}}
        src={candlesImage}
        alt=""
      />
      <img
        style={{...styles.image(position, dimensions), clipPath: clipPathValue}}
        src={candleFlamesImage}
        alt=""
      />
    </>
  )
}

export default PlayScreen;