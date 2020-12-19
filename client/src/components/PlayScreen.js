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
      <Candles position={position} dimensions={dimensions} candles={7} litCandles={{0: true, 1: true, 2: false, 3: true, 4: false, 5: true, 6: true, 7: true}}/>
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

  const flamePositionOffsets = [
    {x: ((900 - 208) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 251) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 298) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 344) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 555) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 600) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 648) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
    {x: ((900 - 692) / 900) * 1000, y: ((600 - 305) / 600) * 1000},
  ]
  console.log(flamePositionOffsets)

  const candleFlames = Object.keys(litCandles).filter(index => litCandles[index]).map(index =>
    <img
      style={styles.image({x: flamePositionOffsets[index].x, y: flamePositionOffsets[index].y}, {width: 70, height: 91})}
      src={candleFlameImage}
      alt=""
    />
  )
  const cutoff = cutoffValues[candles]
  const clipPathValue = `polygon(${cutoff.left}% 100%, ${cutoff.left}% 0%, 38% 0%, 38% 100%, ${cutoff.right}% 100%, ${cutoff.right}% 0%, 100% 0%, 100% 100%)`
  console.log(clipPathValue)
  return (
    <span style={{position: "relative"}}>
      <img
        style={{...styles.image(position, dimensions), clipPath: clipPathValue}}
        src={candlesImage}
        alt=""
      />
      <>
        {candleFlames}
      </>
      {/* <img
        style={{...styles.image(position, dimensions), clipPath: clipPathValue}}
        src={candleFlamesImage}
        alt=""
      /> */}
    </span>
  )
}

export default PlayScreen;