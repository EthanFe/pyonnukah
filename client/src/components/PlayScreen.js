// import TransitionWrapper from './TransitionWrapper.js';

import React from 'react';
import './PlayScreen.css';
import bunnyImage from '../images/bunny.png';
import menorahImage from '../images/menorah.png';
import candlesImage from '../images/candles_on_menorah.png';
import candleFlamesImage from '../images/candles_on_menorah_flames.png';
import candleFlameImage from '../images/single_candle_flame.png';
import singleCandle from '../images/single_candle_with_flame.png';

const totalScreenDimensions = {x: 900, y: 600}

const rangeOfPositionForObject = (objectDimensions) => ({
  x: totalScreenDimensions.x - objectDimensions.width,
  y: totalScreenDimensions.y - objectDimensions.height
})

const styles = {
  playArea: {
    width: `${totalScreenDimensions.x}px`,
    height: `${totalScreenDimensions.y}px`,
    backgroundColor: "slategray",
    borderRadius: "7px",
    position: "relative",
  },
  image: ({x, y}, dimensions, rotation = 0) => {
    const rangeOfPositionForImages = rangeOfPositionForObject(dimensions)
    return {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      position: "absolute",
      top: rangeOfPositionForImages.y - (y / 1000) * rangeOfPositionForImages.y,
      left: (x / 1000) * rangeOfPositionForImages.x,
      transform: `rotate(${rotation}deg)`,
    }
  },
}

const PlayScreen = ({gameState, keyPressed, keyReleased}) => {
  const bunnies = Object.values(gameState.players).map(player => player.bunny)

  return (
    <div className="wrapper-thing" tabIndex={0} onKeyDown={({key}) => keyPressed(key)} onKeyUp={({key}) => keyReleased(key)}>
      <div className="inner-wrapper-thing">
        <div style={styles.playArea}>
          <Menorah position={{x: 500, y: 0}} displayShamus={gameState.shamusOnMenorah} candles={gameState.candlesOnLevel} litCandles={gameState.litCandles}/>
          <Bunnies bunnies={bunnies}/>
          <PyonPairCircles pyonPairs={gameState.activePyonPairs.map(pyonPair => ({id: pyonPair.id, originTime: pyonPair.originTime, bunnies: pyonPair.playerIds.map(playerId => gameState.players[playerId].bunny)}))}/>
          <div>
            Active pyon pairs: {gameState.activePyonPairs.length}
          </div>
        </div>
      </div>
    </div>
  )
}

const PyonPairCircles = ({pyonPairs}) => {
  return (
    <>
      {pyonPairs.map(pyonPair => {
        const midPoint = {x: (pyonPair.bunnies[0].position.x + pyonPair.bunnies[1].position.x) / 2,
                          y: (pyonPair.bunnies[0].position.y + pyonPair.bunnies[1].position.y) / 2}
        return <PyonPairCircle key={pyonPair.id} position={midPoint} originTime={pyonPair.originTime}/>
      })}
    </>
  )
}

const PyonPairCircle = ({position, originTime}) => {
  const {x, y} = position

  const age = Date.now() - originTime
  const size = (age <= 400) ? (50 * (age / 400)) : (100 * ((age - 400) / 1600) + 50)

  const rangeOfPosition = rangeOfPositionForObject({width: size, height: size})

  return (
    <span
      style={{
        position: "absolute",
        left: (x / 1000) * rangeOfPosition.x,
        top: rangeOfPosition.y - (y / 1000) * rangeOfPosition.y,
      }}
      className={"pyon-pair-circle"}
    />
  )
}

const Bunnies = ({bunnies}) => {
  return (
    bunnies.map((bunny, index) => <Bunny key={index} position={bunny.position} carryingCandle={bunny.carryingCandle}/> )
  )
}

const Bunny = ({position, carryingCandle}) => {
  const bunnyDimensions = {width: 64, height: 64}
  return (
    <>
      {carryingCandle &&
      <img
        style={{
          ...styles.image({x: 0, y: position.y + 15}, {width: 24, height: 72}, 25),
          left: (position.x / 1000) * (totalScreenDimensions.x - bunnyDimensions.width) + 50
        }}
        src={singleCandle}
        alt=""
      />}
      <img
        style={styles.image(position, bunnyDimensions)}
        src={bunnyImage}
        alt=""
      />
    </>
  )
}

const Menorah = ({position, displayShamus, candles, litCandles}) => {
  const dimensions = {width: 524, height: 400}

  return (
    <>
      <Shamus display={displayShamus} position={position} dimensions={dimensions}/>
      <Candles position={position} dimensions={dimensions} candles={candles} litCandles={litCandles}/>
      <img
        style={styles.image(position, dimensions)}
        src={menorahImage}
        alt=""
      />
    </>
  )
}

const Shamus = ({position, dimensions, display}) => {
  if (!display) { return null }
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

  const candleFlames = Object.keys(litCandles).filter(index => litCandles[index]).map(index =>
    <img
      style={styles.image({x: flamePositionOffsets[index].x, y: flamePositionOffsets[index].y}, {width: 70, height: 91})}
      src={candleFlameImage}
      alt=""
      key={index}
    />
  )
  const cutoff = cutoffValues[candles]
  const clipPathValue = `polygon(${cutoff.left}% 100%, ${cutoff.left}% 0%, 38% 0%, 38% 100%, ${cutoff.right}% 100%, ${cutoff.right}% 0%, 100% 0%, 100% 100%)`
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